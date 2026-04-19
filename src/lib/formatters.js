export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
}

export function formatVolume(value) {
  if (!value) {
    return 'Volume sob consulta';
  }

  return `${value} ml`;
}

export function buildWhatsAppUrl(number, perfumeName) {
  if (!number) {
    return null;
  }

  const message = `Oi! Vim pelo site da Fonte do Cheiro e quero saber mais sobre o perfume *${perfumeName}*. Pode me passar disponibilidade e formas de pagamento?`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
