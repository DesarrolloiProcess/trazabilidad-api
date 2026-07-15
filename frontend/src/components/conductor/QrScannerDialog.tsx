import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '#src/components/ui/Button';

const SCANNER_ELEMENT_ID = 'qr-scanner-viewport';

interface QrScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (code: string) => void;
}

export function QrScannerDialog({ open, onOpenChange, onScan }: QrScannerDialogProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setError(null);

    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          if (cancelled) return;
          onScan(decodedText.trim());
        },
        () => {
          // se dispara en cada frame sin código detectado; no es un error real
        },
      )
      .catch(() => {
        if (!cancelled) setError('No pudimos acceder a la cámara. Revisa los permisos del navegador.');
      });

    return () => {
      cancelled = true;
      scanner.stop().catch(() => {});
      scanner.clear();
      scannerRef.current = null;
    };
  }, [open, onScan]);

  const handleClose = () => onOpenChange(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-navy-dark/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-2xl focus:outline-none">
          <Dialog.Title className="font-display text-base font-bold uppercase tracking-wide text-navy">
            Escanear guía
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-slate-500">
            Apunta la cámara al código de la guía.
          </Dialog.Description>

          <div id={SCANNER_ELEMENT_ID} className="mt-4 overflow-hidden rounded-xl bg-navy-dark" />

          {error && <p className="mt-3 text-xs font-medium text-controlled">{error}</p>}

          <Button variant="secondary" className="mt-4 w-full" onClick={handleClose}>
            Cancelar
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
