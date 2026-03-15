import { useState, useEffect } from 'react';
import { Menu, X, Sparkles, LogOut, LayoutDashboard, Sun, Moon, Shield } from 'lucide-react';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

interface NavigationProps {
  user: FirebaseUser | null;
  onDemoClick: () => void;
  onAuthClick: () => void;
  onLoginClick: () => void;
}

const Navigation = ({ user, onDemoClick, onAuthClick, onLoginClick }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setLoading] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setLoading(true);
  }, []);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setIsAdmin(userDoc.data()?.isAdmin === true);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Features', id: 'features' },
    { label: 'Themes', id: 'themes' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-aura-navy/90 backdrop-blur-xl border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            {/* Logo */}
            <div 
              className="flex items-center gap-0 group cursor-pointer"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <div className="w-14 h-14 sm:w-20 sm:h-20 -mr-2 sm:-mr-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <img 
                  src="/aura%20tree%20logo.png" 
                  alt="Aura Tree Logo" 
                  className="w-full h-full object-contain scale-[3.2] invert dark:invert-0 transition-all duration-300" 
                />
              </div>
              <span className="font-display font-bold text-lg sm:text-xl text-aura-text group-hover:text-aura-violet transition-colors">
                Aura <span className="text-aura-violet">Tree</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-sm text-aura-text-secondary hover:text-aura-text transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 text-aura-text-secondary transition-all"
                aria-label="Toggle theme"
              >
                {mounted && (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
              </button>

              <button 
                onClick={onDemoClick}
                className="text-sm text-aura-text-secondary hover:text-aura-text transition-colors"
              >
                View demo
              </button>

              {user ? (
                <div className="flex items-center gap-4">
                  {isAdmin && (
                    <a 
                      href="http://localhost:5000/admin" 
                      className="flex items-center gap-2 text-sm text-aura-cyan hover:text-aura-cyan/80 transition-colors"
                      title="Admin Panel"
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </a>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-aura-text-secondary hover:text-aura-pink transition-colors"
                    title="Log out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      window.location.href = '/dashboard';
                    }}
                    className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={onLoginClick}
                    className="text-sm text-aura-text hover:text-aura-violet transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={onAuthClick}
                    className="btn-primary text-sm py-2.5 px-5"
                  >
                    Create your page
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-aura-text"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${
          isMobileMenuOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
      >
        <div 
          className={`absolute inset-0 bg-aura-navy/40 backdrop-blur-[40px] transition-opacity duration-200 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        <div 
          className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-aura-navy/80 backdrop-blur-3xl border-l border-white/10 flex flex-col items-center justify-center gap-8 p-6 transition-transform duration-300 ease-out shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          data-lenis-prevent
        >
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
            <button 
              onClick={toggleTheme}
              className="p-3 rounded-full bg-white/5 border border-white/10 text-aura-text-secondary"
            >
              {mounted && (theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />)}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-full bg-white/5 border border-white/10 text-aura-text-secondary"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-8 w-full">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-3xl font-display font-bold text-aura-text hover:text-aura-violet transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
          
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />

          <button 
            onClick={() => { onDemoClick(); setIsMobileMenuOpen(false); }}
            className="text-xl text-aura-text-secondary hover:text-aura-text"
          >
            View demo
          </button>

          {user && (
            <button 
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="text-xl text-aura-pink/80 hover:text-aura-pink transition-colors flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          )}

          <div className="w-full px-4 mt-4 flex flex-col gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <a 
                    href="http://localhost:5000/admin" 
                    className="w-full text-center py-4 px-8 text-lg font-semibold flex items-center justify-center gap-2 text-aura-cyan bg-white/5 border border-aura-cyan/20 rounded-xl"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="w-5 h-5" />
                    Admin Panel
                  </a>
                )}
                <Link 
                  to="/dashboard"
                  className="btn-primary w-full text-center py-4 px-8 text-lg font-semibold flex items-center justify-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
              </>
            ) : (
              <button 
                onClick={() => { onAuthClick(); setIsMobileMenuOpen(false); }}
                className="btn-primary w-full py-4 px-8 text-lg font-semibold"
              >
                Create your page
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
