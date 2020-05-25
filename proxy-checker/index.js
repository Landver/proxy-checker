const puppeteer = require('puppeteer');

let browser;
let page;


/** list of methods to test one specific proxy */
const proxyChecker = {
    /** initialization */
    initialize: async (protocol, address, port, login, password) => {
        console.log('Starting proxy-checker..');

        browser = await puppeteer.launch({
            // headless: false,
            args: [`--proxy-server=${protocol}://${address}:${port}`]
        });
        page = await browser.newPage();

        // ** Do not download images and fonts */
        await page.setRequestInterception(true);
        page.on('request', req => {
            if (['image', 'font'].includes(req.resourceType())) { req.abort(); }
            else { req.continue() }
        })
    },

    accessSpeedTestSite: async () => {
        console.log('Open Speed Test site..');

        /** Selectors */
        const cookiesAcceptButton = 'button[id="_evidon-banner-acceptbutton"]';
        const goButton = 'a[class="js-start-test test-mode-multi"]';
        const goAgainButton = 'a[class="js-start-test test-mode-multi start-button-state-after"]';
        const downloadSpeedResult = 'span[class="result-data-large number result-data-value download-speed"]';
        const uploadSpeedResult = 'span[class="result-data-large number result-data-value upload-speed"]';

        /** Go to speed test page */
        try { await page.goto("https://www.speedtest.net/", { timeout: 10000 }) } 
        catch (err) {
            console.log(`10 sec had passed since initial page load attempt`);
            if (err.message.includes('ERR_PROXY_CONNECTION_FAILED') || err.message.includes('ERR_CONNECTION_RESET')) { return }
        };

        /** Close popup cookies warning banner */
        try {
            await page.waitFor(cookiesAcceptButton, { timeout: 4000 }); await page.click(cookiesAcceptButton, { delay: 25 });
            await page.waitFor(1000)
        } catch (err) { console.log('was no request to accept cookies') };

        /** Click on "Go" button to start speed test */
        try {
            await page.waitFor(goButton, { timeout: 3000 });
            await page.click(goButton, { delay: 25 })
        }
        catch (err) {
            console.log(err);
            return
        };

        /** Wait 60 seconds to let speed test finish it's job */
        try { await page.waitFor(goAgainButton, { timeout: 60000 }); }
        catch (err) {
            console.log(err);
            return
        };

        /** Get result values of maxumum download and upload speed */
        try {
            const downloadSpeed = await page.$eval(downloadSpeedResult, el => el.innerText);
            const uploadSpeed = await page.$eval(uploadSpeedResult, el => el.innerText);
            console.log(`download: ${downloadSpeed}, upload: ${uploadSpeed}`)
        } catch (err) { console.log(err.message) }
    },

    /** close the browser */
    end: async () => {
        console.log('Close browser..');
        await browser.close()
    },
}

module.exports = proxyChecker;
