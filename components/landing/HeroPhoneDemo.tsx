"use client";

import { useEffect, useRef, useState, type FocusEvent, type MouseEvent, type PointerEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Pause, Play, RotateCcw, Sparkles, Star } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { MentorOrbit } from "./MentorOrbit";
import { HERO_EXAMPLES, HERO_PHASES, type HeroPreviewPhase } from "./hero-preview";
import styles from "./HeroSection.module.css";

export { HERO_EXAMPLES } from "./hero-preview";

interface Props {
  onExampleChange: (index: number, instant: boolean) => void;
}

/** A finite product explanation. The real directory is always one click away. */
export function HeroPhoneDemo({ onExampleChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const nearViewport = useInView(ref, { once: true, margin: "200px" });
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [focusWithin, setFocusWithin] = useState(false);
  const [hoverReading, setHoverReading] = useState(false);
  const [instantChange, setInstantChange] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const exampleIndex = reduceMotion && !inspecting ? 0 : Math.floor(step / 3);
  const phase = (reduceMotion && !inspecting ? 2 : step % 3) as HeroPreviewPhase;
  const example = HERO_EXAMPLES[exampleIndex];
  const complete = step === HERO_EXAMPLES.length * HERO_PHASES.length - 1 && !playing;
  const reading = focusWithin || hoverReading;
  const advancing = playing && !reading && inView && pageVisible && !reduceMotion;
  const orbitRunning = playing && !focusWithin && inView && pageVisible && !reduceMotion;

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    onExampleChange(exampleIndex, instantChange);
  }, [exampleIndex, instantChange, onExampleChange]);

  useEffect(() => {
    if (!advancing) return;
    const timer = window.setTimeout(() => {
      setInstantChange(false);
      if (step === HERO_EXAMPLES.length * HERO_PHASES.length - 1) setPlaying(false);
      else setStep((value) => value + 1);
    }, HERO_PHASES[phase].hold);
    return () => window.clearTimeout(timer);
  }, [step, phase, advancing]);

  const onFocus = () => setFocusWithin(true);
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusWithin(false);
  };
  const onReadingEnter = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) setHoverReading(true);
  };
  const onReadingLeave = () => setHoverReading(false);
  const selectPhase = (nextPhase: HeroPreviewPhase, event: MouseEvent<HTMLButtonElement>) => {
    setInstantChange(event.detail === 0);
    setInspecting(true);
    setPlaying(false);
    setStep(exampleIndex * HERO_PHASES.length + nextPhase);
  };
  const togglePlayback = (event: MouseEvent<HTMLButtonElement>) => {
    setInstantChange(event.detail === 0);
    if (complete) setStep(0);
    setPlaying((value) => !value);
  };

  return (
    <div ref={ref} className={styles.demo} data-playing={advancing} data-phase={phase} data-instant={instantChange}>
      <MentorOrbit enabled={nearViewport && reduceMotion === false} running={orbitRunning} />
      <div className={styles.demoGlow} aria-hidden="true" />
      <div className={`${styles.annotation} ${styles.annotationLeft}`} aria-hidden="true">
        <span className={styles.questionIcon}><Sparkles size={18} /></span>
        <strong>Your question.</strong>
        <p>In your own words.</p>
        <svg className={styles.annotationArrow} viewBox="0 0 110 48" fill="none"><path d="M4 5C34 6 43 40 100 27M93 22L102 27L96 34" /></svg>
      </div>

      <div className={styles.phone} role="group" aria-label="Example of finding a mentor with Ruth AI" onFocusCapture={onFocus} onBlurCapture={onBlur} onPointerEnter={onReadingEnter} onPointerLeave={onReadingLeave}>
        <div className={styles.phoneStatus} aria-hidden="true"><span>9:41</span><i /><span>▮▮▮ ▰</span></div>
        <div className={styles.phoneScreen}>
          <div className={styles.phoneNav}><Image src="/logo.svg" alt="" width={22} height={22} /><strong>HelpMeMan</strong><span>Product preview</span></div>
          <div className={styles.phoneGreeting}><span>A little clarity starts here</span><h3>Let’s figure out<br />your next step.</h3></div>
          <div className={styles.phonePrompt} key={`query-${exampleIndex}`}><Sparkles size={15} aria-hidden="true" /><p>{example.query}</p></div>
          <div className={styles.phoneMatchStatus}>
            {phase === 1 ? <span className={styles.matchDots} aria-hidden="true"><i /><i /><i /></span> : <Check size={12} aria-hidden="true" />}
            <span>{phase === 0 ? "One question. A place to begin." : phase === 1 ? "Finding someone who’s been there…" : "Relevant experience. A real person."}</span>
          </div>
          <div className={styles.previewCard} data-revealed={phase === 2} aria-hidden={phase !== 2}>
            <div className={styles.previewCover}><span>Example match</span><Sparkles size={20} /></div>
            <div className={styles.previewProfile} key={`mentor-${exampleIndex}`}>
              <Image src={example.avatar} alt="" className={styles.previewAvatar} width={46} height={46} />
              <span className={styles.previewVerified}><Check size={10} /> Verified mentor</span>
              <strong>{example.name}</strong><p>{example.role}</p><span className={styles.previewSkill}>{example.skill}</span>
            </div>
            <div className={styles.previewFooter}><span><Star size={10} /> 1:1 guidance</span><span>Made for your next step</span></div>
          </div>
          <Link href="/mentors" className={styles.phoneAction}>Explore mentors <ArrowRight size={13} /></Link>
          <div className={styles.homeIndicator} aria-hidden="true" />
        </div>
      </div>

      <div className={`${styles.annotation} ${styles.annotationRight}`} aria-hidden="true">
        <div className={styles.peopleAvatars}>
          {HERO_EXAMPLES.map((item) => <Image key={item.name} src={item.avatar} alt="" width={34} height={34} />)}
        </div>
        <strong>Someone who gets it.</strong>
        <p>Real experience. Human advice.</p>
        <svg className={`${styles.annotationArrow} ${styles.arrowBack}`} viewBox="0 0 110 48" fill="none"><path d="M4 5C34 6 43 40 100 27M93 22L102 27L96 34" /></svg>
      </div>

      <div className={styles.demoFooter}>
        <div className={styles.playbackBar}>
          <div className={styles.demoSteps} role="group" aria-label="Product preview steps">
            {HERO_PHASES.map((item, index) => <button key={item.label} type="button" aria-pressed={phase === index} onClick={(event) => selectPhase(index as HeroPreviewPhase, event)}><span aria-hidden="true">0{index + 1}</span>{item.label}</button>)}
          </div>
          {!reduceMotion && <button type="button" className={styles.demoControl} aria-label={complete ? "Replay product preview" : playing ? "Pause product preview" : "Play product preview"} onClick={togglePlayback}>{complete ? <RotateCcw size={13} /> : playing ? <Pause size={13} /> : <Play size={13} />}</button>}
        </div>
        <p className={styles.demoCaption}>{reading && playing && !reduceMotion ? "Paused while you explore" : complete ? "Your next step starts with a conversation" : "A question. A connection. A way forward."}</p>
      </div>
    </div>
  );
}
