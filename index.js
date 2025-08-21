import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const whitelist = [
  'http://localhost:1234',
  'https://pernekshethracertificates.netlify.app',
  // NOTE: wildcard like *.retool.com won't match with simple indexOf
];
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // allow curl/postman
    const ok =
      whitelist.includes(origin) ||
      /\.retool\.com$/.test(new URL(origin).hostname); // handle subdomains
    return ok ? callback(null, true) : callback(new Error('Not allowed by CORS'));
  }
};
app.use(cors(corsOptions));

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
    printBackground: inData.printBackground === "true" ? true : false
  });

  await browser.close();

  return pdf;
};

app.post('/', async (req, res) => {
  if(!req.body) {
    console.log(1);
    res.status(404).send("{ msg: 'Failed to generate the certificate, contact developer on bellare545@gmail.com' }");
    return;
  }
  const pdf = await printPdf(req.body).catch(e => console.log(e));
  res.contentType('application/pdf');
  res.send(pdf);
  return;
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
});
