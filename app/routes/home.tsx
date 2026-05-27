import type { Route } from "./+types/home";
import type { CSSProperties } from "react";
import { Link } from "react-router";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Gauge,
  Headphones,
  LockKeyhole,
  MessageSquareText,
  PackageCheck,
  Sparkles,
  TrendingUp,
  Workflow
} from "lucide-react";
import homeStyles from "./home.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Miso Apps - Professional Shopify app studio" },
    {
      name: "description",
      content:
        "Miso Apps builds reliable Shopify and commerce apps for automation, conversion, AI discoverability, and merchant operations."
    }
  ];
}

const capabilities = [
  {
    icon: Workflow,
    title: "Operational automation",
    description:
      "Rule engines, bulk actions, and admin workflows that remove repetitive store work without hiding control from merchants."
  },
  {
    icon: TrendingUp,
    title: "Conversion-focused surfaces",
    description:
      "Storefront components built to stay fast, theme-aware, and measurable across mobile and desktop purchase paths."
  },
  {
    icon: LockKeyhole,
    title: "Platform-safe engineering",
    description:
      "Apps designed around Shopify limits, permissions, privacy expectations, and long-term platform compatibility."
  },
  {
    icon: Headphones,
    title: "Support that understands commerce",
    description:
      "Clear implementation help, practical debugging, and product updates shaped by real merchant cases."
  }
];

const products = [
  "SO: Auto Tags | All-in-One",
  "SO: Sticky Add To Cart",
  "SO: Product History & Revert",
  "SO: llms.txt"
];

export default function Home() {
  return (
    <>
      <Navigation />

      <main className={homeStyles.pageShell}>
        <section className={homeStyles.heroSection}>
          <div className={homeStyles.heroCopy}>
            <span className={homeStyles.eyebrow}>Shopify app studio</span>
            <h1>Commerce apps built for stores that have to keep moving.</h1>
            <p>
              Miso Apps designs and ships focused Shopify and Shopline apps for
              automation, conversion, and AI-readable storefront data. The work
              is clean, fast, and built around merchant operations.
            </p>
            <div className={homeStyles.heroActions}>
              <Link className={homeStyles.primaryAction} to="/products">
                View our apps <ArrowRight size={18} strokeWidth={2} />
              </Link>
              <Link className={homeStyles.textAction} to="/about">
                About the studio
              </Link>
            </div>
          </div>

          <div className={homeStyles.heroVisual} aria-label="Miso Apps product operations preview">
            <div className={homeStyles.visualToolbar}>
              <span />
              <span />
              <span />
              <strong>merchant console</strong>
            </div>
            <div className={homeStyles.signalPanel}>
              <div>
                <span className={homeStyles.panelLabel}>Automation load</span>
                <strong>8,742</strong>
              </div>
              <BarChart3 size={42} strokeWidth={1.5} />
            </div>
            <div className={homeStyles.metricRow}>
              <div>
                <span>Avg. rating</span>
                <strong>5.0</strong>
              </div>
              <div>
                <span>Theme impact</span>
                <strong>0.06s</strong>
              </div>
            </div>
            <div className={homeStyles.workflowCard}>
              {products.map((product, index) => (
                <div className={homeStyles.workflowItem} key={product} style={{ "--index": index } as CSSProperties}>
                  <CheckCircle2 size={18} strokeWidth={2} />
                  <span>{product}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={homeStyles.trustBand} aria-label="Company highlights">
          <div>
            <strong>10K+</strong>
            <span>merchant stores reached</span>
          </div>
          <div>
            <strong>50+</strong>
            <span>countries using our apps</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>support coverage</span>
          </div>
          <div>
            <strong>5.0</strong>
            <span>current app ratings</span>
          </div>
        </section>

        <section className={homeStyles.capabilitiesSection}>
          <div className={homeStyles.sectionIntro}>
            <span className={homeStyles.eyebrow}>What we build</span>
            <h2>Small, sharp products for high-friction commerce work.</h2>
            <p>
              The website now reflects the way the company should show up:
              professional, technical, and calm enough for merchants to trust.
            </p>
          </div>

          <div className={homeStyles.capabilityGrid}>
            {capabilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <article className={homeStyles.capabilityCard} key={item.title} style={{ "--index": index } as CSSProperties}>
                  <Icon size={28} strokeWidth={1.7} />
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className={homeStyles.processSection}>
          <div className={homeStyles.processVisual}>
            <div className={homeStyles.orbitCard}>
              <PackageCheck size={30} strokeWidth={1.6} />
              <span>Ship useful apps</span>
            </div>
            <div className={homeStyles.orbitCard}>
              <Gauge size={30} strokeWidth={1.6} />
              <span>Keep storefronts fast</span>
            </div>
            <div className={homeStyles.orbitCard}>
              <MessageSquareText size={30} strokeWidth={1.6} />
              <span>Support real merchants</span>
            </div>
          </div>
          <div className={homeStyles.processCopy}>
            <span className={homeStyles.eyebrow}>How we work</span>
            <h2>Product decisions stay close to merchant reality.</h2>
            <p>
              We focus on narrow problems with clear business value, then keep
              the implementation maintainable: stable permissions, clean UI,
              practical analytics, and support paths that do not leave merchants
              guessing.
            </p>
            <Link className={homeStyles.secondaryAction} to="/products">
              Explore product suite <ArrowRight size={18} strokeWidth={2} />
            </Link>
          </div>
        </section>

        <section className={homeStyles.quoteSection}>
          <Sparkles size={28} strokeWidth={1.7} />
          <blockquote>
            "Miso Apps helped us automate the repetitive store work without
            adding weight to the buying experience. The tools feel practical,
            not decorative."
          </blockquote>
          <p>Growth lead, independent home goods brand</p>
        </section>

        <section className={homeStyles.ctaSection}>
          <div>
            <span className={homeStyles.eyebrow}>Ready to evaluate</span>
            <h2>Find the app that fits your store workflow.</h2>
          </div>
          <Link className={homeStyles.primaryAction} to="/products">
            Browse apps <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
