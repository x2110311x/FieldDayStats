import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Aspect-Ratio Preserving Client-Side PDF Exporter.
 * Uses high-DPI canvas rendering with explicit width handling to prevent text & badge truncation.
 */
export async function exportElementToPdf(elementId: string, filename: string): Promise<void> {
  const container = document.getElementById(elementId);
  if (!container) {
    console.error(`PDF Export Error: Element #${elementId} not found.`);
    return;
  }

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  try {
    const pages = container.querySelectorAll('.a4-page');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfPageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm

    if (pages && pages.length > 0) {
      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i] as HTMLElement;

        const canvas = await html2canvas(pageEl, {
          scale: 2, // 2x resolution canvas
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 1280,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgProps = pdf.getImageProperties(imgData);
        const renderHeight = (imgProps.height * pdfPageWidth) / imgProps.width;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfPageWidth, Math.min(renderHeight, pdfPageHeight));
      }
    } else {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1280,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgProps = pdf.getImageProperties(imgData);
      const renderHeight = (imgProps.height * pdfPageWidth) / imgProps.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfPageWidth, Math.min(renderHeight, pdfPageHeight));
    }

    pdf.save(cleanFilename);
  } catch (err) {
    console.error('jsPDF save error, using File object fallback:', err);
    try {
      const pdfBlob = (new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })).output('blob');
      const file = new File([pdfBlob], cleanFilename, { type: 'application/pdf' });
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = cleanFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (fallbackErr) {
      console.error('Fallback save error:', fallbackErr);
    }
  }
}
