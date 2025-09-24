import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const generatePDF = async (element: HTMLElement): Promise<string> => {
  try {
    // Render DOM to canvas with moderate scale to balance quality/size
    const baseCanvas = await html2canvas(element, {
      scale: 1.2,
      useCORS: true,
      logging: false,
      onclone: (doc) => {
        // Prevent cross-origin images from tainting the canvas
        const imgs = Array.from(doc.querySelectorAll('img')) as HTMLImageElement[];
        imgs.forEach((img) => {
          const src = img.getAttribute('src') || '';
          const isRemote = /^https?:\/\//.test(src) && !src.startsWith(window.location.origin);
          if (isRemote) img.setAttribute('src', '');
        });
      }
    });

    // Downscale to a reasonable max width to reduce bytes
    const MAX_W = 1240; // ~A4 at ~150dpi
    const ratio = Math.min(1, MAX_W / baseCanvas.width);
    const targetW = Math.round(baseCanvas.width * ratio);
    const targetH = Math.round(baseCanvas.height * ratio);

    let canvas = baseCanvas;
    if (ratio < 1) {
      const off = document.createElement('canvas');
      off.width = targetW;
      off.height = targetH;
      const ctx = off.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(baseCanvas, 0, 0, targetW, targetH);
      canvas = off;
    }

    // JPEG at lower quality to compress further
    const imgData = canvas.toDataURL('image/jpeg', 0.6);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);

    // Return the PDF as a data URL
    return pdf.output('dataurlstring');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
