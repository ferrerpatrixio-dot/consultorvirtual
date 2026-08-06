const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    const htmlPath = `file://${path.resolve('C:/Users/ferre/Proyectos/PROCESOS BPMN/bpmn_profesional.html')}`;

    console.log('Cargando HTML desde:', htmlPath);
    await page.goto(htmlPath, { waitUntil: 'networkidle2' });

    await page.waitForSelector('.mermaid svg', { timeout: 10000 }).catch(() => {
      console.log('SVG Mermaid no encontrado, continuando...');
    });

    const pdfPath = 'C:/Users/ferre/Proyectos/PROCESOS BPMN/BPMN_Recepcion_Equipos.pdf';

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      printBackground: true,
      preferCSSPageSize: true
    });

    console.log('✓ PDF generado exitosamente en:', pdfPath);
    process.exit(0);
  } catch (error) {
    console.error('Error al generar PDF:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
