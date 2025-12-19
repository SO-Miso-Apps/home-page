import type { Route } from "./+types/privacy";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { NeubrutalistBadge } from "../components/Neubrutalism";
import {
  Wrench,
  MessageCircle,
  Lock,
  BarChart3,
  Scale,
  Target
} from "lucide-react";
import privacyStyles from "./privacy.module.css";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Privacy Policy - Miso Apps" },
    { name: "description", content: "Learn how Miso Apps protects your privacy and handles your data. Our comprehensive privacy policy." },
  ];
}

export default function Privacy() {
  const lastUpdated = "November 10, 2025";

  const usageItems = [
    { icon: Wrench, title: 'Service Delivery', text: 'To provide, maintain, and improve our services' },
    { icon: MessageCircle, title: 'Communication', text: 'To respond to inquiries and send important updates' },
    { icon: Lock, title: 'Security', text: 'To detect and prevent fraud, abuse, and security threats' },
    { icon: BarChart3, title: 'Analytics', text: 'To analyze usage patterns and improve user experience' },
    { icon: Scale, title: 'Legal Compliance', text: 'To comply with legal obligations and enforce our terms' },
    { icon: Target, title: 'Marketing', text: 'To send promotional materials (with your consent)' }
  ];

  const rights = [
    { title: 'Access', description: 'Request a copy of your personal data we hold' },
    { title: 'Correction', description: 'Update or correct inaccurate information' },
    { title: 'Deletion', description: 'Request deletion of your personal data' },
    { title: 'Portability', description: 'Receive your data in a portable format' },
    { title: 'Opt-Out', description: 'Unsubscribe from marketing communications' },
    { title: 'Object', description: 'Object to certain data processing activities' }
  ];

  return (
    <>
      <Navigation />

      <main className={privacyStyles.privacyContainer}>
        <div className={privacyStyles.privacyContent}>
          {/* Header */}
          <div className={privacyStyles.privacyHeader}>
            <NeubrutalistBadge variant="outline" size="large">Legal</NeubrutalistBadge>
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
          <div className={privacyStyles.sectionsContainer}>
            {/* Section 1 */}
            <section className={privacyStyles.section}>
              <h2 className={privacyStyles.sectionTitle}>
                1. Information We Collect
              </h2>

              <h3 className={privacyStyles.subsectionTitle}>
                1.1 Information You Provide
              </h3>
              <p className={privacyStyles.paragraph}>
                We collect information that you voluntarily provide to us, including:
              </p>
              <ul className={privacyStyles.list}>
                <li>Name, email address, and contact information</li>
                <li>Account credentials and profile information</li>
                <li>Payment and billing information</li>
                <li>Communications with us (emails, support tickets, etc.)</li>
                <li>Content you create or upload to our services</li>
              </ul>

              <h3 className={privacyStyles.subsectionTitle}>
                1.2 Automatically Collected Information
              </h3>
              <p className={privacyStyles.paragraph}>
                When you use our services, we automatically collect certain information:
              </p>
              <ul className={privacyStyles.list}>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Log data and analytics information</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className={privacyStyles.section}>
              <h2 className={privacyStyles.sectionTitle}>
                2. How We Use Your Information
              </h2>
              <p className={privacyStyles.paragraph}>
                We use the collected information for the following purposes:
              </p>
              <div className={privacyStyles.usageGrid}>
                {usageItems.map((item, i) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={i} className={privacyStyles.usageCard}>
                      <IconComponent className={privacyStyles.usageIcon} size={28} strokeWidth={1.5} />
                      <div>
                        <h4 className={privacyStyles.usageCardTitle}>{item.title}</h4>
                        <p className={privacyStyles.usageCardText}>{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section 3 */}
            <section className={privacyStyles.section}>
              <h2 className={privacyStyles.sectionTitle}>
                3. Data Sharing and Disclosure
              </h2>
              <p className={privacyStyles.paragraph}>
                We do not sell your personal information. We may share your data only in the following circumstances:
              </p>
              <ul className={privacyStyles.list}>
                <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in operating our services (e.g., cloud hosting, payment processing)</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className={privacyStyles.section}>
              <h2 className={privacyStyles.sectionTitle}>
                4. Data Security
              </h2>
              <p className={privacyStyles.paragraph}>
                We implement industry-standard security measures to protect your personal information:
              </p>
              <div className={privacyStyles.securityBox}>
                <ul className={privacyStyles.securityList}>
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
            <section className={privacyStyles.section}>
              <h2 className={privacyStyles.sectionTitle}>
                5. Your Rights and Choices
              </h2>
              <p className={privacyStyles.paragraph}>
                You have the following rights regarding your personal information:
              </p>
              <div className={privacyStyles.rightsGrid}>
                {rights.map((right, i) => (
                  <div key={i} className={privacyStyles.rightCard}>
                    <strong>{right.title}:</strong>
                    <span>{right.description}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 6 */}
            <section className={privacyStyles.section}>
              <h2 className={privacyStyles.sectionTitle}>
                6. Cookies and Tracking
              </h2>
              <p className={privacyStyles.paragraph}>
                We use cookies and similar technologies to enhance your experience. You can control cookie preferences through your browser settings.
              </p>
              <p className={privacyStyles.paragraph}>
                Types of cookies we use:
              </p>
              <ul className={privacyStyles.list}>
                <li><strong>Essential Cookies:</strong> Required for basic functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
                <li><strong>Marketing Cookies:</strong> Used for targeted advertising</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className={privacyStyles.section}>
              <h2 className={privacyStyles.sectionTitle}>
                7. Data Retention
              </h2>
              <p className={privacyStyles.paragraph}>
                We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. When data is no longer needed, we securely delete or anonymize it.
              </p>
            </section>

            {/* Section 8 */}
            <section className={privacyStyles.section}>
              <h2 className={privacyStyles.sectionTitle}>
                8. International Data Transfers
              </h2>
              <p className={privacyStyles.paragraph}>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data, including Standard Contractual Clauses approved by the European Commission and other legally recognized transfer mechanisms.
              </p>
            </section>

            {/* Section 9 */}
            <section className={privacyStyles.section}>
              <h2 className={privacyStyles.sectionTitle}>
                9. Children's Privacy
              </h2>
              <p className={privacyStyles.paragraph}>
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.
              </p>
            </section>

            {/* Section 10 */}
            <section className={privacyStyles.section}>
              <h2 className={privacyStyles.sectionTitle}>
                10. Changes to This Policy
              </h2>
              <p className={privacyStyles.paragraph}>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            {/* Contact Section */}
            <section className={privacyStyles.contactSection}>
              <h2 className={privacyStyles.contactTitle}>
                11. Contact Us
              </h2>
              <p className={privacyStyles.contactText}>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className={privacyStyles.contactBox}>
                <p><strong>Email:</strong> hi@misoapps.com</p>
                <p><strong>Phone:</strong> +84 35-7654-619</p>
                <p><strong>Address:</strong> Hanoi, Vietnam</p>
              </div>
            </section>

            {/* Compliance Badges */}
            <section className={privacyStyles.complianceSection}>
              <h3 className={privacyStyles.complianceTitle}>
                We comply with:
              </h3>
              <div className={privacyStyles.complianceBadges}>
                {['GDPR', 'CCPA', 'HIPAA', 'SOC 2', 'ISO 27001'].map((badge, i) => (
                  <div key={i} className={privacyStyles.complianceBadge}>
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
