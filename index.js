const express = require('express')
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
const port = 3000;

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const corsOptions = {
  origin: 'http://localhost:1234'
};

const printPdf = async (inData) => {
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
  await page.type('#groom-name', inData.groomName);
  await page.type('#groom-address1', inData.groomAddress1);
  await page.type('#groom-address2', inData.groomAddress2);
  await page.type('#groom-address3', inData.groomAddress3);
  await page.type('#bride-name', inData.brideName);
  await page.type('#bride-address1', inData.brideAddress1);
  await page.type('#bride-address2', inData.brideAddress2);
  await page.type('#bride-address3', inData.brideAddress3);
  //await page.pdf({ path: 'certificate.pdf', format: 'a4' });
  const pdf = await page.pdf({ path: 'certificate.pdf', format: 'a4', printBackground: true });

  await browser.close();

  return pdf;
};

app.post('/', cors(corsOptions), async (req, res) => {
  console.log(JSON.parse(Object.keys(req.body)[0]));
  if(!req.body) {
    res.status(404).send("{}");
    return;
  }
  const data = JSON.parse(Object.keys(req.body)[0]);
  const pdf = await printPdf(data).catch(e => console.log(e));
  res.contentType('application/pdf');
  res.send(pdf);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

