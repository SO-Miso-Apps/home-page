import type { Route } from "./+types/about";
import { Link } from "react-router";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import {
  ArrowRight,
  Code2,
  Compass,
  DatabaseZap,
  Lock,
  MessageCircle,
  Store,
  Target,
  Users
} from "lucide-react";
import aboutStyles from "./about.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About - Miso Apps" },
    {
      name: "description",
      content:
        "Miso Apps is a commerce app studio building professional Shopify and Shopline products for automation, conversion, and merchant operations."
    }
  ];
}

const values = [
  {
    icon: Target,
    title: "Focused product scope",
    text: "We prefer apps that solve a specific merchant problem clearly over large feature sets that make daily work harder."
  },
  {
    icon: Code2,
    title: "Maintainable engineering",
    text: "Platform APIs, permission surfaces, performance budgets, and support tooling are part of product quality from day one."
  },
  {
    icon: MessageCircle,
    title: "Merchant-level support",
    text: "Support is written for the person running the store, with clear steps and practical answers instead of vague tickets."
  },
  {
    icon: Lock,
    title: "Trust by design",
    text: "We keep data access intentional, explain what apps need, and avoid patterns that create privacy or theme-risk surprises."
  }
];

const stats = [
  { number: "10K+", label: "stores reached" },
  { number: "50+", label: "countries served" },
  { number: "5.0", label: "public app rating" },
  { number: "24/7", label: "support coverage" }
];

export default function About() {
  return (
    <>
      <Navigation />

      <main className={aboutStyles.pageShell}>
        <section className={aboutStyles.heroSection}>
          <div>
            <span className={aboutStyles.eyebrow}>About Miso Apps</span>
            <h1>A commerce app studio built around practical merchant work.</h1>
          </div>
          <div className={aboutStyles.heroPanel}>
            <Compass size={34} strokeWidth={1.6} />
            <p>
              We design, build, and maintain focused apps for Shopify and
              Shopline merchants. The team cares about speed, predictable
              interfaces, and software that keeps working after the launch.
            </p>
          </div>
        </section>

        <section className={aboutStyles.storySection}>
          <div className={aboutStyles.storyCopy}>
            <span className={aboutStyles.eyebrow}>Our point of view</span>
            <h2>Good commerce software should feel quiet, capable, and easy to trust.</h2>
          </div>
          <div className={aboutStyles.storyText}>
            <p>
              Miso Apps started from direct Shopify implementation work: stores
              needed better tools for repetitive operations, cleaner buying
              paths, and new AI-readable surfaces without adding operational
              drag.
            </p>
            <p>
              Today we keep that same standard. Each product is scoped around a
              real merchant workflow, shaped by platform constraints, and
              maintained with the expectation that stores cannot pause for
              fragile software.
            </p>
          </div>
        </section>

        <section className={aboutStyles.valuesSection}>
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <article className={aboutStyles.valueCard} key={value.title}>
                <Icon size={28} strokeWidth={1.7} />
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            );
          })}
        </section>

        <section className={aboutStyles.impactSection}>
          <div className={aboutStyles.impactCopy}>
            <span className={aboutStyles.eyebrow}>Impact</span>
            <h2>Built for merchants across markets and operating styles.</h2>
            <p>
              We support stores that care about faster admin work, storefront
              conversion, structured data, and dependable implementation help.
            </p>
          </div>
          <div className={aboutStyles.statsGrid}>
            {stats.map((stat) => (
              <div className={aboutStyles.statCard} key={stat.label}>
                <strong>{stat.number}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={aboutStyles.teamSection}>
          <div className={aboutStyles.teamCard}>
            <Users size={30} strokeWidth={1.7} />
            <h3>Product, engineering, and support stay close together.</h3>
            <p>
              The same feedback loops that identify product gaps also guide UI
              cleanup, documentation, support answers, and maintenance work.
            </p>
          </div>
          <div className={aboutStyles.teamCard}>
            <DatabaseZap size={30} strokeWidth={1.7} />
            <h3>We measure what affects the store.</h3>
            <p>
              Storefront speed, workflow reliability, permission needs, and
              merchant clarity matter more than decorative feature volume.
            </p>
          </div>
          <div className={aboutStyles.teamCard}>
            <Store size={30} strokeWidth={1.7} />
            <h3>Commerce context shapes every decision.</h3>
            <p>
              Apps are designed for the messy reality of themes, catalogs,
              promotions, order operations, and changing platform rules.
            </p>
          </div>
        </section>

        <section className={aboutStyles.ctaSection}>
          <h2>See the apps we maintain for modern commerce teams.</h2>
          <Link className={aboutStyles.primaryAction} to="/products">
            Explore products <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
