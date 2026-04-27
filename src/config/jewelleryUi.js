export const JEWELLERY_CATEGORIES = [
  {
    id: 'ring',
    label: 'Ring',
    status: 'active',
    modelIds: ['eclipse_ruby_ring', 'diamond_ring'],
  },
  {
    id: 'earrings',
    label: 'Earrings',
    status: 'active',
    modelIds: ['diamond_earrings'],
  },
  {
    id: 'necklace',
    label: 'Necklace',
    status: 'disabled',
    modelIds: [],
  },
  {
    id: 'bracelet',
    label: 'Bracelet',
    status: 'disabled',
    modelIds: [],
  },
];

export const STYLE_PRESETS_BY_MODEL = {
  eclipse_ruby_ring: [
    {
      id: 'classic-gold-ruby',
      name: 'Classic Gold & Ruby',
      materials: {
        Ring: 'gold',
        Ruby_Base: 'gold',
        Ruby: 'ruby',
      },
      finish: 'polished',
    },
    {
      id: 'silver-ruby',
      name: 'Silver & Ruby',
      materials: {
        Ring: 'silver',
        Ruby_Base: 'silver',
        Ruby: 'ruby',
      },
      finish: 'polished',
    },
    {
      id: 'rose-gold-ruby',
      name: 'Rose Gold & Ruby',
      materials: {
        Ring: 'rose-gold',
        Ruby_Base: 'rose-gold',
        Ruby: 'ruby',
      },
      finish: 'polished',
    },
    {
      id: 'platinum-ruby',
      name: 'Platinum & Ruby',
      materials: {
        Ring: 'platinum',
        Ruby_Base: 'platinum',
        Ruby: 'ruby',
      },
      finish: 'polished',
    },
    {
      id: 'gold-diamond',
      name: 'Gold & Diamond',
      materials: {
        Ring: 'gold',
        Ruby_Base: 'gold',
        Ruby: 'diamond',
      },
      finish: 'polished',
    },
    {
      id: 'gold-sapphire',
      name: 'Gold & Sapphire',
      materials: {
        Ring: 'gold',
        Ruby_Base: 'gold',
        Ruby: 'sapphire',
      },
      finish: 'polished',
    },
    {
      id: 'gold-emerald',
      name: 'Gold & Emerald',
      materials: {
        Ring: 'gold',
        Ruby_Base: 'gold',
        Ruby: 'emerald',
      },
      finish: 'polished',
    },
    {
      id: 'vintage-bronze',
      name: 'Vintage Bronze & Ruby',
      materials: {
        Ring: 'bronze',
        Ruby_Base: 'bronze',
        Ruby: 'ruby',
      },
      finish: 'brushed',
    },
  ],
  diamond_ring: [
    {
      id: 'classic-gold-diamond',
      name: 'Classic Gold & Diamond',
      materials: {
        Ring: 'gold',
        Setting: 'gold',
        Band: 'gold',
        Diamond: 'diamond',
      },
      finish: 'polished',
    },
    {
      id: 'silver-diamond',
      name: 'Silver & Diamond',
      materials: {
        Ring: 'silver',
        Setting: 'silver',
        Band: 'silver',
        Diamond: 'diamond',
      },
      finish: 'polished',
    },
    {
      id: 'rose-gold-diamond',
      name: 'Rose Gold & Diamond',
      materials: {
        Ring: 'rose-gold',
        Setting: 'rose-gold',
        Band: 'rose-gold',
        Diamond: 'diamond',
      },
      finish: 'polished',
    },
    {
      id: 'platinum-diamond',
      name: 'Platinum & Diamond',
      materials: {
        Ring: 'platinum',
        Setting: 'platinum',
        Band: 'platinum',
        Diamond: 'diamond',
      },
      finish: 'polished',
    },
    {
      id: 'bronze-diamond',
      name: 'Bronze & Diamond',
      materials: {
        Ring: 'bronze',
        Setting: 'bronze',
        Band: 'bronze',
        Diamond: 'diamond',
      },
      finish: 'brushed',
    },
    {
      id: 'copper-diamond',
      name: 'Copper & Diamond',
      materials: {
        Ring: 'copper',
        Setting: 'copper',
        Band: 'copper',
        Diamond: 'diamond',
      },
      finish: 'satin',
    },
    {
      id: 'gold-diamond-polished',
      name: 'Gold & Diamond (Polished)',
      materials: {
        Ring: 'gold',
        Setting: 'gold',
        Band: 'gold',
        Diamond: 'diamond',
      },
      finish: 'polished',
    },
    {
      id: 'platinum-diamond-satin',
      name: 'Platinum & Diamond (Satin)',
      materials: {
        Ring: 'platinum',
        Setting: 'platinum',
        Band: 'platinum',
        Diamond: 'diamond',
      },
      finish: 'satin',
    },
  ],
  diamond_earrings: [
    {
      id: 'classic-gold-diamond-earrings',
      name: 'Classic Gold & Diamond',
      materials: {
        Earrings: 'gold',
        Diamonds: 'diamond',
      },
      finish: 'polished',
    },
    {
      id: 'silver-diamond-earrings',
      name: 'Silver & Diamond',
      materials: {
        Earrings: 'silver',
        Diamonds: 'diamond',
      },
      finish: 'polished',
    },
    {
      id: 'rose-gold-diamond-earrings',
      name: 'Rose Gold & Diamond',
      materials: {
        Earrings: 'rose-gold',
        Diamonds: 'diamond',
      },
      finish: 'polished',
    },
    {
      id: 'platinum-diamond-earrings',
      name: 'Platinum & Diamond',
      materials: {
        Earrings: 'platinum',
        Diamonds: 'diamond',
      },
      finish: 'polished',
    },
    {
      id: 'bronze-diamond-earrings',
      name: 'Bronze & Diamond',
      materials: {
        Earrings: 'bronze',
        Diamonds: 'diamond',
      },
      finish: 'brushed',
    },
    {
      id: 'copper-diamond-earrings',
      name: 'Copper & Diamond',
      materials: {
        Earrings: 'copper',
        Diamonds: 'diamond',
      },
      finish: 'satin',
    },
    {
      id: 'gold-diamond-earrings-polished',
      name: 'Gold & Diamond (Polished)',
      materials: {
        Earrings: 'gold',
        Diamonds: 'diamond',
      },
      finish: 'polished',
    },
    {
      id: 'platinum-diamond-earrings-satin',
      name: 'Platinum & Diamond (Satin)',
      materials: {
        Earrings: 'platinum',
        Diamonds: 'diamond',
      },
      finish: 'satin',
    },
  ],
};

export function getStylePresetsForModel(modelId) {
  return STYLE_PRESETS_BY_MODEL[modelId] || [];
}

export function getCategoryForModel(modelId) {
  return (
    JEWELLERY_CATEGORIES.find((category) =>
      category.modelIds.includes(modelId),
    ) || JEWELLERY_CATEGORIES[0]
  );
}

export function getFirstModelForCategory(categoryId) {
  const category = JEWELLERY_CATEGORIES.find((item) => item.id === categoryId);
  return category?.modelIds[0] || null;
}

export function getMaterialSwatches(style) {
  if (!style) return [];

  return Array.from(new Set(Object.values(style.materials))).slice(0, 4);
}
