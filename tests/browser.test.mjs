// Prueba la página de verdad en un navegador (Chromium sin ventana).
// Se corre con: npm run test:browser
// Requiere: npm install && npx playwright install chromium
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.js': 'text/javascript' };

// Servidor estático mínimo (como GitHub Pages)
const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = normalize(join(ROOT, path));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end('not found'); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const results = [];

async function test(name, fn) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const gaRequests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/googletagmanager|google-analytics/.test(m.text())) errors.push(m.text()); });
  // Nunca salir a internet: Analytics se intercepta y se cuenta
  await context.route(/googletagmanager\.com|google-analytics\.com/, route => {
    gaRequests.push(route.request().url());
    route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
  });
  try {
    await fn({ page, context, errors, gaRequests });
    if (errors.length) throw new Error('errores en la consola: ' + errors.join(' | '));
    results.push([true, name]);
  } catch (e) {
    results.push([false, name, e.message]);
  } finally {
    await context.close();
  }
}

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const zonesCount = (page) => page.locator('#zones .zone').count();

await test('carga la página y muestra los 37 husos horarios', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForSelector('#zones .zone');
  assert(await zonesCount(page) === 37, `se esperaban 37 zonas, hay ${await zonesCount(page)}`);
});

await test('sin aceptar cookies no se carga Google Analytics', async ({ page, gaRequests }) => {
  await page.goto(BASE);
  await page.waitForSelector('#zones .zone');
  assert(await page.locator('#cookie-banner').isVisible(), 'el aviso de cookies no aparece');
  await page.waitForTimeout(500);
  assert(gaRequests.length === 0, 'se llamó a Google antes de aceptar');
  await page.click('#cookie-reject');
  await page.reload();
  await page.waitForSelector('#zones .zone');
  assert(!(await page.locator('#cookie-banner').isVisible()), 'el aviso vuelve a aparecer tras rechazar');
  assert(gaRequests.length === 0, 'se llamó a Google tras rechazar');
});

await test('al aceptar cookies se carga Google Analytics', async ({ page, gaRequests }) => {
  await page.goto(BASE);
  await page.click('#cookie-accept');
  await page.waitForTimeout(300);
  assert(gaRequests.some(u => u.includes('G-P9SC8CDHN4')), 'no se cargó gtag.js después de aceptar');
  assert(!(await page.locator('#cookie-banner').isVisible()), 'el aviso no se cerró');
});

await test('un saludo con HTML no se ejecuta (XSS)', async ({ page }) => {
  await page.addInitScript(() => {
    try {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('greeting_newyear', '<img src=x onerror="window.__xss=1"> "\'><script>window.__xss=2</script>');
        localStorage.setItem('cfg_showTweets', '1');
        sessionStorage.setItem('seeded', '1');
      }
    } catch {}
  });
  await page.goto(BASE);
  await page.waitForSelector('#zones .zone');
  await page.locator('#zones .zone').first().locator('.zone-head, button, [role=button]').first().click().catch(() => {});
  await page.waitForTimeout(300);
  assert(await page.evaluate(() => window.__xss) === undefined, 'se ejecutó código inyectado');
});

await test('ajustes guardados inválidos no rompen la página', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cfg_holidayCountry', '__proto__');
    localStorage.setItem('cfg_baseSelect', 'custom');
    localStorage.setItem('cfg_baseCustom', '999');
    localStorage.setItem('cfg_citySeconds', 'NaN');
    localStorage.setItem('cfg_lastTab', 'holidays');
  });
  await page.goto(BASE);
  await page.waitForSelector('#cal-grid-holidays .cal-card');
  assert(await page.locator('#holiday-country-select').inputValue() === 'ar', 'no volvió al país por defecto');
});

await test('funciona aunque el navegador bloquee el almacenamiento', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('bloqueado', 'SecurityError'); } });
  });
  await page.goto(BASE);
  await page.waitForSelector('#zones .zone');
  assert(await zonesCount(page) === 37, 'no cargaron las zonas');
});

await test('si data.json falla, se muestra un aviso en vez de una página rota', async ({ page, context, errors }) => {
  await context.route('**/data.json', r => r.fulfill({ status: 500, body: 'error' }));
  await page.goto(BASE);
  await page.waitForSelector('.load-error');
  errors.length = 0; // el error se registra a propósito en la consola
});

await test('el saludo no supera el largo máximo', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForSelector('#zones .zone');
  const max = await page.locator('#greeting-input').getAttribute('maxlength');
  assert(max === '500', 'el saludo no tiene maxlength');
  assert(await page.locator('#search').getAttribute('maxlength') === '60', 'la búsqueda no tiene maxlength');
});

await test('vista para la web (?vitrina=1) no muestra el aviso de cookies', async ({ page, gaRequests }) => {
  await page.goto(BASE + '?vitrina=1');
  await page.waitForSelector('#zones .zone');
  assert(!(await page.locator('#cookie-banner').isVisible()), 'el aviso aparece en la vitrina');
  assert(gaRequests.length === 0, 'se cargó Analytics en la vitrina sin permiso');
});

await test('en un celular no hay scroll horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(BASE);
  await page.waitForSelector('#zones .zone');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, `la página se desborda ${overflow}px`);
});

await test('la política de privacidad carga y borra los datos del navegador', async ({ page }) => {
  await page.goto(BASE);
  await page.evaluate(() => { localStorage.setItem('greeting_newyear', 'hola'); localStorage.setItem('otro_proyecto', 'no tocar'); });
  await page.goto(BASE + 'privacidad.html');
  assert(await page.locator('h1').innerText() === 'Política de privacidad', 'título incorrecto');
  page.once('dialog', d => d.accept());
  await page.click('#wipe');
  await page.waitForSelector('#status:not(:empty)');
  const left = await page.evaluate(() => [localStorage.getItem('greeting_newyear'), localStorage.getItem('otro_proyecto')]);
  assert(left[0] === null, 'no se borró el saludo');
  assert(left[1] === 'no tocar', 'borró datos de otro proyecto');
});

await browser.close();
server.close();

for (const [ok, name, err] of results) console.log(`${ok ? '✓' : '✗'} ${name}${err ? `\n    → ${err}` : ''}`);
const failed = results.filter(r => !r[0]).length;
console.log(`\n${results.length - failed}/${results.length} pruebas pasaron`);
process.exit(failed ? 1 : 0);
