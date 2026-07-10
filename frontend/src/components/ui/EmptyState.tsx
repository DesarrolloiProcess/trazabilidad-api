import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
      <span className="seal h-8 w-8 bg-slate-200" aria-hidden="true" />
      <div>
        <p className="font-display text-base font-semibold uppercase tracking-wide text-navy">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}
