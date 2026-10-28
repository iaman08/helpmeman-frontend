"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useCallback, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { HERO_EXAMPLES, HeroPhoneDemo } from "./HeroPhoneDemo";
import styles from "./HeroSection.module.css";

const TRUST_LOGOS = [
  ["Google", "/logos/google.svg"],
  ["Microsoft", "/logos/microsoft.svg"],
  ["Amazon", "/logos/amazon.svg"],
  ["Meta", "/logos/meta.svg"],
  ["IIT Bombay", "/logos/iit-bombay.svg"],
];

export function HeroSection() {
  const { user, mentor, loading } = useAuth();
  const [example, setExample] = useState({ index: 0, instant: false });
  const onExampleChange = useCallback((index: number, instant: boolean) => {
    setExample((current) => current.index === index && current.instant === instant ? current : { index, instant });
  }, []);
  const dashboardPath = user
    ? user.role === "SUPER_ADMIN" ? "/superadmin"
      : user.role === "ADMIN" ? "/admin"
      : user.role === "MENTOR" && mentor ? mentor.approvalStatus === "APPROVED" ? "/mentor" : "/mentor/status"
      : "/dashboard"
    : null;

  return (
    <section className={styles.hero} data-instant={example.instant}>
      <div className={styles.content}>
        <div className={styles.eyebrow}><span aria-hidden="true" /> Real people. A little more direction.</div>
        <h1 className={styles.heading}>
          <span className="sr-only">Find your mentor. For your career move, big idea, or next chapter.</span>
          <span aria-hidden="true">
            <span className={styles.headingLine}>Find your mentor.</span>
            <span className={styles.headingLine}>For your <span className={styles.words}>{HERO_EXAMPLES.map((item, index) => <span key={item.word} className={styles.word} data-active={index === example.index}>{item.word}</span>)}</span></span>
          </span>
        </h1>
        <p className={styles.description}>Big questions feel smaller with the right person.<br className="hidden sm:block" /> Connect with mentors who have been where you want to go.</p>
        <div className={styles.actions}>
          <Link href={!loading && dashboardPath ? dashboardPath : "/?auth=signup"} className={styles.primary}>{!loading && dashboardPath ? "Go to Dashboard" : "Find your mentor"}<ArrowRight size={15} /></Link>
          <Link href="/#pricing" className={styles.secondary}>See our plans <ArrowRight size={15} /></Link>
        </div>
        <HeroPhoneDemo onExampleChange={onExampleChange} />
        <p className={styles.trustLabel}>Our mentors bring experience from</p>
        <div className={styles.trustLogos}>{TRUST_LOGOS.map(([name, logo]) => <span className={styles.trustLogo} key={name}><Image src={logo} alt="" width={17} height={17} />{name}</span>)}</div>
      </div>
    </section>
  );
}
