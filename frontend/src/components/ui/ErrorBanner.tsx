interface ErrorBannerProps {
  title?: string;
  message: string;
}

export function ErrorBanner({ title = 'Algo salió mal', message }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border-l-4 border-controlled bg-controlled/5 px-4 py-3">
      <span className="seal mt-0.5 h-3 w-3 shrink-0 bg-controlled" aria-hidden="true" />
      <div>
        <p className="font-display text-sm font-semibold uppercase tracking-wide text-controlled">{title}</p>
        <p className="mt-0.5 text-sm text-navy/80">{message}</p>
      </div>
    </div>
  );
}
