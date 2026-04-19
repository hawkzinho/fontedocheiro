import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';
import BrandMark from '../components/BrandMark';
import PerfumeCard from '../components/PerfumeCard';
import Skeleton from '../components/Skeleton';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { FAMILIAS_OLFATIVAS, GENEROS } from '../lib/constants';
import { BRAND_CONTENT, HERO_POINTS, TRUST_ITEMS } from '../lib/siteContent';
import { WHATSAPP_NUMBER, ensureSupabaseConfigured, supabase } from '../lib/supabase';

const PAGE_SIZE = 20;

function FilterGroup({ title, options, selected, onSelect, stacked = false }) {
  const isGenderGroup = title === 'Genero';

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate">
        {title}
      </p>
      <div className={`mt-3 ${stacked ? 'grid gap-3' : 'flex flex-wrap gap-3'}`}>
        {options.map((option) => {
          const active = selected === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`pill inline-flex items-center justify-center ${
                isGenderGroup ? 'pill-spotlight' : ''
              } ${
                active
                  ? isGenderGroup
                    ? 'pill-spotlight-active'
                    : 'pill-active'
                  : isGenderGroup
                    ? 'pill-spotlight-inactive'
                    : 'pill-inactive'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="9" cy="9" r="5.5" />
      <path d="m14 14 3.5 3.5" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M10 4v12" />
      <path d="m5.5 11 4.5 5 4.5-5" />
    </svg>
  );
}

function SearchField({ value, onChange }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate">
        Busca
      </p>
      <label className="relative mt-3 block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={value}
          onChange={onChange}
          placeholder="Buscar perfume"
          className="field-shell pl-11 pr-4"
        />
      </label>
    </div>
  );
}

const whatsappHref = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      'Oi! Vim pelo site da Fonte do Cheiro e quero ajuda para escolher um perfume.'
    )}`
  : '/catalogo#contato';
const hasWhatsApp = Boolean(WHATSAPP_NUMBER);

export default function Catalogo() {
  const gridRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('Todos');
  const [selectedFamily, setSelectedFamily] = useState('Todas');
  const [draftGender, setDraftGender] = useState('Todos');
  const [draftFamily, setDraftFamily] = useState('Todas');
  const [page, setPage] = useState(1);
  const [perfumes, setPerfumes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const deferredSearch = useDeferredValue(searchTerm);
  const deferredGender = useDeferredValue(selectedGender);
  const deferredFamily = useDeferredValue(selectedFamily);
  const deferredPage = useDeferredValue(page);

  useEffect(() => {
    setDraftGender(selectedGender);
    setDraftFamily(selectedFamily);
  }, [selectedFamily, selectedGender]);

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [filtersOpen]);

  useEffect(() => {
    let active = true;

    async function loadCatalog({ silent = false } = {}) {
      if (!silent && active) {
        setLoading(true);
      }

      try {
        ensureSupabaseConfigured();

        let query = supabase
          .from('perfumes')
          .select('*', { count: 'exact' })
          .eq('disponivel', true);

        if (deferredGender !== 'Todos') {
          query = query.eq('genero', deferredGender);
        }

        if (deferredFamily !== 'Todas') {
          query = query.eq('familia_olfativa', deferredFamily);
        }

        const normalizedSearch = deferredSearch.trim();

        if (normalizedSearch) {
          query = query.ilike('nome', `%${normalizedSearch}%`);
        }

        if (
          deferredGender === 'Todos' &&
          deferredFamily === 'Todas' &&
          !normalizedSearch
        ) {
          query = query
            .order('destaque', { ascending: false })
            .order('created_at', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const from = (deferredPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const { data, error: queryError, count } = await query.range(from, to);

        if (queryError) {
          throw queryError;
        }

        if (active) {
          setPerfumes(data || []);
          setTotalCount(count || 0);
          setError('');
        }
      } catch (currentError) {
        if (active) {
          setPerfumes([]);
          setTotalCount(0);
          setError(
            currentError.message ||
              'Nao foi possivel carregar o catalogo neste momento.'
          );
        }
      } finally {
        if (active && !silent) {
          setLoading(false);
        }
      }
    }

    const timer = window.setTimeout(() => {
      loadCatalog();
    }, 300);

    const channel = supabase
      .channel(
        `catalog-changes-${deferredGender}-${deferredFamily}-${deferredPage}-${deferredSearch}`
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'perfumes' },
        () => {
          loadCatalog({ silent: true });
        }
      )
      .subscribe();

    return () => {
      active = false;
      window.clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [deferredFamily, deferredGender, deferredPage, deferredSearch]);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    if (page > pages) {
      setPage(pages);
    }
  }, [page, totalCount]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const normalizedSearch = searchTerm.trim();
  const hasActiveFilters =
    selectedGender !== 'Todos' ||
    selectedFamily !== 'Todas' ||
    normalizedSearch !== '';

  const handleGenderChange = (value) => {
    startTransition(() => {
      setSelectedGender(value);
      setPage(1);
    });
  };

  const handleFamilyChange = (value) => {
    startTransition(() => {
      setSelectedFamily(value);
      setPage(1);
    });
  };

  const handleSearchChange = (event) => {
    const nextValue = event.target.value;

    startTransition(() => {
      setSearchTerm(nextValue);
      setPage(1);
    });
  };

  const applyMobileFilters = () => {
    startTransition(() => {
      setSelectedGender(draftGender);
      setSelectedFamily(draftFamily);
      setPage(1);
    });
    setFiltersOpen(false);
  };

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-transparent pb-16">
      <section className="relative overflow-hidden border-b border-line bg-[linear-gradient(180deg,#FFFDF9_0%,#F7F0E7_55%,#FBF8F3_100%)]">
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-sand/80 blur-3xl sm:h-64 sm:w-64" />

        <div className="luxury-container relative py-8 sm:py-11 lg:py-14">
          <div className="max-w-4xl">
            <p className="section-label">{BRAND_CONTENT.heroEyebrow}</p>
            <BrandMark compact className="mt-4" showDescriptor={false} />

            <h1 className="mt-5 max-w-3xl font-display text-[2.2rem] font-semibold leading-[1.03] tracking-[-0.04em] text-ink sm:mt-6 sm:text-5xl lg:text-[3.45rem]">
              {BRAND_CONTENT.heroTitle}
            </h1>

            <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-slate sm:mt-4 sm:text-lg sm:leading-8">
              {BRAND_CONTENT.heroCopy}
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate">
              {HERO_POINTS.map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <button
                type="button"
                onClick={scrollToGrid}
                className="button-primary w-full gap-2 sm:w-auto"
              >
                {BRAND_CONTENT.heroPrimaryCta}
                <ArrowDownIcon />
              </button>
              <a
                href={whatsappHref}
                target={hasWhatsApp ? '_blank' : undefined}
                rel={hasWhatsApp ? 'noreferrer' : undefined}
                className="button-secondary w-full gap-2 sm:w-auto"
              >
                <WhatsAppIcon className="h-[18px] w-[18px] shrink-0" />
                {BRAND_CONTENT.heroSecondaryCta}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section ref={gridRef} className="luxury-container scroll-mt-24 py-7 sm:py-10">
        <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label">{BRAND_CONTENT.catalogEyebrow}</p>
            <h2 className="section-title">{BRAND_CONTENT.catalogTitle}</h2>
            <p className="section-copy">{BRAND_CONTENT.catalogCopy}</p>
          </div>

          <div className="soft-panel px-4 py-3.5 text-sm text-slate sm:px-5 sm:py-4">
            <p className="font-semibold text-ink">{BRAND_CONTENT.catalogCounterLabel}</p>
            <p className="mt-1">
              {loading ? 'Atualizando a colecao...' : `${totalCount} perfume(s) disponiveis`}
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate">
              {normalizedSearch
                ? `Resultados para "${normalizedSearch}"`
                : hasActiveFilters
                  ? 'Busca refinada pelos seus filtros'
                  : BRAND_CONTENT.catalogFeaturedNote}
            </p>
          </div>
        </div>

        <div className="mt-7 hidden sm:block">
          <div className="soft-panel p-6">
            <div className="grid gap-6">
              <div className="grid gap-6 border-b border-line/70 pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <SearchField value={searchTerm} onChange={handleSearchChange} />

                <div className="flex items-end lg:justify-end">
                  <a
                    href={whatsappHref}
                    target={hasWhatsApp ? '_blank' : undefined}
                    rel={hasWhatsApp ? 'noreferrer' : undefined}
                    className="button-secondary w-full gap-2 sm:w-auto lg:min-w-[220px]"
                  >
                    <WhatsAppIcon />
                    Pedir ajuda no WhatsApp
                  </a>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <FilterGroup
                  title="Genero"
                  options={['Todos', ...GENEROS]}
                  selected={selectedGender}
                  onSelect={handleGenderChange}
                />
                <FilterGroup
                  title="Familia olfativa"
                  options={['Todas', ...FAMILIAS_OLFATIVAS]}
                  selected={selectedFamily}
                  onSelect={handleFamilyChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:hidden">
          <SearchField value={searchTerm} onChange={handleSearchChange} />
        </div>

        <div className="sticky top-[70px] z-30 -mx-4 mt-4 border-y border-line/80 bg-ivory/95 px-4 py-3 backdrop-blur sm:top-[76px] sm:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="button-secondary w-full justify-between px-4"
          >
            <span className="inline-flex items-center gap-2">
              <SearchIcon />
              Filtrar catalogo
            </span>
            <span className="text-xs text-slate">
              {loading ? '...' : `${totalCount} itens`}
            </span>
          </button>
        </div>

        <div
          className={`fixed inset-0 z-50 sm:hidden ${
            filtersOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <div
            className={`absolute inset-0 bg-black/30 transition duration-200 ${
              filtersOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setFiltersOpen(false)}
          />

          <div
            className={`absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-ivory px-5 py-6 transition duration-200 ${
              filtersOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="section-label">Filtros</p>
                <h3 className="mt-2 font-display text-[1.8rem] font-medium leading-[1.05] tracking-[-0.04em] text-ink">
                  Refine a busca
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white text-sm font-semibold text-ink"
                aria-label="Fechar filtros"
              >
                X
              </button>
            </div>

            <div className="mt-7 flex-1 space-y-7 overflow-y-auto">
              <FilterGroup
                title="Genero"
                options={['Todos', ...GENEROS]}
                selected={draftGender}
                onSelect={setDraftGender}
                stacked
              />
              <FilterGroup
                title="Familia olfativa"
                options={['Todas', ...FAMILIAS_OLFATIVAS]}
                selected={draftFamily}
                onSelect={setDraftFamily}
                stacked
              />
            </div>

            <div className="mt-8 border-t border-line pt-4">
              <button
                type="button"
                onClick={applyMobileFilters}
                className="button-primary w-full"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>

        <div className="mt-7">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-4">
                  <Skeleton className="h-[285px] w-full sm:h-[320px]" />
                  <Skeleton className="h-5 w-2/5" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : perfumes.length ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {perfumes.map((perfume) => (
                  <PerfumeCard key={perfume.id} perfume={perfume} showHighlightBadge />
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4 border-t border-line/80 pt-6 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate">
                  Pagina {page} de {totalPages}
                </p>

                <div className="grid grid-cols-2 gap-3 sm:flex">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Pagina anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page === totalPages}
                    className="button-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Proxima pagina
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="card-shell p-6 sm:p-8">
              <p className="font-display text-[1.9rem] font-medium leading-[1.08] tracking-[-0.04em] text-ink sm:text-3xl">
                {BRAND_CONTENT.catalogEmptyTitle}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate">
                {error || BRAND_CONTENT.catalogEmptyCopy}
              </p>
              <a
                href={whatsappHref}
                target={hasWhatsApp ? '_blank' : undefined}
                rel={hasWhatsApp ? 'noreferrer' : undefined}
                className="button-primary mt-6 w-full gap-2 sm:w-auto"
              >
                <WhatsAppIcon className="h-[18px] w-[18px] shrink-0" />
                Falar com a loja
              </a>
            </div>
          )}
        </div>
      </section>

      <section id="sobre" className="luxury-container scroll-mt-24 py-10 sm:py-14">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label">{BRAND_CONTENT.trustEyebrow}</p>
            <h2 className="section-title">{BRAND_CONTENT.trustTitle}</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate sm:text-base">
            {BRAND_CONTENT.trustCopy}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3 lg:mt-10 lg:gap-6">
          {TRUST_ITEMS.map((item) => (
            <article key={item.title} className="card-shell p-6">
              <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="luxury-container py-10 sm:py-14">
        <div className="soft-panel overflow-hidden p-5 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="section-label">Atendimento</p>
              <h2 className="section-title">{BRAND_CONTENT.finalCtaTitle}</h2>
              <p className="section-copy">{BRAND_CONTENT.finalCtaCopy}</p>
            </div>

            <a
              href={whatsappHref}
              target={hasWhatsApp ? '_blank' : undefined}
              rel={hasWhatsApp ? 'noreferrer' : undefined}
              className="button-primary w-full gap-2 sm:w-auto"
            >
              <WhatsAppIcon className="h-[18px] w-[18px] shrink-0" />
              {BRAND_CONTENT.finalCtaButton}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
