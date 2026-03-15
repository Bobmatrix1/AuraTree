import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Check, ArrowLeft, CreditCard, Shield, Zap, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planName = searchParams.get('plan') || 'Pro';
  
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prices, setPrices] = useState({ pro: 1000, teams: 10000 });

  useEffect(() => {
    if (planName.toLowerCase() === 'starter') {
      navigate('/dashboard');
      return;
    }

    const fetchPrices = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/v1/system/settings');
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

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        // Redirect to home if not logged in
        toast.error('Please sign in to subscribe');
        navigate('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const planDetails = {
    Pro: {
      price: prices.pro.toLocaleString(),
      features: ['Unlimited social links', 'Custom themes & backgrounds', 'Custom profile picture', 'Full analytics dashboard', 'Priority support'],
      icon: Zap,
      color: 'text-aura-violet',
      bg: 'bg-aura-violet/10'
    },
    Teams: {
      price: prices.teams.toLocaleString(),
      features: ['Everything in Pro', 'Remove "aura-" prefix', 'Fully branded custom links', 'Team collaboration', 'Admin controls'],
      icon: Users,
      color: 'text-aura-cyan',
      bg: 'bg-aura-cyan/10'
    }
  }[planName as 'Pro' | 'Teams'] || {
    price: '0',
    features: [],
    icon: Zap,
    color: 'text-aura-violet',
    bg: 'bg-aura-violet/10'
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify({
          plan: planName.toLowerCase()
        })
      });

      const data = await response.json();
      if (data.success && data.data?.authorizationUrl) {
        window.location.href = data.data.authorizationUrl;
      } else {
        throw new Error(data.message || 'Failed to initialize payment');
      }
    } catch (error: any) {
      toast.error('Payment Error', { description: error.message });
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-aura-navy flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-aura-violet animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aura-navy py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-aura-text-secondary hover:text-aura-text transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Plan Summary */}
          <div className="space-y-8">
            <div>
              <h1 className="font-display font-bold text-3xl text-aura-text mb-2 text-aura-text">Complete your subscription</h1>
              <p className="text-aura-text-secondary">Unlock the full power of your Aura Tree.</p>
            </div>

            <div className={`glass-card p-8 border-aura-violet/20 bg-gradient-to-br from-aura-violet/5 to-transparent`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl ${planDetails.bg} flex items-center justify-center ${planDetails.color}`}>
                  <planDetails.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-2xl text-aura-text">{planName} Plan</h2>
                  <p className="text-aura-violet font-semibold">₦{planDetails.price} / month</p>
                </div>
              </div>

              <ul className="space-y-4">
                {planDetails.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-aura-text text-sm">
                    <Check className="w-5 h-5 text-aura-mint flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Checkout Action */}
          <div className="lg:pt-20">
            <div className="glass-card p-8 space-y-6">
              <h3 className="font-display font-bold text-xl text-aura-text">Order Summary</h3>
              
              <div className="space-y-3 border-b border-white/10 pb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-aura-text-secondary">{planName} Subscription</span>
                  <span className="text-aura-text font-medium">₦{planDetails.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-aura-text-secondary">VAT</span>
                  <span className="text-aura-text font-medium">₦0.00</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <span className="text-aura-text font-bold text-lg">Total Due</span>
                <span className="text-aura-violet font-display font-bold text-3xl">₦{planDetails.price}</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-2xl shadow-aura-violet/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    Pay with Paystack
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <Shield className="w-5 h-5 text-aura-mint opacity-70 flex-shrink-0" />
                <p className="text-[10px] text-aura-text-secondary leading-tight">
                  Secure payment powered by <strong>Paystack</strong>. Your data is encrypted and never stored on our servers.
                </p>
              </div>

              <p className="text-center text-[10px] text-aura-text-secondary px-4 uppercase tracking-widest font-semibold">
                By clicking pay, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
