import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface ActaProduct {
  code: string;
  description: string;
  quantity: number;
  price?: number;
}

export interface ActaData {
  trackingNumber: string;
  address: string;
  recipientName: string;
  products: ActaProduct[];
  receiverName: string | null;
  receiverIdNumber: string | null;
  deliveredAt: string | null;
  latitude: number | null;
  longitude: number | null;
  signatureUrl: string | null;
  photoUrl: string | null;
  /** Datos de la línea de tiempo completa (creación → alistamiento → entrega) — opcionales porque
   * el portal público del paciente genera esta misma acta sin exponer datos internos de CDI. */
  createdAt?: string;
  alistamientoStartedAt?: string | null;
  alistamientoEndedAt?: string | null;
  verifierSignatureUrl?: string | null;
}

// Paleta de marca FarmaTrack × La Rebaja (misma fuente de verdad que tailwind.config.ts).
const NAVY: [number, number, number] = [36, 20, 23]; // carbón cálido #241417
const NARANJA: [number, number, number] = [214, 40, 57]; // rojo de marca #D62839
const BLANCO_CLINICO: [number, number, number] = [255, 255, 255]; // blanco puro #FFFFFF
const VERDE_SALVIA: [number, number, number] = [47, 111, 94]; // #2F6F5E, sin cambios
const ARENA: [number, number, number] = [240, 235, 227]; // #F0EBE3, sin cambios
const GRIS_PIZARRA: [number, number, number] = [107, 114, 128]; // #6B7280, sin cambios
const BORDE = [214, 206, 195] as const;

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 16;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

/**
 * jsPDF solo incrusta fuentes TrueType (.ttf) y el proyecto solo distribuye woff/woff2
 * vía @fontsource, así que el acta usa las fuentes núcleo de PDF (helvetica/courier) en
 * los mismos roles que el resto del sistema: helvetica bold+versalitas para lo que en la
 * UI es Barlow Condensed (títulos), helvetica normal para Public Sans (cuerpo) y courier
 * para IBM Plex Mono (guías, códigos, coordenadas).
 */
function displayFont(doc: jsPDF, size: number, color: readonly [number, number, number] = NAVY) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size);
  doc.setTextColor(...color);
}

function bodyFont(doc: jsPDF, size: number, color: readonly [number, number, number] = NAVY) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...color);
}

function monoFont(doc: jsPDF, size: number, bold: boolean, color: readonly [number, number, number] = NAVY) {
  doc.setFont('courier', bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...color);
}

function sectionLabel(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setCharSpace(0.6);
  doc.setTextColor(...GRIS_PIZARRA);
  doc.text(text.toUpperCase(), x, y);
  doc.setCharSpace(0);
}

/**
 * jsPDF.addImage solo acepta rasters (PNG/JPEG/WEBP), no SVG. Los placeholders de
 * evidencia del mock son data URIs de SVG, así que los redibujamos en un canvas
 * offscreen para obtener un PNG real — funciona igual para fotos/firmas reales
 * capturadas por cámara o canvas (ya son PNG, el paso es un no-op en ese caso).
 */
interface RasterImage {
  dataUrl: string;
  width: number;
  height: number;
}

async function toPngDataUrl(dataUri: string): Promise<RasterImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || 320;
      const height = img.naturalHeight || 220;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('No se pudo preparar el lienzo para el PDF'));
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve({ dataUrl: canvas.toDataURL('image/png'), width, height });
    };
    img.onerror = () => reject(new Error('No se pudo cargar la imagen para el PDF'));
    img.src = dataUri;
  });
}

/** Encaja una imagen dentro de una caja preservando su proporción original (equivalente a object-fit: contain) — nunca la deforma, deja espacio en blanco alrededor si no calza exacto. */
function fitContain(imageW: number, imageH: number, boxX: number, boxY: number, boxW: number, boxH: number) {
  const scale = Math.min(boxW / imageW, boxH / imageH);
  const width = imageW * scale;
  const height = imageH * scale;
  return { width, height, x: boxX + (boxW - width) / 2, y: boxY + (boxH - height) / 2 };
}

