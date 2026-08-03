import { LoginForm } from './LoginForm';

export default async function LoginPage({
  searchParams,
}: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;

  return (
    <div className="ar-login">
      <div className="ar-login-box">
        <span className="ar-brand">أرفا</span>
        <span className="ar-hint">لوحة إدارة متجرك وبوت الزبائن</span>

        {reason === 'session' && (
          <div className="ar-note ar-note-warn">انتهت الجلسة. سجّل الدخول من جديد.</div>
        )}

        <div className="ar-card">
          <LoginForm />
        </div>

        <p className="ar-hint" style={{ marginTop: 14, textAlign: 'center' }}>
          معرّف الدخول وكلمة المرور تصدرهما الإدارة. لتغييرهما تواصل معها.
        </p>
      </div>
    </div>
  );
}
