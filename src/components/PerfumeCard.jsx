import { Link } from 'react-router-dom';
import fallbackPerfume from '../assets/fallback-perfume.svg';
import { formatCurrency } from '../lib/formatters';
import { getFamilyGuide } from '../lib/siteContent';

export default function PerfumeCard({ perfume, showHighlightBadge = false }) {
  const image = perfume.imagem_capa || fallbackPerfume;
  const hasPromo = Number(perfume.preco_promocional) > 0;
  const familyGuide = getFamilyGuide(perfume.familia_olfativa);

  return (
    <Link
      to={`/perfume/${perfume.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line/80 bg-white shadow-hush transition duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-float"
    >
      <div className="relative overflow-hidden bg-[#F7F1EA]">
        <img
          src={image}
          alt={perfume.nome}
          className="h-[285px] w-full object-cover transition duration-200 group-hover:scale-[1.03] sm:h-[320px]"
          loading="lazy"
        />

        <div className="absolute left-4 top-4 rounded-full border border-[#E7D7C1] bg-[#FFF9F1] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6D5332] shadow-sm">
          {perfume.genero || 'Unissex'}
        </div>

        {showHighlightBadge && perfume.destaque ? (
          <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-xl bg-[#FFF0D4] px-3 py-1.5 text-[11px] font-semibold text-[#8C5A1C] shadow-hush">
            {'\u2605'} Destaque
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/90">
            {perfume.marca}
          </p>
          <h3 className="mt-3 font-display text-[1.55rem] leading-[1.05] tracking-[-0.04em] text-ink">
            {perfume.nome}
          </h3>
          <p className="mt-3 text-sm font-medium text-slate">
            {perfume.familia_olfativa || 'Curadoria da marca'}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate/90">{familyGuide}</p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-2">
          <div>
            {hasPromo ? (
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-slate/70 line-through">
                  {formatCurrency(perfume.preco)}
                </span>
                <span className="text-2xl font-semibold text-gold">
                  {formatCurrency(perfume.preco_promocional)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-semibold text-ink">
                {formatCurrency(perfume.preco)}
              </span>
            )}
          </div>

          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate transition duration-150 group-hover:text-gold">
            Ver perfume
          </span>
        </div>
      </div>
    </Link>
  );
}
