const express = require('express')
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
const port = 3000;

const corsOptions = {
  origin: 'http://localhost:1234'
};

const printPdf = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080', {
    waitUntil: 'networkidle0',
  });
  const selectors = [
    '#groom-name',
    '#groom-address1',
    '#groom-address2',
    '#groom-address3',
    '#bride-name',
    '#bride-address1',
    '#bride-address2',
    '#bride-address3'
  ];
  for(const selector of selectors) {
    await page.waitForSelector(selector);
  }
  await page.type('#groom-name', 'SANDEEP K N');
  await page.type('#groom-address1', 'S/o Mahalinga Patali & Veena');
  await page.type('#groom-address2', 'Ajjavara House');
  await page.type('#groom-address3', 'Sullia');
  await page.type('#bride-name', 'PRATHEEKSHA P');
  await page.type('#bride-address1', 'S/o Mahalinga Patali & Veena');
  await page.type('#bride-address2', 'Ajjavara House');
  await page.type('#bride-address3', 'Sullia');
  //await page.pdf({ path: 'certificate.pdf', format: 'a4' });
  const pdf = await page.pdf({ path: 'certificate.pdf', format: 'a4', printBackground: true });

  await browser.close();

  return pdf;
};

app.get('/', cors(corsOptions), async (req, res) => {
  const pdf = await printPdf().catch(e => console.log(e));
  res.contentType('application/pdf');
  res.send(pdf);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

