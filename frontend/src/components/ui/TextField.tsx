import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  mono?: boolean;
  hint?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, mono, hint, className, id, ...rest }, ref) => {
    const fieldId = id ?? rest.name;

    return (
      <div className="text-left">
        <label htmlFor={fieldId} className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wide text-navy">
          {label}
        </label>
        <input
          id={fieldId}
          ref={ref}
          className={clsx(
            'w-full rounded-lg border px-3.5 py-2.5 text-sm text-navy placeholder:text-slate-400',
            mono && 'font-mono tracking-wide',
            error ? 'border-controlled' : 'border-slate-300',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...rest}
        />
        {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        {error && (
          <p id={`${fieldId}-error`} className="mt-1 text-xs font-medium text-controlled">
            {error}
          </p>
        )}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
