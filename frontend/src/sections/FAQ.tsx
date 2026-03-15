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
      question: 'Can I use a custom domain?',
      answer: 'Yes! Pro and Teams plans allow you to connect your own domain. Simply add your domain in settings, configure the DNS records, and your Aura Tree page will be live on your custom URL within minutes.',
    },
    {
      question: 'Is there a limit on links?',
      answer: 'No, all plans include unlimited links. Add as many links as you need to showcase your content, products, and social profiles.',
    },
    {
      question: 'Can I reorder links?',
      answer: 'Absolutely! Our drag-and-drop interface makes it easy to reorder your links. Simply grab the handle next to any link and drag it to your desired position. Changes are reflected instantly on your live page.',
    },
    {
      question: 'How does analytics work?',
      answer: 'We track views, clicks, and referrers in real-time. The dashboard shows daily, weekly, and monthly trends, click-through rates for each link, and your top traffic sources. No additional setup required.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time. Your page will remain active until the end of your billing period, then automatically downgrade to the free plan with all your links preserved.',
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
