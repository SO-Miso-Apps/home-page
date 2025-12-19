import type { Route } from "./+types/about";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import {
  NeubrutalistCard,
  NeubrutalistButton,
  NeubrutalistBadge
} from "../components/Neubrutalism";
import {
  Trophy,
  Target,
  Telescope,
  Lightbulb,
  Star,
  Handshake,
  Lock,
  TrendingUp,
  Briefcase,
  Code,
  Palette,
  Settings,
  Store,
  Download,
  Users,
  Globe,
  DollarSign
} from "lucide-react";
import aboutStyles from "./about.module.css";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "About Us - Miso Apps | Shopify App Development Experts" },
    { name: "description", content: "Learn about Miso Apps - leading Shopify app developers. Our mission, vision, values, and the expert team behind innovative Shopify solutions." },
  ];
}

export default function About() {
  const teamMembers = [
    { name: 'Alex Morgan', role: 'CEO & Founder', icon: Briefcase, description: 'Former Shopify developer with 10+ years' },
    { name: 'Jamie Lee', role: 'CTO', icon: Code, description: 'Shopify API specialist & architect' },
    { name: 'Sam Rivera', role: 'Head of Product', icon: Palette, description: 'UX expert focused on merchant needs' },
    { name: 'Taylor Chen', role: 'VP of Engineering', icon: Settings, description: 'Leading our app development team' }
  ];

  const stats = [
    { number: '10K+', label: 'Shopify Stores', icon: Store },
    { number: '5M+', label: 'App Installations', icon: Download },
    { number: '30+', label: 'Shopify Experts', icon: Users },
    { number: '50+', label: 'Countries Served', icon: Globe },
    { number: '4.9', label: 'Average Rating', icon: Star },
    { number: '$500M+', label: 'Revenue Generated', icon: DollarSign }
  ];

  return (
    <>
      <Navigation />

      <main className={aboutStyles.aboutContainer}>
        {/* Hero Section */}
        <section className={aboutStyles.heroSection}>
          <div className={aboutStyles.heroContent}>
            <NeubrutalistBadge variant="default" size="large">About Miso Apps</NeubrutalistBadge>
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
              <Trophy className={aboutStyles.storyCardIcon} size={48} strokeWidth={1.5} />
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
                <Target className={aboutStyles.missionCardIcon} size={40} strokeWidth={1.5} />
                <h3 className={aboutStyles.missionCardTitle}>
                  Our Mission
                </h3>
                <p className={aboutStyles.missionCardText}>
                  To empower Shopify merchants with innovative apps that drive sales, enhance customer experiences, and automate operations. We believe every merchant deserves access to enterprise-level tools, regardless of their store size. Our mission is to level the playing field and help small businesses compete with larger retailers.
                </p>
              </div>

              <div className={aboutStyles.missionCard}>
                <Telescope className={aboutStyles.missionCardIcon} size={40} strokeWidth={1.5} />
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
        <section className={aboutStyles.valuesSection}>
          <div className={aboutStyles.valuesHeader}>
            <NeubrutalistBadge variant="outline" size="large">Core Values</NeubrutalistBadge>
            <h2>What Drives Us</h2>
            <p>Our values guide every decision we make and every solution we create.</p>
          </div>

          <div className={aboutStyles.valuesGrid}>
            <NeubrutalistCard
              icon={<Lightbulb />}
              title="Innovation"
              description="We stay ahead of e-commerce trends and Shopify updates, continuously innovating to give merchants competitive advantages in their markets."
            />
            <NeubrutalistCard
              icon={<Target />}
              title="Merchant-First"
              description="Every decision we make puts Shopify merchants at the center. We build apps that solve real problems and deliver measurable results."
            />
            <NeubrutalistCard
              icon={<Star />}
              title="Excellence"
              description="We maintain the highest standards in code quality, app performance, and customer support, ensuring reliable solutions merchants can trust."
            />
            <NeubrutalistCard
              icon={<Handshake />}
              title="Partnership"
              description="We view merchants as partners, not just customers. Their success is our success, and we're committed to their long-term growth."
            />
            <NeubrutalistCard
              icon={<Lock />}
              title="Security & Privacy"
              description="We take data security seriously, following Shopify's strict guidelines and implementing best practices to protect merchant and customer data."
            />
            <NeubrutalistCard
              icon={<TrendingUp />}
              title="Continuous Improvement"
              description="We actively listen to merchant feedback and continuously update our apps with new features, improvements, and optimizations."
            />
          </div>
        </section>

        {/* Team Section */}
        <section className={aboutStyles.teamSection}>
          <div className={aboutStyles.teamContainer}>
            <div className={aboutStyles.teamHeader}>
              <h2>Meet Our Leadership Team</h2>
              <p>Experienced professionals driving innovation and excellence</p>
            </div>

            <div className={aboutStyles.teamGrid}>
              {teamMembers.map((member, index) => {
                const IconComponent = member.icon;
                return (
                  <div key={index} className={aboutStyles.teamCard}>
                    <IconComponent className={aboutStyles.teamCardIcon} size={48} strokeWidth={1.5} />
                    <h3 className={aboutStyles.teamCardName}>{member.name}</h3>
                    <p className={aboutStyles.teamCardRole}>{member.role}</p>
                    <p className={aboutStyles.teamCardDescription}>{member.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className={aboutStyles.statsSection}>
          <div className={aboutStyles.statsHeader}>
            <h2>Our Impact by the Numbers</h2>
          </div>

          <div className={aboutStyles.statsGrid}>
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className={aboutStyles.statCard}>
                  <IconComponent className={aboutStyles.statIcon} size={28} strokeWidth={1.5} />
                  <div className={aboutStyles.statNumber}>{stat.number}</div>
                  <div className={aboutStyles.statLabel}>{stat.label}</div>
                </div>
              );
            })}
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
