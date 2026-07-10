import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = './verify-screens';
mkdirSync(OUT, { recursive: true });

const errors = [];

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`✓ ${name}`);
}

async function waitLoaded(page) {
  await page.locator('[data-testid="seal-loader"]').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(150);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[${page.url()}] ${msg.text()}`);
});
page.on('pageerror', (err) => errors.push(`[pageerror ${page.url()}] ${err.message}`));

// ---- Landing ----
await page.goto(BASE);
await page.waitForSelector('text=Acceso interno');
await shot(page, '00-landing');

// ---- Staff login ----
await page.getByRole('link', { name: 'Acceso interno' }).click();
await page.waitForSelector('text=Ingresa con tu cuenta corporativa');
await shot(page, '01-login');

await page.fill('#email', 'maria.rodriguez@farmatrack.co');
await page.fill('#password', 'farmatrack123');
await page.getByRole('button', { name: 'Ingresar al sistema' }).click();
await page.waitForSelector('text=Panel operativo');
await waitLoaded(page);
await shot(page, '02-panel-dashboard');

// ---- Deliveries + TXT import ----
await page.getByRole('link', { name: 'Entregas' }).click();
await page.waitForSelector('text=Entregas ');
await waitLoaded(page);
await shot(page, '03-panel-entregas');

await page.getByRole('button', { name: 'Importar planilla (TXT)' }).click();
await page.waitForSelector('text=Importar planilla (TXT)');
await page.getByRole('button', { name: 'Usar ejemplo válido' }).click();
await shot(page, '04-panel-import-dialog');
await page.getByRole('button', { name: 'Importar planilla' }).click();
await page.waitForSelector('text=Planilla cargada');
await shot(page, '05-panel-import-success');
await page.getByRole('button', { name: 'Listo' }).click();

// malformed case
await page.getByRole('button', { name: 'Importar planilla (TXT)' }).click();
await page.waitForSelector('text=Importar planilla (TXT)');
await page.getByRole('button', { name: 'Usar ejemplo mal formado' }).click();
await page.getByRole('button', { name: 'Importar planilla' }).click();
await page.waitForSelector('text=La planilla no se pudo cargar');
await shot(page, '06-panel-import-error');
await page.keyboard.press('Escape');

// ---- Delivery detail ----
await page.goto(`${BASE}/panel/entregas`);
await page.waitForSelector('table');
await page.locator('table a.font-mono').first().click();
await page.waitForSelector('text=Contenido del envío');
await waitLoaded(page);
await shot(page, '07-panel-delivery-detail');

// ---- Routes ----
await page.goto(`${BASE}/panel/rutas`);
await page.waitForSelector('text=Rutas');
await waitLoaded(page);
await shot(page, '08-panel-rutas');

// ---- CEDIs ----
await page.goto(`${BASE}/panel/cedis`);
await page.waitForSelector('text=Centros de distribución');
await waitLoaded(page);
await shot(page, '09-panel-cedis');

// ---- Logout, login as conductor ----
await page.getByRole('button', { name: 'Cerrar sesión' }).click();
await page.waitForSelector('text=Ingresa con tu cuenta corporativa');

await page.setViewportSize({ width: 414, height: 896 });
await page.fill('#email', 'carlos.pena@farmatrack.co');
await page.fill('#password', 'farmatrack123');
await page.getByRole('button', { name: 'Ingresar al sistema' }).click();
await page.waitForSelector('text=Mi ruta de hoy');
await waitLoaded(page);
await waitLoaded(page);
await shot(page, '10-conductor-mi-ruta');

// open a pending stop
const pendingStop = page.locator('button:has-text("Pendiente")').first();
await pendingStop.click();
await page.waitForSelector('text=Cargando entrega…', { state: 'hidden' });
await page.waitForTimeout(200);
await shot(page, '11-conductor-captura');

const recibirBtn = page.getByRole('button', { name: 'Recibir para transporte' });
if (await recibirBtn.count()) {
  await recibirBtn.click();
  await page.waitForSelector('text=Firma del destinatario');
  await shot(page, '11b-conductor-captura-form');
}

// draw a signature stroke
const canvas = page.locator('canvas');
await canvas.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
const box = (await canvas.count()) ? await canvas.boundingBox() : null;
if (box) {
  await page.mouse.move(box.x + 20, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();
}
if (box) {
  await page.fill('#receiverName', 'Cliente de Prueba');
  await page.fill('#receiverIdNumber', '1020304050');
  await shot(page, '12-conductor-captura-llena');
}

// ---- Client portal ----
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(`${BASE}/portal`);
await page.waitForSelector('text=Consulta tu pedido');
await shot(page, '13-portal-login');

await page.fill('#trackingNumber', 'FARMA-00231');
await page.fill('#verificationValue', '3011234567');
await page.getByRole('button', { name: 'Consultar mis pedidos' }).click();
await page.waitForSelector('text=Farmacia San Rafael');
await shot(page, '14-portal-mis-entregas');

await page.locator('a:has-text("FARMA-00231")').click();
await page.waitForSelector('text=Contenido del envío');
await shot(page, '15-portal-detalle');

// error case: unknown guide
await page.goto(`${BASE}/portal`);
await page.fill('#trackingNumber', 'FARMA-99999');
await page.fill('#verificationValue', '3000000000');
await page.getByRole('button', { name: 'Consultar mis pedidos' }).click();
await page.waitForSelector('text=Guía no encontrada');
await shot(page, '16-portal-error-guia');

await browser.close();

console.log('\n--- Console/page errors ---');
console.log(errors.length ? errors.join('\n') : '(ninguno)');
