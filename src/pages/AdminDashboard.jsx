import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fallbackPerfume from '../assets/fallback-perfume.svg';
import BrandMark from '../components/BrandMark';
import PerfumeForm from '../components/PerfumeForm';
import Skeleton from '../components/Skeleton';
import { useToast } from '../components/ToastProvider';
import { formatCurrency } from '../lib/formatters';
import { extractStoragePath } from '../lib/security';
import { deleteStoragePaths, extractStoragePathsFromUrls } from '../lib/storage';
import { ensureSupabaseConfigured, supabase } from '../lib/supabase';
import { useIdleLogout } from '../hooks/useIdleLogout';

function SummaryCard({ label, value, hint }) {
  return (
    <div className="card-shell p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl font-medium tracking-[-0.04em] text-ink">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate">{hint}</p>
    </div>
  );
}

function TableToggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`table-toggle ${checked ? 'bg-gold' : 'bg-slate/30'} disabled:cursor-not-allowed disabled:opacity-50`}
      aria-label={checked ? 'Desativar' : 'Ativar'}
    >
      <span className={checked ? 'translate-x-6' : 'translate-x-1'} />
    </button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { notify } = useToast();
  useIdleLogout();

  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPerfume, setEditingPerfume] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeToggleId, setActiveToggleId] = useState('');

  const total = perfumes.length;
  const totalAvailable = perfumes.filter((item) => item.disponivel).length;
  const totalFeatured = perfumes.filter((item) => item.destaque).length;

  useEffect(() => {
    let active = true;

    async function loadPerfumes() {
      try {
        ensureSupabaseConfigured();

        const { data, error: queryError } = await supabase
          .from('perfumes')
          .select('*')
          .order('created_at', { ascending: false });

        if (queryError) {
          throw queryError;
        }

        if (active) {
          setPerfumes(data || []);
          setError('');
        }
      } catch (currentError) {
        if (active) {
          setPerfumes([]);
          setError(
            currentError.message ||
              'Nao foi possivel carregar o painel neste momento.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPerfumes();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/admin', { replace: true });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin', { replace: true });
  };

  const handleSaved = (savedPerfume) => {
    setPerfumes((current) => {
      const exists = current.some((item) => item.id === savedPerfume.id);

      if (!exists) {
        return [savedPerfume, ...current];
      }

      return current.map((item) =>
        item.id === savedPerfume.id ? savedPerfume : item
      );
    });
  };

  const handleToggle = async (perfume, field) => {
    const nextValue = !perfume[field];
    const toggleKey = `${perfume.id}-${field}`;

    setActiveToggleId(toggleKey);
    setPerfumes((current) =>
      current.map((item) =>
        item.id === perfume.id ? { ...item, [field]: nextValue } : item
      )
    );

    try {
      const { data, error: updateError } = await supabase
        .from('perfumes')
        .update({ [field]: nextValue })
        .eq('id', perfume.id)
        .select('*')
        .single();

      if (updateError) {
        throw updateError;
      }

      setPerfumes((current) =>
        current.map((item) => (item.id === perfume.id ? data : item))
      );
    } catch (currentError) {
      setPerfumes((current) =>
        current.map((item) =>
          item.id === perfume.id ? { ...item, [field]: perfume[field] } : item
        )
      );

      notify({
        title: 'Falha ao atualizar',
        description:
          currentError.message || 'Nao foi possivel aplicar esta alteracao.',
        tone: 'error',
      });
    } finally {
      setActiveToggleId('');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('perfumes')
        .delete()
        .eq('id', deleteTarget.id);

      if (deleteError) {
        throw deleteError;
      }

      setPerfumes((current) =>
        current.filter((item) => item.id !== deleteTarget.id)
      );

      const storagePaths = [
        extractStoragePath(deleteTarget.imagem_capa),
        ...extractStoragePathsFromUrls(deleteTarget.imagens_adicionais || []),
      ].filter(Boolean);

      if (storagePaths.length) {
        deleteStoragePaths(storagePaths).catch(() => null);
      }

      notify({
        title: 'Perfume removido',
        description: `${deleteTarget.nome} foi excluido do catalogo.`,
        tone: 'success',
      });
    } catch (currentError) {
      notify({
        title: 'Falha ao excluir',
        description:
          currentError.message || 'Nao foi possivel excluir este perfume.',
        tone: 'error',
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#FBF8F3_0%,#F5EEE6_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="card-shell p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-label">Painel administrativo</p>
              <BrandMark className="mt-4" compact showDescriptor={false} />
              <h1 className="mt-5 font-display text-4xl font-medium tracking-[-0.04em] text-ink sm:text-5xl">
                Gestao do catalogo
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate">
                Gerencie perfumes, imagens, disponibilidade e destaques. O site publico responde quase em tempo real ao que voce atualizar aqui.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setEditingPerfume(null);
                  setFormOpen(true);
                }}
                className="button-primary"
              >
                Adicionar perfume
              </button>
              <button type="button" onClick={handleLogout} className="button-secondary">
                Sair
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Total de perfumes"
            value={loading ? '--' : total}
            hint="Total de itens cadastrados no banco."
          />
          <SummaryCard
            label="Disponiveis"
            value={loading ? '--' : totalAvailable}
            hint="Itens visiveis no catalogo do cliente."
          />
          <SummaryCard
            label="Em destaque"
            value={loading ? '--' : totalFeatured}
            hint="Ganham prioridade quando o catalogo esta sem filtros."
          />
        </div>

        <div className="card-shell mt-6 overflow-hidden">
          <div className="border-b border-line px-6 py-5">
            <p className="text-lg font-semibold text-ink">Perfumes cadastrados</p>
            <p className="mt-1 text-sm text-slate">
              Atualizacoes no painel refletem no site sem precisar de reload manual.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4 px-6 py-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : perfumes.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-slate">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Foto</th>
                    <th className="px-6 py-4 font-semibold">Nome</th>
                    <th className="px-6 py-4 font-semibold">Marca</th>
                    <th className="px-6 py-4 font-semibold">Preco</th>
                    <th className="px-6 py-4 font-semibold">Disponivel</th>
                    <th className="px-6 py-4 font-semibold">Destaque</th>
                    <th className="px-6 py-4 font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {perfumes.map((perfume) => (
                    <tr key={perfume.id} className="transition duration-150 hover:bg-mist/70">
                      <td className="px-6 py-5">
                        <img
                          src={perfume.imagem_capa || fallbackPerfume}
                          alt={perfume.nome}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-ink">{perfume.nome}</p>
                        <p className="mt-1 text-sm text-slate">
                          {perfume.familia_olfativa || 'Familia sob consulta'}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-slate">{perfume.marca}</td>
                      <td className="px-6 py-5 font-medium text-ink">
                        {formatCurrency(perfume.preco_promocional || perfume.preco)}
                      </td>
                      <td className="px-6 py-5">
                        <TableToggle
                          checked={perfume.disponivel}
                          onChange={() => handleToggle(perfume, 'disponivel')}
                          disabled={activeToggleId === `${perfume.id}-disponivel`}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <TableToggle
                          checked={perfume.destaque}
                          onChange={() => handleToggle(perfume, 'destaque')}
                          disabled={activeToggleId === `${perfume.id}-destaque`}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPerfume(perfume);
                              setFormOpen(true);
                            }}
                            className="button-secondary px-4 py-2"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(perfume)}
                            className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition duration-150 hover:bg-rose-50"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-10">
              <p className="text-lg font-semibold text-ink">Seu catalogo comeca aqui.</p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate">
                {error ||
                  'Adicione o primeiro perfume para preencher o catalogo e a pagina de produto.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {formOpen ? (
        <PerfumeForm
          perfume={editingPerfume}
          onClose={() => {
            setFormOpen(false);
            setEditingPerfume(null);
          }}
          onSaved={handleSaved}
        />
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-line bg-white p-6 shadow-velvet">
            <p className="section-label">Confirmacao</p>
            <h2 className="mt-4 font-display text-3xl font-medium tracking-[-0.04em] text-ink">
              Excluir perfume?
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate">
              {deleteTarget.nome} sera removido do catalogo e as imagens vinculadas entrarao na fila de limpeza do Storage.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="button-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-6 py-3 text-sm font-medium text-white transition duration-150 hover:bg-rose-700"
              >
                Confirmar exclusao
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
