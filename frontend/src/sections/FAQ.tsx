import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

const FAQ = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const accordionRef = useRef<HTMLDivElement>(null);

  const faqs = [
    {
      question: 'How does the Affiliate Program work?',
      answer: 'It\'s simple! When you become an affiliate, you receive a unique referral link. You\'ll earn a 20% recurring monthly commission for every new customer who signs up for a Pro or Teams plan through your link.',
    },
    {
      question: 'How is my Aura Score calculated?',
      answer: 'Your Aura Score is a dynamic metric out of 100 that measures the health and influence of your page. It\'s calculated based on several factors, including your profile completeness (photo, bio), engagement (visits, click-through rate), and the diversity of your links.',
    },
    {
      question: 'Is there a limit to how many pages I can create?',
      answer: 'Yes, page creation is based on your plan. The Free plan includes 1 page. Upgrading to Pro gives you 2 pages, and the Teams plan unlocks unlimited pages for ultimate flexibility.',
    },
    {
      question: 'What makes your analytics different?',
      answer: 'We focus on accuracy. Our analytics track unique visitors based on their IP address, preventing the same person from inflating your view or click counts. This gives you a more realistic understanding of your audience reach and engagement.',
    },
    {
      question: 'Can I customize my profile link?',
      answer: 'Yes! On the Pro plan, you can choose a custom name with our official prefix (e.g., aura.tree/yourbrand). The Teams plan takes it a step further by allowing you to remove the "aura-" prefix entirely, giving you a fully branded, white-labeled link for your profile.',
    },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { y: -12, opacity: 0 },
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

      // Accordion animation
      gsap.fromTo(
        accordionRef.current,
        { y: 18, opacity: 0 },
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

  const handleChat = () => {
    toast.success('Opening chat...', {
      description: 'Our team is ready to help!',
    });
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative w-full min-h-screen py-16 sm:py-20 lg:py-0 flex items-center"
      style={{ zIndex: 90 }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="max-w-2xl lg:max-w-3xl mx-auto">
          {/* Title */}
          <div ref={titleRef} className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="font-display font-bold text-aura-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4">
              Questions <span className="text-gradient-violet">& answers</span>
            </h2>
          </div>

          {/* Accordion */}
          <div ref={accordionRef}>
            <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="glass-card-sm border-0 px-4 sm:px-6 data-[state=open]:bg-white/10 rounded-xl sm:rounded-2xl"
                >
                  <AccordionTrigger className="text-aura-text hover:no-underline py-4 sm:py-5 text-left text-sm sm:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-aura-text-secondary pb-4 sm:pb-5 leading-relaxed text-xs sm:text-sm">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* CTA */}
          <div className="mt-8 sm:mt-10 lg:mt-12 text-center">
            <p className="text-aura-text-secondary text-sm sm:text-base mb-3 sm:mb-4">Still have questions?</p>
            <button
              onClick={handleChat}
              className="inline-flex items-center gap-2 text-aura-violet font-medium hover:gap-3 transition-all group text-sm sm:text-base"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              Chat with us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
