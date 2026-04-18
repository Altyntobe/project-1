"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { convertCurrency, formatCurrency, getCurrencyForLocale } from "@/lib/currency"
import { translateCategory, translateSource } from "@/lib/translations/categories"

interface SourceStats {
  source: string
  count: number
  averagePrice: number | null
  minPrice: number | null
  maxPrice: number | null
  categories: string[]
}

export default function SourcesPage() {
  const { t, locale } = useLanguage()
  const currency = getCurrencyForLocale(locale)
  const [sources, setSources] = useState<SourceStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSources = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/sources")
        if (!response.ok) throw new Error("Failed to fetch sources")
        const data = await response.json()
        setSources(data.sources)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchSources()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {t.common.error}: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t.sources.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((source) => (
          <div
            key={source.source}
            className="border border-border rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4">
              {translateSource(source.source, locale)}
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{t.sources.totalProducts}</p>
                <p className="text-xl font-bold">{source.count}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.sources.averagePrice}</p>
                <p className="text-xl font-bold">
                  {source.averagePrice ? formatCurrency(
                    convertCurrency(source.averagePrice, "USD", currency),
                    currency,
                    locale
                  ) : "N/A"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">{t.sources.minPrice}</p>
                  <p className="text-lg">
                    {source.minPrice ? formatCurrency(
                      convertCurrency(source.minPrice, "USD", currency),
                      currency,
                      locale
                    ) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.sources.maxPrice}</p>
                  <p className="text-lg">
                    {source.maxPrice ? formatCurrency(
                      convertCurrency(source.maxPrice, "USD", currency),
                      currency,
                      locale
                    ) : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {t.sources.categories} ({source.categories.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {source.categories.slice(0, 5).map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-1 bg-muted rounded text-xs"
                    >
                      {translateCategory(cat, locale)}
                    </span>
                  ))}
                  {source.categories.length > 5 && (
                    <span className="px-2 py-1 text-xs text-muted-foreground">
                      +{source.categories.length - 5} {t.sources.moreCategories}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t.sources.noSourcesFound}</p>
        </div>
      )}
    </div>
  )
}
