const categoryTranslations: Record<string, { ru: string; en: string; kk: string }> = {
  // Кондиционер санаттары
  "сплит-система": { ru: "сплит-система", en: "split-system", kk: "сплит-жүйе" },
  "инвертор": { ru: "инвертор", en: "inverter", kk: "инвертор" },
  "мобильный": { ru: "мобильный", en: "portable", kk: "портативті" },
  "мульти-сплит": { ru: "мульти-сплит", en: "multi-split", kk: "мульти-сплит" },
  "кассетный": { ru: "кассетный", en: "cassette", kk: "кассеталық" },

  // Су сүзгілері санаттары
  "обратный осмос": { ru: "обратный осмос", en: "reverse osmosis", kk: "кері осмос" },
  "кувшин": { ru: "кувшин", en: "pitcher", kk: "кесе сүзгі" },
  "под мойку": { ru: "под мойку", en: "under-sink", kk: "раковина астына" },
  "магистральный": { ru: "магистральный", en: "whole-house", kk: "магистральды" },
  "насадка на кран": { ru: "насадка на кран", en: "faucet-mount", kk: "кранға кигізгіш" },

  // DummyJSON / FakeStore санаттары
  "beauty": { ru: "красота", en: "beauty", kk: "сұлулық" },
  "fragrances": { ru: "парфюмерия", en: "fragrances", kk: "хош иіс" },
  "furniture": { ru: "мебель", en: "furniture", kk: "жиһаз" },
  "groceries": { ru: "продукты", en: "groceries", kk: "азық-түлік" },
  "home-decoration": { ru: "декор для дома", en: "home decoration", kk: "үй безендіру" },
  "kitchen-accessories": { ru: "кухонные аксессуары", en: "kitchen accessories", kk: "ас үй керек-жарағы" },
  "laptops": { ru: "ноутбуки", en: "laptops", kk: "ноутбуктер" },
  "mens-shirts": { ru: "мужские рубашки", en: "men's shirts", kk: "ерлер көйлектері" },
  "mens-shoes": { ru: "мужская обувь", en: "men's shoes", kk: "ерлер аяқ киімі" },
  "mens-watches": { ru: "мужские часы", en: "men's watches", kk: "ерлер сағаттары" },
  "mobile-accessories": { ru: "мобильные аксессуары", en: "mobile accessories", kk: "мобильді керек-жарақтар" },
  "motorcycle": { ru: "мотоциклы", en: "motorcycle", kk: "мотоциклдер" },
  "skin-care": { ru: "уход за кожей", en: "skin care", kk: "тері күтімі" },
  "smartphones": { ru: "смартфоны", en: "smartphones", kk: "смартфондар" },
  "sports-accessories": { ru: "спортивные аксессуары", en: "sports accessories", kk: "спорт керек-жарақтары" },
  "sunglasses": { ru: "солнечные очки", en: "sunglasses", kk: "күн көзілдірігі" },
  "tablets": { ru: "планшеты", en: "tablets", kk: "планшеттер" },
  "tops": { ru: "топы", en: "tops", kk: "топтар" },
  "vehicle": { ru: "транспорт", en: "vehicle", kk: "көлік" },
  "womens-bags": { ru: "женские сумки", en: "women's bags", kk: "әйелдер сөмкелері" },
  "womens-dresses": { ru: "женские платья", en: "women's dresses", kk: "әйелдер көйлектері" },
  "womens-jewellery": { ru: "женские украшения", en: "women's jewellery", kk: "әйелдер зергерлік бұйымдары" },
  "womens-shoes": { ru: "женская обувь", en: "women's shoes", kk: "әйелдер аяқ киімі" },
  "womens-watches": { ru: "женские часы", en: "women's watches", kk: "әйелдер сағаттары" },
  "men's clothing": { ru: "мужская одежда", en: "men's clothing", kk: "ерлер киімі" },
  "women's clothing": { ru: "женская одежда", en: "women's clothing", kk: "әйелдер киімі" },
  "jewelery": { ru: "ювелирные изделия", en: "jewelery", kk: "зергерлік бұйымдар" },
  "electronics": { ru: "электроника", en: "electronics", kk: "электроника" },
}

const reverseCategoryMap = new Map<string, { ru: string; kk: string }>()
for (const [key, val] of Object.entries(categoryTranslations)) {
  if (val.en !== key) {
    reverseCategoryMap.set(val.en, { ru: val.ru, kk: val.kk })
  }
}

export function translateCategory(category: string, locale: string): string {
  const match = categoryTranslations[category]
  if (match) {
    if (locale === "en") return match.en
    if (locale === "kk") return match.kk
    return match.ru
  }
  const fromReverse = reverseCategoryMap.get(category)
  if (fromReverse) {
    if (locale === "en") return category
    if (locale === "kk") return fromReverse.kk
    return fromReverse.ru
  }
  return category
}

const sourceTranslations: Record<string, { ru: string; en: string; kk: string }> = {
  "airconditioners": { ru: "Кондиционеры", en: "Air Conditioners", kk: "Ауа баптағыштар" },
  "waterfilters": { ru: "Фильтры для воды", en: "Water Filters", kk: "Су сүзгілері" },
  "dummyjson": { ru: "DummyJSON", en: "DummyJSON", kk: "DummyJSON" },
  "fakestore": { ru: "FakeStore", en: "FakeStore", kk: "FakeStore" },
  "manual": { ru: "Вручную", en: "Manual", kk: "Қолмен" },
}

export function translateSource(source: string, locale: string): string {
  const match = sourceTranslations[source]
  if (match) {
    if (locale === "en") return match.en
    if (locale === "kk") return match.kk
    return match.ru
  }
  return source
}
