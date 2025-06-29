import type { FC } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export const ToggleSwitch: FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description
}) => {
  return (
    <div className="flex items-center space-x-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${checked ? 'bg-primary' : 'bg-muted'}
        `}
        role="switch"
        aria-checked={checked}
        aria-labelledby="toggle-label"
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      <div>
        <label id="toggle-label" className="text-sm font-medium cursor-pointer" onClick={() => onChange(!checked)}>
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};