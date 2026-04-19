import BrandMark from './BrandMark';
import WhatsAppIcon from './WhatsAppIcon';
import { BRAND_CONTENT, SHOPPING_STEPS } from '../lib/siteContent';
import { WHATSAPP_NUMBER } from '../lib/supabase';

const whatsappHref = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      'Oi! Quero falar com a Fonte do Cheiro sobre um perfume.'
    )}`
  : null;
const hasWhatsApp = Boolean(WHATSAPP_NUMBER);

export default function Footer() {
  return (
    <footer
      id="contato"
      className="scroll-mt-24 border-t border-line bg-[linear-gradient(180deg,#FFFDF9_0%,#F6F0E8_100%)]"
    >
      <div className="luxury-container py-12 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr] lg:gap-10">
          <div>
            <BrandMark />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
              Como comprar
            </p>
            <div className="mt-4 space-y-4">
              {SHOPPING_STEPS.map((item) => (
                <div key={item.step} className="border-b border-line/70 pb-4 last:border-b-0 last:pb-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate">
                    {item.step}
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink">{item.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
              Contato
            </p>
            <div className="mt-4 space-y-2.5 text-sm leading-7 text-slate">
              <p>{BRAND_CONTENT.footerInstagram}</p>
              <p>{BRAND_CONTENT.footerLocation}</p>
              <p>Envio para todo o Brasil</p>
            </div>

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target={hasWhatsApp ? '_blank' : undefined}
                rel={hasWhatsApp ? 'noreferrer' : undefined}
                className="button-primary mt-5 w-full gap-2 sm:w-auto"
              >
                <WhatsAppIcon className="h-[18px] w-[18px] shrink-0" />
                Chamar no WhatsApp
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-line/70 pt-5 text-xs text-slate sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <p>{BRAND_CONTENT.footerCopy}</p>
          <p>Cat\u00e1logo online com atendimento direto.</p>
        </div>
      </div>
    </footer>
  );
}
