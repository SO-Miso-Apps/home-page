// Storefronts whose themes the studio has customized, shown on the home page
// as proof of the theme service. Screenshots are static captures of each live
// home page in public/work/ — retake them when a client's storefront changes
// enough that ours no longer matches what a visitor would find.
//
// Facts only: the store, what it sells, and the theme it runs. Results and
// scope details belong here once the client has agreed to them being public.
import type { Lang } from "./i18n";

export interface WorkItem {
  id: string;
  /** Domain as shown, without protocol. */
  domain: string;
  url: string;
  image: { src: string; width: number; height: number };
  /** One line: who the store is. */
  about: string;
  /** The theme the storefront is built on. */
  theme: string;
  tags: string[];
}

const BASE = [
  {
    id: "tortuga",
    domain: "tortugabackpacks.com",
    url: "https://www.tortugabackpacks.com/",
    image: { src: "/work/tortuga.webp", width: 1200, height: 750 },
    theme: "Broadcast",
  },
  {
    id: "nuday",
    domain: "nuday.ae",
    url: "https://nuday.ae/",
    image: { src: "/work/nuday.webp", width: 1200, height: 750 },
    theme: "Spotlight",
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
  },
};

export function getWork(lang: Lang): WorkItem[] {
  return BASE.map((item) => ({ ...item, image: { ...item.image }, ...COPY[lang][item.id] }));
}
