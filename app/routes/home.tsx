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
    { title: "Miso Apps - Innovative Software Solutions" },
    { name: "description", content: "Transform your business with cutting-edge software solutions from Miso Apps. We build powerful, user-friendly applications that drive growth." },
  ];
}

export default function Home() {
  return (
    <>
      <Navigation />
      
      <main style={{ minHeight: '100vh' }}>
        {/* Hero Section */}
        <NeubrutalistHero
          title="Transform Your Business with Innovative Software Solutions"
          subtitle="We create powerful, user-friendly applications that help businesses thrive in the digital age. From concept to deployment, we're your trusted technology partner."
          primaryCTA={{
            text: "Explore Our Products",
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
            <NeubrutalistBadge variant="yellow">Why Choose Us</NeubrutalistBadge>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0' }}>
              Built for Success
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
              We combine cutting-edge technology with user-centric design to deliver exceptional results.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            <NeubrutalistCard
              icon="🚀"
              color="blue"
              title="Lightning Fast"
              description="Our applications are optimized for speed and performance, ensuring smooth user experiences across all devices and platforms."
            />
            <NeubrutalistCard
              icon="🎨"
              color="purple"
              title="Beautiful Design"
              description="Every pixel is crafted with care. We create intuitive, visually stunning interfaces that users love to interact with."
            />
            <NeubrutalistCard
              icon="🔒"
              color="green"
              title="Secure & Reliable"
              description="Security is our priority. We implement industry-leading practices to keep your data safe and your systems running smoothly."
            />
            <NeubrutalistCard
              icon="📱"
              color="yellow"
              title="Mobile First"
              description="Responsive design that works flawlessly on any device. Your users can access your apps anywhere, anytime."
            />
            <NeubrutalistCard
              icon="⚡"
              color="red"
              title="Scalable Solutions"
              description="Built to grow with your business. Our architecture supports scaling from startup to enterprise levels."
            />
            <NeubrutalistCard
              icon="💡"
              color="blue"
              title="Innovation Driven"
              description="We stay ahead of the curve, continuously exploring new technologies to give you competitive advantages."
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
                <div style={{ fontSize: '4rem', fontWeight: 900, color: '#000' }}>500+</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem' }}>Happy Clients</div>
              </div>
              <div>
                <div style={{ fontSize: '4rem', fontWeight: 900, color: '#000' }}>1000+</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem' }}>Projects Completed</div>
              </div>
              <div>
                <div style={{ fontSize: '4rem', fontWeight: 900, color: '#000' }}>99.9%</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem' }}>Uptime Guarantee</div>
              </div>
              <div>
                <div style={{ fontSize: '4rem', fontWeight: 900, color: '#000' }}>24/7</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem' }}>Support Available</div>
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
                "Miso Apps transformed our business operations. The software is intuitive, powerful, and has dramatically improved our efficiency."
              </p>
              <div style={{ fontWeight: 700 }}>Sarah Johnson</div>
              <div style={{ color: '#666' }}>CEO, TechCorp</div>
            </div>

            <div style={{
              padding: '2rem',
              background: '#fff',
              border: '4px solid #000',
              boxShadow: '8px 8px 0 rgba(0, 0, 0, 1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                "Outstanding service and incredible results. The team at Miso Apps truly understands what businesses need to succeed."
              </p>
              <div style={{ fontWeight: 700 }}>Michael Chen</div>
              <div style={{ color: '#666' }}>Founder, StartupHub</div>
            </div>

            <div style={{
              padding: '2rem',
              background: '#fff',
              border: '4px solid #000',
              boxShadow: '8px 8px 0 rgba(0, 0, 0, 1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                "The best investment we've made. Miso Apps delivered beyond our expectations and continues to provide excellent support."
              </p>
              <div style={{ fontWeight: 700 }}>Emily Rodriguez</div>
              <div style={{ color: '#666' }}>Director, GrowthLab</div>
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
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Join hundreds of satisfied clients and transform your business today.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <NeubrutalistButton href="/products" variant="accent" size="large">
              View Our Products
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
