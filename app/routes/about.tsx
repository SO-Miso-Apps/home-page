import type { Route } from "./+types/about";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { 
  NeubrutalistCard, 
  NeubrutalistButton,
  NeubrutalistBadge 
} from "../components/Neubrutalism";
import aboutStyles from "./about.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About Us - Miso Apps | Shopify App Development Experts" },
    { name: "description", content: "Learn about Miso Apps - leading Shopify app developers. Our mission, vision, values, and the expert team behind innovative Shopify solutions." },
  ];
}

export default function About() {
  return (
    <>
      <Navigation />
      
      <main className={aboutStyles.aboutContainer}>
        {/* Hero Section */}
        <section className={aboutStyles.heroSection}>
          <div className={aboutStyles.heroContent}>
            <NeubrutalistBadge variant="yellow" size="large">About Miso Apps</NeubrutalistBadge>
            <h1 className={aboutStyles.heroTitle}>
              Shopify App Experts Since 2018
            </h1>
            <p className={aboutStyles.heroSubtitle}>
              We're a passionate team of Shopify specialists dedicated to creating powerful apps that help merchants succeed in the competitive e-commerce landscape.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className={aboutStyles.storySection}>
          <div className={aboutStyles.storyGrid}>
            <div className={aboutStyles.storyContent}>
              <h2>Our Story</h2>
              <p>
                Founded in 2018, Miso Apps was born from a simple observation: Shopify merchants needed better tools to compete in the rapidly growing e-commerce space. As experienced Shopify developers, we saw the gaps in the app ecosystem and decided to fill them.
              </p>
              <p>
                What started as two developers building apps in a garage has grown into a thriving company serving over 10,000 Shopify stores across 50+ countries. Our apps have been installed millions of times and have helped merchants generate over $500M in additional revenue.
              </p>
              <p>
                Today, we're recognized as Shopify Experts and trusted partners in the Shopify ecosystem. We continue to innovate, releasing new apps and updates that help merchants grow their businesses and deliver exceptional customer experiences.
              </p>
            </div>
            <div className={aboutStyles.storyCard}>
              <div className={aboutStyles.storyCardIcon}>🏆</div>
              <h3 className={aboutStyles.storyCardTitle}>
                Shopify Experts
              </h3>
              <p className={aboutStyles.storyCardText}>
                Certified Shopify Partners & App Developers with proven track record
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className={aboutStyles.missionSection}>
          <div className={aboutStyles.missionContainer}>
            <div className={aboutStyles.missionGrid}>
              <div className={aboutStyles.missionCard}>
                <div className={aboutStyles.missionCardIcon}>🎯</div>
                <h3 className={aboutStyles.missionCardTitle}>
                  Our Mission
                </h3>
                <p className={aboutStyles.missionCardText}>
                  To empower Shopify merchants with innovative apps that drive sales, enhance customer experiences, and automate operations. We believe every merchant deserves access to enterprise-level tools, regardless of their store size. Our mission is to level the playing field and help small businesses compete with larger retailers.
                </p>
              </div>

              <div className={aboutStyles.missionCard}>
                <div className={aboutStyles.missionCardIcon}>🔭</div>
                <h3 className={aboutStyles.missionCardTitle}>
                  Our Vision
                </h3>
                <p className={aboutStyles.missionCardText}>
                  To become the most trusted name in Shopify app development, setting the standard for quality, reliability, and merchant success. We envision a future where every Shopify store, from emerging startups to established brands, uses our apps to achieve their full potential and deliver world-class shopping experiences.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <NeubrutalistBadge variant="purple" size="large">Core Values</NeubrutalistBadge>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0' }}>
              What Drives Us
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: '700px', margin: '0 auto' }}>
              Our values guide every decision we make and every solution we create.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem'
          }}>
            <NeubrutalistCard
              icon="💡"
              color="yellow"
              title="Innovation"
              description="We stay ahead of e-commerce trends and Shopify updates, continuously innovating to give merchants competitive advantages in their markets."
            />
            <NeubrutalistCard
              icon="🎯"
              color="blue"
              title="Merchant-First"
              description="Every decision we make puts Shopify merchants at the center. We build apps that solve real problems and deliver measurable results."
            />
            <NeubrutalistCard
              icon="⭐"
              color="purple"
              title="Excellence"
              description="We maintain the highest standards in code quality, app performance, and customer support, ensuring reliable solutions merchants can trust."
            />
            <NeubrutalistCard
              icon="🤝"
              color="green"
              title="Partnership"
              description="We view merchants as partners, not just customers. Their success is our success, and we're committed to their long-term growth."
            />
            <NeubrutalistCard
              icon="�"
              color="red"
              title="Security & Privacy"
              description="We take data security seriously, following Shopify's strict guidelines and implementing best practices to protect merchant and customer data."
            />
            <NeubrutalistCard
              icon="�"
              color="blue"
              title="Continuous Improvement"
              description="We actively listen to merchant feedback and continuously update our apps with new features, improvements, and optimizations."
            />
          </div>
        </section>

        {/* Team Section */}
        <section style={{ 
          padding: '4rem 2rem',
          background: '#000',
          color: '#fff',
          margin: '4rem 2rem',
          border: '6px solid #000',
          boxShadow: '12px 12px 0 rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
                Meet Our Leadership Team
              </h2>
              <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>
                Experienced professionals driving innovation and excellence
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '2rem'
            }}>
              {[
                { name: 'Alex Morgan', role: 'CEO & Founder', icon: '👔', description: 'Former Shopify developer with 10+ years' },
                { name: 'Jamie Lee', role: 'CTO', icon: '💻', description: 'Shopify API specialist & architect' },
                { name: 'Sam Rivera', role: 'Head of Product', icon: '🎨', description: 'UX expert focused on merchant needs' },
                { name: 'Taylor Chen', role: 'VP of Engineering', icon: '⚙️', description: 'Leading our app development team' }
              ].map((member, index) => (
                <div key={index} style={{
                  padding: '2rem',
                  background: '#fff',
                  color: '#000',
                  border: '4px solid #ffd700',
                  boxShadow: '6px 6px 0 rgba(255, 215, 0, 0.5)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{member.icon}</div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    {member.name}
                  </h3>
                  <p style={{ color: '#ffd700', fontWeight: 700, marginBottom: '1rem' }}>
                    {member.role}
                  </p>
                  <p style={{ color: '#666' }}>{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 800 }}>
              Our Impact by the Numbers
            </h2>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '2rem'
          }}>
            {[
              { number: '10K+', label: 'Shopify Stores', icon: '�️' },
              { number: '5M+', label: 'App Installations', icon: '⬇️' },
              { number: '30+', label: 'Shopify Experts', icon: '👥' },
              { number: '50+', label: 'Countries Served', icon: '🌍' },
              { number: '4.9★', label: 'Average Rating', icon: '⭐' },
              { number: '$500M+', label: 'Revenue Generated', icon: '�' }
            ].map((stat, index) => (
              <div key={index} style={{
                padding: '2rem',
                background: '#ffd700',
                border: '4px solid #000',
                boxShadow: '6px 6px 0 rgba(0, 0, 0, 1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className={aboutStyles.finalCtaSection}>
          <h2 className={aboutStyles.finalCtaTitle}>
            Join Thousands of Successful Merchants
          </h2>
          <p className={aboutStyles.finalCtaText}>
            Ready to take your Shopify store to the next level? Discover our powerful apps today.
          </p>
          <div className={aboutStyles.finalCtaButtons}>
            <NeubrutalistButton href="/products" variant="primary" size="large">
              Explore Our Shopify Apps
            </NeubrutalistButton>
            <NeubrutalistButton href="/" variant="secondary" size="large">
              Back to Home
            </NeubrutalistButton>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
