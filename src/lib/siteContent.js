export const BRAND_CONTENT = {
  name: 'Fonte do Cheiro',
  descriptor: 'perfumes \u00e1rabes e importados',
  supportingLine:
    'Compra mais simples, atendimento direto e envio para todo o Brasil.',
  heroEyebrow: 'Compra facilitada e atendimento direto',
  heroTitle: 'Uma forma mais simples de comprar perfumes \u00e1rabes.',
  heroCopy:
    'Em vez de importar por conta pr\u00f3pria, voc\u00ea compra com a loja, fala direto no WhatsApp e recebe com mais praticidade e agilidade.',
  heroPrimaryCta: 'Ver perfumes',
  heroSecondaryCta: 'Falar no WhatsApp',
  catalogEyebrow: 'Cat\u00e1logo',
  catalogTitle: 'Perfumes dispon\u00edveis',
  catalogCopy:
    'Use os filtros para encontrar mais r\u00e1pido o perfil, a fam\u00edlia olfativa ou o g\u00eanero que voc\u00ea procura.',
  catalogFeaturedNote:
    'Quando a busca est\u00e1 aberta, os destaques da loja aparecem primeiro.',
  catalogCounterLabel: 'Dispon\u00edveis agora',
  catalogEmptyTitle: 'Nenhum perfume apareceu nesta combina\u00e7\u00e3o.',
  catalogEmptyCopy:
    'Tente outro filtro ou fale com a loja para receber ajuda na escolha pelo WhatsApp.',
  trustEyebrow: 'Comprar com a loja',
  trustTitle: 'Mais praticidade do que importar sozinho.',
  trustCopy:
    'A ideia \u00e9 simplificar a compra: vitrine pronta, atendimento direto e um processo mais r\u00e1pido.',
  finalCtaTitle: 'Precisa de ajuda para escolher?',
  finalCtaCopy:
    'A loja atende direto no WhatsApp para confirmar disponibilidade, valores e indicar op\u00e7\u00f5es parecidas.',
  finalCtaButton: 'Chamar no WhatsApp',
  footerCopy:
    'Perfumes \u00e1rabes e importados com atendimento direto, compra simples e envio nacional.',
  footerInstagram: '@fontedocheiro',
  footerLocation: 'S\u00e3o Mateus - ES',
};

export const HERO_POINTS = [
  'Sem importacao por conta propria',
  'Atendimento direto no WhatsApp',
  'Compra mais simples e agil',
];

export const TRUST_ITEMS = [
  {
    title: 'Compra mais simples',
    description:
      'Voce escolhe pelo catalogo e fecha com a loja, sem passar pelo processo de importacao sozinho.',
  },
  {
    title: 'Atendimento direto',
    description:
      'Disponibilidade, pagamento e duvidas sao resolvidos em conversa direta no WhatsApp.',
  },
  {
    title: 'Mais agilidade',
    description:
      'O processo fica mais pratico e a entrega tende a ser mais rapida do que comprar por conta propria.',
  },
];

export const SHOPPING_STEPS = [
  {
    step: '01',
    title: 'Escolha no catalogo',
    description:
      'Veja os perfumes disponiveis, compare familias olfativas e encontre o perfil que faz sentido para voce.',
  },
  {
    step: '02',
    title: 'Fale com a loja',
    description:
      'No WhatsApp, a equipe confirma disponibilidade, tira duvidas e ajuda na decisao.',
  },
  {
    step: '03',
    title: 'Receba com praticidade',
    description:
      'Pagamento, envio e acompanhamento seguem de forma mais simples e direta.',
  },
];

export const PRODUCT_PAGE_CONTENT = {
  cta: 'Quero este perfume',
  ctaSupport:
    'Fale com a loja para confirmar disponibilidade, valor atualizado e formas de pagamento.',
  unavailable:
    'Os detalhes completos ainda estao sendo atualizados. Chame a loja para receber notas, disponibilidade e orientacao de compra.',
  availableBadge: 'Disponivel para atendimento',
  unavailableBadge: 'Consulte reposicao',
  detailsTitle: 'Por que este perfume chama atencao',
  detailsFallback:
    'Os detalhes deste perfume podem ser enviados pela loja no WhatsApp, junto com disponibilidade, faixa de valor e orientacao para escolha.',
  supportTitle: 'Compra acompanhada pela loja',
  supportCopy:
    'Voce recebe ajuda para decidir, confirmar disponibilidade e alinhar envio sem sair da conversa.',
  supportPoints: [
    'Atendimento direto pelo WhatsApp',
    'Envio para todo o Brasil',
    'Orientacao para escolha e presente',
  ],
  relatedEyebrow: 'Continue explorando',
  relatedTitle: 'Mais opcoes com o mesmo caminho olfativo.',
  relatedCopy:
    'Se voce gostou deste perfil, estas sugestoes ajudam a ampliar a escolha sem perder coerencia.',
  notFoundTitle: 'Este perfume nao esta disponivel agora.',
  notFoundCopy:
    'Ele pode ter saido do catalogo ou estar fora do estoque no momento. Vale voltar para a colecao ou falar com a loja.',
};

export const FAMILY_GUIDES = {
  Floral: 'Mais delicado, elegante e facil de gostar.',
  Amadeirado: 'Mais seco, sofisticado e com profundidade.',
  Oriental: 'Mais quente, envolvente e de presenca marcante.',
  'C\u00edtrico': 'Mais fresco, luminoso e leve no uso.',
  'Aqu\u00e1tico': 'Mais limpo, versatil e agradavel no dia a dia.',
};

export function getFamilyGuide(family) {
  return FAMILY_GUIDES[family] || 'Um perfil escolhido para marcar presenca com bom gosto.';
}
