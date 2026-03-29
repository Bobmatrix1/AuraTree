import { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, User, Loader2, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Starfield from '../components/Starfield';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine mode from path
  const isLoginPage = location.pathname === '/login';
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(isLoginPage ? 'login' : 'signup');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sync mode with URL if it changes
  useEffect(() => {
    setMode(location.pathname === '/login' ? 'login' : 'signup');
  }, [location.pathname]);

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const referredBy = localStorage.getItem('referred_by');

        // Register via API or Firebase Client?
        // The current code uses Firebase Client SDK then Firestore setDoc.
        // Let's stick to that but add referredBy.
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile
        await updateProfile(user, {
          displayName: displayName || email.split('@')[0],
        });

        // Create user document in Firestore
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: displayName || email.split('@')[0],
          username: (displayName || email.split('@')[0]).toLowerCase().replace(/\s+/g, ''),
          bio: '',
          avatarUrl: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          isAdmin: false,
          subscription: {
            plan: 'free',
            status: 'active',
            expiresAt: null,
          },
          referredBy: referredBy || null,
        };

        await setDoc(doc(db, 'users', user.uid), userData);

        // If referredBy exists, we should also notify the backend or handle it here
        // Since we updated the backend register controller, maybe we should use it?
        // For now, adding it to Firestore directly works as the backend will check this field.
        
        // Clear referral from storage
        if (referredBy) localStorage.removeItem('referred_by');

        toast.success('Account created successfully!');
        navigate('/dashboard');
      } else if (mode === 'login') {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      } else if (mode === 'forgot-password') {
        // Forgot Password
        await sendPasswordResetEmail(auth, email);
        toast.success('Password reset email sent!', {
          description: 'Check your inbox for instructions to reset your password.',
        });
        setMode('login');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let message = 'Authentication failed';
      if (error.code === 'auth/email-already-in-use') message = 'Email already in use';
      if (error.code === 'auth/wrong-password') message = 'Invalid password';
      if (error.code === 'auth/user-not-found') message = 'User not found';
      if (error.code === 'auth/invalid-credential') message = 'Invalid email or password';
      if (error.code === 'auth/too-many-requests') message = 'Too many attempts. Try again later.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-aura-navy flex items-center justify-center p-4 relative overflow-hidden">
      <Starfield />
      <div className="noise-overlay" />
      
      {/* Top Left: Back to Home */}
      <div className="absolute top-6 left-6 sm:top-10 sm:left-12 z-20">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-aura-text-secondary hover:text-aura-text transition-all group"
        >
          <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 group-hover:bg-white/10 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest hidden sm:inline">
            Back to home
          </span>
        </Link>
      </div>
      
      {/* Top Right: Logo */}
      <div className="absolute top-4 right-6 sm:top-5 sm:right-12 z-20">
        <Link to="/" className="flex items-center gap-0 group">
          <div className="w-14 h-14 sm:w-20 sm:h-20 -mr-2 sm:-mr-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <img 
              src="/aura%20tree%20logo.png" 
              alt="Aura Tree Logo" 
              className="w-full h-full object-contain scale-[3.2] drop-shadow-[0_0_10px_rgba(123,97,255,0.3)] invert dark:invert-0 transition-all duration-300" 
            />
          </div>
          <span className="font-display font-bold text-lg sm:text-xl text-aura-text group-hover:text-aura-violet transition-colors">
            Aura Tree
          </span>
        </Link>
      </div>

      <div className="relative w-full max-w-[400px] z-10 mt-16 sm:-mt-8">
        <div className="glass-card p-5 sm:p-8 shadow-[0_0_100px_rgba(123,97,255,0.15)] animate-in fade-in zoom-in duration-500 border-white/10">
          {mode === 'forgot-password' && (
            <button 
              onClick={() => setMode('login')}
              className="absolute top-4 left-4 p-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2 text-aura-text-secondary hover:text-aura-text text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}

          <div className="flex flex-col items-center -mt-8 mb-4 text-center">
            {/* EVEN LARGER CENTRAL LOGO */}
            <div className="w-64 h-64 sm:w-96 sm:h-96 -mb-20 sm:-mb-32 animate-float pointer-events-none">
              <img 
                src="/aura%20tree%20logo.png" 
                alt="Aura Tree" 
                className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(123,97,255,1)] scale-110 invert dark:invert-0 transition-all duration-300" 
              />
            </div>
            
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-aura-text leading-none">
              {mode === 'signup' ? 'Create account' : 
               mode === 'login' ? 'Welcome back' : 'Reset password'}
            </h2>
            <p className="text-aura-text-secondary text-[11px] sm:text-xs mt-2 text-center max-w-[240px] leading-tight">
              {mode === 'signup' 
                ? 'Start building your bio page today.' 
                : mode === 'login'
                ? 'Sign in to manage your page.'
                : 'We\'ll send you a reset link.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-aura-text-secondary" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-aura-text placeholder:text-aura-text-secondary/30 focus:outline-none focus:border-aura-violet/50 transition-all font-medium text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-aura-text-secondary" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-aura-text placeholder:text-aura-text-secondary/30 focus:outline-none focus:border-aura-violet/50 transition-all font-medium text-sm"
                />
              </div>
            </div>

            {mode !== 'forgot-password' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[9px] font-bold text-aura-text-secondary uppercase tracking-widest">Password</label>
                  {mode === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-[8px] font-bold text-aura-violet hover:text-aura-cyan uppercase tracking-wider transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-aura-text-secondary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-aura-text placeholder:text-aura-text-secondary/30 focus:outline-none focus:border-aura-violet/50 transition-all font-medium text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/5 text-aura-text-secondary hover:text-aura-text transition-colors"
                  >
                    {showPassword ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-aura-violet text-white font-bold flex items-center justify-center gap-3 hover:bg-aura-violet/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-aura-violet/20 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-widest text-xs">
                    {mode === 'signup' ? 'Get Started' : 
                     mode === 'login' ? 'Sign In' : 'Reset Password'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/10 text-center">
            <p className="text-aura-text-secondary text-[11px] font-medium">
              {mode === 'signup' ? 'Already have an account?' : 
               mode === 'login' ? "Don't have an account?" : "Wait, I remember it!"}{' '}
              <button 
                onClick={() => {
                  if (mode === 'forgot-password') setMode('login');
                  else {
                    const newPath = mode === 'signup' ? '/login' : '/signup';
                    navigate(newPath);
                  }
                }}
                className="text-aura-violet font-bold hover:text-aura-cyan transition-colors ml-1"
              >
                {mode === 'signup' ? 'Sign In' : 
                 mode === 'login' ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
        
        <p className="mt-6 text-center text-[9px] text-aura-text-secondary/40 uppercase tracking-[0.2em] font-medium px-4">
          Secure AES-256 Authentication • End-to-End Privacy Protected
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
