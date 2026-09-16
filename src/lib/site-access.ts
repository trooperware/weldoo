import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server.js";

export const SITE_COOKIE = "weldoo_site_access";
const SESSION_SECONDS = 12 * 60 * 60;
const ACCESS_PATH = "/site-access";
const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function signature(value: string, password: string) {
  return createHmac("sha256", password).update(`weldoo-site-access:v1:${value}`).digest("hex");
}

export function createSiteSession(password: string, now = Date.now()) {
  const expires = String(Math.floor(now / 1000) + SESSION_SECONDS);
  return `${expires}.${signature(expires, password)}`;
}

export function validSiteSession(token: string | undefined, password: string, now = Date.now()) {
  if (!token || !/^\d{10}\.[a-f0-9]{64}$/.test(token)) return false;
  const [expires, mac] = token.split(".");
  const remaining = Number(expires) - Math.floor(now / 1000);
  return remaining > 0 && remaining <= SESSION_SECONDS &&
    timingSafeEqual(Buffer.from(mac, "hex"), Buffer.from(signature(expires, password), "hex"));
}

export function safeReturnPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return "/";
  const url = new URL(value, "https://site.invalid");
  if (url.origin !== "https://site.invalid" || url.pathname === ACCESS_PATH) return "/";
  return url.pathname + url.search;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

function gatePage(next: string, error = false) {
  return new NextResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Private access · Weldoo</title><style>
  *{box-sizing:border-box}body{margin:0;background:#f5f5fb;color:#0c0c18;font:16px system-ui,sans-serif;min-height:100svh;display:grid;place-items:center;padding:24px}main{width:100%;max-width:420px;background:white;border:1px solid #e0e0ed;border-radius:24px;padding:40px;box-shadow:0 16px 60px #3d3db410}.brand{font-size:32px;font-weight:800;color:#3d3db4;letter-spacing:-1.5px}h1{font-size:24px;margin:32px 0 12px}p{color:#44446a;line-height:1.6}label{display:block;font-weight:600;margin:24px 0 8px}input,button{font:inherit;width:100%;border-radius:10px;padding:14px}input{border:1px solid #b9b9d2}input:focus{outline:3px solid #7b7fe855;border-color:#3d3db4}button{border:0;background:#3d3db4;color:white;font-weight:600;margin-top:16px;cursor:pointer}button:hover{background:#2d2d9a}.error{color:#b42318;font-size:14px}.note{font-size:13px;margin-bottom:0}
  </style></head><body><main><div class="brand">weldoo</div><h1>A little privacy while we build.</h1><p>Enter the shared password to explore Weldoo.</p><form method="post" action="${ACCESS_PATH}"><input type="hidden" name="next" value="${escapeHtml(next)}"><label for="password">Site password</label><input id="password" type="password" name="password" autocomplete="current-password" required maxlength="256" autofocus ${error ? 'aria-invalid="true" aria-describedby="error"' : ""}>${error ? '<p class="error" id="error" role="alert">That password isn’t correct. Please try again.</p>' : ""}<button type="submit">Enter Weldoo</button></form><p class="note">Access lasts up to 12 hours in this browser.</p></main></body></html>`, {
    status: error ? 401 : 200,
    headers: { ...privateHeaders, "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" },
  });
}

/** Runs before app authentication. Null means continue with normal app handling. */
export async function enforceSiteAccess(request: NextRequest, password = process.env.SITE_PASSWORD) {
  if (!password) return null;
  // A high-entropy password is also the session signing key. Misconfiguration fails closed.
  if (password.length < 20 || password.length > 256) {
    return new NextResponse("Site access is not configured correctly.", { status: 503, headers: privateHeaders });
  }
  const path = request.nextUrl.pathname;
  // Next.js can normalize request.url to localhost behind its local server.
  // Use the actual HTTP host so same-origin forms and redirects stay on the visitor's host.
  const origin = `${request.nextUrl.protocol}//${request.headers.get("host") ?? request.nextUrl.host}`;
  if (path === ACCESS_PATH) {
    if (request.method === "GET") return gatePage(safeReturnPath(request.nextUrl.searchParams.get("next")));
    if (request.method !== "POST") return new NextResponse(null, { status: 405, headers: { ...privateHeaders, Allow: "GET, POST" } });
    if (request.headers.get("origin") !== origin) {
      return new NextResponse("Invalid origin.", { status: 403, headers: privateHeaders });
    }
    if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) {
      return new NextResponse(null, { status: 415, headers: privateHeaders });
    }
    // Bound the body even when Content-Length is absent or incorrect.
    const reader = request.body?.getReader();
    if (!reader) return new NextResponse(null, { status: 400, headers: privateHeaders });
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 4096) {
        await reader.cancel();
        return new NextResponse(null, { status: 413, headers: privateHeaders });
      }
      chunks.push(value);
    }
    const form = new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
    const next = safeReturnPath(form.get("next"));
    const digest = (value: string) => createHash("sha256").update(value).digest();
    if (!timingSafeEqual(digest(form.get("password") ?? ""), digest(password))) return gatePage(next, true);
    const response = NextResponse.redirect(new URL(next, origin), 303);
    Object.entries(privateHeaders).forEach(([key, value]) => response.headers.set(key, value));
    response.cookies.set(SITE_COOKIE, createSiteSession(password), {
      httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "lax", path: "/",
      // No Max-Age: browser-session cookie, with a signed server-enforced expiry.
    });
    return response;
  }
  if (validSiteSession(request.cookies.get(SITE_COOKIE)?.value, password)) return null;
  if (path.startsWith("/api/") || path === "/api" || !["GET", "HEAD"].includes(request.method)) {
    return NextResponse.json({ error: "Site password required." }, { status: 401, headers: privateHeaders });
  }
  const url = new URL(ACCESS_PATH, origin);
  url.searchParams.set("next", path + request.nextUrl.search);
  const response = NextResponse.redirect(url, 307);
  Object.entries(privateHeaders).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}
