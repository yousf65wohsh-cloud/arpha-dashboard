'use client';

import { useFormState } from 'react-dom';
import { signIn } from './actions';
import { SubmitButton } from '@/components/store/SubmitButton';

// على React 18 استخدمنا useFormState من 'react-dom' — نفس توقيع useActionState.
export function LoginForm() {
  const [state, action] = useFormState(signIn, null as { error?: string } | null);

  return (
    <form action={action}>
      {state?.error && <div className="ar-note ar-note-err">{state.error}</div>}

      <label className="ar-field">
        <span>معرّف الدخول</span>
        <input
          className="ar-input" name="login_id" autoComplete="username"
          dir="ltr" style={{ textAlign: 'left' }} required autoFocus
        />
      </label>

      <label className="ar-field">
        <span>كلمة المرور</span>
        <input
          className="ar-input" name="password" type="password"
          autoComplete="current-password" dir="ltr" style={{ textAlign: 'left' }} required
        />
      </label>

      <SubmitButton pendingText="جارٍ الدخول…">دخول</SubmitButton>
    </form>
  );
}
