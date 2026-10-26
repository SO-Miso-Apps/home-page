// The two service tracks the studio sells beyond the app catalog: a custom app
// built around a merchant's workflow, and a storefront theme built to their
// brand. One source, rendered twice — the home section summarises a track and
// links to its anchor on /services, which renders the same track in full — so
// the short promise and the detail page can never drift apart.
//
// SERVICES is the English copy and the one the contact email is written from;
// SERVICES_BY_LANG adds the Vietnamese copy of the same tracks, same ids.
import type { Lang } from "./i18n";

export interface ServiceTrack {
  /** Anchor on /services; the fragment the home section links to. */
  id: string;
  title: string;
  /** One sentence: what the engagement is. */
  summary: string;
  /** Platforms and APIs the track is built on. */
  stack: string;
  /** The store or team the track fits. */
  bestFor: string;
  /** What the client owns at the end of the engagement. */
  deliverables: string[];
}

export const SERVICES: ServiceTrack[] = [
  {
    id: "custom-apps",
    title: "Custom app development",
    summary:
      "A Shopify or Shopline app built around the workflow your team still runs by hand today.",
    stack: "Shopify Admin GraphQL · Webhooks · Shopify Functions · Shopline APIs",
    bestFor:
      "Merchants whose operations outgrew spreadsheets and manual admin work, or who need behaviour an off-the-shelf app will not take on.",
    deliverables: [
      "A scope document: the workflow, the records it touches, and what happens at the edges — before any code.",
      "The app itself, private to your store or built for a public App Store listing.",
      "An admin interface that follows how your team already works, not a generic settings page.",
      "Handover: repository access, written setup notes, and a walkthrough with the people who will run it.",
      "Support after launch: review notices, API changes, and fixes answered by the people who wrote the code.",
    ],
  },
  {
    id: "custom-themes",
    title: "Custom theme development",
    summary:
      "A storefront theme built to your brand and your catalog — or a rework of the theme you already run.",
    stack: "Liquid · Theme sections and blocks · Shopify · Shopline themes",
    bestFor:
      "Brands whose storefront no longer fits what a marketplace theme can be stretched into, and whose team wants to edit it without a developer.",
    deliverables: [
      "Merchant-editable sections and blocks, so your team changes copy, merchandising and promotions from the theme editor.",
      "Design tokens for colour, type and spacing, so the storefront stays consistent as the catalog grows.",
      "Templates for every surface you sell on: home, collection, product, cart, and the pages in between.",
      "A performance and accessibility pass — Core Web Vitals budget, keyboard navigation, contrast, no layout shift.",
      "Handover: the theme files, setup notes, and support for the update path that follows.",
    ],
  },
];

const SERVICES_VI: ServiceTrack[] = [
  {
    id: "custom-apps",
    title: "Phát triển app theo yêu cầu",
    summary:
      "Một app Shopify hoặc Shopline được xây quanh đúng quy trình mà đội của bạn vẫn đang làm tay mỗi ngày.",
    stack: "Shopify Admin GraphQL · Webhooks · Shopify Functions · Shopline APIs",
    bestFor:
      "Cửa hàng có vận hành đã vượt quá bảng tính và thao tác thủ công trong admin, hoặc cần một tính năng mà app có sẵn không đáp ứng được.",
    deliverables: [
      "Tài liệu phạm vi: quy trình, dữ liệu liên quan và cách xử lý các trường hợp biên — trước khi viết dòng code nào.",
      "Bản thân app: cài riêng cho cửa hàng của bạn, hoặc xây để đăng công khai trên App Store.",
      "Giao diện quản trị theo đúng cách đội của bạn đang làm việc, không phải một trang cài đặt chung chung.",
      "Bàn giao: quyền truy cập repository, ghi chú cài đặt bằng văn bản và buổi hướng dẫn với người sẽ vận hành app.",
      "Hỗ trợ sau khi ra mắt: thông báo review, thay đổi API và sửa lỗi — do chính người viết code trả lời.",
    ],
  },
  {
    id: "custom-themes",
    title: "Phát triển theme theo yêu cầu",
    summary:
      "Một theme cửa hàng được thiết kế theo thương hiệu và danh mục sản phẩm của bạn — hoặc làm lại theme bạn đang dùng.",
    stack: "Liquid · Theme sections và blocks · Shopify · Shopline themes",
    bestFor:
      "Thương hiệu mà giao diện cửa hàng đã không còn vừa với những gì một theme mua sẵn có thể co kéo, và đội ngũ muốn tự chỉnh sửa mà không cần lập trình viên.",
    deliverables: [
      "Sections và blocks mà đội của bạn tự chỉnh được — nội dung, trưng bày sản phẩm và khuyến mãi ngay trong theme editor.",
      "Design token cho màu sắc, chữ và khoảng cách, để cửa hàng luôn nhất quán khi danh mục lớn dần.",
      "Template cho mọi trang bạn bán hàng: trang chủ, danh mục, sản phẩm, giỏ hàng và các trang ở giữa.",
      "Rà soát hiệu năng và khả năng tiếp cận — ngân sách Core Web Vitals, điều hướng bằng bàn phím, độ tương phản, không xô lệch bố cục.",
      "Bàn giao: file theme, ghi chú cài đặt và hỗ trợ cho các lần cập nhật sau đó.",
    ],
  },
];

export const SERVICES_BY_LANG: Record<Lang, ServiceTrack[]> = {
  en: SERVICES,
  vi: SERVICES_VI,
};
