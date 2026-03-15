import { useState, useEffect } from 'react';
import { X, Sparkles, Mail, Lock, ArrowRight, User, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal = ({ isOpen, onClose, initialMode = 'signup' }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const html = document.documentElement;
      html.classList.add('lenis-stopped');
    } else {
      document.body.style.overflow = '';
      const html = document.documentElement;
      html.classList.remove('lenis-stopped');
    }
    return () => {
      document.body.style.overflow = '';
      const html = document.documentElement;
      html.classList.remove('lenis-stopped');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile
        await updateProfile(user, {
          displayName: displayName || email.split('@')[0],
        });

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
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
        });

        toast.success('Account created successfully!');
        onClose();
      } else if (mode === 'login') {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully!');
        onClose();
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-aura-navy/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div 
        className="relative w-full max-w-md glass-card p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in duration-300"
        data-lenis-prevent
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5 text-aura-text-secondary" />
        </button>

        {mode === 'forgot-password' && (
          <button 
            onClick={() => setMode('login')}
            className="absolute top-4 left-4 p-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2 text-aura-text-secondary hover:text-aura-text text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-aura-violet to-aura-cyan flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl text-aura-text text-center">
            {mode === 'signup' ? 'Create your account' : 
             mode === 'login' ? 'Welcome back' : 'Reset your password'}
          </h2>
          <p className="text-aura-text-secondary text-sm mt-2 text-center max-w-[280px]">
            {mode === 'signup' 
              ? 'Start building your powerful link-in-bio page today.' 
              : mode === 'login'
              ? 'Sign in to manage your Aura Tree page and analytics.'
              : 'Enter your email and we\'ll send you a link to reset your password.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-aura-text-secondary ml-1">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aura-text-secondary" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-aura-text placeholder:text-aura-text-secondary/30 focus:outline-none focus:border-aura-violet/50 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-aura-text-secondary ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aura-text-secondary" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-aura-text placeholder:text-aura-text-secondary/30 focus:outline-none focus:border-aura-violet/50 transition-colors"
              />
            </div>
          </div>

          {mode !== 'forgot-password' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-aura-text-secondary">Password</label>
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-xs text-aura-violet hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aura-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-aura-text placeholder:text-aura-text-secondary/30 focus:outline-none focus:border-aura-violet/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/5 text-aura-text-secondary hover:text-aura-text transition-colors"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-aura-violet text-white font-semibold flex items-center justify-center gap-2 hover:bg-aura-violet/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {mode === 'signup' ? 'Get Started' : 
                 mode === 'login' ? 'Sign In' : 'Send Reset Link'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-aura-text-secondary text-sm">
            {mode === 'signup' ? 'Already have an account?' : 
             mode === 'login' ? "Don't have an account?" : "Remember your password?"}{' '}
            <button 
              onClick={() => {
                if (mode === 'forgot-password') setMode('login');
                else setMode(mode === 'signup' ? 'login' : 'signup');
              }}
              className="text-aura-violet font-semibold hover:underline"
            >
              {mode === 'signup' ? 'Sign In' : 
               mode === 'login' ? 'Create Account' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
