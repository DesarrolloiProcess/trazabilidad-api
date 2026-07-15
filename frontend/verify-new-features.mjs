import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = '../docs/screenshots';
mkdirSync(OUT, { recursive: true });

async function waitLoaded(page) {
  await page.locator('[data-testid="seal-loader"]').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(150);
}

const browser = await chromium.launch();

// ---- CDI móvil ----
const cdiCtx = await browser.newContext({ viewport: { width: 414, height: 896 } });
const cdi = await cdiCtx.newPage();
await cdi.goto(`${BASE}/login`);
await cdi.fill('#email', 'maria.rodriguez@farmatrack.co');
await cdi.fill('#password', 'farmatrack123');
await cdi.getByRole('button', { name: 'Ingresar al sistema' }).click();
await cdi.waitForSelector('text=Planillas por verificar');
await waitLoaded(cdi);
await cdi.screenshot({ path: `${OUT}/17-cdi-lista.png`, fullPage: true });

const routeBtn = cdi.locator('button:has-text("R-0")').first();
if (await routeBtn.count()) {
  await routeBtn.click();
  await cdi.waitForSelector('text=Marca cada punto');
  await waitLoaded(cdi);
  await cdi.screenshot({ path: `${OUT}/18-cdi-checklist.png`, fullPage: true });
}

// ---- Portal cliente: evidencia ----
const portalCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const portal = await portalCtx.newPage();
await portal.goto(`${BASE}/portal`);
await portal.fill('#trackingNumber', 'FARMA-00229');
await portal.fill('#verificationValue', '3033456789');
await portal.getByRole('button', { name: 'Consultar mis pedidos' }).click();
await portal.waitForSelector('text=Punto Salud Norte');
await waitLoaded(portal);
await portal.locator('a:has-text("FARMA-00229")').click();
await portal.waitForSelector('text=Contenido del envío');
await waitLoaded(portal);
await portal.screenshot({ path: `${OUT}/19-portal-evidencia.png`, fullPage: true });

// ---- Panel web: badge de facturación ----
const adminCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const admin = await adminCtx.newPage();
await admin.goto(`${BASE}/login`);
await admin.fill('#email', 'admin@iprocess.co');
await admin.fill('#password', 'farmatrack123');
await admin.getByRole('button', { name: 'Ingresar al sistema' }).click();
await admin.waitForSelector('text=Panel operativo');
await admin.goto(`${BASE}/panel/entregas`);
await admin.waitForSelector('table');
await waitLoaded(admin);
await admin.locator('tr:has-text("Entregado")').first().locator('a.font-mono').click();
await admin.waitForSelector('text=Contenido del envío');
await waitLoaded(admin);
await admin.screenshot({ path: `${OUT}/20-panel-facturacion.png`, fullPage: true });

await browser.close();
console.log('listo');
