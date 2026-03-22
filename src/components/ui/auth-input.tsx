'use client';

import { useId, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react/ssr';

import { cn } from '@/lib/cn';

interface AuthInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
}

export function AuthInput({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  autoComplete,
  maxLength,
}: AuthInputProps) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-text-secondary text-sm mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={cn(
            'w-full bg-surface-light rounded-lg px-4 py-3 text-text-primary text-sm',
            'placeholder:text-text-disabled',
            'focus:outline-none focus:ring-2 focus:ring-accent',
            error && 'ring-1 ring-error',
            isPassword && 'pr-12',
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            data-testid="password-toggle"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary transition-colors"
          >
                {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}
