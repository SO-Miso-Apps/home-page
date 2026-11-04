// Storefronts the studio has worked on, shown on the home page as proof of the
// theme service: client stores whose themes we customized, then demo stores of
// the themes we make. Screenshots are static captures of each home page in
// public/work/ — retake them when a storefront changes enough that ours no
// longer matches what a visitor would find. The Vellmar shots are crops of the
// Theme Store listing captures (misothemes/vellora/docs/launch/listing); the
// Almanac shots are captures of each live store (opened through admin's store
// preview, motion off), two viewport shots stitched to 16:10.
//
// Facts only: the store, what it sells, and the theme it runs. Results and
// scope details belong here once the client has agreed to them being public.
import type { Lang } from "./i18n";

export interface WorkItem {
  id: string;
  kind: "client" | "demo";
  /** Heading on the card: the domain for a client store, the demo brand for a demo store. */
  name: string;
  /** Domain as shown, without protocol. */
  domain: string;
  url: string;
  image: { src: string; width: number; height: number };
  /** One line: who the store is. */
  about: string;
  /** The theme the storefront is built on. */
  theme: string;
  tags: string[];
  /** Set when the storefront asks for a password a visitor doesn't have. */
  locked?: boolean;
  /** Storefront password shown on the card, for demo stores whose password is public. */
  password?: string;
}

const SHOT = { width: 1200, height: 750 };

/** Must match the storefront password set on each Almanac demo store. */
const DEMO_PASSWORD = "1";

const BASE = [
  {
    id: "tortuga",
    kind: "client",
    name: "tortugabackpacks.com",
    domain: "tortugabackpacks.com",
    url: "https://www.tortugabackpacks.com/",
    image: { src: "/work/tortuga.webp", ...SHOT },
    theme: "Broadcast",
  },
  {
    id: "nuday",
    kind: "client",
    name: "nuday.ae",
    domain: "nuday.ae",
    url: "https://nuday.ae/",
    image: { src: "/work/nuday.webp", ...SHOT },
    theme: "Spotlight",
  },
  // Vellmar demo stores keep their storefront password: no auto-bypass there.
  {
    id: "vellmar",
    kind: "demo",
    name: "Casa Lume",
    domain: "themivo-vellora-demo-s0d2wuyn.myshopify.com",
    url: "https://themivo-vellora-demo-s0d2wuyn.myshopify.com/",
    image: { src: "/work/vellmar.webp", ...SHOT },
    theme: "Vellmar · Vellmar preset",
    locked: true,
  },
  {
    id: "sorrel",
    kind: "demo",
    name: "Aurelle",
    domain: "themivo-sorrel-demo-wink9b2p.myshopify.com",
    url: "https://themivo-sorrel-demo-wink9b2p.myshopify.com/",
    image: { src: "/work/sorrel.webp", ...SHOT },
    theme: "Vellmar · Sorrel preset",
    locked: true,
  },
  {
    id: "graphite",
    kind: "demo",
    name: "HALFLIGHT",
    domain: "themivo-graphite-demo-haeffndg.myshopify.com",
    url: "https://themivo-graphite-demo-haeffndg.myshopify.com/",
    image: { src: "/work/graphite.webp", ...SHOT },
    theme: "Vellmar · Graphite preset",
    locked: true,
  },
  // Almanac demo stores: their theme's password page signs visitors in with the
  // shared demo password (themivo-builder demo/stores.json "password_bypass"),
  // and the card shows it in case a visitor lands on the form anyway.
  {
    id: "almanac-pet",
    kind: "demo",
    name: "Burrow & Bark",
    domain: "themivo-almanac-pet-demo-saxmy7at.myshopify.com",
    url: "https://themivo-almanac-pet-demo-saxmy7at.myshopify.com/",
    image: { src: "/work/almanac-pet.webp", ...SHOT },
    theme: "Almanac · Pet preset",
    password: DEMO_PASSWORD,
  },
  {
    id: "almanac-coffee",
    kind: "demo",
    name: "Lowtide Coffee",
    domain: "themivo-almanac-coffee-demo-imz7cfjp.myshopify.com",
    url: "https://themivo-almanac-coffee-demo-imz7cfjp.myshopify.com/",
    image: { src: "/work/almanac-coffee.webp", ...SHOT },
    theme: "Almanac · Coffee preset",
    password: DEMO_PASSWORD,
  },
  {
    id: "almanac-outdoor",
    kind: "demo",
    name: "Northfold",
    domain: "themivo-almanac-outdoor-demo-mzqgubq8.myshopify.com",
    url: "https://themivo-almanac-outdoor-demo-mzqgubq8.myshopify.com/",
    image: { src: "/work/almanac-outdoor.webp", ...SHOT },
    theme: "Almanac · Outdoor preset",
    password: DEMO_PASSWORD,
  },
  {
    id: "almanac-jewelry",
    kind: "demo",
    name: "Maren Atelier",
    domain: "themivo-almanac-jewelry-demo-ypsxqzqp.myshopify.com",
    url: "https://themivo-almanac-jewelry-demo-ypsxqzqp.myshopify.com/",
    image: { src: "/work/almanac-jewelry.webp", ...SHOT },
    theme: "Almanac · Jewelry preset",
    password: DEMO_PASSWORD,
  },
  {
    id: "almanac-electronics",
    kind: "demo",
    name: "Fieldtone",
    domain: "themivo-almanac-electronics-demo-gidusfmy.myshopify.com",
    url: "https://themivo-almanac-electronics-demo-gidusfmy.myshopify.com/",
    image: { src: "/work/almanac-electronics.webp", ...SHOT },
    theme: "Almanac · Electronics preset",
    password: DEMO_PASSWORD,
  },
] as const;

