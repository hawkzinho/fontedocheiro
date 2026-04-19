import { useEffect, useState } from 'react';
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
    document.body.style.overflow = menuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-ivory/90 backdrop-blur-xl">
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
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white md:hidden"
          aria-label="Abrir menu"
        >
          <span className="space-y-1.5">
            <span className="block h-px w-4 bg-ink" />
            <span className="block h-px w-4 bg-ink" />
            <span className="block h-px w-4 bg-ink" />
          </span>
        </button>
      </div>

      <div
        className={`fixed inset-0 z-50 bg-[rgba(23,19,16,0.18)] transition duration-200 md:hidden ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div
          className={`absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-ivory px-5 py-5 transition duration-200 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <BrandMark compact showDescriptor={false} />

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white text-sm font-semibold text-ink"
              aria-label="Fechar menu"
            >
              X
            </button>
          </div>

          <p className="mt-6 max-w-xs text-sm leading-7 text-slate">
            {BRAND_CONTENT.supportingLine}
          </p>

          <nav className="mt-8 flex flex-1 flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="rounded-2xl border border-line bg-white px-5 py-3.5 text-base font-medium text-ink transition duration-150 hover:border-stone hover:shadow-hush"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <a
            href={whatsappHref}
            target={hasWhatsApp ? '_blank' : undefined}
            rel={hasWhatsApp ? 'noreferrer' : undefined}
            className="button-primary mt-5 w-full gap-2"
          >
            <WhatsAppIcon className="h-[18px] w-[18px] shrink-0" />
            Falar com a loja
          </a>
        </div>
      </div>
    </header>
  );
}
