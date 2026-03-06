import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.error('BROWSER ERROR:', msg.text());
            }
        });

        page.on('pageerror', err => {
            console.error('PAGE EXCEPTION:', err.toString());
        });

        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });

        await browser.close();
    } catch (err) {
        console.error('Puppeteer Script Error:', err);
    }
})();
