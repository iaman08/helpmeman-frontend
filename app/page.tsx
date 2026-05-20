"use client";

import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/components/ThemeProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowRight, Infinity as InfinityIcon, Star, X, Check, ShieldCheck, Sun, Moon } from "lucide-react";
import Link from "next/link";

const ChromeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="21.17" x2="12" y1="8" y2="8" /><line x1="3.95" x2="8.54" y1="6.06" y2="14" /><line x1="10.88" x2="15.46" y1="21.94" y2="14" /></svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
);


const mentors = [
    {
        name: 'Mr.Beast',
        role: 'SDE (50+ LPA)',
        company: 'Cohesity',
        badge: 'COHESITY | SDE',
        img: '/mentor2.png',
        stars: 5,
    },
    {
        name: 'Anwesh Das',
        role: 'SDE (1Cr+)',
        company: 'Rubrik',
        badge: 'RUBRIK | SDE',
        img: '/mentor3.png',
        stars: 5,
    },
    {
        name: 'Priya Kapoor',
        role: 'Staff Engineer',
        company: 'Meta',
        badge: 'META | STAFF ENG',
        img: 'https://i.pinimg.com/736x/0d/a5/e7/0da5e7b3a24ea9ef05db4eaa253e9cf3.jpg',
        stars: 5,
    },
    {
        name: 'Harkirat Singh',
        role: 'Staff Engineer',
        company: 'Meta',
        badge: 'META | STAFF ENG',
        img: 'https://i.pinimg.com/736x/fc/86/7d/fc867df822d70b9d78171c7e790f99c7.jpg',
        stars: 5,
    },
    {
        name: 'Harnoor Singh',
        role: 'Product Manager',
        company: 'Google',
        badge: 'GOOGLE | PM',
        img: 'https://i.pinimg.com/1200x/1c/85/2e/1c852ea928150dfcf54c5457dbca0a35.jpg',
        stars: 5,
    },
    {
        name: 'Priya Sharma',
        role: 'UX Lead',
        company: 'Google',
        badge: 'GOOGLE | UX LEAD',
        img: 'https://i.pinimg.com/736x/41/d0/ab/41d0abba8ff870ce4ef1cbea5b56fb29.jpg',
        stars: 5,
    },
    {
        name: 'Arjun Mehta',
        role: 'L7 Engineer',
        company: 'Google',
        badge: 'GOOGLE | L7 ENG',
        img: 'https://i.pinimg.com/736x/fc/86/7d/fc867df822d70b9d78171c7e790f99c7.jpg',
        stars: 5,
    },
    {
        name: 'Vikram Anand',
        role: 'YC Founder',
        company: 'YC S21',
        badge: 'YC | FOUNDER',
        img: 'https://i.pinimg.com/736x/0d/a5/e7/0da5e7b3a24ea9ef05db4eaa253e9cf3.jpg',
        stars: 5,
    },
    {
        name: 'Vineet',
        role: "GSoC '25 & '26",
        company: 'IIT Roorkee',
        badge: 'IIT ROORKEE | GSOC',
        img: '/mentor1.png',
        stars: 5,
    },
];

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [activeCard, setActiveCard] = useState<number | null>(null);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 640);
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Carousel state
    const [currentMentor, setCurrentMentor] = useState(0);
    const dragStartX = useRef<number | null>(null);
    const dragStartTime = useRef<number>(0);
    const isDragging = useRef(false);
    const trackRef = useRef<HTMLDivElement>(null);
    const wheelAccumulator = useRef(0);
    const wheelTimeout = useRef<NodeJS.Timeout | null>(null);

    const prevMentor = useCallback(() => {
        setCurrentMentor(i => (i - 1 + mentors.length) % mentors.length);
    }, []);

    const nextMentor = useCallback(() => {
        setCurrentMentor(i => (i + 1) % mentors.length);
    }, []);

    // Pointer drag handlers on the track
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        dragStartX.current = e.clientX;
        dragStartTime.current = Date.now();
        isDragging.current = false;
    };
    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (dragStartX.current === null) return;
        if (Math.abs(e.clientX - dragStartX.current) > 8) {
            isDragging.current = true;
        }
    };
    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (dragStartX.current === null) return;
        const delta = dragStartX.current - e.clientX;
        const duration = (Date.now() - dragStartTime.current) / 1000;
        const velocity = Math.abs(delta) / (duration || 0.1);

        if (Math.abs(delta) > 30) {
            // Force-based drag: calculate card shift based on distance + velocity
            const distanceShifts = Math.floor(Math.abs(delta) / 150);
            const velocityShifts = velocity > 1200 ? 2 : (velocity > 600 ? 1 : 0);
            let shiftCount = Math.max(1, distanceShifts + velocityShifts);
            shiftCount = Math.min(4, shiftCount);

            if (delta > 0) {
                setCurrentMentor(i => (i + shiftCount) % mentors.length);
            } else {
                setCurrentMentor(i => (i - shiftCount + mentors.length) % mentors.length);
            }
        } else {
            // Tap/click detection: determine which card region was tapped
            // Since cards have pointerEvents:none, we use position-based hit testing
            const trackRect = trackRef.current?.getBoundingClientRect();
            if (trackRect) {
                const tapX = e.clientX - trackRect.left;
                const trackCenter = trackRect.width / 2;
                const deadZone = 60; // center card region (no action needed)

                if (tapX < trackCenter - deadZone) {
                    // Tapped on the LEFT side → bring previous card to center
                    console.log('Tap left → prev card');
                    setCurrentMentor(i => (i - 1 + mentors.length) % mentors.length);
                } else if (tapX > trackCenter + deadZone) {
                    // Tapped on the RIGHT side → bring next card to center
                    console.log('Tap right → next card');
                    setCurrentMentor(i => (i + 1) % mentors.length);
                }
            }
        }
        dragStartX.current = null;
        setTimeout(() => { isDragging.current = false; }, 10);
    };

    // Touchpad / Trackpad horizontal swipe to navigate carousel
    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            // Only intercept horizontal swipes — let vertical scroll pass through for page scrolling
            if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 4) return;

            // Prevent browser back/forward navigation on horizontal swipe
            e.preventDefault();

            // Clear any active decay timer
            if (wheelTimeout.current) clearTimeout(wheelTimeout.current);

            // Accumulate horizontal touchpad delta input
            wheelAccumulator.current += e.deltaX;

            // Trigger swipe step when accumulator crosses threshold
            const threshold = 80;
            if (Math.abs(wheelAccumulator.current) >= threshold) {
                const shifts = Math.trunc(wheelAccumulator.current / threshold);
                if (shifts !== 0) {
                    console.log(`Horizontal swipe: Delta ${wheelAccumulator.current.toFixed(1)}, Shifts: ${shifts}`);
                    setCurrentMentor(i => (i + shifts + mentors.length * 10) % mentors.length);
                }
                wheelAccumulator.current = wheelAccumulator.current % threshold;
            }

            // Decay accumulator if user stops scrolling for 150ms
            wheelTimeout.current = setTimeout(() => {
                wheelAccumulator.current = 0;
            }, 150);
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => {
            el.removeEventListener("wheel", onWheel);
            if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
        };
    }, []);

    useEffect(() => {
        if (!loading && user) {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    // Reveal Animations on Scroll
    useEffect(() => {
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    entry.target.classList.remove('opacity-0', 'translate-y-10');
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('section, .float-card');
        elements.forEach(el => {
            el.classList.add('transition-all', 'duration-1000', 'opacity-0', 'translate-y-10');
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    // Mouse Parallax for Hero
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;

            document.querySelectorAll('.mentor-shape').forEach(shape => {
                (shape as HTMLElement).style.transform = `translateX(${x}px) translateY(${y}px)`;
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    if (loading || user) return null; // Avoid flashing the landing page

    const toggleSignup = () => {
        setIsSignupOpen(!isSignupOpen);
        document.body.style.overflow = !isSignupOpen ? 'hidden' : 'auto';
    };

    return (
        <>
            <nav className="fixed top-0 w-full z-[100] glass border-b border-[var(--hairline)] py-3 sm:py-4 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <a href="#" className="text-2xl font-black tracking-tighter serif italic">HelpMeMan<span className="text-neutral-600 font-sans">.</span></a>
                        <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                            <a href="#about" className="hover:text-[var(--fg)] transition-colors">About</a>
                            <a href="#how" className="hover:text-[var(--fg)] transition-colors">Method</a>
                            <a href="#pricing" className="hover:text-[var(--fg)] transition-colors">Pricing</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-6">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-1.5 sm:p-2 text-neutral-400 hover:text-[var(--fg)] transition-colors rounded-full hover:bg-[var(--hairline)]"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <Link href="/signin" className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-400 hover:text-[var(--fg)] transition-colors">Login</Link>
                        <Link href="/signup" className="bg-[var(--fg)] text-[var(--bg)] px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold hover:scale-105 transition-transform whitespace-nowrap">Get Started</Link>
                    </div>
                </div>
            </nav>

            <main className="relative pt-14 sm:pt-28 lg:pt-40 pb-8 sm:pb-12 lg:pb-20 px-4 sm:px-8 overflow-hidden grid-bg">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
                    <div className="order-2 lg:order-1 mt-8 lg:mt-0">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-[11px] tracking-[0.4em] text-blue-500 font-bold uppercase">Verified Network</span>
                            <div className="h-px w-8 bg-neutral-800"></div>
                            <span className="text-[10px] text-neutral-500 font-medium">98% Success Rate</span>
                        </div>
                        <h1 className="serif text-4xl sm:text-6xl lg:text-8xl font-bold leading-[0.9] mb-6 sm:mb-8">
                            Access the world&apos;s <br /> <span className="italic font-light text-blue-500">Elite 1%.</span>
                        </h1>
                        <p className="text-neutral-400 text-base sm:text-lg max-w-md leading-relaxed mb-8 sm:mb-10">
                            Skip the trial and error. Connect with verified mentors from Google, Meta, YC, and IIT (AIR 1) who have actually walked your path.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={toggleSignup} className="bg-white text-black px-12 py-5 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 group shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                                Browse the Elite 1% <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>

                        <div className="mt-6 sm:mt-8 pt-4 border-t border-[var(--hairline)]">
                            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-6">Mentors from the world&apos;s best</p>
                            <div className="flex flex-wrap items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                                <div className="flex items-center gap-2">
                                    <ChromeIcon className="w-5 h-5" />
                                    <span className="font-bold text-sm">Google</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <InfinityIcon className="w-5 h-5" />
                                    <span className="font-bold text-sm">Meta</span>
                                </div>
                                <div className="flex items-center gap-2 text-orange-500 opacity-100 grayscale-0">
                                    <span className="font-black text-lg">Y</span>
                                    <span className="font-bold text-sm text-[var(--fg)]">Combinator</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-sm italic">IIT</span>
                                    <span className="text-[10px] bg-[var(--fg)] text-[var(--bg)] px-1.5 py-0.5 rounded uppercase font-bold">AIR 1</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mentor Carousel */}
                    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px] flex items-center justify-center order-1 lg:order-2 overflow-visible">
                        {/* Ambient glows */}
                        <div className="mentor-shape w-64 h-64 bg-blue-600/30 top-10 left-10 hidden sm:block blur-3xl rounded-full"></div>
                        <div className="mentor-shape w-48 h-48 bg-purple-600/20 bottom-10 right-10 hidden sm:block blur-3xl rounded-full"></div>
                        <div className="mentor-shape w-48 h-48 bg-blue-600/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:hidden blur-3xl opacity-50 rounded-full"></div>

                        {/* Carousel track — handles pointer drag + wheel scroll */}
                        <div
                            ref={trackRef}
                            className="mentor-carousel-track"
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                        >
                            {mentors.map((mentor, i) => {
                                const offset = i - currentMentor;
                                // Only render visible cards: center, prev, next
                                const isCenter = offset === 0;
                                const isPrev = offset === -1 || (currentMentor === 0 && i === mentors.length - 1);
                                const isNext = offset === 1 || (currentMentor === mentors.length - 1 && i === 0);
                                // Compute normalized offset for wrapping
                                let normOffset = i - currentMentor;
                                if (normOffset > mentors.length / 2) normOffset -= mentors.length;
                                if (normOffset < -mentors.length / 2) normOffset += mentors.length;

                                const visible = Math.abs(normOffset) <= 1;
                                if (!visible) return null;

                                // Responsive card spacing and scaling
                                const cardSpacing = isMobile ? 180 : 250;
                                const tx = normOffset * cardSpacing;
                                const scale = isCenter ? 1.05 : 0.82;
                                const opacity = isCenter ? 1 : 0.45;
                                const zIndex = isCenter ? 20 : 10;

                                return (
                                    <div
                                        key={mentor.name}
                                        className="mentor-carousel-card glass group cursor-pointer"
                                        data-index={i}
                                        onClick={isCenter ? toggleSignup : undefined}
                                        style={{
                                            transform: `translateX(${tx}px) scale(${scale})`,
                                            opacity,
                                            zIndex,
                                            filter: isCenter ? 'none' : 'blur(0.8px)',
                                            pointerEvents: isCenter ? 'auto' : 'none',
                                        }}
                                    >
                                        {/* Card Image Section - Modern rectangular cover */}
                                        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-t-[1.4rem] sm:rounded-t-[1.9rem]">
                                            <img
                                                src={mentor.img}
                                                className="w-full h-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-110"
                                                alt={mentor.name}
                                                draggable={false}
                                            />
                                            {/* Premium Dark overlay for text readability */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent opacity-80" />
                                        </div>

                                        {/* Details container below image */}
                                        <div className="flex flex-col flex-1 justify-between p-4 sm:p-5 text-center z-10">
                                            {/* Role & Company Badge */}
                                            <div className="inline-flex self-center items-center bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest my-1 shadow-[0_0_15px_rgba(59,130,246,0.1)] whitespace-nowrap">
                                                {mentor.badge}
                                            </div>

                                            {/* Name */}
                                            <h3 className="font-bold text-sm sm:text-base text-[var(--fg)] tracking-tight leading-tight group-hover:text-blue-500 transition-colors">
                                                {mentor.name}
                                            </h3>

                                            {/* Star Rating */}
                                            <div className="flex justify-center gap-0.5 mt-1">
                                                {Array.from({ length: mentor.stars }).map((_, si) => (
                                                    <Star key={si} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-500 text-yellow-500 filter drop-shadow-[0_0_4px_rgba(234,179,8,0.3)]" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>

            <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-8 bg-[var(--hairline)] border-y border-[var(--hairline)]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 sm:mb-16">
                        <div>
                            <span className="text-[11px] tracking-[0.4em] text-blue-500 font-bold uppercase mb-4 block">The Directory</span>
                            <h2 className="serif text-3xl sm:text-5xl font-bold italic">Elite Mentors.</h2>
                        </div>
                        <button onClick={toggleSignup} className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 hover:text-[var(--fg)] border-b border-[var(--hairline)] hover:border-[var(--fg)] pb-1 transition-all">View All 400+ Mentors</button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                        {[
                            { name: 'Arjun Mehta', role: 'L7 Engineer', company: 'Google' },
                            { name: 'Sarah Chen', role: 'Product Lead', company: 'Meta' },
                            { name: 'Vikram S.', role: 'Founder', company: 'YC W22' },
                            { name: 'Rahul J.', role: 'AIR 1 (JEE)', company: 'IIT Bombay' },
                            { name: 'Dr. Neha', role: 'Residency', company: 'AIIMS' },
                            { name: 'Chris L.', role: 'Sr. Designer', company: 'Apple' },
                        ].map((mentor) => (
                            <div
                                key={mentor.name}
                                onClick={toggleSignup}
                                className="glass p-5 sm:p-6 rounded-3xl text-center cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.04] active:scale-[0.98] group hover:border-[var(--fg)]/20"
                            >
                                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-[var(--bg)] border border-[var(--hairline)] flex items-center justify-center mb-4 text-[var(--fg)] shadow-lg group-hover:shadow-xl transition-all group-hover:border-[var(--fg)]/20">
                                    {mentor.company === 'Google' && <ChromeIcon scale={28} className="text-blue-500" />}
                                    {mentor.company === 'Meta' && <InfinityIcon size={32} className="text-blue-600" />}
                                    {mentor.company === 'YC W22' && <span className="font-serif italic font-bold text-3xl text-orange-500">Y</span>}
                                    {mentor.company === 'IIT Bombay' && <span className="font-black italic text-2xl tracking-tighter text-teal-500">IIT</span>}
                                    {mentor.company === 'AIIMS' && <ShieldCheck size={28} className="text-rose-500" />}
                                    {mentor.company === 'Apple' && <div className="w-8 h-8 bg-neutral-300 rounded-full flex items-center justify-center text-black font-bold text-xl"></div>}
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-[var(--fg)] transition-colors">{mentor.name}</p>
                                <p className="text-[9px] sm:text-[10px] text-neutral-500 mt-1 group-hover:text-[var(--fg)] transition-colors">{mentor.role}</p>
                                <p className="text-[9px] text-neutral-600 uppercase tracking-tighter mt-1 group-hover:text-[var(--fg)] transition-colors">{mentor.company}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Signup Overlay */}
            <div className={`fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex-col items-center justify-center p-8 text-white ${isSignupOpen ? 'flex' : 'hidden'}`}>
                <button onClick={toggleSignup} className="absolute top-8 right-8 text-neutral-500 hover:text-white transition-colors">
                    <X className="w-8 h-8" />
                </button>
                <div className="max-w-md w-full">
                    <div className="text-center mb-12">
                        <a href="#" className="text-3xl font-black tracking-tighter serif italic mb-8 block">HelpMeMan<span className="text-neutral-600 font-sans">.</span></a>
                        <h2 className="serif text-4xl font-bold mb-4 italic">Join the Elite.</h2>
                        <p className="text-neutral-500 text-sm">Create your account to browse the full directory of 400+ verified mentors.</p>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); router.push('/signup'); }} className="space-y-4">
                        <button type="submit" className="w-full bg-white text-black py-4 rounded-xl font-bold text-sm hover:bg-neutral-200 transition-all shadow-xl shadow-white/5 mt-4">
                            Create Account & Browse
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-neutral-600 mt-8 uppercase tracking-widest">
                        Trusted by 50,000+ Students worldwide
                    </p>
                </div>
            </div>

            <section id="about" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-8 border-t border-[var(--hairline)]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-12 items-start mb-24">
                        <div className="lg:col-span-8">
                            <span className="text-[11px] tracking-[0.4em] text-neutral-500 font-bold uppercase mb-6 block">Chapter 02 — About</span>
                            <h2 className="serif text-3xl sm:text-5xl lg:text-7xl font-bold leading-none italic">
                                Most career advice is loud. <span className="not-italic text-neutral-400">The good kind is quiet.</span>
                            </h2>
                        </div>
                        <div className="lg:col-span-4 lg:pt-12">
                            <p className="text-neutral-500 leading-relaxed text-sm">
                                Students and young professionals are surrounded by noise — about entrance exams, internships, placements, the &quot;right&quot; skills. Most of it is written by people who haven&apos;t done the thing.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="p-8 border-l border-[var(--hairline)] hover:border-[var(--fg)] transition-colors">
                            <span className="text-[10px] text-neutral-600 font-bold mb-4 block">01</span>
                            <h4 className="font-bold mb-3">Real mentors, not influencers</h4>
                            <p className="text-xs text-neutral-500 leading-relaxed">Every mentor has actually walked the path — placements, residencies, founding teams.</p>
                        </div>
                        <div className="p-8 border-l border-[var(--hairline)] hover:border-[var(--fg)] transition-colors">
                            <span className="text-[10px] text-neutral-600 font-bold mb-4 block">02</span>
                            <h4 className="font-bold mb-3">Verified, every single one</h4>
                            <p className="text-xs text-neutral-500 leading-relaxed">Verified against institution emails and alumni records. If they say IIT, they are.</p>
                        </div>
                        <div className="p-8 border-l border-[var(--hairline)] hover:border-[var(--fg)] transition-colors">
                            <span className="text-[10px] text-neutral-600 font-bold mb-4 block">03</span>
                            <h4 className="font-bold mb-3">From the rooms you want</h4>
                            <p className="text-xs text-neutral-500 leading-relaxed">Mentors from Google, Meta, IITs, AIIMS, and elite unicorn founders.</p>
                        </div>
                        <div className="p-8 border-l border-[var(--hairline)] hover:border-[var(--fg)] transition-colors">
                            <span className="text-[10px] text-neutral-600 font-bold mb-4 block">04</span>
                            <h4 className="font-bold mb-3">Practical, not performative</h4>
                            <p className="text-xs text-neutral-500 leading-relaxed">Specific frameworks and honest tradeoffs you can act on this week.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="how" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-8 bg-[var(--hairline)] relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-12 gap-12 items-end mb-24">
                        <div className="lg:col-span-8">
                            <span className="text-[11px] tracking-[0.4em] text-neutral-500 font-bold uppercase mb-6 block">Chapter 03 — Process</span>
                            <h2 className="serif text-3xl sm:text-5xl lg:text-7xl font-bold leading-none">
                                From a question to the <br /> <span className="italic font-light">right person</span>, in three steps.
                            </h2>
                        </div>
                        <div className="lg:col-span-4">
                            <div className="flex items-center gap-4 text-xs font-bold text-neutral-400 mb-2">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                <span>THREE STEPS. NO FRICTION.</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="relative">
                            <h3 className="serif text-8xl font-black text-[var(--fg)]/5 absolute -top-12 -left-4">01</h3>
                            <div className="relative z-10 pt-8">
                                <div className="h-[1px] w-full bg-[var(--fg)]/10 mb-8"></div>
                                <h4 className="text-xl font-bold mb-4">Choose your stage</h4>
                                <p className="text-neutral-500 text-sm leading-relaxed">Tell us where you are — Class 12, undergrad, or mid-career. We match on stage, not vibes.</p>
                                <span className="text-[10px] uppercase font-bold text-neutral-600 mt-6 block tracking-widest">60 Seconds</span>
                            </div>
                        </div>
                        <div className="relative">
                            <h3 className="serif text-8xl font-black text-[var(--fg)]/5 absolute -top-12 -left-4">02</h3>
                            <div className="relative z-10 pt-8">
                                <div className="h-[1px] w-full bg-[var(--fg)]/10 mb-8"></div>
                                <h4 className="text-xl font-bold mb-4">Pick a mentor</h4>
                                <p className="text-neutral-500 text-sm leading-relaxed">Browse a small, hand-picked shortlist. Read their path, focus areas, and what mentees say.</p>
                                <span className="text-[10px] uppercase font-bold text-neutral-600 mt-6 block tracking-widest">Verified Profiles</span>
                            </div>
                        </div>
                        <div className="relative">
                            <h3 className="serif text-8xl font-black text-[var(--fg)]/5 absolute -top-12 -left-4">03</h3>
                            <div className="relative z-10 pt-8">
                                <div className="h-[1px] w-full bg-[var(--fg)]/10 mb-8"></div>
                                <h4 className="text-xl font-bold mb-4">Book a session</h4>
                                <p className="text-neutral-500 text-sm leading-relaxed">Pick a 30 or 60 minute slot, pay once, and meet on a private call. Notes land in your dashboard.</p>
                                <span className="text-[10px] uppercase font-bold text-neutral-600 mt-6 block tracking-widest">From ₹129</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Improved Pricing Section */}
            <section id="pricing" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <span className="text-[11px] tracking-[0.4em] text-neutral-500 font-bold uppercase mb-6 block">Chapter 04 — Pricing</span>
                        <h2 className="serif text-3xl sm:text-5xl lg:text-8xl font-bold italic mb-6 sm:mb-8">
                            Real mentorship, at the <br /> <span className="not-italic">price of a meal out.</span>
                        </h2>
                        <p className="text-neutral-500 max-w-xl mx-auto">
                            One transparent price per stage. No subscriptions, no hidden upsells.
                        </p>
                    </div>

                    {/* Active style = identical to how ₹499 Premium looks by default */}
                    {(() => {
                        const pricingTiers = [
                            { name: 'Starter', price: '129', desc: '11th — 12th guidance', features: ['1 mentor call', '30-day chat access'] },
                            { name: 'Most Chosen', price: '199', desc: '1st / 2nd / 3rd year', features: ['1 mentor call', '30-day chat access'] },
                            { name: 'Career', price: '249', desc: 'Internship / Job guidance', features: ['1 mentor call', '30-day chat access'] },
                            { name: 'Premium', price: '499', desc: 'Top MNC Mentors', features: ['1 premium mentor call', '7-day priority chat'] },
                        ];

                        // Style constants — active mirrors the Premium card look exactly
                        const activeCard_cls = 'border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)] shadow-2xl scale-[1.02]';
                        const inactiveCard_cls = 'glass border-[var(--hairline)] text-[var(--fg)]';
                        const activeTag_cls = 'text-[var(--bg)]/50';
                        const inactiveTag_cls = 'text-[var(--fg)]/50';
                        const activeDesc_cls = 'border-[var(--bg)]/20 text-[var(--bg)]';
                        const inactiveDesc_cls = 'border-[var(--hairline)] text-[var(--fg)]/70';
                        const activeFeat_cls = 'text-[var(--bg)]/80';
                        const inactiveFeat_cls = 'text-[var(--fg)]/70';
                        const activeChk_cls = 'text-[var(--bg)]';
                        const inactiveChk_cls = 'text-[var(--fg)]';
                        const activeBtn_cls = 'bg-[var(--bg)] text-[var(--fg)] hover:opacity-90';
                        const inactiveBtn_cls = 'border border-[var(--hairline)] text-[var(--fg)] hover:border-[var(--fg)]';

                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
                                {pricingTiers.map((tier, index) => {
                                    const isCardActive = (hoveredCard !== null ? hoveredCard === index : activeCard === index);
                                    return (
                                        <div
                                            key={tier.name}
                                            onClick={() => { setActiveCard(index); toggleSignup(); }}
                                            onMouseEnter={() => setHoveredCard(index)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                            className={`relative p-6 sm:p-8 lg:p-10 rounded-[2rem] border transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 ${isCardActive ? activeCard_cls : inactiveCard_cls}`}
                                        >
                                            {isCardActive && (
                                                <div className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-[var(--bg)] text-[var(--fg)] text-[8px] sm:text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-full border border-[var(--hairline)]">
                                                    Highlighted
                                                </div>
                                            )}

                                            <span className={`text-[9px] sm:text-[10px] tracking-widest font-bold uppercase mb-4 sm:mb-8 ${isCardActive ? activeTag_cls : inactiveTag_cls}`}>
                                                {tier.name}
                                            </span>

                                            <div className="flex items-start gap-1 sm:gap-2 mb-2">
                                                <span className="text-xl sm:text-2xl mt-1 sm:mt-2">₹</span>
                                                <span className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter">
                                                    {tier.price}
                                                </span>
                                            </div>

                                            <p className={`text-xs sm:text-sm font-medium mb-6 sm:mb-8 pb-6 sm:pb-8 border-b transition-colors ${isCardActive ? activeDesc_cls : inactiveDesc_cls}`}>
                                                {tier.desc}
                                            </p>

                                            <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-12 flex-1">
                                                {tier.features.map(f => (
                                                    <li key={f} className={`flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium ${isCardActive ? activeFeat_cls : inactiveFeat_cls}`}>
                                                        <Check size={14} className={isCardActive ? activeChk_cls : inactiveChk_cls} /> {f}
                                                    </li>
                                                ))}
                                            </ul>

                                            <button className={`w-full py-3 sm:py-4 rounded-xl text-[10px] sm:text-[11px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all mt-auto ${isCardActive ? activeBtn_cls : inactiveBtn_cls}`}>
                                                Book at ₹{tier.price} <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            </section>

            <footer className="py-12 sm:py-20 px-4 sm:px-8 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="text-center md:text-left">
                        <a href="#" className="text-xl font-black tracking-tighter serif italic">HelpMeMan<span className="text-neutral-600 font-sans">.</span></a>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600 mt-4">© 2026 Verified Mentorship Network</p>
                    </div>
                    <div className="flex gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Mentors Apply</a>
                    </div>
                    <div className="flex gap-4">
                        <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"><TwitterIcon className="w-4 h-4" /></button>
                        <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"><LinkedinIcon className="w-4 h-4" /></button>
                    </div>
                </div>
            </footer>
        </>
    );
}
