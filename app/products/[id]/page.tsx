"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { useLanguage } from "@/contexts/LanguageContext"
import { TrendingUp, TrendingDown, Minus, Upload, Trash2, ImageIcon } from "lucide-react"
import {
  convertCurrency,
  formatCurrency,
  getCurrencyForLocale,
  getStoredPriceCurrency,
} from "@/lib/currency"
import { translateProductName } from "@/lib/translations/products"
import { translateCategory, translateSource } from "@/lib/translations/categories"

interface Product {
  id: string
  externalId: string
  title: string
  price: number
  category: string
  image?: string | null
  source: string
  fetchedAt: string
  createdAt: string
  updatedAt: string
  hasCustomImage?: boolean
}

interface Forecast {
  product: {
    id: string
    title: string
    currentPrice: number
    category: string
  }
  priceForecast: {
    forecast: number
    confidence: number
    min: number
    max: number
  }
  salesForecast: {
    forecastPrice: number
    forecastSales: number
    confidence: number
    priceRange: {
      min: number
      max: number
    }
    trend: "rising" | "falling" | "stable"
    growthRate: number
    predictedRevenue: number
  }
  history: Array<{
    price: number
    date: string
  }>
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t, locale } = useLanguage()
  const currency = getCurrencyForLocale(locale)
  const [product, setProduct] = useState<Product | null>(null)
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageMessage, setImageMessage] = useState<string | null>(null)
  const [imageKey, setImageKey] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchProduct = async () => {
    const res = await fetch(`/api/products/${params.id}`)
    if (!res.ok) throw new Error("Failed to fetch product")
    return res.json()
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [productData, forecastRes] = await Promise.all([
          fetchProduct(),
          fetch(`/api/forecast/${params.id}`),
        ])

        setProduct(productData)

        if (forecastRes.ok) {
          const forecastData = await forecastRes.json()
          setForecast(forecastData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setImageMessage(null)

    const formData = new FormData()
    formData.append("image", file)

    try {
      const res = await fetch(`/api/products/${params.id}/image`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t.products.uploadError)
      }

      const updatedProduct = await fetchProduct()
      setProduct(updatedProduct)
      setImageKey((k) => k + 1)
      setImageMessage(t.products.imageUploaded)
    } catch (err) {
      setImageMessage(err instanceof Error ? err.message : t.products.uploadError)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleImageDelete = async () => {
    setUploading(true)
    setImageMessage(null)

    try {
      const res = await fetch(`/api/products/${params.id}/image`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete image")

      const updatedProduct = await fetchProduct()
      setProduct(updatedProduct)
      setImageKey((k) => k + 1)
      setImageMessage(t.products.imageDeleted)
    } catch (err) {
      setImageMessage(err instanceof Error ? err.message : t.products.uploadError)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {t.common.error}: {error || t.products.notFound}
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 border border-border rounded hover:bg-accent"
        >
          {t.common.back}
        </button>
      </div>
    )
  }

  const chartData = forecast?.history.map((h) => ({
    date: new Date(h.date).toLocaleDateString(),
    price: convertCurrency(h.price, "USD", currency),
  })) || []

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "rising":
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case "falling":
        return <TrendingDown className="h-5 w-5 text-red-600" />
      default:
        return <Minus className="h-5 w-5 text-gray-600" />
    }
  }

  const getTrendText = (trend: string) => {
    switch (trend) {
      case "rising":
        return t.products.trend.rising
      case "falling":
        return t.products.trend.falling
      default:
        return t.products.trend.stable
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-4 text-muted-foreground hover:text-foreground"
      >
        ← {t.common.back}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          {product.hasCustomImage ? (
            <img
              key={imageKey}
              src={`/api/products/${product.id}/image?v=${imageKey}`}
              alt={translateProductName(product.title, locale)}
              className="w-full h-96 object-cover rounded-lg mb-4"
            />
          ) : product.image ? (
            <img
              src={product.image}
              alt={translateProductName(product.title, locale)}
              className="w-full h-96 object-cover rounded-lg mb-4"
            />
          ) : (
            <div className="w-full h-96 bg-muted rounded-lg mb-4 flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          <div className="flex items-center gap-2 mb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {uploading
                ? t.common.loading
                : product.hasCustomImage
                  ? t.products.changeImage
                  : t.products.uploadImage}
            </button>
            {product.hasCustomImage && (
              <button
                onClick={handleImageDelete}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 border border-destructive text-destructive rounded hover:bg-destructive/10 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {t.products.deleteImage}
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {t.products.allowedFormats} · {t.products.maxFileSize}
          </p>
          {imageMessage && (
            <p className="text-sm mt-1 text-muted-foreground">{imageMessage}</p>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{translateProductName(product.title, locale)}</h1>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t.dashboard.category}</p>
              <p className="text-lg">{translateCategory(product.category, locale)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.dashboard.price}</p>
              <p className="text-3xl font-bold">
                {formatCurrency(
                  convertCurrency(
                    product.price,
                    getStoredPriceCurrency(product.source),
                    currency
                  ),
                  currency,
                  locale
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.dashboard.source}</p>
              <p className="text-lg">{translateSource(product.source, locale)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.dashboard.fetchedAt}</p>
              <p className="text-lg">
                {new Date(product.fetchedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {forecast && (
        <>
          {/* Price Forecast */}
          <div className="border border-border rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.products.forecast}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">{t.products.forecastPrice}</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    convertCurrency(forecast.priceForecast.forecast, "USD", currency),
                    currency,
                    locale
                  )}
                </p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">{t.products.confidence}</p>
                <p className="text-2xl font-bold">
                  {(forecast.priceForecast.confidence * 100).toFixed(1)}%
                </p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">{t.products.priceRange}</p>
                <p className="text-lg">
                  {formatCurrency(
                    convertCurrency(forecast.priceForecast.min, "USD", currency),
                    currency,
                    locale
                  )} - {formatCurrency(
                    convertCurrency(forecast.priceForecast.max, "USD", currency),
                    currency,
                    locale
                  )}
                </p>
              </div>
            </div>

            {chartData.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">{t.dashboard.sevenDayPriceTrends}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--foreground))"
                      name={t.dashboard.price}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Sales Forecast */}
          <div className="border border-border rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.products.salesForecast}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">{t.products.predictedSales}</p>
                <p className="text-2xl font-bold">
                  {forecast.salesForecast.forecastSales} {t.products.units}
                </p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">{t.products.forecastPrice}</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    convertCurrency(forecast.salesForecast.forecastPrice, "USD", currency),
                    currency,
                    locale
                  )}
                </p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-muted-foreground">{t.products.trend.label}</p>
                  {getTrendIcon(forecast.salesForecast.trend)}
                </div>
                <p className="text-xl font-bold">{getTrendText(forecast.salesForecast.trend)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {forecast.salesForecast.growthRate > 0 ? "+" : ""}
                  {forecast.salesForecast.growthRate.toFixed(1)}%
                </p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">{t.products.predictedRevenue}</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    convertCurrency(forecast.salesForecast.predictedRevenue, "USD", currency),
                    currency,
                    locale
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">{t.products.confidence}</p>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${forecast.salesForecast.confidence * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-1">
                  {(forecast.salesForecast.confidence * 100).toFixed(1)}%
                </p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">{t.products.priceRange}</p>
                <p className="text-lg">
                  {formatCurrency(
                    convertCurrency(forecast.salesForecast.priceRange.min, "USD", currency),
                    currency,
                    locale
                  )} - {formatCurrency(
                    convertCurrency(forecast.salesForecast.priceRange.max, "USD", currency),
                    currency,
                    locale
                  )}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
