import clsx from 'clsx';
import { TONE_STYLES, type SealTone } from '#src/components/status/statusConfig';

interface StatusSealProps {
  label: string;
  tone: SealTone;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_STYLES = {
  sm: { seal: 'h-2.5 w-2.5', text: 'text-[11px]', gap: 'gap-1.5', padding: 'py-0.5 pl-1.5 pr-2.5' },
  md: { seal: 'h-3.5 w-3.5', text: 'text-xs', gap: 'gap-2', padding: 'py-1 pl-2 pr-3' },
  lg: { seal: 'h-5 w-5', text: 'text-sm', gap: 'gap-2.5', padding: 'py-1.5 pl-2.5 pr-4' },
};

export function StatusSeal({ label, tone, size = 'md' }: StatusSealProps) {
  const toneStyle = TONE_STYLES[tone];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border border-black/5 bg-white font-display uppercase tracking-wide shadow-sm',
        sizeStyle.gap,
        sizeStyle.padding,
        sizeStyle.text,
      )}
    >
      <span className={clsx('seal shrink-0', sizeStyle.seal, toneStyle.bg)} aria-hidden="true" />
      {label}
    </span>
  );
}
