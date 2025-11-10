import type { Route } from "./+types/home";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { 
  NeubrutalistHero, 
  NeubrutalistCard, 
  NeubrutalistButton,
  NeubrutalistBadge 
} from "../components/Neubrutalism";

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
      
      <main style={{ minHeight: '100vh' }}>
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
        <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <NeubrutalistBadge variant="yellow">Why Choose Miso Apps</NeubrutalistBadge>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0' }}>
              Built for Shopify Success
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: '700px', margin: '0 auto' }}>
              We're Shopify experts dedicated to creating apps that solve real merchant problems and deliver measurable results.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginBottom: '4rem'
          }}>
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

        {/* Stats Section */}
        <section style={{ 
          background: '#ffd700', 
          border: '6px solid #000',
          padding: '4rem 2rem',
          margin: '0 2rem 4rem',
          boxShadow: '12px 12px 0 rgba(0, 0, 0, 1)'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '3rem',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '4rem', fontWeight: 900, color: '#000' }}>10K+</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem' }}>Shopify Stores</div>
              </div>
              <div>
                <div style={{ fontSize: '4rem', fontWeight: 900, color: '#000' }}>50+</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem' }}>Countries Worldwide</div>
              </div>
              <div>
                <div style={{ fontSize: '4rem', fontWeight: 900, color: '#000' }}>4.9★</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem' }}>Average App Rating</div>
              </div>
              <div>
                <div style={{ fontSize: '4rem', fontWeight: 900, color: '#000' }}>24/7</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem' }}>Expert Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <NeubrutalistBadge variant="green">Testimonials</NeubrutalistBadge>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0' }}>
              What Our Clients Say
            </h2>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem'
          }}>
            <div style={{
              padding: '2rem',
              background: '#fff',
              border: '4px solid #000',
              boxShadow: '8px 8px 0 rgba(0, 0, 0, 1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                "Miso Apps' Shopify apps have completely transformed our store. Sales are up 35% and we've automated so many tedious tasks. Best investment ever!"
              </p>
              <div style={{ fontWeight: 700 }}>Sarah Johnson</div>
              <div style={{ color: '#666' }}>Owner, Fashion Boutique</div>
            </div>

            <div style={{
              padding: '2rem',
              background: '#fff',
              border: '4px solid #000',
              boxShadow: '8px 8px 0 rgba(0, 0, 0, 1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                "We've tried many Shopify apps, but Miso Apps stands out. The apps are reliable, the support is amazing, and they truly understand e-commerce."
              </p>
              <div style={{ fontWeight: 700 }}>Michael Chen</div>
              <div style={{ color: '#666' }}>CEO, ElectroStore</div>
            </div>

            <div style={{
              padding: '2rem',
              background: '#fff',
              border: '4px solid #000',
              boxShadow: '8px 8px 0 rgba(0, 0, 0, 1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                "These apps paid for themselves in the first month. Customer engagement is through the roof and managing our store has never been easier!"
              </p>
              <div style={{ fontWeight: 700 }}>Emily Rodriguez</div>
              <div style={{ color: '#666' }}>Founder, BeautyHub</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ 
          padding: '4rem 2rem',
          margin: '4rem 2rem',
          background: '#000',
          color: '#fff',
          textAlign: 'center',
          border: '6px solid #000',
          boxShadow: '12px 12px 0 rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
            Ready to Supercharge Your Shopify Store?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '700px', margin: '0 auto 2rem' }}>
            Join 10,000+ Shopify merchants using our apps to increase sales, improve customer experience, and grow their business.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
