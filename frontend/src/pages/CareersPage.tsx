import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Users,
  Zap,
  Heart,
  Globe,
  Code,
  Palette,
  Rocket,
  Mail,
  ShieldCheck
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../sections/Footer';
import Starfield from '../components/Starfield';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';

gsap.registerPlugin(ScrollTrigger);

interface PageProps {
  onContactClick: () => void;
}

const CareersPage = ({ onContactClick }: PageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if page is refreshed
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0 && navigationEntries[0].type === 'reload') {
      window.location.href = '/';
      return;
    }

    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);

    const ctx = gsap.context(() => {
      setTimeout(() => {
        const heroTargets = gsap.utils.toArray('.careers-hero-content > *');
        if (heroTargets.length > 0) {
          gsap.fromTo(heroTargets, 
            { y: 15, opacity: 0 },
            { 
              y: 0, 
              opacity: 1, 
              duration: 0.6, 
              stagger: 0.1, 
              ease: 'power2.out',
              onComplete: () => ScrollTrigger.refresh()
            }
          );
        }

        const revealSections = gsap.utils.toArray('.reveal-section');
        revealSections.forEach((section: any) => {
          gsap.fromTo(section, 
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              scrollTrigger: {
                trigger: section,
                start: 'top 92%',
              }
            }
          );
        });
      }, 100);
    }, containerRef);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, []);

  const values = [
    {
      icon: Palette,
      title: "Visual First",
      description: "We believe aesthetics are a core feature, not an afterthought. Every pixel we ship must reflect our commitment to beauty."
    },
    {
      icon: Zap,
      title: "High Velocity",
      description: "We move fast, detect links in milliseconds, and iterate on feedback instantly. We value builders who ship with precision."
    },
    {
      icon: Heart,
      title: "Creator Obsessed",
      description: "Our mission is to empower the next generation of digital pioneers. We win when our creators win."
    }
  ];

  const perks = [
    { title: "Remote-First Culture", icon: Globe },
    { title: "Modern Tech Stack", icon: Code },
    { title: "Competitive Pay", icon: Zap },
    { title: "Creative Freedom", icon: Sparkles },
    { title: "Health & Wellness", icon: ShieldCheck },
    { title: "Growth Opportunities", icon: Rocket }
  ];

  const departments = [
    {
      name: "Engineering",
      roles: [
        { title: "Senior Full-Stack Developer", type: "Full-time", location: "Remote" },
        { title: "UI/UX Motion Engineer", type: "Full-time", location: "Remote" }
      ]
    },
    {
      name: "Design",
      roles: [
        { title: "Product Designer", type: "Full-time", location: "Remote" }
      ]
    },
    {
      name: "Growth",
      roles: [
        { title: "Community Manager", type: "Full-time", location: "Remote" },
        { title: "Affiliate Relations Lead", type: "Full-time", location: "Remote" }
      ]
    }
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen bg-aura-navy text-aura-text overflow-x-hidden">
      <Starfield />
      <div className="noise-overlay" />
      
      <Navigation 
        user={auth.currentUser}
        onDemoClick={() => navigate('/about')} 
        onAuthClick={() => navigate('/signup')} 
        onLoginClick={() => navigate('/login')} 
        onContactClick={onContactClick}
      />

      <main className="relative z-10 pt-20 lg:pt-28">
        {/* Floating Back Button */}
        <div className="fixed bottom-8 left-6 sm:left-10 z-[100]">
          <Link 
            to="/" 
            className="flex items-center justify-center w-12 h-12 text-aura-text-secondary hover:text-aura-text transition-all group bg-aura-navy/40 backdrop-blur-xl rounded-full border border-white/10 hover:border-aura-violet shadow-2xl"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
          <div className="careers-hero-content text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aura-violet/10 border border-aura-violet/20 text-aura-violet text-[10px] uppercase tracking-widest font-bold mb-6">
              <Briefcase className="w-3 h-3" />
              <span>Join the AuraTree Team</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-7xl mb-6 leading-tight">
              Build the future of <br className="hidden lg:block"/> <span className="text-gradient-violet">digital identity.</span>
            </h1>
            <p className="text-aura-text-secondary text-base lg:text-xl leading-relaxed max-w-2xl mx-auto">
              We are a team of designers, engineers, and creators building the premier destination for the creator economy.
            </p>
          </div>
        </section>

        {/* Culture / Values */}
        <section className="reveal-section px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="glass-card-sm p-8 hover:border-aura-violet/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-aura-violet/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <v.icon className="w-6 h-6 text-aura-violet" />
                </div>
                <h3 className="font-display font-bold text-xl mb-4">{v.title}</h3>
                <p className="text-aura-text-secondary text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits/Perks */}
        <section className="reveal-section px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
          <div className="glass-card p-10 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-aura-violet/5 blur-[120px] -mr-48 -mt-48" />
            <div className="relative z-10">
              <h2 className="font-display font-bold text-3xl mb-12 text-center">Life at AuraTree</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {perks.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-aura-violet/20 group-hover:border-aura-violet/30 transition-all">
                      <p.icon className="w-5 h-5 text-aura-text-secondary group-hover:text-aura-violet transition-colors" />
                    </div>
                    <span className="font-medium text-sm sm:text-base">{p.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Open Roles */}
        <section className="reveal-section px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl mb-4">Open Roles</h2>
            <p className="text-aura-text-secondary">Explore our current opportunities and find your next challenge.</p>
          </div>
          
          <div className="space-y-12">
            {departments.map((dept, i) => (
              <div key={i}>
                <h3 className="font-display font-bold text-xl mb-6 text-aura-violet uppercase tracking-widest">{dept.name}</h3>
                <div className="space-y-4">
                  {dept.roles.map((role, j) => (
                    <a 
                      key={j} 
                      href={`mailto:ceo@feel-flytech.site?subject=Application for ${role.title} - AuraTree`}
                      className="glass-card-sm p-6 flex items-center justify-between group cursor-pointer hover:border-aura-violet/30 transition-all"
                    >
                      <div>
                        <h4 className="font-bold text-lg mb-1 group-hover:text-aura-violet transition-colors">{role.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-aura-text-secondary uppercase tracking-widest font-bold">
                          <span>{role.type}</span>
                          <span>•</span>
                          <span>{role.location}</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-aura-violet transition-all">
                        <ArrowRight className="w-5 h-5 text-aura-text-secondary group-hover:text-aura-violet group-hover:translate-x-1 transition-all" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Spontaneous Application */}
        <section className="reveal-section px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
          <div className="glass-card p-10 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-aura-violet/10 blur-[120px]" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-aura-violet/20 flex items-center justify-center mx-auto mb-8">
                <Rocket className="w-8 h-8 text-aura-violet" />
              </div>
              <h2 className="font-display font-bold text-3xl lg:text-4xl mb-6">Don't see a role that fits?</h2>
              <p className="text-aura-text-secondary text-base lg:text-lg mb-10 leading-relaxed">
                If you have an extraordinary "Aura" and want to help us build the future of digital identity, we want to hear from you.
              </p>
              
              <a 
                href="mailto:ceo@feel-flytech.site" 
                className="btn-primary inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs"
              >
                <Mail className="w-4 h-4" />
                Spontaneous Application
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer onContactOpenChange={onContactClick} />
    </div>
  );
};

export default CareersPage;
