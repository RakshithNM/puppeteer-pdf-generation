import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
const app = express();

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
  console.log(inData, "inData");
  const browser = await puppeteer.launch({
    headless: true, // (In v24, boolean is fine. If you ever see a deprecation, use 'new'.)
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0); // or set a real number if you prefer

    await page.goto('https://marriagecertificate-perne.netlify.app', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000
    });

    const selectors = [
      '#groom-name', '#groom-address1', '#groom-address2', '#groom-address3',
      '#bride-name', '#bride-address1', '#bride-address2', '#bride-address3',
      '#date', '#registernumber', '#issue-date'
    ];
    await Promise.all(selectors.map(sel => page.waitForSelector(sel, { timeout: 30_000 })));

    const v = (x) => (x ?? '').toString();

    await page.type('#groom-name', v(inData.groomName));
    await page.type('#groom-address1', v(inData.groomAddress1));
    await page.type('#groom-address2', v(inData.groomAddress2));
    await page.type('#groom-address3', v(inData.groomAddress3));
    await page.type('#bride-name', v(inData.brideName));
    await page.type('#bride-address1', v(inData.brideAddress1));
    await page.type('#bride-address2', v(inData.brideAddress2));
    await page.type('#bride-address3', v(inData.brideAddress3));
    await page.type('#date', v(inData.date));
    await page.type('#registernumber', v(inData.registerNumber));
    await page.type('#issue-date', v(inData.issueDate));

    const pdf = await page.pdf({
      path: 'certificate.pdf',
      format: 'A4',
      preferCSSPageSize: true,
      printBackground: inData.printBackground === true || inData.printBackground === 'true'
    });

    return pdf;
  } finally {
    console.log("Closing browser...");
    await browser.close();
  }
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

app.listen(3000, () => {
  console.log(`App listening at http://localhost:${3000}`)
});
