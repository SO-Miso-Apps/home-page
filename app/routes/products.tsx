import type { Route } from "./+types/products";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import {
  NeubrutalistButton,
  NeubrutalistBadge
} from "../components/Neubrutalism";
import {
  Tags,
  ShoppingCart,
  FileText,
  Check,
  ExternalLink
} from "lucide-react";
import productsStyles from "./products.module.css";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Our Apps - Miso Apps" },
    { name: "description", content: "Explore our suite of powerful e-commerce apps for Shopify and Shopline. Automate tagging, boost sales, and enhance AI discoverability." },
  ];
}

export default function Products() {
  const products = [
    {
      icon: Tags,
      name: "SO: Auto Tags | All-in-One",
      platform: "Shopify",
      description: "Automate Shopify store management with custom tagging rules for orders, customers, and products. Streamline workflows and organize data efficiently with AI-powered automation.",
      badge: "Most Popular",
      features: [
        "AI-powered automatic tagging",
        "Custom rules for Orders, Customers & Products",
        "Bulk replace, merge & clean tags",
        "Workflow automation",
        "Real-time tag management",
        "Detailed analytics & reporting"
      ],
      link: "https://apps.shopify.com/so-operations-suite-with-ai",
      rating: "5.0",
      reviews: 3
    },
    {
      icon: ShoppingCart,
      name: "SO: Sticky Add To Cart",
      platform: "Shopify",
      description: "Increase sales with the Sticky Add to Cart bar. Customize designs for any device, keep the button visible while scrolling, and track performance easily.",
      badge: "Boost Sales",
      features: [
        "Always-visible Add to Cart button",
        "Customizable design templates",
        "Mobile & desktop responsive",
        "Performance tracking",
        "Easy customization",
        "No coding required"
      ],
      link: "https://apps.shopify.com/so-sticky-add-to-cart",
      rating: "5.0",
      reviews: 1
    },
    {
      icon: FileText,
      name: "SO: llms.txt",
      platform: "Shopline",
      description: "Generate llms.txt files for your Shopline store to enhance AI discoverability. Help AI assistants and LLMs understand your store content better.",
      badge: "AI Ready",
      features: [
        "Automatic llms.txt generation",
        "AI-optimized content structure",
        "Enhanced AI discoverability",
        "Easy integration",
        "SEO benefits",
        "Regular auto-updates"
      ],
      link: "https://apps.shopline.com/detail?appHandle=so_llms_txt",
      rating: "New",
      reviews: 0
    }
  ];

  return (
    <>
      <Navigation />

      <main className={productsStyles.productsContainer}>
        {/* Hero Section */}
        <section className={productsStyles.heroSection}>
          <div className={productsStyles.heroContent}>
            <NeubrutalistBadge variant="default" size="large">Our Apps</NeubrutalistBadge>
            <h1 className={productsStyles.heroTitle}>
              Powerful Apps for E-commerce Success
            </h1>
            <p className={productsStyles.heroSubtitle}>
              Discover our suite of apps for Shopify and Shopline designed to automate operations, boost conversions, and enhance AI discoverability.
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className={productsStyles.featuredSection}>
          <div className={productsStyles.sectionHeader}>
            <NeubrutalistBadge variant="outline" size="large">Our Products</NeubrutalistBadge>
            <h2>Apps Built for Modern E-commerce</h2>
          </div>

          <div className={productsStyles.featuredGrid}>
            {products.map((product, index) => {
              const IconComponent = product.icon;
              return (
                <div key={index} className={productsStyles.featuredCard}>
                  <div className={productsStyles.featuredCardHeader}>
                    <div className={productsStyles.platformBadge}>
                      {product.platform}
                    </div>
                    <IconComponent className={productsStyles.featuredCardIcon} size={48} strokeWidth={1.5} />
                    <h3 className={productsStyles.featuredCardTitle}>{product.name}</h3>
                    <p className={productsStyles.featuredCardDescription}>{product.description}</p>
                    <div className={productsStyles.cardMeta}>
                      <NeubrutalistBadge variant="ghost">{product.badge}</NeubrutalistBadge>
                      {product.reviews > 0 && (
                        <span className={productsStyles.rating}>
                          ⭐ {product.rating} ({product.reviews} reviews)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={productsStyles.featuredCardFeatures}>
                    <h4>Key Features:</h4>
                    <ul>
                      {product.features.map((feature, i) => (
                        <li key={i}>
                          <Check size={16} strokeWidth={2.5} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <NeubrutalistButton
                      href={product.link}
                      variant="primary"
                      size="medium"
                    >
                      <span>Install on {product.platform}</span>
                      <ExternalLink size={16} />
                    </NeubrutalistButton>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className={productsStyles.ctaSection}>
          <h2>Need a Custom Solution?</h2>
          <p>
            We build custom apps and integrations for Shopify and Shopline. Let's discuss your requirements.
          </p>
          <div className={productsStyles.ctaButtons}>
            <NeubrutalistButton href="/contact" variant="secondary" size="large">
              Contact Us
            </NeubrutalistButton>
            <NeubrutalistButton href="/about" variant="accent" size="large">
              Learn More About Us
            </NeubrutalistButton>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
