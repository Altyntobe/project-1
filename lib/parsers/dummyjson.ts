interface DummyJSONProduct {
  id: number
  title: string
  price: number
  category: string
  images: string[]
}

interface DummyJSONResponse {
  products: DummyJSONProduct[]
  total: number
  skip: number
  limit: number
}

export interface NormalizedProduct {
  externalId: string
  title: string
  price: number
  category: string
  image?: string
  source: string
  fetchedAt: Date
}

export async function parseDummyJSON(): Promise<NormalizedProduct[]> {
  const response = await fetch("https://dummyjson.com/products")

  if (!response.ok) {
    throw new Error(`Failed to fetch DummyJSON: ${response.statusText}`)
  }

  const data: DummyJSONResponse = await response.json()

  return data.products.map((product) => ({
    externalId: `dummyjson-${product.id}`,
    title: product.title,
    price: product.price,
    category: product.category,
    image: product.images?.[0],
    source: "dummyjson",
    fetchedAt: new Date(),
  }))
}

