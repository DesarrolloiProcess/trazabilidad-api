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
}

/**
 * jsPDF.addImage solo acepta rasters (PNG/JPEG/WEBP), no SVG. Los placeholders de
 * evidencia del mock son data URIs de SVG, así que los redibujamos en un canvas
 * offscreen para obtener un PNG real — funciona igual para fotos/firmas reales
 * capturadas por cámara o canvas (ya son PNG, el paso es un no-op en ese caso).
 */
async function toPngDataUrl(dataUri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 320;
      canvas.height = img.naturalHeight || 220;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('No se pudo preparar el lienzo para el PDF'));
      ctx.fillStyle = '#FAFAF8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('No se pudo cargar la imagen para el PDF'));
    img.src = dataUri;
  });
}

export async function generateActaPdf(data: ActaData): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const marginX = 18;
  let y = 20;

  doc.setFont('courier', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(16, 24, 32); // navy
  doc.text('FarmaTrack', marginX, y);
  doc.setFontSize(11);
  doc.setTextColor(91, 100, 112);
  doc.text('Acta de entrega', marginX, (y += 6));

  doc.setDrawColor(227, 220, 207);
  doc.line(marginX, (y += 4), 210 - marginX, y);

  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(16, 24, 32);
  y += 8;

  const field = (label: string, value: string) => {
    doc.setTextColor(91, 100, 112);
    doc.text(label, marginX, y);
    doc.setTextColor(16, 24, 32);
    doc.text(value, marginX + 42, y);
    y += 6;
  };

  field('Guia:', data.trackingNumber);
  field('Destinatario:', data.recipientName);
  field('Direccion:', data.address);
  if (data.deliveredAt) field('Fecha entrega:', new Date(data.deliveredAt).toLocaleString('es-CO'));
  if (data.receiverName) field('Recibido por:', data.receiverName);
  if (data.receiverIdNumber) field('Cedula:', data.receiverIdNumber);
  if (data.latitude != null && data.longitude != null) {
    field('Geolocalizacion:', `${data.latitude.toFixed(5)}, ${data.longitude.toFixed(5)}`);
  }

  y += 4;
  doc.setFont('courier', 'bold');
  doc.text('Contenido del envio', marginX, y);
  y += 6;
  doc.setFont('courier', 'normal');

  const hasPrices = data.products.some((p) => p.price !== undefined);
  for (const product of data.products) {
    const line = hasPrices
      ? `${product.code}  ${product.description}  x${product.quantity}  $${(product.price ?? 0).toLocaleString('es-CO')}`
      : `${product.code}  ${product.description}  x${product.quantity}`;
    doc.text(line, marginX, y);
    y += 5.5;
  }

  y += 6;

  const imageBoxWidth = 78;
  const imageBoxHeight = 45;
  let imagesY = y;

  if (data.signatureUrl) {
    try {
      const png = await toPngDataUrl(data.signatureUrl);
      doc.setFont('courier', 'bold');
      doc.text('Firma', marginX, imagesY);
      doc.addImage(png, 'PNG', marginX, imagesY + 3, imageBoxWidth, imageBoxHeight, undefined, 'FAST');
    } catch {
      // si la imagen no carga, el acta sigue siendo válida sin ella
    }
  }

  if (data.photoUrl) {
    try {
      const png = await toPngDataUrl(data.photoUrl);
      const photoX = marginX + imageBoxWidth + 10;
      doc.setFont('courier', 'bold');
      doc.text('Foto de entrega', photoX, imagesY);
      doc.addImage(png, 'PNG', photoX, imagesY + 3, imageBoxWidth, imageBoxHeight, undefined, 'FAST');
    } catch {
      // idem
    }
  }

  imagesY += imageBoxHeight + 12;

  try {
    const qrDataUrl = await QRCode.toDataURL(data.trackingNumber, { margin: 1, width: 200 });
    const qrSize = 30;
    doc.addImage(qrDataUrl, 'PNG', 210 - marginX - qrSize, imagesY, qrSize, qrSize);
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(91, 100, 112);
    doc.text('Escanea para consultar en el Portal Cliente', 210 - marginX - qrSize, imagesY + qrSize + 4, { align: 'left' });
  } catch {
    // el QR es un complemento; el acta no depende de él
  }

  doc.save(`acta-entrega-${data.trackingNumber}.pdf`);
}
