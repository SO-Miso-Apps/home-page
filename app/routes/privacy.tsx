import type { Route } from "./+types/privacy";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { NeubrutalistBadge } from "../components/Neubrutalism";
import privacyStyles from "./privacy.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Privacy Policy - Miso Apps" },
    { name: "description", content: "Learn how Miso Apps protects your privacy and handles your data. Our comprehensive privacy policy." },
  ];
}

export default function Privacy() {
  const lastUpdated = "November 10, 2025";

  return (
    <>
      <Navigation />
      
      <main className={privacyStyles.privacyContainer}>
        <div className={privacyStyles.privacyContent}>
          {/* Header */}
          <div className={privacyStyles.privacyHeader}>
            <NeubrutalistBadge variant="blue" size="large">Legal</NeubrutalistBadge>
            <h1 className={privacyStyles.privacyTitle}>
              Privacy Policy
            </h1>
            <p className={privacyStyles.privacyLastUpdated}>
              Last Updated: {lastUpdated}
            </p>
          </div>

          {/* Intro */}
          <div className={privacyStyles.introBox}>
            <h2 className={privacyStyles.introTitle}>
              Your Privacy Matters to Us
            </h2>
            <p className={privacyStyles.introText}>
              At Miso Apps, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our services.
            </p>
          </div>

          {/* Content Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Section 1 */}
            <section>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '4px solid #000'
              }}>
                1. Information We Collect
              </h2>
              
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '1rem' }}>
                1.1 Information You Provide
              </h3>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555', marginBottom: '1rem' }}>
                We collect information that you voluntarily provide to us, including:
              </p>
              <ul style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555', marginLeft: '2rem' }}>
                <li>Name, email address, and contact information</li>
                <li>Account credentials and profile information</li>
                <li>Payment and billing information</li>
                <li>Communications with us (emails, support tickets, etc.)</li>
                <li>Content you create or upload to our services</li>
              </ul>

              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '1rem' }}>
                1.2 Automatically Collected Information
              </h3>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555', marginBottom: '1rem' }}>
                When you use our services, we automatically collect certain information:
              </p>
              <ul style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555', marginLeft: '2rem' }}>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Log data and analytics information</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '4px solid #000'
              }}>
                2. How We Use Your Information
              </h2>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555', marginBottom: '1rem' }}>
                We use the collected information for the following purposes:
              </p>
              <div style={{
                display: 'grid',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                {[
                  { icon: '🔧', title: 'Service Delivery', text: 'To provide, maintain, and improve our services' },
                  { icon: '💬', title: 'Communication', text: 'To respond to inquiries and send important updates' },
                  { icon: '🔒', title: 'Security', text: 'To detect and prevent fraud, abuse, and security threats' },
                  { icon: '📊', title: 'Analytics', text: 'To analyze usage patterns and improve user experience' },
                  { icon: '⚖️', title: 'Legal Compliance', text: 'To comply with legal obligations and enforce our terms' },
                  { icon: '🎯', title: 'Marketing', text: 'To send promotional materials (with your consent)' }
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: '1.5rem',
                    background: '#f8f9fa',
                    border: '3px solid #000',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ fontSize: '2rem', flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '1rem', color: '#555', margin: 0 }}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '4px solid #000'
              }}>
                3. Data Sharing and Disclosure
              </h2>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555', marginBottom: '1rem' }}>
                We do not sell your personal information. We may share your data only in the following circumstances:
              </p>
              <ul style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555', marginLeft: '2rem' }}>
                <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in operating our services (e.g., cloud hosting, payment processing)</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '4px solid #000'
              }}>
                4. Data Security
              </h2>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555', marginBottom: '1rem' }}>
                We implement industry-standard security measures to protect your personal information:
              </p>
              <div style={{
                padding: '2rem',
                background: '#e8f5e9',
                border: '4px solid #000',
                boxShadow: '6px 6px 0 rgba(0, 0, 0, 1)',
                marginTop: '1.5rem'
              }}>
                <ul style={{ fontSize: '1.125rem', lineHeight: 1.8, margin: 0, paddingLeft: '1.5rem' }}>
                  <li>256-bit SSL/TLS encryption for data transmission</li>
                  <li>Encrypted data storage with regular security audits</li>
                  <li>Multi-factor authentication and access controls</li>
                  <li>Regular security updates and vulnerability assessments</li>
                  <li>Employee training on data protection practices</li>
                  <li>24/7 security monitoring and incident response</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '4px solid #000'
              }}>
                5. Your Rights and Choices
              </h2>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555', marginBottom: '1.5rem' }}>
                You have the following rights regarding your personal information:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { title: 'Access', description: 'Request a copy of your personal data we hold' },
                  { title: 'Correction', description: 'Update or correct inaccurate information' },
                  { title: 'Deletion', description: 'Request deletion of your personal data' },
                  { title: 'Portability', description: 'Receive your data in a portable format' },
                  { title: 'Opt-Out', description: 'Unsubscribe from marketing communications' },
                  { title: 'Object', description: 'Object to certain data processing activities' }
                ].map((right, i) => (
                  <div key={i} style={{
                    padding: '1.25rem',
                    background: '#fff',
                    border: '3px solid #000',
                    boxShadow: '4px 4px 0 rgba(0, 0, 0, 1)'
                  }}>
                    <strong style={{ fontSize: '1.25rem', color: '#000' }}>{right.title}:</strong>
                    <span style={{ fontSize: '1.125rem', color: '#555', marginLeft: '0.5rem' }}>
                      {right.description}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '4px solid #000'
              }}>
                6. Cookies and Tracking
              </h2>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555', marginBottom: '1rem' }}>
                We use cookies and similar technologies to enhance your experience. You can control cookie preferences through your browser settings.
              </p>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555' }}>
                Types of cookies we use:
              </p>
              <ul style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555', marginLeft: '2rem' }}>
                <li><strong>Essential Cookies:</strong> Required for basic functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
                <li><strong>Marketing Cookies:</strong> Used for targeted advertising</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '4px solid #000'
              }}>
                7. Data Retention
              </h2>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555' }}>
                We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. When data is no longer needed, we securely delete or anonymize it.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '4px solid #000'
              }}>
                8. International Data Transfers
              </h2>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555' }}>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data, including Standard Contractual Clauses approved by the European Commission and other legally recognized transfer mechanisms.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '4px solid #000'
              }}>
                9. Children's Privacy
              </h2>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555' }}>
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '4px solid #000'
              }}>
                10. Changes to This Policy
              </h2>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#555' }}>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            {/* Contact Section */}
            <section style={{
              padding: '2.5rem',
              background: '#000',
              color: '#fff',
              border: '5px solid #000',
              boxShadow: '8px 8px 0 rgba(0, 0, 0, 1)',
              marginTop: '2rem'
            }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                11. Contact Us
              </h2>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div style={{ 
                background: '#ffd700',
                color: '#000',
                padding: '1.5rem',
                border: '3px solid #fff',
                fontSize: '1.125rem',
                lineHeight: 1.8
              }}>
                <p style={{ margin: '0.5rem 0' }}><strong>Email:</strong> privacy@misoapps.com</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Address:</strong> 123 Tech Street, San Francisco, CA 94105, USA</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Data Protection Officer:</strong> dpo@misoapps.com</p>
              </div>
            </section>

            {/* Compliance Badges */}
            <section style={{
              padding: '2rem',
              background: '#f8f9fa',
              border: '4px solid #000',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                We comply with:
              </h3>
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                {['GDPR', 'CCPA', 'HIPAA', 'SOC 2', 'ISO 27001'].map((badge, i) => (
                  <div key={i} style={{
                    padding: '0.75rem 1.5rem',
                    background: '#fff',
                    border: '3px solid #000',
                    fontWeight: 700,
                    fontSize: '1.125rem'
                  }}>
                    {badge}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
