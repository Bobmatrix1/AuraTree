import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Zap, Users, Sparkles, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import type { User as FirebaseUser } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { API_V1_URL } from '../config/api';

gsap.registerPlugin(ScrollTrigger);

interface PricingProps {
  user: FirebaseUser | null;
  onPlanClick: (planName: string) => void;
}

const Pricing = ({ user, onPlanClick }: PricingProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [prices, setPrices] = useState({ pro: 1000, teams: 10000 });
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(`${API_V1_URL}/system/settings`);
        const data = await response.json();
        if (data.success) {
          setPrices({
            pro: data.data.proPrice || 1000,
            teams: data.data.teamsPrice || 10000
          });
        }
      } catch (e) {
        console.error('Failed to fetch prices');
      }
    };
    fetchPrices();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, [user]);

  const plans = [
    {
      name: 'Starter',
      id: 'starter',
      price: 'Free',
      description: 'Perfect for getting started',
      icon: Sparkles,
      features: [
        '5 social links max',
        'Standard Aura theme',
        'Basic profile layout',
        'QR code generation',
        'Community support',
      ],
      cta: 'Get started',
      highlighted: false,
    },
    {
      name: 'Pro',
      id: 'pro',
      price: `₦${prices.pro.toLocaleString()}`,
      period: '/month',
      description: 'For serious creators',
      icon: Zap,
      features: [
        '100% Ad-free experience',
        'Unlimited social links',
        'Custom themes & backgrounds',
        'Custom profile picture',
        'Full analytics dashboard',
        'Aura-prefixed custom links',
      ],
      cta: 'Subscribe',
      highlighted: true,
    },
    {
      name: 'Teams',
      id: 'teams',
      price: `₦${prices.teams.toLocaleString()}`,
      period: '/month',
      description: 'For teams and businesses',
      icon: Users,
      features: [
        'Everything in Pro',
        'Ad-free workspace',
        'Remove "aura-" prefix',
        'Fully branded custom links',
        'Team collaboration',
        'Admin controls',
      ],
      cta: 'Subscribe',
      highlighted: false,
    },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 0.6,
          }
        }
      );

      // Cards animation
      gsap.fromTo(
        cardsRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            end: 'top 30%',
            scrub: 0.6,
          }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleCTA = (planName: string) => {
    onPlanClick(planName);
  };

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative w-full min-h-screen py-16 sm:py-20 lg:py-24 flex items-center"
      style={{ zIndex: 80 }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div ref={titleRef} className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="font-display font-bold text-aura-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4">
              Simple <span className="text-gradient-violet">pricing</span>
            </h2>
            <p className="text-aura-text-secondary text-sm sm:text-base lg:text-lg">
              Start free. Upgrade when you need more.
            </p>
          </div>

          {/* Pricing Cards */}
          <div ref={cardsRef}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative ${plan.highlighted ? 'lg:-mt-4 lg:mb-4' : ''}`}
                >
                  <div 
                    className={`h-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 ${
                      plan.highlighted
                        ? 'glass-card border-aura-violet/30'
                        : 'glass-card-sm'
                    }`}
                  >
                    {/* Badge */}
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 sm:px-4 py-1 rounded-full bg-aura-violet text-white text-xs font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${
                        plan.highlighted ? 'bg-aura-violet/20' : 'bg-white/5'
                      }`}>
                        <plan.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          plan.highlighted ? 'text-aura-violet' : 'text-aura-text-secondary'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-aura-text text-base sm:text-lg">{plan.name}</h3>
                        <p className="text-[10px] sm:text-xs text-aura-text-secondary">{plan.description}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4 sm:mb-6">
                      <span className="font-display font-bold text-3xl sm:text-4xl text-aura-text">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-aura-text-secondary text-sm sm:text-base">{plan.period}</span>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                      {plan.features.map((feature, i) => (
                        <li 
                          key={i} 
                          className="flex items-center gap-2 sm:gap-3 text-aura-text text-xs sm:text-sm"
                        >
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            plan.highlighted ? 'bg-aura-violet/20' : 'bg-white/5'
                          }`}>
                            <Check className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                              plan.highlighted ? 'text-aura-violet' : 'text-aura-text-secondary'
                            }`} />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => handleCTA(plan.name)}
                      className={`w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                        plan.highlighted
                          ? 'bg-aura-violet text-white hover:bg-aura-violet/90'
                          : 'bg-white/5 text-aura-text hover:bg-white/10'
                      }`}
                    >
                      {user && (userData?.subscription?.plan || 'starter').toLowerCase() === plan.id.toLowerCase() ? (
                        <>
                          <LayoutDashboard className="w-4 h-4" />
                          Go to dashboard
                        </>
                      ) : (
                        user ? (plan.id === 'starter' ? 'Go to dashboard' : 'Subscribe') : plan.cta
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
