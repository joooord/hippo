
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000); // Wait for 2 seconds
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
})();
