// Theme packages with indicative prices, shown on the home page and /services.
// Each package has two prices: one for stores in Vietnam (VND) and one for
// stores abroad (USD). The visitor picks the market; the page language only
// sets which one starts selected.
//
// Prices and durations are the studio's commitments: change them only on the
// studio's word. A null price reads "quoted per project" and a null duration
// is not shown.
//
// The FAQ's pricing answer points at this table; keep the two in step.
import type { Lang } from "./i18n";

export type Market = "vn" | "intl";

/** A price range in whole currency units; no `max` means "from `min`". */
export interface PriceRange {
  min: number;
  max?: number;
}

export interface Duration {
  min: number;
  max?: number;
  unit: "day" | "week";
}

export interface PricingPlan {
  /** Stable id, carried to the contact form as `?plan=`. */
  id: string;
  name: Record<Lang, string>;
  summary: Record<Lang, string>;
  includes: Record<Lang, string[]>;
  price: { vn: PriceRange | null; intl: PriceRange | null };
  duration: Duration | null;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "theme-tweaks",
    name: { en: "Theme tweaks", vi: "Chỉnh sửa theme" },
    summary: {
      en: "A few targeted changes to the theme your store already runs.",
      vi: "Vài thay đổi cụ thể trên theme cửa hàng đang dùng.",
    },
    includes: {
      en: [
        "Add or adjust a few sections and blocks",
        "Fix layout and display issues on mobile and desktop",
        "Changes stay editable in the theme editor",
      ],
      vi: [
        "Thêm hoặc sửa một vài section, block",
        "Sửa lỗi bố cục, hiển thị trên điện thoại và máy tính",
        "Mọi thay đổi vẫn chỉnh được trong trình chỉnh sửa theme",
      ],
    },
    price: { vn: { min: 2_000_000, max: 5_000_000 }, intl: { min: 300, max: 800 } },
    duration: { min: 3, unit: "day" },
  },
  {
    id: "theme-customization",
    name: { en: "Theme customization", vi: "Tùy chỉnh theme" },
    summary: {
      en: "Rework the pages you sell on, inside the theme you already have.",
      vi: "Làm lại các trang bán hàng ngay trên theme bạn đang có.",
    },
    includes: {
      en: [
        "New sections and blocks built to your brief",
        "Layout and style changes across home, collection, product and cart",
        "A speed and accessibility pass",
        "Notes on what changed and help with the next theme update",
      ],
      vi: [
        "Section và block mới làm theo yêu cầu của bạn",
        "Đổi bố cục, giao diện cho trang chủ, danh mục, sản phẩm, giỏ hàng",
        "Tối ưu tốc độ tải trang và khả năng truy cập",
        "Ghi chú những gì đã đổi, hỗ trợ khi cập nhật theme",
      ],
    },
    price: { vn: { min: 5_000_000, max: 10_000_000 }, intl: { min: 800, max: 2_500 } },
    duration: { min: 5, max: 10, unit: "day" },
  },
  {
    id: "custom-theme",
    name: { en: "Custom theme", vi: "Theme thiết kế riêng" },
    summary: {
      en: "A theme designed from scratch around your brand and products.",
      vi: "Theme thiết kế mới từ đầu theo thương hiệu và sản phẩm của bạn.",
    },
    includes: {
      en: [
        "Design for every page you sell on",
        "Every section written for your store, all editable",
        "Speed, accessibility and launch checks",
        "Theme files, handover notes and a walkthrough for your team",
      ],
      vi: [
        "Thiết kế cho mọi trang bán hàng",
        "Toàn bộ section viết riêng cho cửa hàng, đều chỉnh sửa được",
        "Kiểm tra tốc độ, khả năng truy cập trước khi ra mắt",
        "Bàn giao file theme, tài liệu và buổi hướng dẫn cho đội của bạn",
      ],
    },
    price: { vn: null, intl: { min: 3_000 } },
    duration: { min: 15, max: 30, unit: "day" },
  },
];

const MARKET_FOR_LANG: Record<Lang, Market> = { en: "intl", vi: "vn" };
export const defaultMarket = (lang: Lang): Market => MARKET_FOR_LANG[lang];

const LOCALE: Record<Lang, string> = { en: "en-US", vi: "vi-VN" };

// VND reads in millions ("2 – 5 triệu đồng"); USD as dollars with the page
// language's digit grouping, matching the budget labels in lib/contact.ts.
const amount = (value: number, market: Market, lang: Lang): string => {
  if (market === "intl") return `$${value.toLocaleString(LOCALE[lang])}`;
  return (value / 1_000_000).toLocaleString(LOCALE[lang], { maximumFractionDigits: 1 });
};

export const formatPrice = (range: PriceRange | null, market: Market, lang: Lang): string | null => {
  if (!range) return null;
  const unit = market === "vn" ? (lang === "vi" ? " triệu đồng" : " million VND") : "";
  const from = amount(range.min, market, lang);
  if (range.max == null) return lang === "vi" ? `Từ ${from}${unit}` : `From ${from}${unit}`;
  return `${from} – ${amount(range.max, market, lang)}${unit}`;
};

export const formatDuration = (duration: Duration | null, lang: Lang): string | null => {
  if (!duration) return null;
  const span = duration.max == null ? `${duration.min}` : `${duration.min}–${duration.max}`;
  if (lang === "vi") return `${span} ${duration.unit === "day" ? "ngày" : "tuần"}`;
  const plural = (duration.max ?? duration.min) > 1;
  return `${span} ${duration.unit}${plural ? "s" : ""}`;
};

/** The opening line written into the contact form's message for a plan. */
export const planMessage = (plan: PricingPlan, lang: Lang): string =>
  lang === "vi"
    ? `Tôi quan tâm đến gói ${plan.name.vi}. `
    : `I'm interested in the ${plan.name.en} package. `;

export const findPlan = (id: string | null | undefined): PricingPlan | undefined =>
  id ? PRICING_PLANS.find((plan) => plan.id === id) : undefined;
