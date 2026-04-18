/** Локальный каталог фильтров для воды (витрина aquaphor.kz, изображения сохранены в public/). */
export interface WaterFilterProduct {
  id: number
  title: string
  price: number
  category: string
  image: string
}

export const waterfilters: WaterFilterProduct[] = [
  {
    id: 1,
    title: "Аквафор Прованс A5",
    price: 9040,
    category: "кувшин",
    image: "/images/catalog/water/01-provence-a5.png",
  },
  {
    id: 2,
    title: "Аквафор Модерн исп. 2",
    price: 13120,
    category: "насадка на кран",
    image: "/images/catalog/water/02-modern-2.png",
  },
  {
    id: 3,
    title: "Аквафор DWM-102S",
    price: 133000,
    category: "обратный осмос",
    image: "/images/catalog/water/03-dwm-102s.png",
  },
  {
    id: 4,
    title: "Аквафор DWM-70S",
    price: 90000,
    category: "обратный осмос",
    image: "/images/catalog/water/04-dwm-70s.png",
  },
  {
    id: 5,
    title: "Аквафор DWM-101S",
    price: 107000,
    category: "обратный осмос",
    image: "/images/catalog/water/05-dwm-101s.png",
  },
  {
    id: 6,
    title: "Аквафор Лион A5",
    price: 6900,
    category: "кувшин",
    image: "/images/catalog/water/06-lyon-a5.png",
  },
  {
    id: 7,
    title: "J.SHMIDT A500",
    price: 29410,
    category: "под мойку",
    image: "/images/catalog/water/07-js500.png",
  },
  {
    id: 8,
    title: "Аквафор Фаворит Pro",
    price: 73000,
    category: "под мойку",
    image: "/images/catalog/water/08-favorit-pro.png",
  },
  {
    id: 9,
    title: "Аквафор DWM-312S Pro",
    price: 66700,
    category: "обратный осмос",
    image: "/images/catalog/water/09-dwm-312s-pro.png",
  },
  {
    id: 10,
    title: "Аквафор Смайл",
    price: 5360,
    category: "кувшин",
    image: "/images/catalog/water/10-smile.png",
  },
  {
    id: 11,
    title: "Аквафор Кристалл А",
    price: 24900,
    category: "под мойку",
    image: "/images/catalog/water/11-crystal-a.png",
  },
  {
    id: 12,
    title: "АКВАФОР Инди A6",
    price: 4010,
    category: "кувшин",
    image: "/images/catalog/water/12-indi-a6.png",
  },
  {
    id: 13,
    title: "Аквафор Аквамарин",
    price: 5960,
    category: "кувшин",
    image: "/images/catalog/water/13-aquamarin.png",
  },
  {
    id: 14,
    title: "Аквафор Осмо 50 исп. 5",
    price: 93000,
    category: "обратный осмос",
    image: "/images/catalog/water/14-osmo-50.png",
  },
  {
    id: 15,
    title: "Аквафор Трио Норма",
    price: 25000,
    category: "под мойку",
    image: "/images/catalog/water/15-trio-norma.png",
  },
]
