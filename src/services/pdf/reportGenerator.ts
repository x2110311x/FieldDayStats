import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Aspect-Ratio Preserving Client-Side PDF Exporter.
 * Captures fixed A4 ratio pages (794px x 1123px) and embeds into jsPDF without text stretching.
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
          scale: 2, // 2x high resolution canvas
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 794,
          height: 1123,
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
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgProps = pdf.getImageProperties(imgData);
      const renderHeight = (imgProps.height * pdfPageWidth) / imgProps.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfPageWidth, Math.min(renderHeight, pdfPageHeight));
    }

    // Direct built-in jsPDF save preserves clean filename & .pdf extension
    pdf.save(cleanFilename);

  } catch (err) {
    console.error('jsPDF save error:', err);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.text('ARRL Field Day Operations Report', 10, 10);
      pdf.save(cleanFilename);
    } catch (fallbackErr) {
      console.error('Fallback save error:', fallbackErr);
    }
  }
}
