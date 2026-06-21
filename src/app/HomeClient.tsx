'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle, Shield, Globe, Users, Briefcase,
  Award, Zap, ShieldCheck, ArrowRight, FileCheck, Search, MessageSquare,
} from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

/* ══════════════════════════════════════════════
   Profile Carousel data
══════════════════════════════════════════════ */
const PROFILES = [
  {
    initials: 'M', name: 'Marco R.', role: 'PDR Technician', country: 'Germany', flag: '🇩🇪',
    tags: ['PDR Tech', 'Dismantler', 'DE', 'AT', 'CH'], type: 'tech' as const,
    grad: 'from-brand-400 to-brand-700',
  },
  {
    initials: 'A', name: 'AutoHaus Wien GmbH', role: 'Car Dealership · Client', country: 'Austria', flag: '🇦🇹',
    tags: ['Hiring Now', 'Vienna', 'Workshop'], type: 'client' as const,
    grad: 'from-amber-500 to-orange-600',
  },
  {
    initials: 'L', name: 'Luca B.', role: 'Car Painter', country: 'Italy', flag: '🇮🇹',
    tags: ['Car Painter', 'Preparer', 'IT', 'ES', 'FR'], type: 'tech' as const,
    grad: 'from-slate-500 to-slate-700',
  },
  {
    initials: 'C', name: 'CarMax GmbH', role: 'Workshop · Client', country: 'Germany', flag: '🇩🇪',
    tags: ['Seeking PDR Tech', 'Munich', 'Client'], type: 'client' as const,
    grad: 'from-brand-600 to-slate-700',
  },
  {
    initials: 'S', name: 'Stavros P.', role: 'PDR Technician', country: 'Greece', flag: '🇬🇷',
    tags: ['PDR Tech', 'GR', 'CY', 'MT'], type: 'tech' as const,
    grad: 'from-brand-500 to-brand-800',
  },
  {
    initials: 'E', name: 'EuroDent Cyprus', role: 'Dealership · Client', country: 'Cyprus', flag: '🇨🇾',
    tags: ['Seeking Technician', 'Limassol', 'Client'], type: 'client' as const,
    grad: 'from-slate-600 to-brand-700',
  },
  {
    initials: 'J', name: 'Jan K.', role: 'Preparer', country: 'Poland', flag: '🇵🇱',
    tags: ['Preparer', 'PL', 'DE', 'AT'], type: 'tech' as const,
    grad: 'from-brand-700 to-slate-600',
  },
];

/* ══════════════════════════════════════════════
   Animated Number Counter
══════════════════════════════════════════════ */
function AnimatedNumber({ end, suffix = '', started }: { end: number; suffix?: string; started: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    let raf: number;
    const t0 = performance.now();
    const dur = 2000;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, started]);
  return <>{val}{suffix}</>;
}

