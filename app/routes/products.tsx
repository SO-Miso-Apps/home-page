import type { Route } from "./+types/products";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import {
  ArrowUpRight,
  Check,
  FileText,
  ShoppingCart,
  Tags,
  Zap
} from "lucide-react";
import productsStyles from "./products.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Products - Miso Apps" },
    {
      name: "description",
      content:
        "Explore Miso Apps products for Shopify and Shopline: automation, conversion, and AI discoverability tools for modern commerce teams."
    }
  ];
}

const products = [
  {
    icon: Tags,
    name: "SO: Auto Tags | All-in-One",
    platform: "Shopify",
    description:
      "Automate store management with rule-based tagging for orders, customers, and products. Built for teams that need cleaner data and less manual admin work.",
    badge: "Operations",
    features: [
      "Custom rules for orders, customers, and products",
      "Bulk replace, merge, and cleanup tools",
      "Workflow automation for recurring admin tasks",
      "Realtime tag management and reporting"
    ],
    link: "https://apps.shopify.com/so-operations-suite-with-ai",
    rating: "5.0",
    reviews: 3
  },
  {
    icon: ShoppingCart,
    name: "SO: Sticky Add To Cart",
    platform: "Shopify",
    description:
      "Keep the purchase action visible as shoppers browse. The bar is customizable, responsive, and focused on improving product-page conversion.",
    badge: "Conversion",
    features: [
      "Always-visible add-to-cart action",
      "Mobile and desktop responsive layouts",
      "Design controls for store theme fit",
      "Performance tracking for experiments"
    ],
    link: "https://apps.shopify.com/so-sticky-add-to-cart",
    rating: "5.0",
    reviews: 1
  },
  {
    icon: FileText,
    name: "SO: llms.txt",
    platform: "Shopline",
    description:
      "Generate llms.txt files that help AI assistants understand store content. A practical step toward better AI discoverability for modern commerce.",
    badge: "AI readiness",
    features: [
      "Automatic llms.txt generation",
      "AI-readable content structure",
      "Simple Shopline integration",
      "Scheduled updates as store content changes"
    ],
    link: "https://apps.shopline.com/detail?appHandle=so_llms_txt",
    rating: "New",
    reviews: 0
  }
];

export default function Products() {
  return (
    <>
      <Navigation />

      <main className={productsStyles.pageShell}>
        <section className={productsStyles.heroSection}>
          <div>
            <span className={productsStyles.eyebrow}>Product suite</span>
            <h1>Tools for cleaner operations and sharper buying paths.</h1>
          </div>
          <p>
            Each app is intentionally narrow: solve one merchant pain well,
            keep the interface clear, and avoid adding unnecessary storefront
            weight.
          </p>
        </section>

        <section className={productsStyles.productsSection}>
          {products.map((product, index) => {
            const Icon = product.icon;
            return (
              <article className={productsStyles.productCard} key={product.name}>
                <div className={productsStyles.productSummary}>
                  <div className={productsStyles.cardTopline}>
                    <span>{product.platform}</span>
                    <strong>{product.badge}</strong>
                  </div>
                  <Icon className={productsStyles.productIcon} size={34} strokeWidth={1.7} />
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  <div className={productsStyles.productMeta}>
                    <span>{product.rating}</span>
                    <small>{product.reviews > 0 ? `${product.reviews} public reviews` : "Recently launched"}</small>
                  </div>
                </div>

                <div className={productsStyles.featurePanel}>
                  <h3>What it handles</h3>
                  <ul>
                    {product.features.map((feature) => (
                      <li key={feature}>
                        <Check size={17} strokeWidth={2.2} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={product.link} className={productsStyles.installLink} target="_blank" rel="noopener noreferrer">
                    Open app listing <ArrowUpRight size={17} strokeWidth={2} />
                  </a>
                </div>

                <div className={productsStyles.productIndex}>0{index + 1}</div>
              </article>
            );
          })}
        </section>

        <section className={productsStyles.ctaSection}>
          <Zap size={30} strokeWidth={1.7} />
          <h2>Need a custom workflow or integration?</h2>
          <p>
            We can evaluate the merchant problem, app permissions, storefront
            impact, and maintenance cost before anything gets built.
          </p>
          <a className={productsStyles.installLink} href="mailto:hi@misoapps.com">
            Contact Miso Apps <ArrowUpRight size={17} strokeWidth={2} />
          </a>
        </section>
      </main>

      <Footer />
    </>
  );
}
