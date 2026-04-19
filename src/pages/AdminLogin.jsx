import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ensureSupabaseConfigured, supabase } from '../lib/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.message || '');

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        ensureSupabaseConfigured();

        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (active && data.session) {
          navigate('/admin/dashboard', { replace: true });
        }
      } catch {
        if (active) {
          setError((current) => current);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      ensureSupabaseConfigured();

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error('Credenciais invalidas');
      }

      navigate('/admin/dashboard', { replace: true });
    } catch (currentError) {
      setError(currentError.message || 'Credenciais invalidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#FBF8F3_0%,#F5EEE6_100%)] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-white shadow-velvet">
        <div className="p-6 sm:p-8">
          <Link
            to="/catalogo"
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-slate transition duration-150 hover:text-gold"
          >
            <span aria-hidden="true">{'\u2190'}</span>
            Voltar ao site
          </Link>

          <div className="mt-7">
            <p className="section-label">Acesso admin</p>
            <h1 className="mt-3 font-display text-[2rem] font-medium tracking-[-0.04em] text-ink sm:text-[2.2rem]">
              Entrar
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate">
              Use seu usuario e senha para acessar o painel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">E-mail</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field-shell"
                placeholder="seuemail@email.com"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">Senha</span>
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field-shell"
                placeholder="Sua senha"
              />
            </label>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="button-primary mt-2 w-full gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Entrando...
                </>
              ) : (
                'Entrar no painel'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
