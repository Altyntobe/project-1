interface PriceDataPoint {
  price: number
  fetchedAt: Date
}

interface SalesForecastResult {
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

/**
 * Calculate sales forecast based on price history
 * Uses multiple factors: price trend, volatility, and historical patterns
 */
export function calculateSalesForecast(
  priceHistory: PriceDataPoint[],
  baseSales: number = 100
): SalesForecastResult {
  if (priceHistory.length === 0) {
    throw new Error("No price history provided")
  }

  // Sort by date
  const sorted = [...priceHistory].sort(
    (a, b) => a.fetchedAt.getTime() - b.fetchedAt.getTime()
  )

  // Calculate price trend
  const recentPrices = sorted.slice(-5)
  const olderPrices = sorted.slice(-10, -5)

  const recentAvg =
    recentPrices.reduce((sum, p) => sum + p.price, 0) / recentPrices.length
  const olderAvg =
    olderPrices.length > 0
      ? olderPrices.reduce((sum, p) => sum + p.price, 0) / olderPrices.length
      : recentAvg

  const priceChange = recentAvg - olderAvg
  const priceChangePercent = olderAvg > 0 ? (priceChange / olderAvg) * 100 : 0

  // Determine trend
  let trend: "rising" | "falling" | "stable"
  if (priceChangePercent > 2) {
    trend = "rising"
  } else if (priceChangePercent < -2) {
    trend = "falling"
  } else {
    trend = "stable"
  }

  // Calculate volatility
  const prices = sorted.map((p) => p.price)
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length
  const variance =
    prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
    prices.length
  const stdDev = Math.sqrt(variance)
  const volatility = mean > 0 ? stdDev / mean : 0

  // Forecast price (moving average with trend adjustment)
  const forecastPrice = recentAvg * (1 + priceChangePercent / 100 / 2)

  // Forecast sales based on price elasticity
  // Lower prices typically lead to higher sales
  const priceElasticity = -1.5 // Elasticity coefficient
  const priceChangeFactor = priceChangePercent / 100
  const salesChange = priceElasticity * priceChangeFactor

  // Base sales adjustment
  const forecastSales = Math.max(
    0,
    baseSales * (1 + salesChange) * (1 - volatility * 0.5)
  )

  // Confidence based on data quality and volatility
  const confidence = Math.min(
    0.95,
    Math.max(0.5, 1 - volatility * 2 - (1 / sorted.length) * 0.3)
  )

  // Calculate growth rate
  const growthRate = priceChangePercent

  // Predicted revenue
  const predictedRevenue = forecastPrice * forecastSales

  return {
    forecastPrice,
    forecastSales: Math.round(forecastSales),
    confidence,
    priceRange: {
      min: forecastPrice - stdDev,
      max: forecastPrice + stdDev,
    },
    trend,
    growthRate,
    predictedRevenue,
  }
}

/**
 * Calculate multiple period forecast
 */
export function calculateMultiPeriodForecast(
  priceHistory: PriceDataPoint[],
  periods: number = 3,
  baseSales: number = 100
): SalesForecastResult[] {
  const forecasts: SalesForecastResult[] = []

  for (let i = 1; i <= periods; i++) {
    // Use progressively more historical data
    const historyToUse = priceHistory.slice(-(10 + i * 2))
    const forecast = calculateSalesForecast(historyToUse, baseSales)
    forecasts.push(forecast)
  }

  return forecasts
}

