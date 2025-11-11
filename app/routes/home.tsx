import type { Route } from "./+types/home";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { 
  NeubrutalistHero, 
  NeubrutalistCard, 
  NeubrutalistButton,
  NeubrutalistBadge 
} from "../components/Neubrutalism";
import neuStyles from "../components/Neubrutalism/Neubrutalism.module.css";
import homeStyles from "./home.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Miso Apps - Premium Shopify Apps Development" },
    { name: "description", content: "Transform your Shopify store with powerful apps from Miso Apps. We build innovative Shopify applications that boost sales, enhance customer experience, and streamline operations." },
  ];
}

export default function Home() {
  return (
    <>
      <Navigation />
      
      <main className={homeStyles.homeContainer}>
        {/* Hero Section */}
        <NeubrutalistHero
          title="Powerful Shopify Apps That Drive Real Results"
          subtitle="We specialize in building premium Shopify apps that help merchants increase sales, improve customer engagement, and automate their operations. Trusted by thousands of Shopify stores worldwide."
          primaryCTA={{
            text: "Explore Our Apps",
            href: "/products"
          }}
          secondaryCTA={{
            text: "Learn About Us",
            href: "/about"
          }}
        />

        {/* Features Section */}
        <section className={homeStyles.featuresSection}>
          <div className={homeStyles.featuresHeader}>
            <NeubrutalistBadge variant="yellow">Why Choose Miso Apps</NeubrutalistBadge>
            <h2>
              Built for Shopify Success
            </h2>
            <p>
              We're Shopify experts dedicated to creating apps that solve real merchant problems and deliver measurable results.
            </p>
          </div>

          <div className={homeStyles.featuresGrid}>
            <NeubrutalistCard
              icon="�️"
              color="blue"
              title="Shopify Certified"
              description="Our team consists of certified Shopify experts with deep knowledge of the platform's APIs, best practices, and ecosystem."
            />
            <NeubrutalistCard
              icon="⚡"
              color="purple"
              title="Lightning Fast Performance"
              description="Our apps are optimized for speed, ensuring zero impact on your store's loading time and excellent user experience."
            />
            <NeubrutalistCard
              icon="🎨"
              color="green"
              title="Seamless Integration"
              description="Beautiful, intuitive interfaces that match Shopify's design language and integrate perfectly with your store's theme."
            />
            <NeubrutalistCard
              icon="�"
              color="yellow"
              title="Proven Results"
              description="Our apps have helped merchants increase conversions by up to 40% and save countless hours on manual tasks."
            />
            <NeubrutalistCard
              icon="🔧"
              color="red"
              title="Regular Updates"
              description="We continuously improve our apps with new features, bug fixes, and compatibility updates for the latest Shopify releases."
            />
            <NeubrutalistCard
              icon="�"
              color="blue"
              title="World-Class Support"
              description="Get help when you need it with our responsive 24/7 customer support team that knows Shopify inside and out."
            />
          </div>
        </section>

        {/* Stats Section (muted palette to reduce glare) */}
        <section className={neuStyles.statsSection}>
          <div className={homeStyles.statsGrid}>
            <div>
              <div className={homeStyles.statNumber}>10K+</div>
              <div className={homeStyles.statLabel}>Shopify Stores</div>
            </div>
            <div>
              <div className={homeStyles.statNumber}>50+</div>
              <div className={homeStyles.statLabel}>Countries Worldwide</div>
            </div>
            <div>
              <div className={homeStyles.statNumber}>4.9★</div>
              <div className={homeStyles.statLabel}>Average App Rating</div>
            </div>
            <div>
              <div className={homeStyles.statNumber}>24/7</div>
              <div className={homeStyles.statLabel}>Expert Support</div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={homeStyles.testimonialsSection}>
          <div className={homeStyles.testimonialsHeader}>
            <NeubrutalistBadge variant="green">Testimonials</NeubrutalistBadge>
            <h2>
              What Our Clients Say
            </h2>
            <p className={neuStyles.mutedText}>
              Real merchants. Real results — quotes and short case highlights from stores using our Shopify apps.
            </p>
          </div>

          <div className={homeStyles.testimonialsGrid}>
            <div className={neuStyles.testimonialCard}>
              <div className={homeStyles.testimonialRating}>⭐⭐⭐⭐⭐</div>
              <p className={homeStyles.testimonialText}>
                "Miso Apps' Shopify apps have completely transformed our store. Sales are up 35% and we've automated so many tedious tasks. Best investment ever!"
              </p>
              <div className={homeStyles.testimonialAuthor}>Sarah Johnson</div>
              <div className={neuStyles.mutedText}>Owner, Fashion Boutique — +28% AOV in 3 months</div>
            </div>

            <div className={neuStyles.testimonialCard}>
              <div className={homeStyles.testimonialRating}>⭐⭐⭐⭐⭐</div>
              <p className={homeStyles.testimonialText}>
                "We've tried many Shopify apps, but Miso Apps stands out. The apps are reliable, the support is amazing, and they truly understand e-commerce."
              </p>
              <div className={homeStyles.testimonialAuthor}>Michael Chen</div>
              <div className={neuStyles.mutedText}>CEO, ElectroStore — 4.8★ avg across apps</div>
            </div>

            <div className={neuStyles.testimonialCard}>
              <div className={homeStyles.testimonialRating}>⭐⭐⭐⭐⭐</div>
              <p className={homeStyles.testimonialText}>
                "These apps paid for themselves in the first month. Customer engagement is through the roof and managing our store has never been easier!"
              </p>
              <div className={homeStyles.testimonialAuthor}>Emily Rodriguez</div>
              <div className={neuStyles.mutedText}>Founder, BeautyHub — +42% repeat purchases</div>
            </div>

            <div className={neuStyles.testimonialCard}>
              <div className={homeStyles.testimonialRating}>⭐⭐⭐⭐⭐</div>
              <p className={homeStyles.testimonialText}>
                "Integration was seamless and the team implemented custom logic for our promotions. Support replied within an hour and the results speak for themselves."
              </p>
              <div className={homeStyles.testimonialAuthor}>Raj Patel</div>
              <div className={neuStyles.mutedText}>Head of Growth, HomeGoodsCo — +18% conversion on campaigns</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={homeStyles.ctaSection}>
          <h2>
            Ready to Supercharge Your Shopify Store?
          </h2>
          <p>
            Join 10,000+ Shopify merchants using our apps to increase sales, improve customer experience, and grow their business.
          </p>
          <div className={homeStyles.ctaButtons}>
            <NeubrutalistButton href="/products" variant="accent" size="large">
              Browse Our Shopify Apps
            </NeubrutalistButton>
            <NeubrutalistButton href="/about" variant="secondary" size="large">
              Learn More About Us
            </NeubrutalistButton>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
