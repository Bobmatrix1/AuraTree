import { X, Check, Minus, Sparkles, Zap, Users, BarChart3 } from 'lucide-react';
import React, { useEffect } from 'react';

interface ComparePlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComparePlansModal = ({ isOpen, onClose }: ComparePlansModalProps) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // If Lenis is being used, we should also handle it
      const lenisElement = document.querySelector('html');
      if (lenisElement) lenisElement.classList.add('lenis-stopped');
    } else {
      document.body.style.overflow = '';
      const lenisElement = document.querySelector('html');
      if (lenisElement) lenisElement.classList.remove('lenis-stopped');
    }
    return () => {
      document.body.style.overflow = '';
      const lenisElement = document.querySelector('html');
      if (lenisElement) lenisElement.classList.remove('lenis-stopped');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = [
    {
      title: 'Design & Customization',
      features: [
        { name: 'Standard Aura Themes', starter: true, pro: true, teams: true },
        { name: 'Custom Themes & Fonts', starter: false, pro: true, teams: true },
        { name: 'Custom Background (Image/Video)', starter: false, pro: true, teams: true },
        { name: 'Animated Link Styles', starter: false, pro: true, teams: true },
        { name: 'Remove Aura Branding', starter: false, pro: false, teams: true },
      ]
    },
    {
      title: 'Links & Branding',
      features: [
        { name: 'Social Link Limit', starter: '5 Links', pro: 'Unlimited', teams: 'Unlimited' },
        { name: 'Custom Link Slug', starter: 'aura-prefix-random', pro: 'aura-prefix-custom', teams: 'Fully Custom' },
        { name: 'Smart Platform Detection', starter: true, pro: true, teams: true },
        { name: 'Scheduled Links', starter: false, pro: true, teams: true },
        { name: 'Password Protected Links', starter: false, pro: false, teams: true },
      ]
    },
    {
      title: 'Analytics & Growth',
      features: [
        { name: 'Total View Tracking', starter: false, pro: true, teams: true },
        { name: 'Link Click Tracking', starter: false, pro: true, teams: true },
        { name: 'QR Code Scans', starter: false, pro: true, teams: true },
        { name: 'Referrer & Device Data', starter: false, pro: true, teams: true },
        { name: 'Analytics Export (CSV)', starter: false, pro: false, teams: true },
      ]
    },
    {
      title: 'Support & Management',
      features: [
        { name: 'Community Support', starter: true, pro: true, teams: true },
        { name: 'Priority Email Support', starter: false, pro: true, teams: true },
        { name: 'Dedicated Account Manager', starter: false, pro: false, teams: true },
        { name: 'Multi-user Access', starter: false, pro: false, teams: true },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-aura-navy/95 backdrop-blur-2xl"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden glass-card flex flex-col shadow-[0_0_100px_rgba(123,97,255,0.2)]"
        data-lenis-prevent
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-aura-violet/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-aura-violet" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-aura-text">Feature Comparison</h2>
              <p className="text-xs sm:text-sm text-aura-text-secondary">Compare plan details and benefits</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-aura-text-secondary hover:text-aura-text"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Head */}
            <thead className="sticky top-0 z-10 bg-aura-navy backdrop-blur-2xl border-b border-white/10 shadow-md">
              <tr>
                <th className="p-4 sm:p-6 text-sm font-semibold text-aura-text-secondary w-1/3 bg-aura-navy">Feature</th>
                <th className="p-4 sm:p-6 text-center bg-aura-navy">
                  <div className="flex flex-col items-center gap-1">
                    <Sparkles className="w-4 h-4 text-aura-text-secondary mb-1" />
                    <span className="text-sm font-bold text-aura-text">Starter</span>
                  </div>
                </th>
                <th className="p-4 sm:p-6 text-center bg-aura-navy">
                  <div className="flex flex-col items-center gap-1">
                    <Zap className="w-4 h-4 text-aura-violet mb-1" />
                    <span className="text-sm font-bold text-aura-text">Pro</span>
                  </div>
                </th>
                <th className="p-4 sm:p-6 text-center bg-aura-navy">
                  <div className="flex flex-col items-center gap-1">
                    <Users className="w-4 h-4 text-aura-cyan mb-1" />
                    <span className="text-sm font-bold text-aura-text">Teams</span>
                  </div>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {categories.map((category, idx) => (
                <React.Fragment key={idx}>
                  {/* Category Row */}
                  <tr className="bg-white/[0.03]">
                    <td colSpan={4} className="p-3 px-4 sm:px-6 text-xs font-bold uppercase tracking-widest text-aura-violet">
                      {category.title}
                    </td>
                  </tr>
                  
                  {category.features.map((feature, fIdx) => (
                    <tr key={fIdx} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 sm:p-6 text-sm text-aura-text font-medium">{feature.name}</td>
                      
                      {/* Starter Value */}
                      <td className="p-4 sm:p-6 text-center">
                        {typeof feature.starter === 'boolean' ? (
                          feature.starter ? <Check className="w-5 h-5 text-aura-mint mx-auto" /> : <Minus className="w-5 h-5 text-white/10 mx-auto" />
                        ) : (
                          <span className="text-xs font-medium text-aura-text-secondary">{feature.starter}</span>
                        )}
                      </td>

                      {/* Pro Value */}
                      <td className="p-4 sm:p-6 text-center">
                        {typeof feature.pro === 'boolean' ? (
                          feature.pro ? <Check className="w-5 h-5 text-aura-violet mx-auto" /> : <Minus className="w-5 h-5 text-white/10 mx-auto" />
                        ) : (
                          <span className="text-xs font-medium text-aura-violet font-bold">{feature.pro}</span>
                        )}
                      </td>

                      {/* Teams Value */}
                      <td className="p-4 sm:p-6 text-center">
                        {typeof feature.teams === 'boolean' ? (
                          feature.teams ? <Check className="w-5 h-5 text-aura-cyan mx-auto" /> : <Minus className="w-5 h-5 text-white/10 mx-auto" />
                        ) : (
                          <span className="text-xs font-medium text-aura-cyan font-bold">{feature.teams}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer CTA */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-white/[0.02] text-center">
          <p className="text-xs text-aura-text-secondary mb-4 italic">
            All plans include core security features and lightning-fast global CDN delivery.
          </p>
          <button 
            onClick={onClose}
            className="btn-primary py-3 px-10 text-sm font-bold"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparePlansModal;
