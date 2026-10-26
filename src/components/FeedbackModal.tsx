import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Send, Loader2, CheckCircle2, Heart } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { usePets } from '../context/PetContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { activePet } = usePets();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<'general' | 'bug' | 'feature' | 'recipe'>('general');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMessage('Por favor escribe un comentario antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      const isMobile = window.innerWidth < 1024;

      await addDoc(collection(db, 'feedbacks'), {
        rating,
        category,
        comment: comment.trim(),
        device: isMobile ? 'mobile' : 'pc',
        userId: user ? user.uid : null,
        userEmail: user ? user.email : 'Sin correo registrado',
        userName: user ? (user.displayName || (activePet ? `Tutor de ${activePet.name}` : 'Usuario NutriPet')) : (activePet ? `Tutor de ${activePet.name}` : 'Usuario Anónimo'),
        createdAt: serverTimestamp(),
        source: 'web_app'
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setComment('');
        setRating(5);
        setCategory('general');
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error enviando feedback:', err);
      setErrorMessage('Hubo un error al enviar tu opinión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 dark:border-stone-800 transition-colors"
        >
          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-stone-900 dark:text-stone-100">
                ¡Muchas Gracias!
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                Tu opinión nos ayuda a seguir optimizando la experiencia y salud de miles de mascotas.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Encabezado */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 leading-tight">
                    Tu Opinión nos Importa
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    ¿Qué tal ha sido tu experiencia con NutriPet?
                  </p>
                </div>
              </div>

              {/* Selector de Estrellas */}
              <div className="flex flex-col items-center justify-center py-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/80 dark:border-stone-750">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-300 dark:text-stone-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mt-1">
                  {rating === 5 && '¡Excelente, me encanta!'}
                  {rating === 4 && 'Muy buena'}
                  {rating === 3 && 'Buena / Aceptable'}
                  {rating === 2 && 'Puede mejorar'}
                  {rating === 1 && 'No me gustó'}
                </span>
              </div>

              {/* Selector de Categoría */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 block">
                  Tema de tu comentario
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="general">⭐ Opinión general o felicitación</option>
                  <option value="feature">💡 Sugerencia de nueva función</option>
                  <option value="recipe">🥩 Porciones y cálculo BARF</option>
                  <option value="bug">🐛 Reporte de error o problema visual</option>
                </select>
              </div>

              {/* Área de texto */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 block">
                  Comentarios o Sugerencias
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos qué función te gustaría ver o cómo ha mejorado la vida de tu mascota..."
                  className="w-full p-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all resize-none shadow-2xs"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-bold text-center">
                  {errorMessage}
                </div>
              )}

              {/* Botón Enviar */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando opinión...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Calificación</span>
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};