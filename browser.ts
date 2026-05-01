import { chromium, type Browser, type Page } from 'playwright';

let browser: Browser | null = null;
let page: Page | null = null;

export async function manipulateBrowser(action: string, url?: string, selector?: string, value?: string): Promise<any> {
    if (!browser) {
        browser = await chromium.launch({ headless: true }); // Headless to run on Linux VPS natively without GUI
        page = await browser.newPage();
    }
    
    try {
        switch (action) {
            case 'goto':
                if (!url) throw new Error("URL required for goto");
                await page!.goto(url, { waitUntil: 'networkidle' });
                return { result: `Navigated to ${url}`, title: await page!.title() };
                
            case 'click':
                if (!selector) throw new Error("Selector required for click");
                await page!.click(selector);
                return { result: `Clicked on ${selector}` };
                
            case 'type':
                if (!selector || value === undefined) throw new Error("Selector and value required for type");
                await page!.fill(selector, value);
                return { result: `Typed '${value}' into ${selector}` };
                
            case 'extract':
                if (!selector) throw new Error("Selector required for extract");
                const text = await page!.locator(selector).textContent();
                return { result: text };
                
            case 'screenshot':
                const buffer = await page!.screenshot({ type: 'jpeg', quality: 50 });
                return { image: buffer.toString('base64') };
                
            case 'close':
                await browser.close();
                browser = null;
                page = null;
                return { result: "Browser closed" };
                
            default:
                throw new Error(`Unknown browser action: ${action}`);
        }
    } catch (e: any) {
        return { error: e.message };
    }
}
