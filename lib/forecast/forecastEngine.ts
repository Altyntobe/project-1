interface PriceDataPoint {
  price: number
  fetchedAt: Date
}

/**
 * Simple moving average forecast
 * @param dataPoints Array of historical price data points
 * @param period Number of periods to use for moving average (default: 3)
 * @returns Forecasted price for next period
 */
export function movingAverageForecast(
  dataPoints: PriceDataPoint[],
  period: number = 3
): number {
  if (dataPoints.length === 0) {
    throw new Error("No data points provided")
  }

  if (dataPoints.length < period) {
    // If we have less data than the period, use average of all available data
    const sum = dataPoints.reduce((acc, point) => acc + point.price, 0)
    return sum / dataPoints.length
  }

  // Sort by date (oldest first)
  const sorted = [...dataPoints].sort(
    (a, b) => a.fetchedAt.getTime() - b.fetchedAt.getTime()
  )

  // Get last N periods
  const lastN = sorted.slice(-period)

  // Calculate average
  const sum = lastN.reduce((acc, point) => acc + point.price, 0)
  return sum / period
}

/**
 * Generate forecast with confidence interval
 */
export function forecastWithConfidence(
  dataPoints: PriceDataPoint[],
  period: number = 3
): {
  forecast: number
  confidence: number
  min: number
  max: number
} {
  const forecast = movingAverageForecast(dataPoints, period)

  if (dataPoints.length < 2) {
    return {
      forecast,
      confidence: 0.5,
      min: forecast * 0.9,
      max: forecast * 1.1,
    }
  }

  // Calculate standard deviation for confidence interval
  const sorted = [...dataPoints].sort(
    (a, b) => a.fetchedAt.getTime() - b.fetchedAt.getTime()
  )
  const lastN = sorted.slice(-period)
  const mean = forecast
  const variance =
    lastN.reduce((acc, point) => acc + Math.pow(point.price - mean, 2), 0) /
    lastN.length
  const stdDev = Math.sqrt(variance)

  // Confidence based on data points count and variance
  const confidence = Math.min(0.95, Math.max(0.5, 1 - stdDev / mean))

  return {
    forecast,
    confidence,
    min: forecast - stdDev,
    max: forecast + stdDev,
  }
}

