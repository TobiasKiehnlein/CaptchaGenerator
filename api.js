const puppeteer = require('puppeteer');
const express = require('express');

const app = express();
const PORT = 3000;
const HOST = 'localhost';

app.use(express.static('public'));

app.get('/generateCaptchas', async (req, res) => {
    res.send(await getCaptchas(req.query.amount || "1"));
});

app.listen(PORT, () => {
    console.log(`Captcha api listening at http://${HOST}:${PORT}`);
});

const getCaptchas = async (n) => {
    n = parseInt(n);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForSelector("#initialized");

    const result = await page.evaluate(`generateCaptchas(${n})`, n);

    await browser.close();

    return result;
};
