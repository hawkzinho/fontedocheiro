import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import BrandMark from './BrandMark';
import WhatsAppIcon from './WhatsAppIcon';
import { BRAND_CONTENT } from '../lib/siteContent';
import { WHATSAPP_NUMBER } from '../lib/supabase';

const navItems = [
  { label: 'Catalogo', href: '/catalogo' },
  { label: 'Sobre', href: '/catalogo#sobre' },
  { label: 'Contato', href: '/catalogo#contato' },
];

const whatsappHref = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      'Oi! Vim pelo site da Fonte do Cheiro e quero conhecer a colecao.'
    )}`
  : '/catalogo#contato';
const hasWhatsApp = Boolean(WHATSAPP_NUMBER);

export default function Header() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const scrollY = window.scrollY;
    const { style } = document.body;
    const previous = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
    };

    style.overflow = 'hidden';
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.left = '0';
    style.right = '0';
    style.width = '100%';

    return () => {
      style.overflow = previous.overflow;
      style.position = previous.position;
      style.top = previous.top;
      style.left = previous.left;
      style.right = previous.right;
      style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-[60] border-b border-line/80 bg-ivory/90 backdrop-blur-xl">
      <div className="luxury-container flex h-[70px] items-center justify-between gap-4 sm:h-[76px] sm:gap-6">
        <Link to="/catalogo" aria-label={BRAND_CONTENT.name}>
          <BrandMark compact showDescriptor={false} />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="text-sm font-medium text-slate transition duration-150 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={whatsappHref}
            target={hasWhatsApp ? '_blank' : undefined}
            rel={hasWhatsApp ? 'noreferrer' : undefined}
            className="button-secondary gap-2 whitespace-nowrap"
          >
            <WhatsAppIcon className="h-[17px] w-[17px] shrink-0" />
            Atendimento no WhatsApp
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white transition duration-150 hover:border-stone md:hidden"
          aria-label="Abrir menu"
        >
          <span className="space-y-1.5">
            <span className="block h-px w-4 bg-ink" />
            <span className="block h-px w-4 bg-ink" />
            <span className="block h-px w-4 bg-ink" />
          </span>
        </button>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <div
            className={`fixed inset-0 z-[140] transition duration-200 md:hidden ${
              menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-hidden={!menuOpen}
          >
            <div
              className="absolute inset-0 bg-[rgba(23,19,16,0.35)] backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />

            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegacao"
              className={`absolute inset-0 h-full w-full max-w-full overflow-x-hidden bg-[linear-gradient(180deg,#FFFDFA_0%,#F7F1E9_100%)] px-5 pb-6 pt-5 shadow-[0_16px_44px_rgba(23,19,16,0.22)] transition duration-200 ${
                menuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="flex items-center justify-between gap-4 border-b border-line/80 pb-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">
                    Navegacao
                  </p>
                  <BrandMark compact showDescriptor={false} className="mt-2" />
                </div>

                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-sm font-semibold text-ink transition duration-150 hover:border-stone"
                  aria-label="Fechar menu"
                >
                  X
                </button>
              </div>

              <p className="mt-4 max-w-xs text-sm leading-6 text-slate">
                {BRAND_CONTENT.supportingLine}
              </p>

              <nav className="mt-6 flex flex-col">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="inline-flex min-h-[50px] items-center border-b border-line/70 py-3 text-base font-medium text-ink transition duration-150 active:text-gold"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <a
                href={whatsappHref}
                target={hasWhatsApp ? '_blank' : undefined}
                rel={hasWhatsApp ? 'noreferrer' : undefined}
                className="button-primary mt-6 w-full gap-2"
              >
                <WhatsAppIcon className="h-[18px] w-[18px] shrink-0" />
                Falar com a loja
              </a>
            </aside>
          </div>,
          document.body
        )}
    </header>
  );
}
