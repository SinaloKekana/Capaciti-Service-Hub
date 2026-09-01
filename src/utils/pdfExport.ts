import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename?: string;
  reportTitle?: string;
  onProgress?: (progress: number) => void;
}

/**
 * High-definition PDF exporter for Capaciti Executive & Manager Reports.
 * Captures pixel-perfect charts, typography, KPI cards, and tables.
 */
export async function exportReportElementToPDF(
  elementId: string,
  options: PDFExportOptions = {}
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found for PDF export.`);
    return false;
  }

  const filename = options.filename || `Capaciti_Executive_Report_${new Date().toISOString().slice(0, 10)}.pdf`;

  try {
    if (options.onProgress) options.onProgress(20);

    // Save original styling
    const originalShadow = element.style.boxShadow;
    const originalBorder = element.style.border;
    element.style.boxShadow = 'none';

    // Render DOM to high-res canvas (scale: 2 for crisp 300dpi-equivalent print)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
    });

    if (options.onProgress) options.onProgress(65);

    // Restore styling
    element.style.boxShadow = originalShadow;
    element.style.border = originalBorder;

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210; // A4 standard width in mm
    const pdfPageHeight = 297; // A4 standard height in mm
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfPageHeight;

    // Subsequent pages if long report
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfPageHeight;
    }

    if (options.onProgress) options.onProgress(90);

    pdf.save(filename);
    
    if (options.onProgress) options.onProgress(100);
    return true;
  } catch (err) {
    console.error('PDF export error:', err);
    return false;
  }
}
