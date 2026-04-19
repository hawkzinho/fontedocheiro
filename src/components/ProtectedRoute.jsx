import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ensureSupabaseConfigured, supabase } from '../lib/supabase';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [state, setState] = useState({
    loading: true,
    allowed: false,
    message: '',
  });

  useEffect(() => {
    let active = true;

    async function validateSession() {
      try {
        ensureSupabaseConfigured();

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (active) {
          setState({
            loading: false,
            allowed: Boolean(data.session),
            message: data.session ? '' : 'Faca login para acessar o painel.',
          });
        }
      } catch (error) {
        if (active) {
          setState({
            loading: false,
            allowed: false,
            message:
              error.message || 'Nao foi possivel validar a sua sessao agora.',
          });
        }
      }
    }

    validateSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return;
      }

      setState({
        loading: false,
        allowed: Boolean(session),
        message: session ? '' : 'Sua sessao foi encerrada. Entre novamente.',
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [location.pathname, location.key]);

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#FBF8F3_0%,#F5EEE6_100%)] px-6">
        <div className="card-shell w-full max-w-md px-8 py-10 text-center">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-mist" />
          <p className="mt-4 font-display text-2xl font-medium tracking-[-0.04em] text-ink">
            Validando acesso
          </p>
          <p className="mt-2 text-sm text-slate">
            Um instante enquanto confirmamos sua sessao.
          </p>
        </div>
      </div>
    );
  }

  if (!state.allowed) {
    return (
      <Navigate
        to="/admin"
        replace
        state={{ from: location, message: state.message }}
      />
    );
  }

  return children;
}
