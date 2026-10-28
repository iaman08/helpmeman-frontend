import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Dumbbell, HeartPulse, Scale } from "lucide-react";
import styles from "./MarketingSections.module.css";

const INSTITUTIONS = [
  { name: "Google", category: "Engineering & AI", logo: "/logos/google.svg" },
  { name: "Microsoft", category: "Cloud & development", logo: "/logos/microsoft.svg" },
  { name: "Amazon", category: "Systems & AWS", logo: "/logos/amazon.svg" },
  { name: "Meta", category: "Frontend & AI", logo: "/logos/meta.svg" },
  { name: "IIT Bombay", category: "CSE & engineering", logo: "/logos/iit-bombay.svg" },
  { name: "IIT Delhi", category: "Technology & research", logo: "/logos/iit-delhi.svg" },
  { name: "IIT Madras", category: "Technology & AI", logo: "/logos/iit-madras.svg" },
  { name: "AIIMS New Delhi", category: "Medical guidance", logo: "/aiimsdelhi.png" },
  { name: "NLSIU Law", category: "Law & legal advisory", logo: "/nlsiu.png" },
];

const PRACTICES = [
  { name: "Fitness & training", category: "Coaches & trainers", icon: Dumbbell },
  { name: "Clinical nutrition", category: "Healthcare & wellbeing", icon: HeartPulse },
  { name: "Legal & advocate counsel", category: "CLAT & legal advisory", icon: Scale },
];

/** A finite wall of existing institutions and disciplines, with unique labels. */
export function FloatingLogosSection() {
  return (
    <section className={styles.institutionSection} aria-labelledby="experience-heading">
      <div className={styles.sectionInner}>
        <div className={styles.institutionHeader}>
          <div>
            <h2 id="experience-heading">Different paths.<br />The right perspective.</h2>
            <p>Explore guidance across technology, healthcare, law, fitness and leading universities.</p>
          </div>
          <Link href="/mentors" className={styles.textAction}>Explore the community <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        <ul className={styles.institutionGrid}>
          {INSTITUTIONS.map((institution) => (
            <li key={institution.name}>
              <span className={styles.institutionLogo}><Image src={institution.logo} alt="" width={27} height={27} /></span>
              <span><strong>{institution.name}</strong><span>{institution.category}</span></span>
            </li>
          ))}
          {PRACTICES.map((practice) => (
            <li key={practice.name}>
              <span className={`${styles.institutionLogo} ${styles.practiceIcon}`}><practice.icon size={23} aria-hidden="true" /></span>
              <span><strong>{practice.name}</strong><span>{practice.category}</span></span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
