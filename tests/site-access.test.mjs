import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server.js';
import { createSiteSession, validSiteSession, safeReturnPath, enforceSiteAccess } from '../src/lib/site-access.ts';

const password = 'test-only-random-password-123456789';
const request = (path, options) => new NextRequest(`https://weldoo.test${path}`, options);
const login = (value, next = '/', origin = 'https://weldoo.test') => request('/site-access', {
  method: 'POST', headers: { origin, 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ password: value, next }).toString(),
});

test('signed sessions reject tampering, expiry, future timestamps and password rotation', () => {
  const now = Date.now();
  const token = createSiteSession(password, now);
  assert.equal(validSiteSession(token, password, now), true);
  assert.equal(validSiteSession(token, password, now + 12 * 3600 * 1000), false);
  assert.equal(validSiteSession(token, 'changed-password', now), false);
  assert.equal(validSiteSession(token + '0', password, now), false);
  assert.equal(validSiteSession('1234567890.' + '0'.repeat(64), password, now), false);
  assert.equal(validSiteSession(createSiteSession(password, now + 60000), password, now), false);
});

test('return paths cannot redirect off-site', () => {
  for (const path of ['//evil.test', '/\\evil.test', 'https://evil.test', '/site-access', '/foo\r\nbar']) {
    assert.equal(safeReturnPath(path), '/');
  }
  assert.equal(safeReturnPath('/jobs?search=welding'), '/jobs?search=welding');
});

test('gate covers pages, public assets, API and action requests', async () => {
  for (const path of ['/', '/jobs', '/image.png', '/_next/image?url=%2Fimage.png']) {
    const response = await enforceSiteAccess(request(path), password);
    assert.equal(response.status, 307);
    assert.equal(new URL(response.headers.get('location')).pathname, '/site-access');
  }
  assert.equal((await enforceSiteAccess(request('/api/jobs'), password)).status, 401);
  assert.equal((await enforceSiteAccess(request('/jobs', { method: 'POST' }), password)).status, 401);
  assert.equal(await enforceSiteAccess(request('/'), ''), null);
  assert.equal((await enforceSiteAccess(request('/'), 'short')).status, 503);
});

test('login validates password and origin, sets private session cookie and restores destination', async () => {
  const wrong = await enforceSiteAccess(login('incorrect'), password);
  assert.equal(wrong.status, 401);
  assert.equal(wrong.headers.get('referrer-policy'), 'same-origin');
  assert.equal((await enforceSiteAccess(login(password, '/', 'null'), password)).status, 403);
  assert.equal(wrong.headers.get('set-cookie'), null);
  assert.equal((await enforceSiteAccess(login(password, '/', 'https://evil.test'), password)).status, 403);
  const response = await enforceSiteAccess(login(password, '/jobs?tab=saved'), password);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), 'https://weldoo.test/jobs?tab=saved');
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=lax/);
  assert.doesNotMatch(cookie, /Max-Age|Expires/i);
  assert.equal(await enforceSiteAccess(request('/api/jobs', { headers: { cookie: cookie.split(';')[0] } }), password), null);
  assert.match(response.headers.get('cache-control'), /no-store/);
});

test('gate escapes reflected content and bounds request bodies', async () => {
  const response = await enforceSiteAccess(request('/site-access?next=' + encodeURIComponent('/\"><script>alert(1)</script>')), password);
  assert.equal(response.headers.get('referrer-policy'), 'same-origin');
  assert.doesNotMatch(await response.text(), /<script>/);
  assert.equal((await enforceSiteAccess(login('x'.repeat(5000)), password)).status, 413);
  assert.equal((await enforceSiteAccess(request('/site-access', { method: 'DELETE' }), password)).status, 405);
});

test('uses the visitor host when Next.js normalizes its internal URL', async () => {
  const req = new NextRequest('http://localhost:3097/site-access', {
    method: 'POST', headers: { host: '127.0.0.1:3097', origin: 'http://127.0.0.1:3097', 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ password, next: '/jobs' }).toString(),
  });
  const response = await enforceSiteAccess(req, password);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), 'http://127.0.0.1:3097/jobs');
});
