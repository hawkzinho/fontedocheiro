import { BRAND_CONTENT } from '../lib/siteContent';

export default function BrandMark({
  compact = false,
  className = '',
  light = false,
  showDescriptor = true,
}) {
  const titleTone = light ? 'text-white' : 'text-ink';
  const metaTone = light ? 'text-white/70' : 'text-slate';
  const lineTone = light ? 'bg-white/30' : 'bg-gold/45';

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-center gap-3">
        <span className={`h-px ${compact ? 'w-6' : 'w-10'} ${lineTone}`} />
        <div>
          <p
            className={`font-display font-semibold tracking-[-0.04em] ${titleTone} ${
              compact ? 'text-[1.35rem] leading-none' : 'text-[2rem] leading-none'
            }`}
          >
            {BRAND_CONTENT.name}
          </p>
          {showDescriptor ? (
            <p
              className={`mt-1 text-[10px] font-medium uppercase tracking-[0.34em] ${metaTone}`}
            >
              {BRAND_CONTENT.descriptor}
            </p>
          ) : null}
        </div>
      </div>
      {!compact ? (
        <p className={`mt-4 max-w-sm text-sm leading-7 ${metaTone}`}>
          {BRAND_CONTENT.supportingLine}
        </p>
      ) : null}
    </div>
  );
}
