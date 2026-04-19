import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import heroStillLife from '../assets/hero-still-life.svg';
import BrandMark from '../components/BrandMark';
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#FBF8F3_0%,#F5EEE6_100%)] px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-line bg-white shadow-velvet lg:grid-cols-[0.92fr_1.08fr]">
        <div className="p-8 sm:p-10">
          <Link
            to="/catalogo"
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-slate transition duration-150 hover:text-gold"
          >
            <span aria-hidden="true">{'\u2190'}</span>
            Voltar ao site
          </Link>

          <div className="mt-10">
            <BrandMark />
            <p className="mt-8 section-label">Admin</p>
            <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.04em] text-ink">
              Painel administrativo
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate">
              Entre com o usuario criado no Supabase Auth para gerenciar perfumes,
              disponibilidade, destaques e imagens.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
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
                placeholder="Sua senha do Supabase Auth"
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

        <div className="hidden border-l border-line bg-[#FCF8F2] p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="section-label">Gestao da vitrine</p>
            <h2 className="mt-4 font-display text-4xl font-medium tracking-[-0.04em] text-ink">
              Atualize o catalogo sem perder a linguagem da marca.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate">
              O que muda aqui aparece no site e na jornada de compra quase em tempo
              real.
            </p>
          </div>

          <div className="card-shell overflow-hidden">
            <img
              src={heroStillLife}
              alt="Composicao da Fonte do Cheiro"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
