// The two service tracks the studio sells beyond the app catalog: theme design
// and customization, which leads, and a custom app built around a merchant's
// workflow. The home page links to each track's anchor on /services, and the
// contact form offers the same tracks, in this order, as its service options.
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
    id: "custom-themes",
    title: "Theme design and customization",
    summary:
      "Changes to the theme your store already runs — new sections, layout and style work, speed fixes — or a theme designed from scratch for your brand.",
    stack: "Liquid · Theme sections and blocks · Shopify · Shopline themes",
    bestFor:
      "Brands whose storefront has outgrown what the theme settings allow, and whose team still wants to edit it without a developer.",
    deliverables: [
      "Sections and blocks your team can edit, so copy, merchandising and promotions change from the theme editor.",
      "Layout and style changes made in the theme's own code, so theme updates and the editor keep working.",
      "Every page you sell on covered: home, collection, product, cart, and the pages in between.",
      "A performance and accessibility pass — Core Web Vitals, keyboard navigation, contrast, no layout shift.",
      "Handover: the theme files, notes on what changed, and help with the theme updates that follow.",
    ],
  },
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
];

const SERVICES_VI: ServiceTrack[] = [
  {
    id: "custom-themes",
    title: "Thiết kế và tùy chỉnh theme",
    summary:
      "Sửa ngay trên theme cửa hàng đang dùng — thêm section, đổi bố cục và giao diện, tăng tốc độ tải trang — hoặc thiết kế theme mới theo thương hiệu của bạn.",
    stack: "Liquid · Section và block · Theme Shopify · Theme Shopline",
    bestFor:
      "Thương hiệu thấy phần cài đặt sẵn của theme không còn đủ dùng, nhưng vẫn muốn đội mình tự chỉnh sửa mà không cần lập trình viên.",
    deliverables: [
      "Section và block mà đội của bạn tự chỉnh được: đổi nội dung, sắp xếp sản phẩm, chạy khuyến mãi ngay trong trình chỉnh sửa theme.",
      "Bố cục và giao diện được sửa trong chính mã nguồn theme, nên vẫn cập nhật theme và dùng trình chỉnh sửa như bình thường.",
      "Đủ các trang bán hàng: trang chủ, danh mục, sản phẩm, giỏ hàng và các trang khác.",
      "Kiểm tra tốc độ và khả năng truy cập: Core Web Vitals, dùng được bằng bàn phím, đủ độ tương phản, không nhảy bố cục.",
      "Bàn giao: file theme, ghi chú những gì đã thay đổi, và hỗ trợ khi bạn cập nhật theme về sau.",
    ],
  },
  {
    id: "custom-apps",
    title: "Làm app theo yêu cầu",
    summary:
      "App Shopify hoặc Shopline làm riêng cho những việc đội của bạn vẫn đang làm tay mỗi ngày.",
    stack: "Shopify Admin GraphQL · Webhooks · Shopify Functions · Shopline API",
    bestFor:
      "Cửa hàng đã quá tải với bảng tính và thao tác tay trong trang quản trị, hoặc cần một tính năng mà app có sẵn không làm được.",
    deliverables: [
      "Bản mô tả phạm vi: quy trình, dữ liệu liên quan và cách xử lý các trường hợp đặc biệt — chốt trước khi viết code.",
      "App hoàn chỉnh, cài riêng cho cửa hàng của bạn hoặc đăng công khai trên App Store.",
      "Trang quản trị theo đúng cách đội của bạn đang làm việc, không phải một trang cài đặt chung chung.",
      "Bàn giao: quyền truy cập repository, hướng dẫn cài đặt bằng văn bản, và một buổi hướng dẫn cho người sẽ dùng app.",
      "Hỗ trợ sau khi ra mắt: phản hồi từ App Store, thay đổi API và sửa lỗi đều do chính người viết code xử lý.",
    ],
  },
];

export const SERVICES_BY_LANG: Record<Lang, ServiceTrack[]> = {
  en: SERVICES,
  vi: SERVICES_VI,
};
