import { create } from "zustand"

interface Product {
  id: string
  externalId: string
  title: string
  price: number
  category: string
  image?: string | null
  source: string
  fetchedAt: string
}

interface Analytics {
  summary: {
    totalProducts: number
    totalSources: number
    averagePrice: number | null
    minPrice: number | null
    maxPrice: number | null
    totalValue: number | null
    priceRange?: number | null
    medianPrice?: number | null
  }
  sources: Array<{ source: string; count: number }>
  categories: Array<{
    category: string
    count: number
    averagePrice: number | null
    minPrice?: number | null
    maxPrice?: number | null
  }>
  recentProducts: Product[]
  priceDistribution?: Array<{ range: string; count: number }>
  dailyStats?: Array<{
    date: string
    count: number
    avgPrice: number
    minPrice: number
    maxPrice: number
  }>
  sourcePriceStats?: Array<{
    source: string
    averagePrice: number | null
    minPrice: number | null
    maxPrice: number | null
    totalValue: number | null
    count: number
  }>
  topCategories?: Array<{ category: string; count: number }>
  monthlyTrends?: Array<{
    month: string
    count: number
    avgPrice: number
    minPrice: number
    maxPrice: number
    totalValue: number
  }>
  categoryGrowth?: Array<{
    category: string
    totalCount: number
    avgPrice: number
    sourceCount: number
  }>
}

interface StoreState {
  products: Product[]
  analytics: Analytics | null
  loading: boolean
  error: string | null
  setProducts: (products: Product[]) => void
  setAnalytics: (analytics: Analytics) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useStore = create<StoreState>((set) => ({
  products: [],
  analytics: null,
  loading: false,
  error: null,
  setProducts: (products) => set({ products }),
  setAnalytics: (analytics) => set({ analytics }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

