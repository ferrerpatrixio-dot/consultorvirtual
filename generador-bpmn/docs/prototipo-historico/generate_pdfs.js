const puppeteer = require('puppeteer');
const path = require('path');

async function generatePDF(htmlPath, outputName) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const filePath = `file://${path.resolve(htmlPath)}`;

    console.log(`📄 Generando: ${outputName}...`);
    await page.goto(filePath, { waitUntil: 'networkidle2' });

    const pdfPath = `C:/Users/ferre/Proyectos/PROCESOS BPMN/${outputName}`;

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' },
      printBackground: true,
      preferCSSPageSize: true
    });

    console.log(`✓ ${outputName} generado`);
    return pdfPath;
  } finally {
    await browser.close();
  }
}

(async () => {
  try {
    await generatePDF('C:/Users/ferre/Proyectos/PROCESOS BPMN/bpmn_architect_visual.html', 'Comparativa_BPMN_Skills.pdf');
    
    console.log('\n✅ Todos los PDFs generados exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
