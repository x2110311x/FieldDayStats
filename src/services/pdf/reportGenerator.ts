/**
 * Triggers native browser print dialog for instant, high-quality vector printing / PDF saving.
 */
export async function exportElementToPdf(_elementId: string, _filename: string): Promise<void> {
  window.print();
}
