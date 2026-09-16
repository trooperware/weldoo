import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { NextRequest } from 'next/server.js';
import { enforceSiteAccess } from '../src/lib/site-access.ts';

// Run with Playwright installed, or point PLAYWRIGHT_MODULE to an existing install.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const password = 'browser-test-only-password-123456789';
const origins = [];
const server = createServer(async (req, res) => {
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const options = { method: req.method, headers: req.headers };
    if (req.method === 'POST') {
      options.body = Buffer.concat(chunks);
      origins.push(req.headers.origin);
    }
    const request = new NextRequest(`http://${req.headers.host}${req.url}`, options);
    const response = await enforceSiteAccess(request, password) ?? new Response('Access granted');
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    res.writeHead(500);
    res.end(String(error));
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const origin = `http://127.0.0.1:${server.address().port}`;
  await page.goto(`${origin}/jobs?tab=saved`);
  await page.locator('#password').fill('wrong-password');
  await Promise.all([page.waitForNavigation(), page.getByRole('button', { name: 'Enter Weldoo' }).click()]);
  assert.equal(origins[0], origin, 'Native form POST must retain its origin');
  assert.match(await page.locator('body').innerText(), /isn’t correct/);
  await page.locator('#password').fill(password);
  await Promise.all([page.waitForNavigation(), page.getByRole('button', { name: 'Enter Weldoo' }).click()]);
  assert.equal(origins[1], origin, 'Retry form must also retain its origin');
  assert.equal(page.url(), `${origin}/jobs?tab=saved`);
  assert.equal(await page.locator('body').innerText(), 'Access granted');
  console.log('Browser checks passed: native form origin, wrong-password retry, login and return destination.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
