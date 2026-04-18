import { NormalizedProduct } from "@/lib/parsers/dummyjson"
import { airconditioners } from "@/data/airconditioners"

export function parseAirConditioners(): NormalizedProduct[] {
  return airconditioners.map((product) => ({
    externalId: `airconditioner-${product.id}`,
    title: product.title,
    price: product.price,
    category: product.category,
    image: product.image,
    source: "airconditioners",
    fetchedAt: new Date(),
  }))
}
