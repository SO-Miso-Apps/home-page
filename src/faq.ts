// Questions a merchant asks before writing in. Every answer restates something
// the site already commits to elsewhere — the service deliverables in
// services.ts, the "What you need" list and process on /services, the budget
// ranges in lib/contact.ts, the reply time in ContactForm — so change those
// first and this second, never the other way round.
import type { Lang } from "./i18n";

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_BY_LANG: Record<Lang, FaqItem[]> = {
  en: [
    {
      question: "Which platforms do you build for?",
      answer:
        "Shopify and Shopline. Our own apps are listed on the Shopify App Store, and custom apps and themes are built on the platform APIs — Admin GraphQL, webhooks, Shopify Functions, Liquid theme sections — rather than storefront hacks.",
    },
    {
      question: "How is a custom build priced?",
      answer:
        "Each build is quoted after we scope it against your store, and the quote comes before the build starts. The request form asks for a rough range — from under $1,000 to $8,000+, or “prefer to discuss” — so the first proposal fits what you had in mind.",
    },
    {
      question: "Who owns the code when the project ends?",
      answer:
        "You do. Handover includes repository access (or the theme files), written setup notes, and a walkthrough with the people on your team who will run it.",
    },
    {
      question: "What happens after launch?",
      answer:
        "We stay on it: App Store review notices, Shopify API changes and fixes are answered by the people who wrote the code, not a support desk you have never met.",
    },
    {
      question: "What do you need from us to start?",
      answer:
        "Your store URL, a short description of the job, and a collaborator or staff account on a store we can work in. Everything is reviewed on a development store before it reaches your customers.",
    },
    {
      question: "How quickly will we hear back?",
      answer:
        "Within one working day of sending the request form. If it is urgent, call us — the number is at the top of every page.",
    },
  ],
  vi: [
    {
      question: "Miso Apps làm cho những nền tảng nào?",
      answer:
        "Shopify và Shopline. Các app của chúng tôi có mặt trên Shopify App Store; app và theme theo yêu cầu đều được xây trên API chính thức của nền tảng — Admin GraphQL, webhooks, Shopify Functions, section của theme Liquid — chứ không chắp vá trên storefront.",
    },
    {
      question: "Chi phí một dự án theo yêu cầu tính thế nào?",
      answer:
        "Mỗi dự án được báo giá sau khi chúng tôi khảo sát phạm vi trên chính cửa hàng của bạn, và bạn nhận báo giá trước khi bắt đầu làm. Form yêu cầu có ô chọn mức ngân sách — từ dưới $1.000 đến trên $8.000, hoặc “muốn trao đổi thêm” — để đề xuất đầu tiên sát với dự tính của bạn.",
    },
    {
      question: "Kết thúc dự án, ai sở hữu mã nguồn?",
      answer:
        "Bạn. Khi bàn giao, bạn nhận quyền truy cập repository (hoặc toàn bộ file theme), tài liệu cài đặt bằng văn bản và một buổi hướng dẫn với những người trong đội sẽ vận hành.",
    },
    {
      question: "Sau khi ra mắt thì sao?",
      answer:
        "Chúng tôi vẫn theo dõi: thông báo review của App Store, thay đổi API của Shopify và các bản sửa lỗi đều do chính người viết code xử lý, không qua một bộ phận hỗ trợ xa lạ.",
    },
    {
      question: "Để bắt đầu, chúng tôi cần chuẩn bị gì?",
      answer:
        "Địa chỉ cửa hàng, vài dòng mô tả công việc, và một tài khoản collaborator hoặc staff trên cửa hàng để chúng tôi làm việc. Mọi thứ được kiểm thử trên cửa hàng phát triển trước khi tới tay khách của bạn.",
    },
    {
      question: "Bao lâu thì nhận được phản hồi?",
      answer:
        "Trong vòng một ngày làm việc kể từ khi gửi form. Nếu gấp, hãy gọi cho chúng tôi — số điện thoại nằm ở đầu mỗi trang.",
    },
  ],
};
