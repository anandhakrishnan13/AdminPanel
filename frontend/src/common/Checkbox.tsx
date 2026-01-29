import type { ReactNode, InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref): ReactNode => {
    const checkboxId = id ?? `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            type="checkbox"
            id={checkboxId}
            className={cn(
              'h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-destructive' : '',
              className
            )}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={description ? `${checkboxId}-description` : undefined}
            {...props}
          />
        </div>
        {(label ?? description) ? (
          <div className="ml-3">
            {label ? (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                {label}
              </label>
            ) : null}
            {description ? (
              <p id={`${checkboxId}-description`} className="text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
