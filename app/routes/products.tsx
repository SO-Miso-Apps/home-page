import type { Route } from "./+types/products";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { 
  NeubrutalistCard, 
  NeubrutalistButton,
  NeubrutalistBadge 
} from "../components/Neubrutalism";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Our Shopify Apps - Miso Apps" },
    { name: "description", content: "Explore our suite of powerful Shopify apps designed to increase sales, improve customer experience, and automate your e-commerce operations." },
  ];
}

export default function Products() {
  return (
    <>
      <Navigation />
      
      <main style={{ minHeight: '100vh' }}>
        {/* Hero Section */}
        <section style={{ 
          padding: '6rem 2rem 4rem',
          background: 'linear-gradient(135deg, #fa8bff 0%, #2bd2ff 52%, #2bff88 90%)',
          color: '#000',
          textAlign: 'center',
          border: '6px solid #000',
          margin: '0 2rem 4rem',
          boxShadow: '12px 12px 0 rgba(0, 0, 0, 1)'
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <NeubrutalistBadge variant="yellow" size="large">Our Shopify Apps</NeubrutalistBadge>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, margin: '2rem 0 1rem' }}>
              Powerful Apps for Shopify Success
            </h1>
            <p style={{ fontSize: '1.5rem', lineHeight: 1.6, fontWeight: 600 }}>
              Discover our comprehensive suite of Shopify apps designed to boost conversions, enhance customer engagement, and streamline your store operations.
            </p>
          </div>
        </section>

        {/* Featured Products */}
        <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <NeubrutalistBadge variant="blue" size="large">Featured Apps</NeubrutalistBadge>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0' }}>
              Our Most Popular Shopify Apps
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {/* Product 1 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              padding: '3rem',
              background: '#fff',
              border: '6px solid #000',
              boxShadow: '12px 12px 0 rgba(0, 0, 0, 1)'
            }}>
              <div>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎁</div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Upsell & Cross-Sell Pro
                </h3>
                <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Increase average order value with intelligent product recommendations. AI-powered upsells, cross-sells, and bundles that convert at checkout and throughout your store.
                </p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <NeubrutalistBadge variant="green">Most Popular</NeubrutalistBadge>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Key Features:</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    '✅ AI-powered product recommendations',
                    '✅ One-click upsells at checkout',
                    '✅ Frequently bought together bundles',
                    '✅ Post-purchase upsell offers',
                    '✅ Customizable design templates',
                    '✅ Detailed analytics & A/B testing'
                  ].map((feature, i) => (
                    <li key={i} style={{ 
                      padding: '0.75rem 1rem',
                      background: '#f8f9fa',
                      border: '2px solid #000',
                      marginBottom: '0.5rem',
                      fontWeight: 600
                    }}>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: '1.5rem' }}>
                  <NeubrutalistButton variant="primary" size="large">
                    Install App
                  </NeubrutalistButton>
                </div>
              </div>
            </div>

            {/* Product 2 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              padding: '3rem',
              background: '#ffd700',
              border: '6px solid #000',
              boxShadow: '12px 12px 0 rgba(0, 0, 0, 1)'
            }}>
              <div>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>�</div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Email Marketing Master
                </h3>
                <p style={{ fontSize: '1.25rem', color: '#333', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Recover abandoned carts and boost customer retention with automated email campaigns. Beautiful templates, segmentation, and powerful automation workflows.
                </p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <NeubrutalistBadge variant="blue">Enterprise Ready</NeubrutalistBadge>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Key Features:</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    '✅ Abandoned cart recovery emails',
                    '✅ Welcome series automation',
                    '✅ Customer win-back campaigns',
                    '✅ Product review requests',
                    '✅ Drag-and-drop email builder',
                    '✅ Advanced segmentation & analytics'
                  ].map((feature, i) => (
                    <li key={i} style={{ 
                      padding: '0.75rem 1rem',
                      background: '#fff',
                      border: '2px solid #000',
                      marginBottom: '0.5rem',
                      fontWeight: 600
                    }}>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: '1.5rem' }}>
                  <NeubrutalistButton variant="accent" size="large">
                    Install App
                  </NeubrutalistButton>
                </div>
              </div>
            </div>

            {/* Product 3 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              padding: '3rem',
              background: '#e0bbe4',
              border: '6px solid #000',
              boxShadow: '12px 12px 0 rgba(0, 0, 0, 1)'
            }}>
              <div>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⭐</div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Reviews & Social Proof
                </h3>
                <p style={{ fontSize: '1.25rem', color: '#333', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Build trust and increase conversions with authentic customer reviews and social proof. Photo reviews, Q&A, ratings, and automated review collection.
                </p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <NeubrutalistBadge variant="purple">Best Value</NeubrutalistBadge>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Key Features:</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    '✅ Automated review requests',
                    '✅ Photo & video reviews',
                    '✅ Q&A for products',
                    '✅ Google Rich Snippets (SEO)',
                    '✅ Review widgets & popups',
                    '✅ Import reviews from platforms'
                  ].map((feature, i) => (
                    <li key={i} style={{ 
                      padding: '0.75rem 1rem',
                      background: '#fff',
                      border: '2px solid #000',
                      marginBottom: '0.5rem',
                      fontWeight: 600
                    }}>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: '1.5rem' }}>
                  <NeubrutalistButton variant="primary" size="large">
                    Install App
                  </NeubrutalistButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More Products */}
        <section style={{ padding: '4rem 2rem', background: '#f8f9fa' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <NeubrutalistBadge variant="red" size="large">More Apps</NeubrutalistBadge>
              <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0' }}>
                Complete Your Store Toolkit
              </h2>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem'
            }}>
              <NeubrutalistCard
                icon="�"
                color="blue"
                title="Inventory Management"
                description="Track stock levels across multiple locations. Get low-stock alerts, automate reordering, and sync with suppliers in real-time."
              />
              <NeubrutalistCard
                icon="🎯"
                color="green"
                title="Pop-ups & Forms"
                description="Capture emails and reduce cart abandonment with exit-intent popups, spin-to-win wheels, and customizable forms."
              />
              <NeubrutalistCard
                icon="�"
                color="red"
                title="Shipping Calculator"
                description="Display real-time shipping rates on product pages. Reduce cart abandonment by showing shipping costs upfront."
              />
              <NeubrutalistCard
                icon="�"
                color="purple"
                title="Discount Manager Pro"
                description="Create advanced discount campaigns with tiered pricing, BOGO offers, volume discounts, and flash sales."
              />
              <NeubrutalistCard
                icon="📱"
                color="yellow"
                title="SMS Marketing"
                description="Send personalized SMS campaigns for cart recovery, order updates, shipping notifications, and promotions."
              />
              <NeubrutalistCard
                icon="🔍"
                color="blue"
                title="Smart Search & Filter"
                description="Help customers find products faster with AI-powered search, instant results, and advanced filtering options."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <NeubrutalistBadge variant="green" size="large">Pricing</NeubrutalistBadge>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0' }}>
              Flexible Plans for Every Store
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#666' }}>
              Start free, upgrade as you grow. All plans include 14-day free trial.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem'
          }}>
            {/* Starter */}
            <div style={{
              padding: '2.5rem',
              background: '#fff',
              border: '5px solid #000',
              boxShadow: '8px 8px 0 rgba(0, 0, 0, 1)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Starter</h3>
              <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>$9.99</div>
              <div style={{ color: '#666', marginBottom: '2rem' }}>per month</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', textAlign: 'left' }}>
                {['1 App of your choice', 'Up to 500 orders/month', 'Email support', 'Basic analytics', '14-day free trial'].map((item, i) => (
                  <li key={i} style={{ padding: '0.5rem 0', borderBottom: '2px solid #f0f0f0' }}>
                    ✓ {item}
                  </li>
                ))}
              </ul>
              <NeubrutalistButton variant="secondary" size="medium">
                Get Started
              </NeubrutalistButton>
            </div>

            {/* Professional */}
            <div style={{
              padding: '2.5rem',
              background: '#ffd700',
              border: '5px solid #000',
              boxShadow: '8px 8px 0 rgba(0, 0, 0, 1)',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#000',
                color: '#fff',
                padding: '0.5rem 1rem',
                fontWeight: 700,
                border: '3px solid #000'
              }}>
                POPULAR
              </div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Growth</h3>
              <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>$29.99</div>
              <div style={{ color: '#333', marginBottom: '2rem' }}>per month</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', textAlign: 'left' }}>
                {['Up to 3 Apps', 'Up to 2,000 orders/month', 'Priority email support', 'Advanced analytics', 'A/B testing', 'Remove branding'].map((item, i) => (
                  <li key={i} style={{ padding: '0.5rem 0', borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
                    ✓ {item}
                  </li>
                ))}
              </ul>
              <NeubrutalistButton variant="primary" size="medium">
                Get Started
              </NeubrutalistButton>
            </div>

            {/* Enterprise */}
            <div style={{
              padding: '2.5rem',
              background: '#fff',
              border: '5px solid #000',
              boxShadow: '8px 8px 0 rgba(0, 0, 0, 1)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Enterprise</h3>
              <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>$99.99</div>
              <div style={{ color: '#666', marginBottom: '2rem' }}>per month</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', textAlign: 'left' }}>
                {['All Apps included', 'Unlimited orders', '24/7 priority support', 'Custom integrations', 'Dedicated account manager', 'White-label options'].map((item, i) => (
                  <li key={i} style={{ padding: '0.5rem 0', borderBottom: '2px solid #f0f0f0' }}>
                    ✓ {item}
                  </li>
                ))}
              </ul>
              <NeubrutalistButton variant="accent" size="medium">
                Contact Sales
              </NeubrutalistButton>
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
            Ready to Boost Your Shopify Store?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Start your 14-day free trial today. No credit card required. Cancel anytime.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <NeubrutalistButton variant="accent" size="large">
              Start Free Trial
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
