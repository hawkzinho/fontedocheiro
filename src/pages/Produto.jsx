import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import fallbackPerfume from '../assets/fallback-perfume.svg';
import PerfumeCard from '../components/PerfumeCard';
import Skeleton from '../components/Skeleton';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { buildWhatsAppUrl, formatCurrency, formatVolume } from '../lib/formatters';
import {
  BRAND_CONTENT,
  PRODUCT_PAGE_CONTENT,
  getFamilyGuide,
} from '../lib/siteContent';
import { sanitizeRichDescription } from '../lib/security';
import { WHATSAPP_NUMBER, ensureSupabaseConfigured, supabase } from '../lib/supabase';

function BackArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12.5 4.5 7 10l5.5 5.5" />
      <path d="M7.5 10H17" />
    </svg>
  );
}

export default function Produto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [perfume, setPerfume] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadPerfume({ silent = false } = {}) {
      if (!silent && active) {
        setLoading(true);
      }

      try {
        ensureSupabaseConfigured();

        const { data, error: queryError } = await supabase
          .from('perfumes')
          .select('*')
          .eq('id', id)
          .eq('disponivel', true)
          .single();

        if (queryError) {
          throw queryError;
        }

        if (!active) {
          return;
        }

        setPerfume(data);

        const gallery = [data.imagem_capa, ...(data.imagens_adicionais || [])].filter(
          Boolean
        );
        setSelectedImage((current) =>
          gallery.includes(current) ? current : gallery[0] || fallbackPerfume
        );

        const { data: relatedData, error: relatedError } = await supabase
          .from('perfumes')
          .select('*')
          .eq('disponivel', true)
          .eq('familia_olfativa', data.familia_olfativa)
          .neq('id', data.id)
          .order('created_at', { ascending: false })
          .range(0, 3);

        if (relatedError) {
          throw relatedError;
        }

        if (active) {
          setRelated(relatedData || []);
          setError('');
        }
      } catch (currentError) {
        if (active) {
          setPerfume(null);
          setRelated([]);
          setError(
            currentError.message ||
              'Nao foi possivel carregar este perfume agora.'
          );
        }
      } finally {
        if (active && !silent) {
          setLoading(false);
        }
      }
    }

    loadPerfume();

    const channel = supabase
      .channel(`product-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'perfumes',
          filter: `id=eq.${id}`,
        },
        () => {
          loadPerfume({ silent: true });
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate('/catalogo');
  };

  if (loading) {
    return (
      <div className="luxury-container pb-24 pt-10 sm:pb-16 sm:pt-12">
        <div className="mb-6 h-11 w-44 rounded-xl bg-mist" />
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <Skeleton className="aspect-[4/5] w-full sm:aspect-[3/4]" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!perfume) {
    return (
      <div className="luxury-container flex min-h-[70vh] items-center py-16">
        <div className="card-shell max-w-xl p-8">
          <p className="section-label">{BRAND_CONTENT.name}</p>
          <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.04em] text-ink">
            {PRODUCT_PAGE_CONTENT.notFoundTitle}
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate">
            {error || PRODUCT_PAGE_CONTENT.notFoundCopy}
          </p>
          <button
            type="button"
            onClick={() => navigate('/catalogo')}
            className="button-primary mt-8"
          >
            Voltar ao catalogo
          </button>
        </div>
      </div>
    );
  }

  const images = [perfume.imagem_capa, ...(perfume.imagens_adicionais || [])].filter(
    Boolean
  );
  const mainImage = selectedImage || images[0] || fallbackPerfume;
  const hasPromo = Number(perfume.preco_promocional) > 0;
  const whatsappUrl = buildWhatsAppUrl(WHATSAPP_NUMBER, perfume.nome);
  const descriptionHtml = sanitizeRichDescription(perfume.descricao);
  const familyGuide = getFamilyGuide(perfume.familia_olfativa);

  return (
    <div className="bg-transparent pb-24 pt-7 sm:pb-16 sm:pt-12">
      <section className="border-b border-line bg-[linear-gradient(180deg,#FFFDF9_0%,#F7F0E7_100%)]">
        <div className="luxury-container py-8 sm:py-12">
          <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate sm:mb-4 sm:text-sm">
            <Link to="/catalogo" className="transition duration-150 hover:text-gold">
              Inicio
            </Link>
            <span className="text-line">/</span>
            <Link to="/catalogo" className="transition duration-150 hover:text-gold">
              Catalogo
            </Link>
            <span className="text-line">/</span>
            <span className="text-ink">{perfume.nome}</span>
          </nav>

          <button
            type="button"
            onClick={handleBack}
            className="mb-5 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-slate transition duration-150 hover:text-gold sm:mb-6"
          >
            <BackArrowIcon />
            Voltar ao catalogo
          </button>

          <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-start">
            <div className="space-y-4">
              <div className="soft-panel overflow-hidden p-2.5 sm:p-4">
                <img
                  src={mainImage}
                  alt={perfume.nome}
                  className="aspect-[4/5] w-full rounded-xl object-cover sm:aspect-[3/4]"
                />
              </div>

              {images.length ? (
                <div className="flex gap-2.5 overflow-x-auto pb-1 sm:gap-3">
                  {images.map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`h-[74px] w-[74px] shrink-0 overflow-hidden rounded-xl border transition duration-150 sm:h-20 sm:w-20 ${
                        mainImage === image
                          ? 'border-gold shadow-hush'
                          : 'border-line bg-white'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Miniatura de ${perfume.nome}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="lg:sticky lg:top-24">
              <p className="section-label">{perfume.marca}</p>
              <h1 className="mt-3 font-display text-[2.1rem] font-medium leading-[1.02] tracking-[-0.045em] text-ink sm:mt-4 sm:text-5xl sm:leading-[0.98]">
                {perfume.nome}
              </h1>

              <p className="mt-3 max-w-2xl text-[0.97rem] leading-7 text-slate sm:mt-4 sm:text-base sm:leading-8">
                {familyGuide}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {perfume.destaque ? (
                  <span className="rounded-full bg-[#FFF0D4] px-3 py-1 text-xs font-semibold text-[#8C5A1C]">
                    Destaque da curadoria
                  </span>
                ) : null}
                <span className="status-badge">{perfume.familia_olfativa}</span>
                <span className="status-badge">{perfume.genero}</span>
                <span className="status-badge">{formatVolume(perfume.volume_ml)}</span>
              </div>

              <div className="card-shell mt-7 p-5 sm:mt-8 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    {hasPromo ? (
                      <>
                        <p className="text-sm text-slate line-through">
                          {formatCurrency(perfume.preco)}
                        </p>
                        <p className="mt-1 text-[2rem] font-semibold tracking-[-0.04em] text-gold sm:text-4xl">
                          {formatCurrency(perfume.preco_promocional)}
                        </p>
                      </>
                    ) : (
                      <p className="text-[2rem] font-semibold tracking-[-0.04em] text-ink sm:text-4xl">
                        {formatCurrency(perfume.preco)}
                      </p>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      perfume.disponivel
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-mist text-slate'
                    }`}
                  >
                    {perfume.disponivel
                      ? PRODUCT_PAGE_CONTENT.availableBadge
                      : PRODUCT_PAGE_CONTENT.unavailableBadge}
                  </span>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate">
                  {PRODUCT_PAGE_CONTENT.ctaSupport}
                </p>

                <div className="mt-6 hidden sm:flex sm:flex-col sm:gap-3">
                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="button-primary w-full gap-2"
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                      {PRODUCT_PAGE_CONTENT.cta}
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="button-primary w-full cursor-not-allowed opacity-50"
                    >
                      Configure o WhatsApp nas envs
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleBack}
                    className="button-secondary w-full"
                  >
                    Voltar ao catalogo
                  </button>
                </div>

                <div className="mt-6 border-t border-line pt-6">
                  <p className="text-sm font-semibold text-ink">
                    {PRODUCT_PAGE_CONTENT.supportTitle}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate">
                    {PRODUCT_PAGE_CONTENT.supportCopy}
                  </p>
                  <div className="mt-4 space-y-3">
                    {PRODUCT_PAGE_CONTENT.supportPoints.map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-slate">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-container grid gap-6 py-12 lg:grid-cols-[1.08fr_0.92fr]">
        <article className="soft-panel p-5 sm:p-8">
          <p className="section-label">{PRODUCT_PAGE_CONTENT.detailsTitle}</p>
          {descriptionHtml ? (
            <div
              className="mt-5 space-y-4 text-sm leading-8 text-slate [&_p]:mt-0"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          ) : (
            <p className="mt-5 text-sm leading-8 text-slate">
              {PRODUCT_PAGE_CONTENT.detailsFallback}
            </p>
          )}
        </article>

        <aside className="card-shell p-5 sm:p-8">
          <p className="section-label">Compra com confianca</p>
          <h2 className="mt-4 font-display text-[1.85rem] font-medium leading-[1.08] tracking-[-0.04em] text-ink sm:text-3xl">
            {BRAND_CONTENT.name}
          </h2>
          <p className="mt-4 text-sm leading-8 text-slate">
            {BRAND_CONTENT.supportingLine}
          </p>

          <div className="mt-8 space-y-4 border-t border-line pt-6">
            <div>
              <p className="text-sm font-semibold text-ink">Atendimento direto</p>
              <p className="mt-1 text-sm leading-7 text-slate">
                Tire duvidas, confirme estoque e alinhe pagamento em uma conversa so.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Envio nacional</p>
              <p className="mt-1 text-sm leading-7 text-slate">
                A loja atende online e envia para todo o Brasil com orientacao no processo.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Ajuda para decidir</p>
              <p className="mt-1 text-sm leading-7 text-slate">
                Se quiser comparar com outros perfis, o atendimento ajuda a escolher com mais seguranca.
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="luxury-container pb-3 sm:pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label">{PRODUCT_PAGE_CONTENT.relatedEyebrow}</p>
            <h2 className="section-title">{PRODUCT_PAGE_CONTENT.relatedTitle}</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate sm:text-base">
            {PRODUCT_PAGE_CONTENT.relatedCopy}
          </p>
        </div>

        {related.length ? (
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 xl:grid-cols-4 lg:gap-6">
            {related.map((item) => (
              <PerfumeCard key={item.id} perfume={item} />
            ))}
          </div>
        ) : (
          <div className="card-shell mt-8 p-6 sm:mt-10 sm:p-8">
            <p className="font-display text-[1.8rem] font-medium leading-[1.1] tracking-[-0.04em] text-ink sm:text-3xl">
              Mais opcoes desta familia vao aparecer aqui.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate">
              Conforme o catalogo recebe novas entradas da mesma familia olfativa, esta selecao fica ainda mais rica.
            </p>
          </div>
        )}
      </section>

      <div className="fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-0 right-0 z-40 px-3 sm:hidden">
        <div className="mx-auto w-full max-w-full rounded-2xl border border-line bg-ivory/95 p-2.5 shadow-[0_-8px_24px_rgba(46,31,9,0.10)] backdrop-blur">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[44px] w-full max-w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gold px-4 py-2.5 text-[0.92rem] font-medium text-white transition duration-150"
            >
              <WhatsAppIcon className="h-[17px] w-[17px] shrink-0" />
              <span className="truncate">{PRODUCT_PAGE_CONTENT.cta}</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-gold px-4 py-2.5 text-[0.92rem] font-medium text-white opacity-50"
            >
              <span className="truncate">Configure o WhatsApp nas envs</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
