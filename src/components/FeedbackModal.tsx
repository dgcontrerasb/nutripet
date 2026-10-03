import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { usePets } from '../context/PetContext';
import { Star, MessageSquarePlus, X, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, activePet } = usePets();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState<'general' | 'bug' | 'feature' | 'recipe'>('general');
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        userId: user?.uid || 'anonimo',
        userEmail: user?.email || 'Sin correo registrado',
        userName: user?.displayName || (activePet ? `Tutor de ${activePet.name}` : 'Usuario NutriPet'),
        rating: Number(rating),
        category,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
        device: typeof window !== 'undefined' && window.innerWidth < 768 ? 'movil' : 'pc'
      });

      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setComment('');
        setRating(5);
        onClose();
      }, 1800);
    } catch (error: any) {
      console.error('Error detallado guardando feedback:', error);
      alert('Error al enviar la calificación. Asegúrate de haber publicado las reglas en Firebase Console.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in no-print">
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-100">
              ¿Cómo ha sido tu experiencia?
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-bold text-stone-900 dark:text-stone-100 text-base">¡Muchas gracias por tu calificación!</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">Tus comentarios nos ayudan a seguir mejorando NutriPet.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Calificación por estrellas */}
            <div className="text-center space-y-1.5">
              <label className="font-bold text-stone-700 dark:text-stone-300 block">
                Califica la aplicación:
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300 dark:text-stone-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                ¿Sobre qué quieres opinar?
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="general">⭐ Opinión general o felicitación</option>
                <option value="feature">💡 Sugerencia de nueva función</option>
                <option value="recipe">🥩 Porciones y Dieta Nutricional</option>
                <option value="bug">🐛 Reporte de error o problema visual</option>
              </select>
            </div>

            {/* Comentario */}
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Tu mensaje o sugerencia:
              </label>
              <textarea
                required
                rows={3}
                placeholder="Escribe aquí tu experiencia, dudas o qué te gustaría ver en NutriPet..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-stone-300 dark:border-stone-700 rounded-xl font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !comment.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Opinión'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};