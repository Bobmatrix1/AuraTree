import { useState, useEffect } from 'react';
import { X, Youtube, Instagram, Music, ShoppingBag, Image, FileText, Mic, Sparkles, GripVertical } from 'lucide-react';
import { SiYoutube, SiInstagram, SiSpotify, SiTiktok, SiX } from 'react-icons/si';
import { toast } from 'sonner';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_LINKS = [
  { id: '1', icon: SiYoutube as any, label: 'Latest YouTube Video', url: 'youtube.com', color: 'bg-[#FF0000]' },
  { id: '2', icon: SiInstagram as any, label: 'Photography Portfolio', url: 'instagram.com', color: 'bg-gradient-to-tr from-[#FFB800] via-[#FF0000] to-[#D300C5]' },
  { id: '3', icon: SiSpotify as any, label: 'Weekly Playlist', url: 'spotify.com', color: 'bg-[#1DB954]' },
  { id: '4', icon: SiTiktok as any, label: 'Dance Challenge', url: 'tiktok.com', color: 'bg-[#000000]' },
  { id: '5', icon: SiX as any, label: 'Daily Thoughts', url: 'twitter.com', color: 'bg-[#000000]' },
];

const DemoModal = ({ isOpen, onClose }: DemoModalProps) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'dashboard' | 'editor'>('preview');
  const [demoLinks, setDemoLinks] = useState(DEFAULT_LINKS);

  // Handle Body Lock, Scroll Isolation and State Reset
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('lenis-stopped');
      // Reset state whenever modal opens for a fresh start
      setDemoLinks(DEFAULT_LINKS);
      setActiveTab('preview');
    } else {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('lenis-stopped');
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('lenis-stopped');
    };
  }, [isOpen]);

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...demoLinks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newLinks.length) {
      [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
      setDemoLinks(newLinks);
      toast.success('Order updated');
    }
  };

  const simulateAddLink = () => {
    const input = document.getElementById('demoUrlInput') as HTMLInputElement;
    const url = input.value.toLowerCase();
    if (!url) return;
    
    let platform = 'web', Icon: any = Sparkles, color = 'bg-aura-violet', title = 'New Link';
    if (url.includes('youtube')) { platform = 'youtube'; Icon = SiYoutube; color = 'bg-[#FF0000]'; title = 'My YouTube Channel'; }
    else if (url.includes('instagram')) { platform = 'instagram'; Icon = SiInstagram; color = 'bg-gradient-to-tr from-[#FFB800] via-[#FF0000] to-[#D300C5]'; title = 'Follow me on Insta'; }
    else if (url.includes('spotify')) { platform = 'spotify'; Icon = SiSpotify; color = 'bg-[#1DB954]'; title = 'Listen on Spotify'; }
    else if (url.includes('tiktok')) { platform = 'tiktok'; Icon = SiTiktok; color = 'bg-[#000000]'; title = 'New TikTok Video'; }
    
    setDemoLinks([{ id: Date.now().toString(), icon: Icon, label: title, url, color }, ...demoLinks]);
    input.value = '';
    toast.success(`Smart Detection: ${platform.toUpperCase()}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-aura-navy/95 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl h-[90vh] glass-card flex flex-col shadow-2xl overflow-hidden border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src="/aura%20tree%20logo.png" className="w-10 h-10 sm:w-12 sm:h-12 object-contain scale-[3.2] invert dark:invert-0" />
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-aura-text">Aura Tree Demo</h2>
              <p className="text-xs text-aura-text-secondary">Interactive Platform Experience</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-aura-text-secondary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 p-3 sm:p-4 border-b border-white/10 overflow-x-auto flex-shrink-0 bg-white/[0.02]">
          {(['preview', 'dashboard', 'editor'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold capitalize transition-all ${
                activeTab === tab ? 'bg-aura-violet text-white shadow-lg' : 'text-aura-text-secondary hover:text-aura-text'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Container - SCROLL FIX WITH data-lenis-prevent */}
        <div className="flex-1 min-h-0 relative overflow-hidden bg-white/[0.01]">
          
          {activeTab === 'preview' && (
            <div className="h-full flex items-center justify-center p-4 overflow-y-auto" data-lenis-prevent>
              <div className="relative w-[260px] sm:w-[280px] h-[520px] sm:h-[580px] bg-aura-navy rounded-[3rem] p-2.5 shadow-2xl border-[6px] border-white/10 ring-1 ring-white/5 flex-shrink-0 flex flex-col">
                <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-aura-navy-light relative border border-aura-glass-border flex flex-col">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-aura-navy rounded-b-2xl z-10" />
                  
                  {/* Internal Phone Scroll Area - data-lenis-prevent is critical here */}
                  <div className="flex-1 overflow-y-auto no-scrollbar pt-10 sm:pt-12 px-4 pb-24 overscroll-contain" data-lenis-prevent>
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-aura-violet to-aura-cyan p-0.5 mb-3 shadow-xl flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-aura-navy-light flex items-center justify-center border-2 border-aura-navy-light overflow-hidden">
                          <img src="/aura%20tree%20logo.png" className="w-full h-full object-cover scale-[2.2] invert dark:invert-0 transition-all" />
                        </div>
                      </div>
                      <h3 className="font-display font-bold text-aura-text text-sm flex-shrink-0">@auratree</h3>
                      <p className="text-[10px] text-aura-text-secondary text-center mt-1 leading-tight flex-shrink-0 mb-6">Your links. Your aura. One powerful page.</p>

                      {/* Links List */}
                      <div className="w-full space-y-2">
                        {demoLinks.map((link) => (
                          <div key={link.id} className="w-full flex items-center gap-2 p-2.5 rounded-xl glass-card-sm border border-aura-glass-border shadow-sm flex-shrink-0 animate-in fade-in slide-in-from-top-2">
                            <div className={`w-7 h-7 rounded-lg ${link.color} flex items-center justify-center flex-shrink-0`}><link.icon className="w-3.5 h-3.5 text-white" /></div>
                            <span className="flex-1 text-left text-[10px] font-bold text-aura-text truncate">{link.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Branding - Now part of the scrollable content */}
                      <div className="mt-12 mb-6 flex justify-center items-center gap-1.5 opacity-30 flex-shrink-0">
                        <Sparkles className="w-2.5 h-2.5 text-aura-violet" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-aura-text">Aura Tree</span>
                      </div>
                      </div>
                      </div>
                      </div>
                      </div>
                      </div>
                      )}

          {activeTab === 'dashboard' && (
            <div className="h-full p-4 sm:p-8 overflow-y-auto overscroll-contain" data-lenis-prevent>
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-card-sm p-6 border border-aura-glass-border bg-white/[0.02]">
                    <h3 className="font-display font-bold text-base text-aura-text mb-4">Live Insights</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[{v:'12.5K', l:'Views', c:'text-aura-violet'}, {v:'3.2K', l:'Clicks', c:'text-aura-cyan'}, {v:'847', l:'QR Scans', c:'text-aura-pink'}, {v:'68%', l:'CTR', c:'text-aura-mint'}].map((s, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className={`font-display font-bold text-xl ${s.c}`}>{s.v}</p>
                          <p className="text-[10px] text-aura-text-secondary uppercase tracking-widest font-bold">{s.l}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card-sm p-6 border border-aura-glass-border flex flex-col justify-center text-center bg-white/[0.02]">
                    <div className="text-4xl font-display font-bold text-aura-mint">+24%</div>
                    <p className="text-sm text-aura-text-secondary mt-1">Growth this week</p>
                  </div>
                </div>
                <div className="glass-card-sm p-6 border border-aura-glass-border bg-white/[0.02]">
                  <h3 className="font-display font-bold text-base text-aura-text mb-4">Quick Management</h3>
                  <div className="space-y-3">
                    {['◈ Customize Theme', '✎ Edit Profile', '+ Add New Link'].map((text, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm font-medium text-aura-text-secondary flex justify-between items-center">{text}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="h-full p-4 sm:p-8 overflow-y-auto overscroll-contain" data-lenis-prevent>
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="glass-card-sm p-5 sm:p-6 border border-aura-glass-border bg-white/[0.02]">
                  <h3 className="font-display font-bold text-lg text-aura-text mb-6">Link Management</h3>
                  <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <input type="text" id="demoUrlInput" placeholder="Paste a URL (youtube.com)..." className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-aura-text text-sm focus:outline-none focus:border-aura-violet/50" onKeyDown={e => e.key === 'Enter' && simulateAddLink()} />
                    <button onClick={simulateAddLink} className="px-6 py-3 rounded-xl bg-aura-violet text-white font-bold hover:bg-aura-violet/90 transition-all text-sm whitespace-nowrap shadow-lg shadow-aura-violet/20">Add Link</button>
                  </div>
                  <div className="space-y-3 pb-10">
                    {demoLinks.map((link, index) => (
                      <div key={link.id} className="flex items-center gap-3 sm:gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 group animate-in fade-in slide-in-from-left-2">
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <button onClick={() => moveLink(index, 'up')} disabled={index === 0} className="p-1 rounded hover:bg-white/10 disabled:opacity-10 text-aura-text-secondary"><GripVertical className="w-3.5 h-3.5 rotate-90" /></button>
                          <button onClick={() => moveLink(index, 'down')} disabled={index === demoLinks.length - 1} className="p-1 rounded hover:bg-white/10 disabled:opacity-10 text-aura-text-secondary"><GripVertical className="w-3.5 h-3.5 rotate-90" /></button>
                        </div>
                        <div className={`w-9 h-9 rounded-xl ${link.color} flex items-center justify-center flex-shrink-0 shadow-lg`}><link.icon className="w-4 h-4 text-white" /></div>
                        <div className="flex-1 min-w-0"><p className="text-aura-text font-bold text-sm truncate">{link.label}</p><p className="text-[10px] text-aura-text-secondary truncate">{link.url}</p></div>
                        <button onClick={() => { setDemoLinks(demoLinks.filter(l => l.id !== link.id)); toast.error('Link removed'); }} className="p-2 text-aura-text-secondary hover:text-red-500 transition-all"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoModal;
