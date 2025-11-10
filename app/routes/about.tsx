import type { Route } from "./+types/about";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { 
  NeubrutalistCard, 
  NeubrutalistButton,
  NeubrutalistBadge 
} from "../components/Neubrutalism";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About Us - Miso Apps" },
    { name: "description", content: "Learn about Miso Apps - our mission, vision, values, and the team behind innovative software solutions." },
  ];
}

export default function About() {
  return (
    <>
      <Navigation />
      
      <main style={{ minHeight: '100vh' }}>
        {/* Hero Section */}
        <section style={{ 
          padding: '6rem 2rem 4rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          textAlign: 'center',
          border: '6px solid #000',
          margin: '0 2rem 4rem',
          boxShadow: '12px 12px 0 rgba(0, 0, 0, 1)'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <NeubrutalistBadge variant="yellow" size="large">About Miso Apps</NeubrutalistBadge>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, margin: '2rem 0 1rem' }}>
              Building the Future of Software
            </h1>
            <p style={{ fontSize: '1.5rem', lineHeight: 1.6, opacity: 0.95 }}>
              We're a passionate team of developers, designers, and innovators dedicated to creating exceptional software solutions that make a real difference.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                Our Story
              </h2>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555', marginBottom: '1rem' }}>
                Founded in 2018, Miso Apps began with a simple vision: to create software that people actually love to use. What started as a small team of three developers has grown into a thriving company serving clients worldwide.
              </p>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555', marginBottom: '1rem' }}>
                We've completed over 1,000 projects across various industries, from startups to Fortune 500 companies. Our commitment to excellence and innovation drives everything we do.
              </p>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555' }}>
                Today, we're proud to be recognized as one of the leading software development companies, known for our cutting-edge solutions and exceptional client service.
              </p>
            </div>
            <div style={{ 
              background: '#ffd700',
              padding: '3rem',
              border: '6px solid #000',
              boxShadow: '12px 12px 0 rgba(0, 0, 0, 1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                Award-Winning Team
              </h3>
              <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                Recognized for excellence in software development and innovation
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section style={{ padding: '4rem 2rem', background: '#f8f9fa' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '2rem'
            }}>
              <div style={{
                padding: '3rem',
                background: '#fff',
                border: '5px solid #000',
                boxShadow: '10px 10px 0 rgba(0, 0, 0, 1)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🎯</div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Our Mission
                </h3>
                <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555' }}>
                  To empower businesses worldwide with innovative software solutions that drive growth, enhance productivity, and create lasting value. We strive to make technology accessible, intuitive, and transformative for every client we serve.
                </p>
              </div>

              <div style={{
                padding: '3rem',
                background: '#fff',
                border: '5px solid #000',
                boxShadow: '10px 10px 0 rgba(0, 0, 0, 1)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🔭</div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Our Vision
                </h3>
                <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555' }}>
                  To be the world's most trusted software development partner, known for delivering exceptional solutions that set industry standards. We envision a future where our technology helps businesses of all sizes achieve their full potential.
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
              description="We constantly push boundaries and explore new technologies to deliver cutting-edge solutions that keep our clients ahead of the curve."
            />
            <NeubrutalistCard
              icon="🤝"
              color="blue"
              title="Integrity"
              description="We build trust through transparency, honesty, and accountability in all our interactions and deliverables."
            />
            <NeubrutalistCard
              icon="⭐"
              color="purple"
              title="Excellence"
              description="We're committed to delivering the highest quality in everything we do, exceeding expectations at every turn."
            />
            <NeubrutalistCard
              icon="🌟"
              color="green"
              title="Customer Focus"
              description="Our clients' success is our success. We listen, understand, and deliver solutions that truly meet their needs."
            />
            <NeubrutalistCard
              icon="🚀"
              color="red"
              title="Agility"
              description="We adapt quickly to change, embracing new challenges and opportunities with flexibility and speed."
            />
            <NeubrutalistCard
              icon="🌍"
              color="blue"
              title="Collaboration"
              description="We believe in the power of teamwork, both within our organization and with our clients and partners."
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
                { name: 'Alex Morgan', role: 'CEO & Founder', icon: '👔', description: '15+ years in software development' },
                { name: 'Jamie Lee', role: 'CTO', icon: '💻', description: 'Expert in cloud architecture' },
                { name: 'Sam Rivera', role: 'Head of Design', icon: '🎨', description: 'Award-winning UX designer' },
                { name: 'Taylor Chen', role: 'VP of Engineering', icon: '⚙️', description: 'Leading innovation initiatives' }
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
              { number: '500+', label: 'Happy Clients', icon: '😊' },
              { number: '1000+', label: 'Projects Delivered', icon: '✅' },
              { number: '50+', label: 'Team Members', icon: '👥' },
              { number: '15+', label: 'Countries Served', icon: '🌍' },
              { number: '99.9%', label: 'Client Satisfaction', icon: '⭐' },
              { number: '24/7', label: 'Support Available', icon: '🛟' }
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
        <section style={{ 
          padding: '4rem 2rem',
          margin: '4rem 2rem',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: '#fff',
          textAlign: 'center',
          border: '6px solid #000',
          boxShadow: '12px 12px 0 rgba(0, 0, 0, 1)'
        }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
            Want to Work With Us?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Let's build something amazing together. Get in touch to discuss your next project.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <NeubrutalistButton href="/products" variant="primary" size="large">
              View Our Services
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
