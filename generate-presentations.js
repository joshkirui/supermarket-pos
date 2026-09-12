const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  // Presentation PDF
  console.log('Generating presentation PDF...');
  const page1 = await browser.newPage();
  await page1.goto('file:///' + path.resolve(__dirname, 'POS_Presentation.html').replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page1.pdf({
    path: path.resolve(__dirname, 'POS_Presentation.pdf'),
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });
  console.log('Done: POS_Presentation.pdf');

  // Pitching Script PDF
  console.log('Generating pitching script PDF...');
  const page2 = await browser.newPage();
  await page2.goto('file:///' + path.resolve(__dirname, 'POS_Pitching_Script.html').replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page2.pdf({
    path: path.resolve(__dirname, 'POS_Pitching_Script.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
  });
  console.log('Done: POS_Pitching_Script.pdf');

  await browser.close();
  console.log('All PDFs generated!');
})();
