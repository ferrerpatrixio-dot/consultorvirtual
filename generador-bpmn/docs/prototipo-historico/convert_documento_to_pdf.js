const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const htmlPath = `file://${path.resolve('C:/Users/ferre/Proyectos/PROCESOS BPMN/flujo_recepcion_equipos_documento.html')}`;

    console.log('Cargando documento desde:', htmlPath);
    await page.goto(htmlPath, { waitUntil: 'networkidle2' });

    const pdfPath = 'C:/Users/ferre/Proyectos/PROCESOS BPMN/Documento_Recepcion_Equipos.pdf';

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' },
      printBackground: true,
      preferCSSPageSize: true
    });

    console.log('✓ PDF del documento generado exitosamente en:', pdfPath);
    process.exit(0);
  } catch (error) {
    console.error('Error al generar PDF:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
