import Image from "next/image";
import styles from "./MarketingSections.module.css";

const COMMUNITY_STATS = [
  { value: "100+", label: "mentors" },
  { value: "200+", label: "sessions" },
  { value: "4400+", label: "minutes" },
];

const DISCIPLINES = [
  { name: "Technology", logo: "/logos/google.svg" },
  { name: "Medicine", logo: "/aiimsdelhi.png" },
  { name: "Law", logo: "/nlsiu.png" },
  { name: "Academia", logo: "/logos/iit-bombay.svg" },
];

/** All community figures are readable immediately; this is a reading surface. */
export function FloatingStatsSection() {
  return (
    <section className={styles.trustBand} aria-labelledby="community-heading">
      <div className={styles.trustInner}>
        <div className={styles.trustIntro}>
          <h2 id="community-heading">A growing community.</h2>
          <p>Built one conversation at a time.</p>
        </div>
        <dl className={styles.communityStats}>
          {COMMUNITY_STATS.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
        <div className={styles.disciplines} aria-label="Mentoring across disciplines">
          {DISCIPLINES.map((discipline) => (
            <span key={discipline.name}>
              <span className={styles.disciplineLogo}><Image src={discipline.logo} alt="" width={18} height={18} /></span>
              {discipline.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
