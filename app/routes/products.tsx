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
    { title: "Our Products - Miso Apps" },
    { name: "description", content: "Explore our suite of innovative software products and services designed to transform your business operations." },
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
            <NeubrutalistBadge variant="yellow" size="large">Our Products</NeubrutalistBadge>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, margin: '2rem 0 1rem' }}>
              Powerful Solutions for Modern Businesses
            </h1>
            <p style={{ fontSize: '1.5rem', lineHeight: 1.6, fontWeight: 600 }}>
              Discover our comprehensive suite of software products designed to streamline operations, boost productivity, and drive growth.
            </p>
          </div>
        </section>

        {/* Featured Products */}
        <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <NeubrutalistBadge variant="blue" size="large">Featured Products</NeubrutalistBadge>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0' }}>
              Our Flagship Solutions
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
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Miso Analytics Pro
                </h3>
                <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Transform your data into actionable insights with our powerful analytics platform. Real-time dashboards, advanced reporting, and AI-powered predictions.
                </p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <NeubrutalistBadge variant="green">Most Popular</NeubrutalistBadge>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Key Features:</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    '✅ Real-time data visualization',
                    '✅ Custom dashboard builder',
                    '✅ AI-powered insights',
                    '✅ Multi-source data integration',
                    '✅ Automated reporting',
                    '✅ Mobile app included'
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
                    Learn More
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
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Miso Project Manager
                </h3>
                <p style={{ fontSize: '1.25rem', color: '#333', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Streamline your project workflow with intuitive tools for planning, tracking, and collaboration. Perfect for teams of any size.
                </p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <NeubrutalistBadge variant="blue">Enterprise Ready</NeubrutalistBadge>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Key Features:</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    '✅ Kanban & Gantt views',
                    '✅ Team collaboration tools',
                    '✅ Time tracking & billing',
                    '✅ Resource management',
                    '✅ Custom workflows',
                    '✅ Integration with 100+ apps'
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
                    Learn More
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
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Miso CRM Suite
                </h3>
                <p style={{ fontSize: '1.25rem', color: '#333', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Build stronger customer relationships with our comprehensive CRM solution. Sales pipeline, customer service, and marketing automation in one platform.
                </p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <NeubrutalistBadge variant="purple">Best Value</NeubrutalistBadge>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Key Features:</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    '✅ Contact management',
                    '✅ Sales pipeline tracking',
                    '✅ Email marketing automation',
                    '✅ Customer support ticketing',
                    '✅ Lead scoring & nurturing',
                    '✅ Advanced analytics'
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
                    Learn More
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
              <NeubrutalistBadge variant="red" size="large">More Solutions</NeubrutalistBadge>
              <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0' }}>
                Complete Your Toolkit
              </h2>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem'
            }}>
              <NeubrutalistCard
                icon="🛒"
                color="blue"
                title="Miso E-Commerce"
                description="Build and scale your online store with our powerful e-commerce platform. Includes payment processing, inventory management, and marketing tools."
              />
              <NeubrutalistCard
                icon="📱"
                color="green"
                title="Miso Mobile App Builder"
                description="Create stunning mobile apps without code. Drag-and-drop interface, real-time preview, and one-click publishing to app stores."
              />
              <NeubrutalistCard
                icon="🔐"
                color="red"
                title="Miso Security Suite"
                description="Protect your business with enterprise-grade security. Includes firewall, threat detection, data encryption, and compliance tools."
              />
              <NeubrutalistCard
                icon="📧"
                color="purple"
                title="Miso Email Marketing"
                description="Design beautiful email campaigns with our intuitive editor. A/B testing, automation workflows, and detailed analytics included."
              />
              <NeubrutalistCard
                icon="☁️"
                color="yellow"
                title="Miso Cloud Storage"
                description="Secure cloud storage with unlimited capacity. File sharing, version control, and seamless collaboration features built-in."
              />
              <NeubrutalistCard
                icon="🤖"
                color="blue"
                title="Miso AI Assistant"
                description="Leverage AI to automate tasks and gain insights. Natural language processing, predictive analytics, and smart recommendations."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <NeubrutalistBadge variant="green" size="large">Pricing</NeubrutalistBadge>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0' }}>
              Choose Your Plan
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#666' }}>
              Flexible pricing for businesses of all sizes
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
              <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>$49</div>
              <div style={{ color: '#666', marginBottom: '2rem' }}>per month</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', textAlign: 'left' }}>
                {['1 Product', 'Up to 5 users', 'Basic support', '10GB storage'].map((item, i) => (
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
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Professional</h3>
              <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>$149</div>
              <div style={{ color: '#333', marginBottom: '2rem' }}>per month</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', textAlign: 'left' }}>
                {['3 Products', 'Up to 25 users', 'Priority support', '100GB storage', 'Advanced analytics'].map((item, i) => (
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
              <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>Custom</div>
              <div style={{ color: '#666', marginBottom: '2rem' }}>contact us</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', textAlign: 'left' }}>
                {['All Products', 'Unlimited users', '24/7 support', 'Unlimited storage', 'Custom integrations', 'Dedicated account manager'].map((item, i) => (
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
            Ready to Transform Your Business?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Start your free 14-day trial today. No credit card required.
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
