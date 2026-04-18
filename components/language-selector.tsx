"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { Locale, locales } from "@/lib/i18n"
import { Globe } from "lucide-react"

const LOCALE_LABELS: Record<Locale, string> = {
  kk: "Қазақша",
  ru: "Русский",
  en: "English",
}

export function LanguageSelector() {
  const { locale, setLocale } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label="Language"
        title="Language"
        className="border border-border rounded px-2 py-1 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_LABELS[loc]}
          </option>
        ))}
      </select>
    </div>
  )
}
