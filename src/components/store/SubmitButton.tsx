'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton({
  children, pendingText, variant = 'primary', small = false, disabled = false,
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: 'primary' | 'ghost' | 'danger' | 'dark';
  small?: boolean;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const cls = ['ar-btn'];
  if (variant === 'primary') cls.push('ar-btn-primary');
  if (variant === 'ghost') cls.push('ar-btn-ghost');
  if (variant === 'danger') cls.push('ar-btn-danger');
  if (small) cls.push('ar-btn-sm');

  return (
    <button type="submit" className={cls.join(' ')} disabled={pending || disabled}>
      {pending ? (pendingText ?? 'جارٍ الحفظ…') : children}
    </button>
  );
}
