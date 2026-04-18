"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/store/useStore"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, TrendingDown, Package, DollarSign } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  convertCurrency,
  formatCurrency,
  getCurrencyForLocale,
  getStoredPriceCurrency,
} from "@/lib/currency"
import { translateProductName } from "@/lib/translations/products"
import { translateCategory, translateSource } from "@/lib/translations/categories"

const COLORS = [
  "hsl(var(--foreground))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--foreground))",
  "hsl(var(--muted-foreground))",
]

export default function DashboardPage() {
  const { t, locale } = useLanguage()
  const { analytics, loading, error, setAnalytics, setLoading, setError } =
    useStore()
  const [parsing, setParsing] = useState(false)
  const currency = getCurrencyForLocale(locale)

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/analytics")
      if (!response.ok) throw new Error("Failed to fetch analytics")
      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const handleParse = async () => {
    setParsing(true)
    setError(null)
    try {
      const cleanupRes = await fetch("/api/parse/cleanup-dummy", {
        method: "POST",
      })
      if (!cleanupRes.ok) {
        const body = await cleanupRes.json().catch(() => ({}))
        throw new Error(body?.error || t.dashboard.parseCleanupError)
      }

      const sources = ["airconditioners", "waterfilters"] as const

      const failures: string[] = []
      for (const source of sources) {
        const response = await fetch(`/api/parse/${source}`, {
          method: "POST",
        })
        if (!response.ok) {
          let detail = response.statusText || String(response.status)
          try {
            const body = await response.json()
            if (body?.error) detail = body.error
          } catch {
            /* ignore */
          }
          failures.push(`${source}: ${detail}`)
        }
      }

      await fetchAnalytics()

      if (failures.length > 0) {
        setError(
          failures.length === sources.length
            ? `${t.dashboard.parseFailedAll}: ${failures.join("; ")}`
            : `${t.dashboard.parseFailedSome}: ${failures.join("; ")}`
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setParsing(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading && !analytics) {
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t.dashboard.title}</h1>
          <p className="text-muted-foreground">
            {t.dashboard.subtitle}
          </p>
        </div>
        <button
          onClick={handleParse}
          disabled={parsing}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {parsing ? t.dashboard.parsing : t.dashboard.parseData}
        </button>
      </div>

      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{t.dashboard.totalProducts}</p>
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{analytics.summary.totalProducts}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {t.dashboard.acrossAllSources}
              </p>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{t.dashboard.averagePrice}</p>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">
                {formatCurrency(
                  convertCurrency(analytics.summary.averagePrice || 0, "USD", currency),
                  currency,
                  locale
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t.dashboard.priceRange}: {formatCurrency(
                  convertCurrency(analytics.summary.minPrice || 0, "USD", currency),
                  currency,
                  locale
                )} - {formatCurrency(
                  convertCurrency(analytics.summary.maxPrice || 0, "USD", currency),
                  currency,
                  locale
                )}
              </p>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{t.dashboard.totalValue}</p>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">
                {formatCurrency(
                  convertCurrency(analytics.summary.totalValue || 0, "USD", currency),
                  currency,
                  locale
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t.dashboard.sumOfAllProducts}
              </p>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{t.dashboard.dataSources}</p>
                <TrendingDown className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{analytics.summary.totalSources}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {t.dashboard.activeSources}
              </p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Daily Stats */}
            {analytics.dailyStats && analytics.dailyStats.length > 0 && (
              <div className="border border-border rounded-lg p-6 bg-card">
                <h2 className="text-xl font-semibold mb-4">{t.dashboard.sevenDayPriceTrends}</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailyStats.map((d: any) => ({
                    ...d,
                    avgPrice: convertCurrency(d.avgPrice, "USD", currency),
                    minPrice: convertCurrency(d.minPrice, "USD", currency),
                    maxPrice: convertCurrency(d.maxPrice, "USD", currency),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value, currency, locale)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgPrice"
                      stroke="hsl(var(--foreground))"
                      strokeWidth={2}
                      name="Avg Price"
                    />
                    <Line
                      type="monotone"
                      dataKey="minPrice"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="5 5"
                      name="Min Price"
                    />
                    <Line
                      type="monotone"
                      dataKey="maxPrice"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="5 5"
                      name="Max Price"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Price Distribution */}
            {analytics.priceDistribution && analytics.priceDistribution.length > 0 && (
              <div className="border border-border rounded-lg p-6 bg-card">
                <h2 className="text-xl font-semibold mb-4">{t.dashboard.priceDistribution}</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.priceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.priceDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Products by Source */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold mb-4">{t.dashboard.productsBySource}</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.sources.map((s: any) => ({
                    ...s,
                    source: translateSource(s.source, locale),
                  }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="hsl(var(--foreground))" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Average Price by Category */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold mb-4">
                {t.dashboard.averagePriceByCategory}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.categories.map((cat: any) => ({
                  ...cat,
                  category: translateCategory(cat.category, locale),
                  averagePrice: convertCurrency(cat.averagePrice || 0, "USD", currency),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency, locale)} />
                  <Legend />
                  <Bar
                    dataKey="averagePrice"
                    fill="hsl(var(--foreground))"
                    name="Avg Price"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Source Price Statistics */}
            {analytics.sourcePriceStats && analytics.sourcePriceStats.length > 0 && (
              <div className="border border-border rounded-lg p-6 bg-card">
                <h2 className="text-xl font-semibold mb-4">{t.dashboard.sourcePriceAnalysis}</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.sourcePriceStats.map((s: any) => ({
                    ...s,
                    source: translateSource(s.source, locale),
                    averagePrice: convertCurrency(s.averagePrice || 0, "USD", currency),
                    minPrice: convertCurrency(s.minPrice || 0, "USD", currency),
                    maxPrice: convertCurrency(s.maxPrice || 0, "USD", currency),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value, currency, locale)} />
                    <Legend />
                    <Bar dataKey="averagePrice" fill="hsl(var(--foreground))" name="Avg Price" />
                    <Bar dataKey="minPrice" fill="hsl(var(--muted-foreground))" name="Min Price" />
                    <Bar dataKey="maxPrice" fill="hsl(var(--muted-foreground))" name="Max Price" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Categories */}
            {analytics.topCategories && analytics.topCategories.length > 0 && (
              <div className="border border-border rounded-lg p-6 bg-card">
                <h2 className="text-xl font-semibold mb-4">{t.dashboard.topCategories}</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topCategories.map((c: any) => ({
                      ...c,
                      category: translateCategory(c.category, locale),
                    }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="hsl(var(--foreground))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Monthly Trends and Category Growth */}
          {(analytics.monthlyTrends || analytics.categoryGrowth) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {analytics.monthlyTrends && analytics.monthlyTrends.length > 0 && (
                <div className="border border-border rounded-lg p-6 bg-card">
                  <h2 className="text-xl font-semibold mb-4">{t.dashboard.monthlyTrends}</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.monthlyTrends.map((m: any) => ({
                      ...m,
                      avgPrice: convertCurrency(m.avgPrice, "USD", currency),
                      totalValue: convertCurrency(m.totalValue, "USD", currency),
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value, currency, locale)} />
                      <Legend />
                      <Bar dataKey="avgPrice" fill="hsl(var(--foreground))" name={t.dashboard.avgPriceLabel} />
                      <Bar dataKey="totalValue" fill="hsl(var(--muted-foreground))" name={t.dashboard.totalValueLabel} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {analytics.categoryGrowth && analytics.categoryGrowth.length > 0 && (
                <div className="border border-border rounded-lg p-6 bg-card">
                  <h2 className="text-xl font-semibold mb-4">{t.dashboard.categoryGrowth}</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.categoryGrowth.map((c: any) => ({
                        ...c,
                        category: translateCategory(c.category, locale),
                      }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="category"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalCount" fill="hsl(var(--foreground))" name={t.dashboard.countLabel} />
                      <Bar dataKey="sourceCount" fill="hsl(var(--muted-foreground))" name={t.dashboard.sourcesLabel} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Category Details Table */}
          <div className="border border-border rounded-lg p-6 bg-card mb-8">
            <h2 className="text-xl font-semibold mb-4">{t.dashboard.categoryStatistics}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3">{t.dashboard.category}</th>
                    <th className="text-left p-3">{t.dashboard.count}</th>
                    <th className="text-left p-3">{t.dashboard.avgPrice}</th>
                    <th className="text-left p-3">{t.dashboard.minPrice}</th>
                    <th className="text-left p-3">{t.dashboard.maxPrice}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.categories.map((cat: any) => (
                    <tr key={cat.category} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3 font-medium">{translateCategory(cat.category, locale)}</td>
                      <td className="p-3">{cat.count}</td>
                      <td className="p-3">
                        {formatCurrency(
                          convertCurrency(cat.averagePrice || 0, "USD", currency),
                          currency,
                          locale
                        )}
                      </td>
                      <td className="p-3">
                        {formatCurrency(
                          convertCurrency(cat.minPrice || 0, "USD", currency),
                          currency,
                          locale
                        )}
                      </td>
                      <td className="p-3">
                        {formatCurrency(
                          convertCurrency(cat.maxPrice || 0, "USD", currency),
                          currency,
                          locale
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Products */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">{t.dashboard.recentProducts}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3">{t.dashboard.columnTitle}</th>
                    <th className="text-left p-3">{t.dashboard.category}</th>
                    <th className="text-left p-3">{t.dashboard.price}</th>
                    <th className="text-left p-3">{t.dashboard.source}</th>
                    <th className="text-left p-3">{t.dashboard.fetchedAt}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentProducts.map((product: any) => (
                    <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3">{translateProductName(product.title, locale)}</td>
                      <td className="p-3">{translateCategory(product.category, locale)}</td>
                      <td className="p-3 font-medium">
                        {formatCurrency(
                          convertCurrency(
                            product.price,
                            getStoredPriceCurrency(product.source),
                            currency
                          ),
                          currency,
                          locale
                        )}
                      </td>
                      <td className="p-3">{translateSource(product.source, locale)}</td>
                      <td className="p-3">
                        {new Date(product.fetchedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
