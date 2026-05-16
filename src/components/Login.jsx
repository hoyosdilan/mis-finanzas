import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon } from './ds/Primitives';

export default function Login() {
  const { loginWithGoogle, loginError } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (loginError) {
      setError(loginError);
      setLoading(false);
    }
  }, [loginError]);

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setError('Fallo al iniciar sesión. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      background: `
        radial-gradient(900px 600px at 100% 0%, rgba(201, 88, 42, 0.12), transparent 60%),
        radial-gradient(700px 500px at 0% 100%, rgba(94, 103, 56, 0.09), transparent 60%),
        var(--bg-canvas)
      `,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Paper grain overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'url(/src/assets/grain.svg)',
        opacity: 0.03,
      }} />

      <div style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border-default)',
        padding: '40px 36px',
        borderRadius: 'var(--r-3xl)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%', maxWidth: 380,
        position: 'relative', zIndex: 1,
        animation: 'fadeUp var(--dur-slow) var(--ease-out)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56,
            background: 'var(--ink-800)', borderRadius: 18,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 8px 24px -6px rgba(31, 27, 20, 0.25)',
          }}>
            <Icon name="donut_small" size={28} color="#fff" />
          </div>
          <h1 style={{
            margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--fg-1)',
            letterSpacing: '-0.02em', lineHeight: 1.1,
          }}>
            Mis Finanzas
          </h1>
          <p style={{
            margin: '6px 0 0', fontSize: 13, color: 'var(--fg-3)',
            fontWeight: 500,
          }}>
            Dashboard personal
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-50)', border: '1px solid rgba(177, 77, 58, 0.2)',
            color: 'var(--danger-700)',
            padding: '10px 14px', borderRadius: 12, marginBottom: 16,
            fontSize: 13, fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '13px 20px', borderRadius: 14, border: '1px solid var(--border-default)',
            background: loading ? 'var(--bg-sunken)' : 'var(--bg-raised)',
            color: 'var(--fg-1)', cursor: loading ? 'wait' : 'pointer',
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14,
            boxShadow: 'var(--shadow-sm)',
            transition: 'background var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
          {loading ? (
            <Icon name="autorenew" size={18} color="var(--fg-3)" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              style={{ width: 18, height: 18 }}
            />
          )}
          {loading ? 'Conectando...' : 'Ingresar con Google'}
        </button>

        <p style={{
          margin: '20px 0 0', fontSize: 11, color: 'var(--fg-4)',
          textAlign: 'center', lineHeight: 1.5,
        }}>
          Acceso restringido. Solo cuentas autorizadas.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
