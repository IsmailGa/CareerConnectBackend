const ejs = require('ejs');
const puppeteer = require('puppeteer');
const path = require('path');

async function generateResumePdf(user) {
  // 1. Рендерим HTML из EJS
  const html = await ejs.renderFile(
    path.join(__dirname, '../templates', 'resume.ejs'),
    { user }
  );

  // 2. Запускаем Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 3. Загружаем HTML
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // 4. Генерируем PDF
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

  await browser.close();

  return pdfBuffer;
}

module.exports = generateResumePdf;