const COPY: Record<Lang, Record<(typeof BASE)[number]["id"], Pick<WorkItem, "about" | "tags">>> = {
  en: {
    tortuga: {
      about: "Carry-on travel backpacks, sold direct from a US storefront.",
      tags: ["Theme customization", "Travel gear"],
    },
    nuday: {
      about: "Supplement gummies and hydration sticks, sold from the UAE.",
      tags: ["Theme customization", "Health and wellness"],
    },
    vellmar: {
      about: "Linen, oak and stoneware from Portuguese workshops — a demo brand for our Vellmar theme.",
      tags: ["Theme demo", "Home goods"],
    },
    sorrel: {
      about: "Small-batch botanical skincare from Mallorca — a demo brand for our Vellmar theme.",
      tags: ["Theme demo", "Skincare"],
    },
    graphite: {
      about: "City streetwear released in drops — a demo brand for our Vellmar theme.",
      tags: ["Theme demo", "Streetwear"],
    },
    "almanac-pet": {
      about: "Food, beds and walking gear for dogs, cats and small pets — a demo brand for our Almanac theme.",
      tags: ["Theme demo", "Pet supplies"],
    },
    "almanac-coffee": {
      about: "Small-lot coffee, roasted weekly — a demo brand for our Almanac theme.",
      tags: ["Theme demo", "Coffee"],
    },
    "almanac-outdoor": {
      about: "Light packs and trail gear, every gram on the label — a demo brand for our Almanac theme.",
      tags: ["Theme demo", "Outdoor gear"],
    },
    "almanac-jewelry": {
      about: "Fine jewelry made at the bench to wear every day — a demo brand for our Almanac theme.",
      tags: ["Theme demo", "Jewelry"],
    },
    "almanac-electronics": {
      about: "Headphones and audio gear, tuned and tested in-house — a demo brand for our Almanac theme.",
      tags: ["Theme demo", "Electronics"],
    },
  },
  vi: {
    tortuga: {
      about: "Thương hiệu balo du lịch xách tay, bán trực tiếp qua cửa hàng tại Mỹ.",
      tags: ["Tùy chỉnh theme", "Đồ du lịch"],
    },
    nuday: {
      about: "Kẹo dẻo bổ sung và gói điện giải, bán từ UAE.",
      tags: ["Tùy chỉnh theme", "Sức khỏe"],
    },
    vellmar: {
      about: "Đồ linen, gỗ sồi và gốm từ các xưởng ở Bồ Đào Nha — thương hiệu demo cho theme Vellmar của chúng tôi.",
      tags: ["Store demo", "Đồ gia dụng"],
    },
    sorrel: {
      about: "Mỹ phẩm thực vật làm theo mẻ nhỏ ở Mallorca — thương hiệu demo cho theme Vellmar của chúng tôi.",
      tags: ["Store demo", "Mỹ phẩm"],
    },
    graphite: {
      about: "Thời trang đường phố mở bán theo từng đợt drop — thương hiệu demo cho theme Vellmar của chúng tôi.",
      tags: ["Store demo", "Streetwear"],
    },
    "almanac-pet": {
      about: "Thức ăn, ổ nằm và đồ dắt đi dạo cho chó, mèo và thú nhỏ — thương hiệu demo cho theme Almanac của chúng tôi.",
      tags: ["Store demo", "Thú cưng"],
    },
    "almanac-coffee": {
      about: "Cà phê lô nhỏ, rang mỗi tuần — thương hiệu demo cho theme Almanac của chúng tôi.",
      tags: ["Store demo", "Cà phê"],
    },
    "almanac-outdoor": {
      about: "Balo nhẹ và đồ đi trail, ghi rõ từng gram — thương hiệu demo cho theme Almanac của chúng tôi.",
      tags: ["Store demo", "Đồ dã ngoại"],
    },
    "almanac-jewelry": {
      about: "Trang sức làm tay tại xưởng để đeo hằng ngày — thương hiệu demo cho theme Almanac của chúng tôi.",
      tags: ["Store demo", "Trang sức"],
    },
    "almanac-electronics": {
      about: "Tai nghe và thiết bị âm thanh, tự chỉnh và kiểm tra tại xưởng — thương hiệu demo cho theme Almanac của chúng tôi.",
      tags: ["Store demo", "Điện tử"],
    },
  },
};

export function getWork(lang: Lang): WorkItem[] {
  return BASE.map((item) => ({ ...item, image: { ...item.image }, ...COPY[lang][item.id] }));
}
