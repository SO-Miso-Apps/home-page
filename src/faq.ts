// Questions a merchant asks before writing in. Every answer restates something
// the site already commits to elsewhere — the service deliverables in
// services.ts, the "What you need" list and process on /services, the packages
// in pricing.ts, the reply time in ContactForm, the phone number in
// the footer — so change those first and this second, never the other way round.
import type { Lang } from "./i18n";

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_BY_LANG: Record<Lang, FaqItem[]> = {
  en: [
    {
      question: "Can you work on the theme we already have?",
      answer:
        "Yes, and that is most of what we do. We customize the theme your store already runs — new sections, layout and style changes, speed fixes — inside Liquid and the theme editor, so your team can still edit it without us.",
    },
    {
      question: "How is the work priced?",
      answer:
        "The pricing table lists indicative prices for each theme package — in VND for stores in Vietnam, in USD for stores abroad. Your exact quote comes after we look at the job on your store, and before any work starts. App work is quoted separately.",
    },
    {
      question: "What do you need from us to start?",
      answer:
        "Your store URL, a few lines on what you want changed, and a collaborator or staff account. We work on a copy of your theme and you review it there before anything reaches your customers.",
    },
    {
      question: "Who owns the code when the project ends?",
      answer:
        "You do. Handover includes the theme files or repository access, written notes on what changed, and a walkthrough with the people on your team who will run it.",
    },
    {
      question: "Do you build apps as well?",
      answer:
        "Yes. We publish our own apps on the Shopify App Store and build custom ones on the official APIs — Admin GraphQL, webhooks, Shopify Functions. We work on Shopify and Shopline.",
    },
    {
      question: "How quickly will we hear back?",
      answer:
        "Within one working day of sending the request form. If it is urgent, call us — the number is in the footer of every page.",
    },
  ],
  vi: [
    {
      question: "Các bạn có sửa được theme cửa hàng đang dùng không?",
      answer:
        "Được, và đó là phần lớn công việc của chúng tôi. Chúng tôi tùy chỉnh ngay trên theme bạn đang chạy — thêm section, đổi bố cục và giao diện, tối ưu tốc độ — bằng Liquid và trình chỉnh sửa theme, nên sau này đội của bạn vẫn tự sửa được mà không cần chúng tôi.",
    },
    {
      question: "Chi phí được tính thế nào?",
      answer:
        "Bảng giá có giá tham khảo cho từng gói theme — tính bằng VND nếu cửa hàng ở Việt Nam, USD nếu ở nước ngoài. Báo giá chính xác được gửi sau khi chúng tôi xem yêu cầu trên cửa hàng của bạn, và trước khi bắt đầu làm. Việc làm app được báo giá riêng.",
    },
    {
      question: "Cần chuẩn bị gì để bắt đầu?",
      answer:
        "Địa chỉ cửa hàng, vài dòng mô tả bạn muốn đổi gì, và một tài khoản collaborator hoặc staff. Chúng tôi làm trên bản sao của theme, bạn xem và duyệt ở đó trước khi khách hàng thấy bất cứ thay đổi nào.",
    },
    {
      question: "Làm xong thì mã nguồn thuộc về ai?",
      answer:
        "Thuộc về bạn. Khi bàn giao, bạn nhận đủ file theme hoặc quyền truy cập repository, ghi chú những gì đã thay đổi, và một buổi hướng dẫn cho người sẽ quản lý cửa hàng.",
    },
    {
      question: "Các bạn có làm app không?",
      answer:
        "Có. Chúng tôi có app riêng trên Shopify App Store và nhận làm app theo yêu cầu trên API chính thức — Admin GraphQL, webhooks, Shopify Functions. Chúng tôi làm cho cả Shopify và Shopline.",
    },
    {
      question: "Bao lâu thì có phản hồi?",
      answer:
        "Trong vòng một ngày làm việc sau khi bạn gửi form. Nếu gấp, bạn cứ gọi cho chúng tôi — số điện thoại ở cuối mỗi trang.",
    },
  ],
};
