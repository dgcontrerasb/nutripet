import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export async function downloadElementAsPdf(
  elementOrId: HTMLElement | string = 'printable-pet-card',
  fileName = 'Carnet-NutriPet.pdf'
): Promise<boolean> {
  const element = typeof elementOrId === 'string'
    ? document.getElementById(elementOrId)
    : elementOrId;

  if (!element) {
    throw new Error(`No se encontró el elemento #${String(elementOrId)} para exportar.`);
  }

  console.log('📄 [PDF] Inicio de exportación:', {
    id: element.id,
    width: element.offsetWidth,
    height: element.offsetHeight
  });

  let tempContainer: HTMLDivElement | null = null;

  try {
    tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-100000px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '780px';
    tempContainer.style.background = '#ffffff';
    tempContainer.style.pointerEvents = 'none';

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '780px';
    clone.style.maxWidth = '780px';
    clone.style.height = 'auto';
    clone.style.maxHeight = 'none';
    clone.style.overflow = 'visible';
    clone.style.position = 'relative';
    clone.style.background = '#ffffff';
    clone.style.color = '#1c1917';

    clone.querySelectorAll('.no-print, [class*="no-print"]').forEach(node => node.remove());

    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight
    });

    const imageData = canvas.toDataURL('image/jpeg', 0.92);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const printableWidth = pageWidth - margin * 2;
    const printableHeight = pageHeight - margin * 2;

    const imageHeight = (canvas.height * printableWidth) / canvas.width;

    let sourceY = 0;
    let remainingHeight = imageHeight;
    let pageNumber = 0;

    while (remainingHeight > 0) {
      if (pageNumber > 0) {
        pdf.addPage();
      }

      const sliceHeight = Math.min(printableHeight, remainingHeight);

      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = canvas.width;
      sourceCanvas.height = Math.round(
        (sliceHeight / imageHeight) * canvas.height
      );

      const context = sourceCanvas.getContext('2d');
      if (!context) {
        throw new Error('No se pudo preparar el lienzo del PDF.');
      }

      context.drawImage(
        canvas,
        0,
        Math.round((sourceY / imageHeight) * canvas.height),
        canvas.width,
        sourceCanvas.height,
        0,
        0,
        sourceCanvas.width,
        sourceCanvas.height
      );

      const sliceData = sourceCanvas.toDataURL('image/jpeg', 0.92);

      pdf.addImage(
        sliceData,
        'JPEG',
        margin,
        margin,
        printableWidth,
        sliceHeight,
        undefined,
        'FAST'
      );

      sourceY += sliceHeight;
      remainingHeight -= sliceHeight;
      pageNumber += 1;
    }

    pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);

    console.log('✅ [PDF] Exportación completada:', {
      filename: fileName,
      pages: pageNumber
    });

    return true;
  } catch (error) {
    console.error('❌ [PDF] Error de exportación:', {
      message: error instanceof Error ? error.message : String(error)
    });
    throw error;
  } finally {
    if (tempContainer?.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }
  }
}