/* ══════════════════════════════════════════════
   Scroll-reveal hook
══════════════════════════════════════════════ */
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ══════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════ */
export default function HomeClient() {
  const { t } = useTranslation();

  /* profile carousel */
  const [profileIdx, setProfileIdx] = useState(0);
  const [profileVisible, setProfileVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setProfileVisible(false);
      setTimeout(() => {
        setProfileIdx(i => (i + 1) % PROFILES.length);
        setProfileVisible(true);
      }, 350);
    }, 3800);
    return () => clearInterval(interval);
  }, []);
  const profile = PROFILES[profileIdx];

  /* animated counters */
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStatsStarted(true); obs.disconnect(); } },
      { threshold: 0.4 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  /* section reveals */
  const featReveal   = useReveal();
  const stepsReveal  = useReveal();
  const rolesReveal  = useReveal();
  const servReveal   = useReveal();
  const priceReveal  = useReveal();

  /* data */
  const features = [
    { icon: Shield,      title: t('home.feat1Title'), desc: t('home.feat1Desc'), grad: 'from-slate-600 to-slate-800'    },
    { icon: Globe,       title: t('home.feat2Title'), desc: t('home.feat2Desc'), grad: 'from-brand-600 to-brand-800'    },
    { icon: Users,       title: t('home.feat3Title'), desc: t('home.feat3Desc'), grad: 'from-slate-500 to-brand-700'    },
    { icon: CheckCircle, title: t('home.feat4Title'), desc: t('home.feat4Desc'), grad: 'from-brand-700 to-slate-700'    },
  ];

  const steps = [
    { icon: FileCheck,     num: '01', title: t('home.step1Title'), desc: t('home.step1Desc') },
    { icon: Search,        num: '02', title: t('home.step2Title'), desc: t('home.step2Desc') },
    { icon: MessageSquare, num: '03', title: t('home.step3Title'), desc: t('home.step3Desc') },
  ];

  const roles: { icon: string; isImg?: boolean; title: string; desc: string; grad: string }[] = [
    { icon: '/icons/pdr-technician.png', isImg: true, title: t('home.role1'), desc: t('home.role1desc'), grad: 'from-brand-600  to-brand-800'  },
    { icon: '/icons/car-painter.png',    isImg: true, title: t('home.role2'), desc: t('home.role2desc'), grad: 'from-slate-600  to-brand-700'  },
    { icon: '/icons/preparer.png',       isImg: true, title: t('home.role3'), desc: t('home.role3desc'), grad: 'from-brand-700  to-slate-700'  },
    { icon: '/icons/dismantler.png',     isImg: true, title: t('home.role4'), desc: t('home.role4desc'), grad: 'from-slate-500  to-slate-700'  },
    { icon: '/icons/customer.png', isImg: true, title: t('home.role5'), desc: t('home.role5desc'), grad: 'from-brand-500  to-brand-800'  },
  ];

  const services = [
    { icon: Briefcase,   title: t('home.serv1Title'), desc: t('home.serv1Desc'), grad: 'from-brand-600  to-brand-800'  },
    { icon: Award,       title: t('home.serv2Title'), desc: t('home.serv2Desc'), grad: 'from-slate-600  to-slate-800'  },
    { icon: Globe,       title: t('home.serv3Title'), desc: t('home.serv3Desc'), grad: 'from-brand-700  to-slate-700'  },
    { icon: Zap,         title: t('home.serv4Title'), desc: t('home.serv4Desc'), grad: 'from-slate-500  to-brand-700'  },
    { icon: ShieldCheck, title: t('home.serv5Title'), desc: t('home.serv5Desc'), grad: 'from-brand-800  to-slate-800'  },
  ];

  const priceFeat = [t('home.priceFeat1'), t('home.priceFeat2'), t('home.priceFeat3'), t('home.priceFeat4')];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ══ STICKY NAV ══ */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Cybratech Solutions" width={58} height={58} unoptimized className="flex-shrink-0" />
            <div className="leading-tight">
              <span className="block text-xl font-black text-gray-700 tracking-tight">
                PDR Connect
              </span>
              <span className="block text-[10px] font-medium text-gray-400 tracking-widest uppercase -mt-0.5">by Cybratech Solutions</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 transition px-3 py-2 rounded-lg hover:bg-gray-50">
              Blog
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden min-h-[93vh] flex items-center">

        {/* Real photo background */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt="PDR Technician at work"
            fill
            priority
            unoptimized
            className="object-cover object-center"
            style={{ filter: 'grayscale(50%) brightness(95%) saturate(45%)' }}
          />
          {/* Light professional overlay — cool slate tone */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(110deg, rgba(15,25,50,0.52) 0%, rgba(20,35,65,0.36) 50%, rgba(15,25,50,0.18) 100%)' }} />
        </div>

        {/* Aurora blobs — very subtle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="aurora-blob aurora-blob-1" style={{ opacity: 0.35 }} />
          <div className="aurora-blob aurora-blob-2" style={{ opacity: 0.30 }} />
          <div className="aurora-blob aurora-blob-3" style={{ opacity: 0.15 }} />
          {/* subtle dot grid */}
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-28 lg:py-36 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: Copy */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-4 py-1.5 text-sm text-brand-300 ring-1 ring-brand-500/25">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                {t('home.badge')}
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-amber-400 tracking-tight leading-[1.08]">
                {t('home.heroTitle')}
                <br />
                {t('home.heroHighlight')}
              </h1>

              <p className="mt-6 text-lg text-slate-300/90 leading-relaxed max-w-lg">
                {t('home.heroDesc')}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 transition-all duration-200">
                  {t('home.createFreeAccount')}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/8 backdrop-blur px-8 py-4 text-base font-semibold text-white hover:bg-white/15 transition ring-1 ring-white/15">
                  {t('home.signIn')}
                </Link>
              </div>

              {/* Trust micro-badges */}
              <div className="mt-10 flex flex-wrap items-center gap-5 text-slate-400 text-sm">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-sky-400 flex-shrink-0" />
                  <span>Verified Profiles</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <span>48+ Countries</span>
                </div>
              </div>
            </div>

            {/* Right: Floating UI cards */}
            <div className="hidden lg:block relative h-[500px]">

              {/* Profile carousel card */}
              <div className="absolute top-0 right-4 w-80 animate-float
                bg-white/8 backdrop-blur-2xl rounded-2xl ring-1 ring-white/15 p-5 shadow-2xl overflow-hidden">

                {/* Transition wrapper */}
                <div style={{
                  opacity: profileVisible ? 1 : 0,
                  transform: profileVisible ? 'translateY(0)' : 'translateY(-10px)',
                  transition: 'opacity 0.35s ease, transform 0.35s ease',
                }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${profile.grad} flex items-center justify-center font-bold text-white text-lg shadow-lg flex-shrink-0`}>
                      {profile.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-semibold text-sm truncate">{profile.name}</div>
                      <div className="text-brand-300 text-xs flex items-center gap-1">
                        <span>{profile.flag}</span>
                        <span>{profile.role}</span>
                      </div>
                    </div>
                    {profile.type === 'tech' ? (
                      <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded-full border border-emerald-500/30 flex-shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-300 text-xs font-medium">Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-full border border-amber-500/30 flex-shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-amber-300 text-xs font-medium">Hiring</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    {profile.tags.map(tag => (
                      <span key={tag} className="bg-white/10 text-slate-200 text-xs px-2.5 py-0.5 rounded-full border border-white/15">{tag}</span>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    {profile.type === 'tech' ? (
                      <>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-sm">★</span>)}
                        </div>
                        <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-slate-400">Looking for professionals</span>
                        <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                          <Briefcase className="h-3 w-3" /> Client
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Dot indicators */}
                <div className="flex justify-center gap-1 mt-3">
                  {PROFILES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setProfileVisible(false); setTimeout(() => { setProfileIdx(i); setProfileVisible(true); }, 350); }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === profileIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/30'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Placement offer notification */}
              <div className="absolute top-52 right-12 w-68 animate-float-delayed
                bg-white/8 backdrop-blur-2xl rounded-xl ring-1 ring-white/15 p-4 shadow-xl"
                style={{ width: '260px' }}>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/25 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                    <Briefcase className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs text-amber-400 font-semibold mb-0.5">New Placement Offer</div>
                    <div className="text-white text-sm font-semibold">AutoHaus Wien GmbH</div>
                    <div className="text-slate-400 text-xs mt-1 leading-relaxed">
                      „PDR Technician needed in Munich starting June…"
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats card */}
              <div className="absolute bottom-12 right-8 w-56 animate-float-slow
                bg-white/8 backdrop-blur-2xl rounded-xl ring-1 ring-white/15 p-4 shadow-xl">
                <div className="text-xs text-brand-300 font-semibold uppercase tracking-wider mb-3">Network Activity</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center bg-white/5 rounded-lg p-2">
                    <div className="text-2xl font-extrabold text-white">1000+</div>
                    <div className="text-xs text-slate-400 mt-0.5">Technicians</div>
                  </div>
                  <div className="text-center bg-white/5 rounded-lg p-2">
                    <div className="text-2xl font-extrabold text-amber-400">48+</div>
                    <div className="text-xs text-slate-400 mt-0.5">Countries</div>
                  </div>
                </div>
              </div>

              {/* Decorative sparkles */}
              <div className="absolute top-6 left-6 h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping opacity-70" />
              <div className="absolute top-32 left-20 h-2 w-2 rounded-full bg-sky-400 animate-ping opacity-60 [animation-delay:0.7s]" />
              <div className="absolute bottom-40 left-8 h-2 w-2 rounded-full bg-emerald-400 animate-ping opacity-60 [animation-delay:1.4s]" />
              <div className="absolute bottom-20 left-36 h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping opacity-50 [animation-delay:0.3s]" />
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 70L80 58C160 46 320 22 480 16C640 10 800 22 960 32C1120 42 1280 50 1360 54L1440 58V70H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <section className="relative py-16 border-b border-gray-100 overflow-hidden">
        {/* Workshop photo, very subtle */}
        <div className="absolute inset-0">
          <Image src="/images/workshop.jpg" alt="" fill unoptimized className="object-cover object-center" />
          <div className="absolute inset-0 bg-white/[0.92]" />
        </div>
        <div ref={statsRef} className="relative mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { end: 1000, suffix: '+', label: t('home.statTechnicians') },
              { end: 48,   suffix: '+', label: t('home.statCountries')   },
              { end: 24,   suffix: 'h', label: t('home.statResponse')    },
              { end: 25,   suffix: '+', label: t('home.statExperience')  },
            ].map(({ end, suffix, label }) => (
              <div key={label}>
                <div className="text-4xl lg:text-5xl font-extrabold text-gray-800 tabular-nums">
                  <AnimatedNumber end={end} suffix={suffix} started={statsStarted} />
                </div>
                <div className="text-sm text-gray-500 mt-1.5 font-medium leading-snug">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/boards.jpg" alt="" fill unoptimized className="object-cover object-center" />
          <div className="absolute inset-0 bg-gray-50/[0.90]" />
        </div>
        <div
          ref={featReveal.ref}
          className={`relative mx-auto max-w-7xl px-6 transition-all duration-700 ${featReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-14">
            <span className="text-brand-600 font-semibold text-xs uppercase tracking-widest">{t('home.whyUs')}</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2">{t('home.whyTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, grad }, i) => (
              <div key={title}
                className="group bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-default"
                style={{ transitionDelay: `${i * 70}ms` }}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="bg-white py-24">
        <div
          ref={stepsReveal.ref}
          className={`mx-auto max-w-5xl px-6 transition-all duration-700 ${stepsReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-14">
            <span className="text-brand-600 font-semibold text-xs uppercase tracking-widest">{t('home.simpleProcess')}</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2">{t('home.howTitle')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connector dashes */}
            <div className="hidden md:block absolute top-9 left-[calc(33%+1rem)] right-[calc(33%+1rem)] border-t-2 border-dashed border-brand-200" />

            {steps.map(({ icon: Icon, num, title, desc }, i) => (
              <div key={num} className="relative text-center group">
                <div className="relative inline-flex justify-center">
                  <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-amber-400 text-gray-900 text-xs font-extrabold flex items-center justify-center shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ THREE-PARTY MODEL ══ */}
      <section className="bg-gray-50 py-20 border-y border-gray-200">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900">{t('home.modelTitle')}</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">{t('home.modelDesc')}</p>
          </div>
          {/* Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-0 items-center">
            {/* Technician */}
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow mx-auto mb-3">
                <img src="/icons/pdr-technician.png" alt="PDR Technician" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-800 opacity-20" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">{t('home.modelTech')}</h3>
              <p className="text-xs text-gray-500">{t('home.modelTechDesc')}</p>
              <span className="mt-3 inline-block rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold">{t('home.modelSignsWithPlatform')}</span>
            </div>
            {/* Arrow left */}
            <div className="flex flex-col items-center px-4 py-6 gap-2 text-center">
              <span className="text-2xl text-orange-500">⇄</span>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide leading-tight">{t('home.modelContract')}</p>
            </div>
            {/* Platform (center) */}
            <div className="rounded-2xl border-2 border-orange-400 bg-orange-50 p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">🏛️</div>
              <h3 className="font-bold text-gray-900 text-base mb-1">PDR Connect</h3>
              <p className="text-xs text-orange-600 font-semibold">{t('home.modelPlatformDesc')}</p>
              <span className="mt-3 inline-block rounded-full bg-gray-900 text-white px-3 py-1 text-xs font-bold">Cybratech-Solutions</span>
            </div>
            {/* Arrow right */}
            <div className="flex flex-col items-center px-4 py-6 gap-2 text-center">
              <span className="text-2xl text-orange-500">⇄</span>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide leading-tight">{t('home.modelContract')}</p>
            </div>
            {/* Workshop */}
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg mx-auto mb-3">
                <img src="/icons/customer.png" alt="Workshop" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-800 opacity-20" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">{t('home.modelWorkshop')}</h3>
              <p className="text-xs text-gray-500">{t('home.modelWorkshopDesc')}</p>
              <span className="mt-3 inline-block rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold">{t('home.modelSignsWithPlatform')}</span>
            </div>
          </div>
          {/* Principle */}
          <div className="mt-8 rounded-xl bg-orange-50 border-l-4 border-orange-400 p-4 text-sm text-orange-800 text-center">
            <strong>{t('home.modelPrincipleTitle')}: </strong>{t('home.modelPrincipleDesc')}
          </div>
        </div>
      </section>

      {/* ══ ROLES (dark) ══ */}
      <section className="relative overflow-hidden py-24">
        {/* Tech-work photo background */}
        <div className="absolute inset-0">
          <Image src="/images/tech-work.jpg" alt="" fill unoptimized className="object-cover object-center" style={{ filter: 'grayscale(40%) brightness(110%) saturate(50%)' }} />
          <div className="absolute inset-0 bg-slate-50/[0.78]" />
        </div>
        {/* subtle dot pattern */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(15,25,50,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div
          ref={rolesReveal.ref}
          className={`relative mx-auto max-w-7xl px-6 transition-all duration-700 ${rolesReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-14">
            <span className="text-brand-600 font-semibold text-xs uppercase tracking-widest">{t('home.forEveryone')}</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2">{t('home.whoTitle')}</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-base">{t('home.whoSubtitle')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {roles.map(({ icon, isImg, title, desc, grad }, i) => (
              <div key={title}
                className="group bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 text-center cursor-default"
                style={{ transitionDelay: `${i * 60}ms` }}>
                {isImg ? (
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform mx-auto mb-3">
                    <img src={icon} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-20`} />
                  </div>
                ) : (
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center mx-auto mb-3 text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                    {icon}
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-sm leading-snug">{title}</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section className="bg-gray-50 py-24">
        <div
          ref={servReveal.ref}
          className={`mx-auto max-w-7xl px-6 transition-all duration-700 ${servReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-14">
            <span className="text-brand-600 font-semibold text-xs uppercase tracking-widest">{t('home.whatWeOffer')}</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2">{t('home.servicesTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, desc, grad }, i) => (
              <div key={title}
                className="group bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-default"
                style={{ transitionDelay: `${i * 70}ms` }}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section className="bg-white py-24">
        <div
          ref={priceReveal.ref}
          className={`mx-auto max-w-md px-6 text-center transition-all duration-700 ${priceReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="text-brand-600 font-semibold text-xs uppercase tracking-widest">Pricing</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2 mb-10">{t('home.pricingTitle')}</h2>
          <div className="relative bg-white rounded-3xl p-8 shadow-2xl ring-2 ring-brand-500 overflow-hidden">
            {/* gradient top bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-amber-400 to-brand-500" />
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t('home.freeBadge')}
            </div>
            <div className="text-7xl font-extrabold text-gray-900 tracking-tight">€0</div>
            <div className="text-gray-400 text-sm mt-1 mb-8">{t('home.freeDuringLaunch')}</div>
            <ul className="text-left space-y-3.5 mb-8">
              {priceFeat.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register"
              className="group w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand-600/20 hover:shadow-brand-600/40 hover:scale-[1.02] transition-all duration-200">
              {t('home.getStarted')}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ BIG CTA BANNER ══ */}
      <section className="relative overflow-hidden py-24">
        {/* Inspection photo background — dramatic car hood close-up */}
        <div className="absolute inset-0">
          <Image src="/images/inspection.jpg" alt="" fill unoptimized className="object-cover object-[center_40%]" />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.80) 0%, rgba(29,78,216,0.75) 50%, rgba(30,58,138,0.82) 100%)' }} />
        </div>
        {/* glow orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-brand-200 text-lg mb-10">{t('home.ctaDesc')}</p>
          <Link href="/register"
            className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 px-10 py-4 text-base font-extrabold text-gray-900 shadow-2xl shadow-amber-400/30 hover:shadow-amber-400/50 hover:scale-105 transition-all duration-200">
            {t('home.createFreeAccount')}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Cybratech Solutions" width={60} height={60} unoptimized className="flex-shrink-0" />
              <div className="leading-tight">
                <span className="block text-white font-bold text-lg tracking-tight">PDR Connect</span>
                <span className="block text-[10px] text-slate-500 tracking-widest uppercase">by Cybratech Solutions</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-sm">{t('home.footerOp')}</p>
              <a href="mailto:info@cybratech-solutions.com" className="text-slate-400 text-sm hover:text-white transition-colors mt-1 inline-block">
                info@cybratech-solutions.com
              </a>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">{t('home.privacy')}</Link>
              <Link href="/terms"   className="hover:text-white transition-colors">{t('home.terms')}</Link>
              <Link href="/legal"   className="hover:text-white transition-colors">{t('home.legal')}</Link>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-600">
            © {new Date().getFullYear()} Cybratech-Solutions. {t('home.rights')}
          </p>
        </div>
      </footer>

    </div>
  );
}
