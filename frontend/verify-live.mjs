import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = './verify-live-screens';
mkdirSync(OUT, { recursive: true });

async function waitLoaded(page) {
  await page.locator('[data-testid="seal-loader"]').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(150);
}

const browser = await chromium.launch();

// ---------- "Dispositivo A": Portal Web ADMIN ----------
const adminCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const admin = await adminCtx.newPage();
await admin.goto(`${BASE}/login`);
await admin.fill('#email', 'admin@iprocess.co');
await admin.fill('#password', 'farmatrack123');
await admin.getByRole('button', { name: 'Ingresar al sistema' }).click();
await admin.waitForSelector('text=Panel operativo');
await waitLoaded(admin);
await admin.screenshot({ path: `${OUT}/A1-admin-dashboard.png`, fullPage: true });

await admin.goto(`${BASE}/panel/entregas`);
await admin.waitForSelector('text=Entregas ');
await waitLoaded(admin);
await admin.screenshot({ path: `${OUT}/A2-admin-entregas-antes.png`, fullPage: true });

// ---------- "Dispositivo B": app CDI móvil (María) ----------
const cdiCtx = await browser.newContext({ viewport: { width: 414, height: 896 } });
const cdi = await cdiCtx.newPage();
await cdi.goto(`${BASE}/login`);
await cdi.fill('#email', 'maria.rodriguez@farmatrack.co');
await cdi.fill('#password', 'farmatrack123');
await cdi.getByRole('button', { name: 'Ingresar al sistema' }).click();
await cdi.waitForSelector('text=Planillas por verificar');
await waitLoaded(cdi);
await cdi.screenshot({ path: `${OUT}/B1-cdi-lista.png`, fullPage: true });

await cdi.locator('button:has-text("R-017")').click();
await cdi.waitForSelector('text=Marca cada punto');
await waitLoaded(cdi);
const items = await cdi.locator('ul > li > button').all();
for (const item of items) await item.click();
await cdi.screenshot({ path: `${OUT}/B2-cdi-checklist-completo.png`, fullPage: true });
await cdi.getByRole('button', { name: 'Confirmar planilla verificada' }).click();
await cdi.waitForSelector('text=Planillas por verificar');
await waitLoaded(cdi);
await cdi.screenshot({ path: `${OUT}/B3-cdi-lista-despues.png`, fullPage: true });

// ---------- "Dispositivo C": app Conductor (Carlos) ----------
const driverCtx = await browser.newContext({ viewport: { width: 414, height: 896 } });
const driver = await driverCtx.newPage();
await driver.goto(`${BASE}/login`);
await driver.fill('#email', 'carlos.pena@farmatrack.co');
await driver.fill('#password', 'farmatrack123');
await driver.getByRole('button', { name: 'Ingresar al sistema' }).click();
await driver.waitForSelector('text=Mi ruta de hoy');
await waitLoaded(driver);
await driver.screenshot({ path: `${OUT}/C1-conductor-mi-ruta.png`, fullPage: true });

await driver.locator('button:has-text("Pendiente")').first().click();
await driver.waitForSelector('text=Cargando entrega…', { state: 'hidden' });
await waitLoaded(driver);

const recibirBtn = driver.getByRole('button', { name: 'Recibir para transporte' });
if (await recibirBtn.count()) {
  await recibirBtn.click();
  await driver.waitForSelector('text=Firma del destinatario');
  await waitLoaded(driver);
}

// firma
const canvas = driver.locator('canvas');
await canvas.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
if (await canvas.count()) {
  const box = await canvas.boundingBox();
  await driver.mouse.move(box.x + 20, box.y + box.height / 2);
  await driver.mouse.down();
  await driver.mouse.move(box.x + box.width - 20, box.y + box.height / 2, { steps: 10 });
  await driver.mouse.up();
}

// foto: simular archivo
const fileInput = driver.locator('input[type="file"]');
if (await fileInput.count()) {
  await fileInput.setInputFiles({
    name: 'evidencia.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    ),
  });
}

await driver.fill('#receiverName', 'Cliente de Prueba Live');
await driver.fill('#receiverIdNumber', '1099887766');

// geo: otorgar permisos falsos
await driverCtx.grantPermissions(['geolocation'], { origin: BASE });
await driverCtx.setGeolocation({ latitude: 4.711, longitude: -74.0721 });
const geoBtn = driver.getByRole('button', { name: 'Capturar ubicación' });
if (await geoBtn.count()) {
  await geoBtn.click();
  await driver.waitForTimeout(500);
}

await driver.screenshot({ path: `${OUT}/C2-conductor-captura-llena.png`, fullPage: true });

const confirmBtn = driver.getByRole('button', { name: 'Confirmar entrega' });
await confirmBtn.click();
await driver.waitForSelector('text=Entrega confirmada', { timeout: 10000 }).catch(() => {});
await driver.screenshot({ path: `${OUT}/C3-conductor-entrega-confirmada.png`, fullPage: true });

// ---------- Volver a "Dispositivo A" SIN recargar, esperar el polling ----------
await admin.waitForTimeout(6000);
await admin.screenshot({ path: `${OUT}/A3-admin-entregas-despues-polling.png`, fullPage: true });

// abrir el detalle de la entrega confirmada para ver el badge de facturación
await admin.goto(`${BASE}/panel/entregas`);
await waitLoaded(admin);
const confirmedRow = admin.locator('tr:has-text("Entregado")').first();
if (await confirmedRow.count()) {
  await confirmedRow.locator('a.font-mono').click();
  await admin.waitForSelector('text=Contenido del envío');
  await waitLoaded(admin);
  await admin.screenshot({ path: `${OUT}/A4-admin-detalle-facturacion.png`, fullPage: true });
}

// ---------- Portal cliente: ver evidencia ----------
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
await portal.screenshot({ path: `${OUT}/D1-portal-evidencia.png`, fullPage: true });

await browser.close();
console.log('listo');
