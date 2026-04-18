/** Локальный каталог кондиционеров (фото с klimatika.kz, файлы в public/images/catalog/ac/). */
export interface AirConditionerProduct {
  id: number
  title: string
  price: number
  category: string
  image: string
}

export const airconditioners: AirConditionerProduct[] = [
  {
    id: 1,
    title: "Настенный кондиционер Almacom REGULAR ACH-07QR 18–20 м²",
    price: 143451,
    category: "сплит-система",
    image: "/images/catalog/ac/01-almacom-ach-07qr.jpg",
  },
  {
    id: 2,
    title: "Настенный кондиционер Almacom STANDART ACH-09QS 20–25 м²",
    price: 160338,
    category: "сплит-система",
    image: "/images/catalog/ac/02-almacom-ach-09qs.jpg",
  },
  {
    id: 3,
    title: "Настенный кондиционер Almacom ACH-12CT 30–35 м²",
    price: 219342,
    category: "сплит-система",
    image: "/images/catalog/ac/03-almacom-ach-12ct.jpg",
  },
  {
    id: 4,
    title: "Настенный кондиционер Almacom ACH-18LC 50–55 м²",
    price: 365570,
    category: "сплит-система",
    image: "/images/catalog/ac/04-almacom-ach-18lc.jpg",
  },
  {
    id: 5,
    title: "Настенный кондиционер OTEX OWM-24TP 60–65 м²",
    price: 294163,
    category: "сплит-система",
    image: "/images/catalog/ac/05-otex-owm-24tp.jpg",
  },
  {
    id: 6,
    title: "Напольный кондиционер Almacom ACP-36A 100 м²",
    price: 706768,
    category: "напольный",
    image: "/images/catalog/ac/06-almacom-acp-36a.jpg",
  },
  {
    id: 7,
    title: "Напольный кондиционер ALMACOM ACP-48A 80–120 м²",
    price: 904304,
    category: "напольный",
    image: "/images/catalog/ac/07-almacom-acp-48a.jpg",
  },
  {
    id: 8,
    title: "Напольный кондиционер OTEX OFS-48T 110–140 м²",
    price: 825675,
    category: "напольный",
    image: "/images/catalog/ac/08-otex-ofs-48t.jpg",
  },
  {
    id: 9,
    title: "Мобильный кондиционер OTEX OM-11T 20–25 м²",
    price: 106050,
    category: "мобильный",
    image: "/images/catalog/ac/09-otex-om-11t.jpg",
  },
  {
    id: 10,
    title: "Инверторный кондиционер OTEX OWM-09TI 20–25 м²",
    price: 159391,
    category: "инвертор",
    image: "/images/catalog/ac/10-otex-owm-09ti.jpg",
  },
  {
    id: 11,
    title: "Инверторный кондиционер OTEX OWM-24TI 50–55 м²",
    price: 198000,
    category: "инвертор",
    image: "/images/catalog/ac/11-otex-owm-24ti.jpg",
  },
  {
    id: 12,
    title: "Настенный кондиционер OTEX OWM-18TN 45–50 м²",
    price: 233840,
    category: "сплит-система",
    image: "/images/catalog/ac/12-otex-owm-18tn.jpg",
  },
  {
    id: 13,
    title: "Настенный кондиционер OTEX OWM-07TP 15–18 м²",
    price: 96897,
    category: "сплит-система",
    image: "/images/catalog/ac/13-otex-owm-07tp.jpg",
  },
  {
    id: 14,
    title: "Напольный кондиционер Almacom ACP-24-60AE",
    price: 450000,
    category: "напольный",
    image: "/images/catalog/ac/14-almacom-acp-24ae.jpg",
  },
  {
    id: 15,
    title: "Фанкойл Almacom AFT3N-1200G50",
    price: 231219,
    category: "кассетный",
    image: "/images/catalog/ac/15-fancoil-aft3n.jpg",
  },
  {
    id: 16,
    title: "Настенный кондиционер DUKE DWM-07WP 14–18 м²",
    price: 95827,
    category: "сплит-система",
    image: "/images/catalog/ac/16-duke-dwm-07wp.png",
  },
]
