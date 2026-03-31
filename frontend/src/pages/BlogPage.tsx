import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  Search,
  Clock,
  User,
  ChevronRight,
  Zap,
  Mail,
  Newspaper,
  Calendar,
  Share2,
  Bookmark
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../sections/Footer';
import Starfield from '../components/Starfield';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

interface PageProps {
  onContactClick: () => void;
}

const BlogPage = ({ onContactClick }: PageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [subEmail, setSubEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

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
      if (!selectedPost) {
        setTimeout(() => {
          if (!containerRef.current) return;
          
          const heroTargets = gsap.utils.toArray('.blog-hero-content > *');
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

          const revealPosts = gsap.utils.toArray('.reveal-post');
          if (revealPosts.length > 0) {
            revealPosts.forEach((section: any) => {
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
          }
        }, 100);
      }
    }, containerRef);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, [selectedPost]);

  const categories = ["All Posts", "Branding", "Growth", "Product", "Creator News"];

  const posts = [
    {
      id: 1,
      title: "How to Build a High Converting Personal Brand in 2026",
      excerpt: "Your personal brand is your most valuable asset. Learn the key strategies to stand out in a saturated digital landscape.",
      content: `
        <p>In 2026, the digital landscape has shifted from simple discovery to deep connection. Your personal brand isn't just about what you do; it's about the Aura you project across platforms.</p>
        
        <h3>1. The Shift to Authentic Narrative</h3>
        <p>Audiences are no longer looking for polished corporate facades. They want raw and authentic stories. Successful creators on AuraTree are those who lean into their unique journey including their failures and successes.</p>
        
        <h3>2. Visual Cohesion is Non Negotiable</h3>
        <p>Your digital identity needs a visual home. By using centralized hubs like AuraTree you ensure that whether a user finds you on Spotify or YouTube the transition to your personal ecosystem is seamless and high fidelity.</p>
        
        <h3>3. Data Driven Optimization</h3>
        <p>Stop guessing and start knowing. Use your Aura Score to understand which links are performing and why. A high converting brand is one that adapts based on actual audience behavior.</p>
      `,
      category: "Branding",
      author: "Aura Team",
      date: "Mar 28, 2026",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&auto=format&fit=crop&q=60",
      featured: true
    },
    {
      id: 2,
      title: "The Psychology of Color in Digital Identity",
      excerpt: "Why choosing the right Aura colors can increase your click through rate by up to 40 percent.",
      content: `
        <p>Color theory is one of the most underutilized tools in a creator's arsenal. The colors you choose for your AuraTree page speak to your audience before they read a single word.</p>
        
        <h3>The Power of Violet and Cyan</h3>
        <p>Our signature AuraTree palette isn't just for show. Violet represents creativity and wisdom while Cyan brings a sense of modern technology and trust. Together they create a premium tech feel.</p>
        
        <h3>Accessibility and Contrast</h3>
        <p>A beautiful page is useless if it is unreadable. We always recommend high contrast links to ensure that your call to actions stand out against your background gradients.</p>
      `,
      category: "Product",
      author: "Design Lab",
      date: "Mar 25, 2026",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: 3,
      title: "5 Links Every Creator Needs on Their Bio Page",
      excerpt: "Are you overwhelming your audience? Here is the essential structure for a high performance hub.",
      content: `
        <p>The Paradox of Choice is real. If you give your audience 20 links they often click none. Here is the perfect 5 link hierarchy:</p>
        
        <ul>
          <li><strong>1. The Hero Link:</strong> Your most important current goal like a new song or course launch.</li>
          <li><strong>2. Social Anchor:</strong> Your primary high engagement social platform.</li>
          <li><strong>3. Community:</strong> A way to join your newsletter or Discord.</li>
          <li><strong>4. Store Support:</strong> Your monetization engine.</li>
          <li><strong>5. Contact:</strong> A professional touchpoint for brands.</li>
        </ul>
      `,
      category: "Growth",
      author: "Growth Engine",
      date: "Mar 22, 2026",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: 4,
      title: "Introducing Aura Score: Real time Engagement Analytics",
      excerpt: "Go behind the scenes of our new algorithm designed to help you optimize your digital presence.",
      content: `
        <p>We are thrilled to announce the launch of Aura Score which is a revolutionary way to measure the health of your digital hub.</p>
        
        <h3>How it Works</h3>
        <p>The score isn't just based on clicks. It factors in click through rate, aesthetic consistency, and link variety. A high Aura Score means your page is optimized for the best possible user experience.</p>
      `,
      category: "Product",
      author: "Engineering",
      date: "Mar 18, 2026",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: 5,
      title: "From Side Hustle to Full time: A Creator's Journey",
      excerpt: "How one AuraTree user grew their audience from 500 to 500,000 in less than 12 months.",
      content: `
        <p>Becoming a full time creator is the dream for millions. Today we are talking to Sarah who is an artist who turned her digital presence into a six figure business.</p>
        
        <h3>Consistency over Perfection</h3>
        <p>I spent too much time worrying about the quality of my first 10 videos Sarah says. The turning point was when I realized that consistent interaction matters more than perfect production.</p>
      `,
      category: "Creator News",
      author: "Community",
      date: "Mar 15, 2026",
      readTime: "10 min read",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: 6,
      title: "The Future of Link in Bio: Moving Beyond the List",
      excerpt: "Predicting the next 5 years of personal landing pages and the rise of interactive digital nodes.",
      content: `
        <p>The Link in Bio is evolving. It is no longer a static list of URLs but it is becoming an operating system for your personal brand.</p>
      `,
      category: "Branding",
      author: "Vision Team",
      date: "Mar 10, 2026",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60"
    }
  ];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All Posts" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail || !subEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/system/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 'Subscribed successfully!');
        setSubEmail('');
      } else {
        toast.error(data.message || 'Subscription failed');
      }
    } catch (error) {
      toast.error('Connection error. Please try again later.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleShare = async () => {
    if (!selectedPost) return;
    
    const shareData = {
      title: selectedPost.title,
      text: selectedPost.excerpt,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const featuredPost = posts.find(p => p.featured);
  const recentPosts = filteredPosts.filter(p => !p.featured);

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
          <button 
            onClick={() => selectedPost ? setSelectedPost(null) : navigate('/')}
            className="flex items-center justify-center w-12 h-12 text-aura-text-secondary hover:text-aura-text transition-all group bg-aura-navy/40 backdrop-blur-xl rounded-full border border-white/10 hover:border-aura-violet shadow-2xl"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        {selectedPost ? (
          /* --- DETAILED ARTICLE VIEW --- */
          <article className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <button 
              onClick={() => setSelectedPost(null)}
              className="flex items-center gap-2 text-aura-text-secondary hover:text-aura-text mb-8 transition-colors group text-sm font-bold uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Articles
            </button>

            <div className="aspect-video rounded-[32px] overflow-hidden mb-10 border border-white/10 shadow-2xl bg-white/5">
              <img src={selectedPost.image} className="w-full h-full object-cover" alt="" />
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 rounded-full bg-aura-violet/20 text-aura-violet text-[10px] font-black uppercase tracking-widest">{selectedPost.category}</span>
              <div className="flex items-center gap-2 text-aura-text-secondary text-[10px] font-bold uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                {selectedPost.readTime}
              </div>
              <div className="flex items-center gap-2 text-aura-text-secondary text-[10px] font-bold uppercase tracking-widest">
                <Calendar className="w-3 h-3" />
                {selectedPost.date}
              </div>
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl mb-8 leading-tight">
              {selectedPost.title}
            </h1>

            <div className="flex items-center gap-4 mb-12 p-4 rounded-2xl bg-white/[0.02] border border-white/5 w-fit">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aura-violet to-aura-cyan p-[1px]">
                <div className="w-full h-full rounded-full bg-aura-navy flex items-center justify-center">
                  <img src="/aura%20tree%20icon.png" className="w-6 h-6 object-contain opacity-50" alt="" />
                </div>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">{selectedPost.author}</p>
                <p className="text-[10px] text-aura-text-secondary font-bold uppercase tracking-widest">Aura Insights Expert</p>
              </div>
            </div>

            <div 
              className="prose prose-invert prose-aura max-w-none text-aura-text-secondary text-lg leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            />

            <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 text-aura-text-secondary hover:text-aura-text transition-colors bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl border border-white/5 hover:border-aura-violet group"
                >
                  <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-widest">Share Article</span>
                </button>
              </div>
            </div>
          </article>
        ) : (
          /* --- MAIN BLOG LIST VIEW --- */
          <>
            {/* Hero */}
            <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
              <div className="blog-hero-content text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aura-violet/10 border border-aura-violet/20 text-aura-violet text-[10px] uppercase tracking-widest font-bold mb-6">
                  <Newspaper className="w-3 h-3" />
                  <span>Aura Insights</span>
                </div>
                <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-7xl mb-6 leading-tight">
                  Stories from the <br className="hidden lg:block"/> <span className="text-gradient-violet">Creator Frontier.</span>
                </h1>
                <p className="text-aura-text-secondary text-base lg:text-xl leading-relaxed max-w-2xl mx-auto">
                  Deep dives into branding, growth strategies, and the technology powering the next generation of digital identity.
                </p>
              </div>
            </section>

            {/* Categories & Search */}
            <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-y border-white/5 py-6">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 w-full md:w-auto">
                  {categories.map((cat, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                        activeCategory === cat ? 'bg-aura-violet text-white shadow-lg shadow-aura-violet/20' : 'bg-white/5 text-aura-text-secondary hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-aura-text-secondary" />
                  <input 
                    type="text"
                    placeholder="Search articles..."
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-aura-violet transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Results Grid */}
            <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
              {filteredPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map((post) => (
                    <div 
                      key={post.id} 
                      onClick={() => handlePostClick(post)}
                      className="reveal-post flex flex-col group cursor-pointer"
                    >
                      <div className="aspect-[16/10] rounded-3xl overflow-hidden mb-6 relative bg-white/5">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[9px] font-black uppercase tracking-widest">{post.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-4 text-[10px] text-aura-text-secondary font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </div>
                        <span>•</span>
                        {post.date}
                      </div>
                      <h3 className="font-display font-bold text-xl mb-4 group-hover:text-aura-violet transition-colors leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-aura-text-secondary text-sm leading-relaxed mb-6 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                          <User className="w-3 h-3 text-aura-text-secondary" />
                        </div>
                        <span className="text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest">{post.author}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/[0.02] rounded-[32px] border border-dashed border-white/10">
                  <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <h3 className="font-display font-bold text-xl mb-2">No articles found</h3>
                  <p className="text-aura-text-secondary">Try adjusting your search or category filter.</p>
                </div>
              )}
            </section>
          </>
        )}

        {/* Newsletter Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
          <div className="glass-card p-10 lg:p-16 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-96 h-96 bg-aura-violet/10 blur-[120px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-aura-cyan/5 blur-[120px] -ml-48 -mb-48" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-aura-violet/20 flex items-center justify-center mx-auto mb-8">
                <Mail className="w-8 h-8 text-aura-violet" />
              </div>
              <h2 className="font-display font-bold text-3xl lg:text-4xl mb-6">Stay ahead of the curve.</h2>
              <p className="text-aura-text-secondary text-base lg:text-lg mb-10 leading-relaxed">
                Join 50,000+ creators receiving our weekly digest on digital branding, platform growth, and early access to AuraTree features.
              </p>
              
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-aura-violet transition-all"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  required
                />
                <button 
                  type="submit"
                  disabled={isSubscribing}
                  className="btn-primary py-4 px-8 rounded-2xl font-bold uppercase tracking-widest text-xs whitespace-nowrap disabled:opacity-50"
                >
                  {isSubscribing ? 'Joining...' : 'Subscribe'}
                </button>
              </form>
              <p className="mt-6 text-[10px] text-aura-text-secondary uppercase tracking-widest">No spam. Only high-signal content.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer onContactOpenChange={onContactClick} />
    </div>
  );
};

export default BlogPage;
