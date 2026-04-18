export type Currency = "USD" | "KZT"

const USD_TO_KZT_RATE = 500 // Приблизительный курс

/** Источники, у которых цена в БД хранится в тенге */
const KZT_STORED_SOURCES = new Set(["waterfilters", "airconditioners"])

export function getStoredPriceCurrency(source: string): Currency {
  return KZT_STORED_SOURCES.has(source) ? "KZT" : "USD"
}

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount

  if (from === "USD" && to === "KZT") {
    return amount * USD_TO_KZT_RATE
  }

  if (from === "KZT" && to === "USD") {
    return amount / USD_TO_KZT_RATE
  }

  return amount
}

export function formatCurrency(amount: number, currency: Currency, locale: string = "kk"): string {
  const intlLocale = locale === "kk" ? "kk-KZ" : locale === "ru" ? "ru-RU" : "en-US"

  if (currency === "KZT") {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: "KZT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** KZT — kk және ru үшін, USD — en үшін */
export function getCurrencyForLocale(locale: string): Currency {
  return locale === "en" ? "USD" : "KZT"
}