export async function generateActaPdf(data: ActaData): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // ── Encabezado ──────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 32, 'F');

  doc.setFillColor(...NARANJA);
  doc.rect(MARGIN_X, 10, 4, 4, 'F');

  displayFont(doc, 20, BLANCO_CLINICO);
  doc.setCharSpace(0.5);
  doc.text('FARMATRACK', MARGIN_X + 8, 15.5);
  doc.setCharSpace(0);

  bodyFont(doc, 9, NARANJA);
  doc.setCharSpace(1.2);
  doc.text('ACTA DE ENTREGA', MARGIN_X + 8, 22);
  doc.setCharSpace(0);

  bodyFont(doc, 7, [214, 218, 222]);
  doc.setCharSpace(0.8);
  doc.text('N.° DE GUÍA', PAGE_W - MARGIN_X, 12, { align: 'right' });
  doc.setCharSpace(0);
  monoFont(doc, 15, true, BLANCO_CLINICO);
  doc.text(data.trackingNumber, PAGE_W - MARGIN_X, 19, { align: 'right' });

  doc.setFillColor(...NARANJA);
  doc.rect(0, 32, PAGE_W, 1.4, 'F');

  let y = 44;

  // ── Datos de la guía y el paciente ─────────────────────────────────────
  sectionLabel(doc, 'Datos de la guía y el paciente', MARGIN_X, y);

  // Sello de estado (mismo lenguaje visual que <StatusSeal> en el panel).
  const stampLabel = 'ENTREGADO';
  monoFont(doc, 8, true);
  const stampTextWidth = doc.getTextWidth(stampLabel);
  const stampWidth = stampTextWidth + 12;
  const stampX = PAGE_W - MARGIN_X - stampWidth;
  doc.setDrawColor(226, 226, 226);
  doc.setLineWidth(0.3);
  doc.roundedRect(stampX, y - 4.2, stampWidth, 6, 3, 3, 'S');
  doc.setFillColor(...VERDE_SALVIA);
  doc.circle(stampX + 5, y - 1.3, 1.4, 'F');
  displayFont(doc, 8, VERDE_SALVIA);
  doc.setCharSpace(0.5);
  doc.text(stampLabel, stampX + 8.5, y - 0.1);
  doc.setCharSpace(0);

  y += 4;
  const cardTop = y;
  const rowX1Label = MARGIN_X + 6;
  const colGap = 8;
  const col2X = MARGIN_X + CONTENT_W / 2 + colGap / 2;

  y += 8;

  const addField = (label: string, value: string, x: number, useMono = false) => {
    bodyFont(doc, 7.5, GRIS_PIZARRA);
    doc.text(label.toUpperCase(), x, y);
    if (useMono) {
      monoFont(doc, 9.5, false);
    } else {
      displayFont(doc, 10.5);
    }
    doc.text(value, x, y + 5);
  };

  addField('Paciente', data.recipientName, rowX1Label);
  if (data.deliveredAt) {
    addField('Fecha y hora de entrega', new Date(data.deliveredAt).toLocaleString('es-CO'), col2X, true);
  }
  y += 12;

  bodyFont(doc, 7.5, GRIS_PIZARRA);
  doc.text('DIRECCIÓN DE ENTREGA', rowX1Label, y);
  displayFont(doc, 10.5);
  const addressLines = doc.splitTextToSize(data.address, CONTENT_W - 12);
  doc.text(addressLines, rowX1Label, y + 5);
  y += 5 + addressLines.length * 5 + 4;

  if (data.receiverName || data.receiverIdNumber) {
    if (data.receiverName) addField('Recibido por', data.receiverName, rowX1Label);
    if (data.receiverIdNumber) addField('Documento receptor', `CC ${data.receiverIdNumber}`, col2X, true);
    y += 12;
  }

  if (data.latitude != null && data.longitude != null) {
    addField('Coordenadas de firma', `${data.latitude.toFixed(5)}, ${data.longitude.toFixed(5)}`, rowX1Label, true);
    y += 10;
  }

  const cardBottom = y - 2;
  doc.setDrawColor(...BORDE);
  doc.setLineWidth(0.35);
  doc.roundedRect(MARGIN_X, cardTop, CONTENT_W, cardBottom - cardTop, 2, 2, 'S');

  y = cardBottom + 10;

  // ── Contenido del envío ──────────────────────────────────────────────────
  sectionLabel(doc, 'Contenido del envío', MARGIN_X, y);
  y += 4;

  const hasPrices = data.products.some((p) => p.price !== undefined);
  const colCode = MARGIN_X + 3;
  const colDesc = MARGIN_X + 30;
  const colQty = hasPrices ? MARGIN_X + 110 : MARGIN_X + CONTENT_W - 12;
  const colPrice = MARGIN_X + 135;
  const colSubtotal = MARGIN_X + CONTENT_W - 4;

  const tableTop = y;
  doc.setFillColor(...ARENA);
  doc.rect(MARGIN_X, tableTop, CONTENT_W, 7, 'F');
  bodyFont(doc, 7.5, NAVY);
  doc.setCharSpace(0.3);
  doc.text('CÓDIGO', colCode, tableTop + 4.7);
  doc.text('DESCRIPCIÓN', colDesc, tableTop + 4.7);
  doc.text('CANT', colQty, tableTop + 4.7, { align: hasPrices ? 'center' : 'right' });
  if (hasPrices) {
    doc.text('PRECIO UNIT.', colPrice, tableTop + 4.7, { align: 'right' });
    doc.text('SUBTOTAL', colSubtotal, tableTop + 4.7, { align: 'right' });
  }
  doc.setCharSpace(0);
  y = tableTop + 7;

  let total = 0;
  for (const product of data.products) {
    const rowY = y + 5;
    monoFont(doc, 8.5, false);
    doc.text(product.code, colCode, rowY);
    bodyFont(doc, 9);
    doc.text(product.description, colDesc, rowY, { maxWidth: hasPrices ? 78 : CONTENT_W - 40 });
    monoFont(doc, 9, false);
    doc.text(String(product.quantity), colQty, rowY, { align: hasPrices ? 'center' : 'right' });
    if (product.price !== undefined) {
      const subtotal = product.price * product.quantity;
      total += subtotal;
      doc.text(`$${product.price.toLocaleString('es-CO')}`, colPrice, rowY, { align: 'right' });
      doc.text(`$${subtotal.toLocaleString('es-CO')}`, colSubtotal, rowY, { align: 'right' });
    }
    y += 7.5;
    doc.setDrawColor(...ARENA);
    doc.setLineWidth(0.25);
    doc.line(MARGIN_X, y, MARGIN_X + CONTENT_W, y);
  }

  if (hasPrices) {
    y += 2;
    doc.setFillColor(...NARANJA);
    doc.rect(MARGIN_X, y, CONTENT_W, 0.6, 'F');
    y += 6;
    displayFont(doc, 10);
    doc.text('TOTAL', colPrice, y, { align: 'right' });
    monoFont(doc, 11, true);
    doc.text(`$${total.toLocaleString('es-CO')}`, colSubtotal, y, { align: 'right' });
    y += 4;
  }

  y += 8;

  // ── Línea de tiempo: trazabilidad completa (mínimo 4 hitos) ─────────────
  if (data.createdAt) {
    sectionLabel(doc, 'Línea de tiempo', MARGIN_X, y);
    y += 6;

    const milestones: Array<{ label: string; date: string | null | undefined }> = [
      { label: 'Creación de la guía', date: data.createdAt },
      { label: 'Inicio de alistamiento (CDI)', date: data.alistamientoStartedAt },
      { label: 'Alistamiento verificado y planilla liberada', date: data.alistamientoEndedAt },
      { label: 'Entrega al usuario final', date: data.deliveredAt },
    ];

    for (const milestone of milestones) {
      bodyFont(doc, 9, NAVY);
      doc.text(`•  ${milestone.label}`, MARGIN_X + 3, y);
      monoFont(doc, 8.5, false, GRIS_PIZARRA);
      doc.text(
        milestone.date ? new Date(milestone.date).toLocaleString('es-CO') : 'No disponible',
        PAGE_W - MARGIN_X,
        y,
        { align: 'right' },
      );
      y += 6;
    }

    y += 4;
  }

  // ── Evidencia de entrega ────────────────────────────────────────────────
  const FOOTER_ZONE_TOP = PAGE_H - 40;

  if (data.verifierSignatureUrl) {
    sectionLabel(doc, 'Verificación CDI', MARGIN_X, y);
    y += 10;

    const verifierBoxW = 60;
    const verifierBoxH = 32;
    const verifierBoxY = Math.min(y, FOOTER_ZONE_TOP - verifierBoxH - 6);

    bodyFont(doc, 7.5, GRIS_PIZARRA);
    doc.text('FIRMA DE QUIEN VERIFICÓ', MARGIN_X, verifierBoxY - 2);
    doc.setDrawColor(...BORDE);
    doc.setLineWidth(0.35);
    doc.roundedRect(MARGIN_X, verifierBoxY, verifierBoxW, verifierBoxH, 2, 2, 'S');
    try {
      const img = await toPngDataUrl(data.verifierSignatureUrl);
      const fit = fitContain(img.width, img.height, MARGIN_X + 2, verifierBoxY + 2, verifierBoxW - 4, verifierBoxH - 4);
      doc.addImage(img.dataUrl, 'PNG', fit.x, fit.y, fit.width, fit.height, undefined, 'FAST');
    } catch {
      // si la imagen no carga, el acta sigue siendo válida sin ella
    }

    y = verifierBoxY + verifierBoxH + 8;
  }

  if (data.signatureUrl || data.photoUrl) {
    sectionLabel(doc, 'Evidencia de entrega', MARGIN_X, y);
    y += 10;

    const boxW = 80;
    const boxH = 48;
    const boxY = Math.min(y, FOOTER_ZONE_TOP - boxH - 6);

    if (data.signatureUrl) {
      bodyFont(doc, 7.5, GRIS_PIZARRA);
      doc.text('FIRMA DEL RECEPTOR', MARGIN_X, boxY - 2);
      doc.setDrawColor(...BORDE);
      doc.setLineWidth(0.35);
      doc.roundedRect(MARGIN_X, boxY, boxW, boxH, 2, 2, 'S');
      try {
        const img = await toPngDataUrl(data.signatureUrl);
        const fit = fitContain(img.width, img.height, MARGIN_X + 2, boxY + 2, boxW - 4, boxH - 4);
        doc.addImage(img.dataUrl, 'PNG', fit.x, fit.y, fit.width, fit.height, undefined, 'FAST');
      } catch {
        // si la imagen no carga, el acta sigue siendo válida sin ella
      }
    }

    if (data.photoUrl) {
      const photoX = MARGIN_X + boxW + 10;
      bodyFont(doc, 7.5, GRIS_PIZARRA);
      doc.text('FOTO DE ENTREGA', photoX, boxY - 2);
      doc.setDrawColor(...BORDE);
      doc.setLineWidth(0.35);
      doc.roundedRect(photoX, boxY, boxW, boxH, 2, 2, 'S');
      try {
        const img = await toPngDataUrl(data.photoUrl);
        const fit = fitContain(img.width, img.height, photoX + 2, boxY + 2, boxW - 4, boxH - 4);
        doc.addImage(img.dataUrl, 'PNG', fit.x, fit.y, fit.width, fit.height, undefined, 'FAST');
      } catch {
        // idem
      }
    }
  }

  // ── Pie: QR fijo en la esquina inferior derecha + fecha de generación ───
  doc.setDrawColor(...NARANJA);
  doc.setLineWidth(0.6);
  doc.line(MARGIN_X, FOOTER_ZONE_TOP, PAGE_W - MARGIN_X, FOOTER_ZONE_TOP);

  const qrSize = 24;
  const qrX = PAGE_W - MARGIN_X - qrSize;
  const qrY = FOOTER_ZONE_TOP + 8;

  try {
    const qrDataUrl = await QRCode.toDataURL(data.trackingNumber, { margin: 0, width: 240 });
    doc.setDrawColor(...BORDE);
    doc.setLineWidth(0.35);
    doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 2, 2, 'S');
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    bodyFont(doc, 6.5, GRIS_PIZARRA);
    doc.text('Verifica en el portal de seguimiento', qrX + qrSize / 2, qrY + qrSize + 6, { align: 'center' });
    monoFont(doc, 7, true);
    doc.text(data.trackingNumber, qrX + qrSize / 2, qrY + qrSize + 10, { align: 'center' });
  } catch {
    // el QR es un complemento; el acta no depende de él
  }

  bodyFont(doc, 8, NAVY);
  doc.text('FarmaTrack', MARGIN_X, FOOTER_ZONE_TOP + 9);
  bodyFont(doc, 7, GRIS_PIZARRA);
  doc.text(
    `Documento generado el ${new Date().toLocaleString('es-CO')}`,
    MARGIN_X,
    FOOTER_ZONE_TOP + 14,
  );
  doc.text('Trazabilidad de última milla', MARGIN_X, FOOTER_ZONE_TOP + 18);

  doc.save(`acta-entrega-${data.trackingNumber}.pdf`);
}
