const express = require('express')
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
const port = process.env.PORT;

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const whitelist = ['http://localhost:1234', 'https://pernekshethracertificates.netlify.app']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

const printPdf = async (inData) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  await page.goto('https://marriagecertificate-perne.netlify.app', {
    waitUntil: 'domcontentloaded',
    timeout: 0
  });
  const selectors = [
    '#groom-name',
    '#groom-address1',
    '#groom-address2',
    '#groom-address3',
    '#bride-name',
    '#bride-address1',
    '#bride-address2',
    '#bride-address3',
    '#date',
    '#registernumber',
    '#issue-date'
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
  await page.type('#date', inData.date);
  await page.type('#registernumber', inData.registerNumber);
  await page.type('#issue-date', inData.issueDate);
  const pdf = await page.pdf({
    path: 'certificate.pdf',
    format: 'A4',
    preferCSSPageSize: true,
    printBackground: inData.printBackground
  });

  await browser.close();

  return pdf;
};

app.post('/', cors(corsOptions), async (req, res) => {
  if(!req.body) {
    res.status(404).send("{ msg: 'Failed to generate the certificate, contact developer on bellare545@gmail.com' }");
    return;
  }
  let data = null;
  try {
    data = JSON.parse(Object.keys(req.body)[0]);
    console.log(data);
  }
  catch(e) {
    res.status(404).send("{ msg: 'Failed to generate the certificate, contact developer on bellare545@gmail.com' }");
    return;
  }
  if(data !== null) {
    const pdf = await printPdf(data).catch(e => console.log(e));
    res.contentType('application/pdf');
    res.send(pdf);
    return;
  }
  res.status(404).send("{ msg: 'Failed to generate the certificate, contact developer on bellare545@gmail.com' }");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

