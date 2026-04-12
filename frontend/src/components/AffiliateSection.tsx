import { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  Copy, 
  Check, 
  Wallet, 
  Clock, 
  History,
  CreditCard,
  Banknote,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronDown,
  Share2,
  X
} from 'lucide-react';
import { auth } from '../config/firebase';
import { toast } from 'sonner';

import { API_V1_URL } from '../config/api';

interface AffiliateData {
  referralCode: string;
  totalEarnings: number;
  pendingEarnings: number;
  withdrawableBalance: number;
  stats: {
    clicks: number;
    signups: number;
    activeSubscribers: number;
  };
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

const AffiliateSection = ({ userData, auraTreeId }: { userData: any, auraTreeId?: string }) => {
  const [isAffiliate, setIsAffiliate] = useState(userData?.isAffiliate || false);
  const [loading, setLoading] = useState(true);
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showUpdateBankModal, setShowUpdateBankModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isUpdatingBank, setIsUpdatingBank] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const referralsPerPage = 20;

  // Registration form state
  const [regForm, setRegForm] = useState({
    fullName: userData?.displayName || '',
    email: userData?.email || '',
    phoneNumber: '',
    withdrawalMethod: 'Bank Transfer',
    bankName: '',
    accountNumber: '',
    accountName: userData?.displayName || '',
  });

  const NIGERIAN_BANKS = [
    "AB Microfinance Bank", "Access Bank", "Accion Microfinance Bank", "Addosser Microfinance Bank",
    "Alternative Bank", "Bank of Agriculture (BOA)", "Bank of Industry (BOI)", "Boctrust Microfinance Bank",
    "Bowen Microfinance Bank", "Carbon (Paylater)", "Citibank Nigeria", "Coronation Merchant Bank",
    "Covenant Microfinance Bank", "Development Bank of Nigeria (DBN)", "Ecobank Nigeria", "Eyowo",
    "FairMoney", "Federal Mortgage Bank of Nigeria (FMBN)", "Fidelity Bank", "Fina Trust Microfinance Bank",
    "First Bank of Nigeria", "First City Monument Bank (FCMB)", "FBNQuest Merchant Bank", "Fortis Microfinance Bank",
    "Globus Bank", "Greenwich Merchant Bank", "Grooming Microfinance Bank", "Guaranty Trust Bank (GTBank)",
    "Infinity Microfinance Bank", "Infrastructure Bank", "Jaiz Bank", "Keystone Bank", "Kuda Bank",
    "LAPO Microfinance Bank", "Lotus Bank", "MIC Microfinance Bank", "Mintyn Bank", "Mkobo Microfinance Bank",
    "Moniepoint Microfinance Bank", "Mutual Trust Microfinance Bank", "Nigerian Export-Import Bank (NEXIM)",
    "NIRSAL Microfinance Bank", "Nova Merchant Bank", "NPF Microfinance Bank", "Opay (OPay MFB)",
    "Optimus Bank", "PalmPay", "Paga", "Parallex Bank", "Polaris Bank", "Premium Trust Bank",
    "Providus Bank", "Rand Merchant Bank Nigeria", "Raven Bank", "Rubies Bank", "Signature Bank",
    "Sparkle", "Stanbic IBTC Bank", "Standard Chartered Bank Nigeria", "Sterling Bank", "Summit Bank",
    "SunTrust Bank", "Taj Bank", "Titan Trust Bank", "Union Bank", "United Bank for Africa (UBA)",
    "Unity Bank", "VFD Microfinance Bank", "Wema Bank", "Zenith Bank"
  ];

  const filteredBanks = NIGERIAN_BANKS.filter(bank => 
    bank.toLowerCase().includes((regForm.bankName || '').toLowerCase())
  );

  const fetchAffiliateData = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const url = new URL(`${API_V1_URL}/affiliates/me`);
      if (auraTreeId) url.searchParams.append('auraTreeId', auraTreeId);
      
      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAffiliateData(data.data);
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const url = new URL(`${API_V1_URL}/affiliates/referrals`);
      if (auraTreeId) url.searchParams.append('auraTreeId', auraTreeId);

      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setReferrals(data.data);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  useEffect(() => {
    fetchAffiliateData();
    fetchReferrals();
  }, [auraTreeId]);

  // If auraTreeId is provided, we might be viewing the team's affiliate data
  // Only show registration if not viewing a team or if the owner themselves is not an affiliate
  const showRegistration = !isAffiliate && !auraTreeId;

  // Re-check isAffiliate status if we get data
  useEffect(() => {
    if (affiliateData) {
      setIsAffiliate(true);
    }
  }, [affiliateData]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (regForm.accountNumber.length !== 10) {
      toast.error('Invalid Account Number', { description: 'Account number must be exactly 10 digits.' });
      return;
    }

    setIsRegistering(true);

    // Trigger Ad for Free users
    if (userData?.subscription?.plan === 'free' || !userData?.subscription) {
      window.open("https://quge5.com/88/tag.min.js?zone=228814", "_blank");
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${API_V1_URL}/affiliates/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(regForm)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Welcome to the Affiliate Program!');
        setIsAffiliate(true);
        setAffiliateData(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error('Registration failed', { description: error.message });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUpdateBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regForm.accountNumber.length !== 10) {
      toast.error('Invalid Account Number', { description: 'Account number must be exactly 10 digits.' });
      return;
    }

    setIsUpdatingBank(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${API_V1_URL}/affiliates/bank-details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bankName: regForm.bankName,
          accountNumber: regForm.accountNumber,
          accountName: regForm.accountName
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Bank details updated successfully');
        setShowUpdateBankModal(false);
        fetchAffiliateData();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error('Update failed', { description: error.message });
    } finally {
      setIsUpdatingBank(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 1000) {
      toast.error('Minimum withdrawal is ₦1,000');
      return;
    }

    setIsWithdrawing(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${API_V1_URL}/affiliates/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Withdrawal request submitted!');
        setShowWithdrawModal(false);
        fetchAffiliateData(); // Refresh balance
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error('Withdrawal failed', { description: error.message });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/signup?ref=${affiliateData?.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied!');
  };

  // Pagination logic
  const indexOfLastReferral = currentPage * referralsPerPage;
  const indexOfFirstReferral = indexOfLastReferral - referralsPerPage;
  const currentReferrals = referrals.slice(indexOfFirstReferral, indexOfLastReferral);
  const totalPages = Math.ceil(referrals.length / referralsPerPage);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-aura-violet animate-spin" />
        <p className="text-aura-text-secondary mt-4 animate-pulse font-medium">Loading Affiliate Portal...</p>
      </div>
    );
  }

  if (!isAffiliate) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="glass-card p-1 bg-gradient-to-br from-aura-violet/20 to-aura-cyan/20">
          <div className="bg-aura-navy/80 backdrop-blur-3xl rounded-[23px] p-8 sm:p-12 overflow-hidden relative">
            {/* Decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-aura-violet/20 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-aura-cyan/20 blur-[100px] rounded-full" />

            <div className="relative z-10 text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aura-violet/10 border border-aura-violet/20 text-aura-violet text-xs font-bold uppercase tracking-widest mb-6">
                <ShieldCheck className="w-4 h-4" /> Affiliate Program
              </div>
              <h2 className="font-display font-bold text-4xl sm:text-5xl text-aura-text mb-4">
                Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-aura-violet to-aura-cyan">20% Recurring</span> Commission
              </h2>
              <p className="text-aura-text-secondary text-lg max-w-2xl mx-auto">
                Join our affiliate program and earn a 20% commission on every subscription purchase made by users you refer. For as long as they stay subscribed.
              </p>
            </div>

            <form onSubmit={handleRegister} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={regForm.fullName}
                  onChange={e => setRegForm({...regForm, fullName: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:border-aura-violet/50 outline-none transition-all font-medium" 
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={regForm.email}
                  onChange={e => setRegForm({...regForm, email: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:border-aura-violet/50 outline-none transition-all font-medium" 
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Bank Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    value={regForm.bankName}
                    onFocus={() => setShowBankDropdown(true)}
                    onBlur={() => setTimeout(() => setShowBankDropdown(false), 200)}
                    onChange={e => setRegForm({...regForm, bankName: e.target.value.replace(/[^a-zA-Z\s\(\)]/g, '')})}
                    className="w-full pl-5 pr-12 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:border-aura-violet/50 outline-none transition-all font-medium" 
                    placeholder="Search or type bank name"
                  />
                  <button 
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowBankDropdown(!showBankDropdown);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-aura-text-secondary hover:text-aura-violet transition-colors group"
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showBankDropdown ? 'rotate-180 text-aura-violet' : 'group-hover:scale-110'}`} />
                  </button>
                  {showBankDropdown && filteredBanks.length > 0 && (
                    <div className="absolute z-[100] left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-aura-navy border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl no-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                      {filteredBanks.map((bank, index) => (
                        <button
                          key={index}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setRegForm({...regForm, bankName: bank});
                            setTimeout(() => setShowBankDropdown(false), 100);
                          }}
                          className={`w-full px-5 py-3 text-left text-sm transition-all border-b border-white/5 last:border-0 font-medium flex items-center justify-between group cursor-pointer ${
                            regForm.bankName === bank 
                              ? 'bg-aura-violet text-white' 
                              : 'text-aura-text hover:bg-white/10 active:bg-aura-violet/40'
                          }`}
                        >
                          <span className="group-hover:translate-x-1 transition-transform duration-200">{bank}</span>
                          {regForm.bankName === bank && <Check className="w-4 h-4 text-white animate-in zoom-in duration-300" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Account Number</label>
                <input 
                  type="text" 
                  required
                  maxLength={10}
                  value={regForm.accountNumber}
                  onChange={e => setRegForm({...regForm, accountNumber: e.target.value.replace(/[^0-9]/g, '').slice(0, 10)})}
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:border-aura-violet/50 outline-none transition-all font-medium" 
                  placeholder="10 Digits"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Bank Account Name</label>
                <input 
                  type="text" 
                  required
                  value={regForm.accountName}
                  onChange={e => setRegForm({...regForm, accountName: e.target.value.replace(/[^a-zA-Z\s]/g, '')})}
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:border-aura-violet/50 outline-none transition-all font-medium" 
                  placeholder="Name on bank account"
                />
              </div>
              
              <div className="md:col-span-2 pt-4">
                <button 
                  type="submit"
                  disabled={isRegistering}
                  className="w-full btn-primary py-5 text-lg font-bold shadow-2xl shadow-aura-violet/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                >
                  {isRegistering ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Become an Affiliate <ArrowUpRight className="w-6 h-6" /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Referral Link Card */}
      <div className="glass-card p-6 border-aura-violet/30 bg-gradient-to-br from-aura-violet/10 to-transparent flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-aura-violet/20 flex items-center justify-center">
            <Share2 className="w-7 h-7 text-aura-violet" />
          </div>
          <div>
            <h3 className="text-aura-text font-bold text-lg">Your Referral Link</h3>
            <p className="text-aura-text-secondary text-sm">Share this link and start earning today.</p>
          </div>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <div className="flex-1 md:w-64 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-aura-text text-sm font-medium truncate flex items-center">
            {window.location.origin}/signup?ref={affiliateData?.referralCode}
          </div>
          <button 
            onClick={copyReferralLink}
            className="p-3 bg-aura-violet text-white rounded-xl hover:bg-aura-violet/90 transition-all shadow-lg"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Stats & Wallet */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Fintech Wallet Card */}
          <div className="relative h-64 w-full group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF] via-[#00D9FF] to-[#7B61FF] rounded-[32px] shadow-[0_20px_50px_rgba(123,97,255,0.4)] animate-gradient rotate-1 group-hover:rotate-0 transition-transform duration-500" />
            <div className="absolute inset-[1px] bg-[#070913]/90 backdrop-blur-3xl rounded-[31px] p-8 flex flex-col justify-between overflow-hidden">
              {/* Card Patterns */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl -mr-32 -mt-32 rounded-full" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-aura-cyan/10 blur-2xl -ml-16 -mb-16 rounded-full" />
              
              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-aura-text-secondary uppercase tracking-[0.3em]">Affiliate Wallet</p>
                  <h4 className="text-white font-display font-bold text-xl tracking-tight">Aura Tree Platinum</h4>
                </div>
                <CreditCard className="text-white/20 w-10 h-10" />
              </div>

              <div className="relative z-10">
                <p className="text-xs text-white/60 mb-1">Withdrawable Balance</p>
                <div className="flex items-end gap-3">
                  <h2 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight">
                    ₦{(affiliateData?.withdrawableBalance || 0).toLocaleString()}
                  </h2>
                  <div className="mb-2 px-2 py-1 rounded-full bg-aura-mint/20 text-aura-mint text-[10px] font-bold uppercase tracking-wider border border-aura-mint/30">
                    Active
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex justify-between items-end">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Total Earned</p>
                    <p className="text-sm font-bold text-white">₦{(affiliateData?.totalEarnings || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Pending</p>
                    <p className="text-sm font-bold text-white/60">₦{(affiliateData?.pendingEarnings || 0).toLocaleString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={(affiliateData?.withdrawableBalance || 0) < 1000}
                  className="bg-white text-aura-navy py-2.5 px-6 rounded-xl font-bold text-xs hover:bg-aura-cyan transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Total Signups', value: affiliateData?.stats.signups || 0, icon: Users, color: 'text-aura-violet', bg: 'bg-aura-violet/10' },
              { label: 'Active Subs', value: affiliateData?.stats.activeSubscribers || 0, icon: TrendingUp, color: 'text-aura-mint', bg: 'bg-aura-mint/10' },
              { label: 'Link Clicks', value: affiliateData?.stats.clicks || 0, icon: ArrowUpRight, color: 'text-aura-cyan', bg: 'bg-aura-cyan/10' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 flex flex-col gap-4 hover:border-white/20 transition-all group">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-aura-text">{stat.value}</p>
                  <p className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Referrals Table */}
          <div className="glass-card overflow-hidden border-aura-glass-border">
            <div className="p-6 border-b border-aura-glass-border flex items-center justify-between bg-white/[0.01]">
              <h3 className="font-display font-bold text-lg text-aura-text">Recent Referrals</h3>
              <Users className="w-5 h-5 text-aura-text-secondary" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-6 py-4 text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest">Date Joined</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest">Plan</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {referrals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-aura-text-secondary italic">
                        No referrals yet. Share your link to start growing!
                      </td>
                    </tr>
                  ) : (
                    currentReferrals.map((ref, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-aura-violet/20 flex items-center justify-center font-bold text-[10px] text-aura-violet overflow-hidden">
                              {ref.avatarUrl ? <img src={ref.avatarUrl} className="w-full h-full object-cover" /> : ref.displayName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-aura-text">{ref.displayName || 'User'}</p>
                              <p className="text-[10px] text-aura-text-secondary">@{ref.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-aura-text-secondary">
                          {new Date(ref.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            ref.subscriptionPlan === 'teams' ? 'bg-aura-cyan/20 text-aura-cyan border border-aura-cyan/30' :
                            ref.subscriptionPlan === 'pro' ? 'bg-aura-violet/20 text-aura-violet border border-aura-violet/30' :
                            'bg-white/5 text-aura-text-secondary border border-white/10'
                          }`}>
                            {ref.subscriptionPlan || 'Free'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${ref.subscriptionStatus === 'active' ? 'bg-aura-mint animate-pulse' : 'bg-aura-text-secondary/30'}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${ref.subscriptionStatus === 'active' ? 'text-aura-mint' : 'text-aura-text-secondary'}`}>
                              {ref.subscriptionStatus || 'Inactive'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t border-white/5 flex items-center justify-between">
                <p className="text-[10px] text-aura-text-secondary uppercase tracking-widest font-bold">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-aura-text disabled:opacity-30 hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-aura-text disabled:opacity-30 hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Payment Info & Help */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 space-y-6">
            <h4 className="font-display font-bold text-aura-text border-b border-white/5 pb-4">Bank Details</h4>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-aura-cyan">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest">Bank Name</p>
                  <p className="text-sm font-bold text-aura-text">{affiliateData?.bankDetails.bankName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-aura-violet">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest">Account Number</p>
                  <p className="text-sm font-bold text-aura-text">{affiliateData?.bankDetails.accountNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-aura-pink">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-aura-text-secondary uppercase tracking-widest">Bank Account Name</p>
                  <p className="text-sm font-bold text-aura-text">{affiliateData?.bankDetails.accountName}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setRegForm({
                  ...regForm,
                  bankName: affiliateData?.bankDetails.bankName || '',
                  accountNumber: affiliateData?.bankDetails.accountNumber || '',
                  accountName: affiliateData?.bankDetails.accountName || ''
                });
                setShowUpdateBankModal(true);
              }}
              className="w-full py-3 rounded-xl border border-white/10 text-aura-text-secondary text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              Update Details
            </button>
          </div>

          <div className="glass-card p-6 bg-aura-violet/5 border-aura-violet/20">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-aura-violet shrink-0" />
              <h4 className="font-display font-bold text-aura-text text-sm">Withdrawal Policy</h4>
            </div>
            <ul className="space-y-3">
              {[
                'Minimum withdrawal: ₦1,000',
                'Maximum 1 request per week',
                '5% handling fee applies',
                'Commissions paid monthly'
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-2 text-[10px] font-medium text-aura-text-secondary">
                  <ChevronRight className="w-3 h-3 text-aura-violet" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Update Bank Details Modal */}
      {showUpdateBankModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowUpdateBankModal(false)} />
          <div className="relative w-full max-w-md glass-card p-8 animate-in zoom-in duration-300">
            <button onClick={() => setShowUpdateBankModal(false)} className="absolute top-4 right-4 p-2 text-aura-text-secondary hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-aura-cyan/20 flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-aura-cyan" />
              </div>
              <h2 className="font-display font-bold text-2xl text-aura-text">Update Bank Details</h2>
              <p className="text-aura-text-secondary text-sm text-center mt-2">
                Edit your bank information for withdrawals.
              </p>
            </div>
            
            <form onSubmit={handleUpdateBankDetails} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Bank Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      value={regForm.bankName}
                      onFocus={() => setShowBankDropdown(true)}
                      onBlur={() => setTimeout(() => setShowBankDropdown(false), 200)}
                      onChange={e => setRegForm({...regForm, bankName: e.target.value.replace(/[^a-zA-Z\s\(\)]/g, '')})}
                      className="w-full pl-5 pr-12 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:border-aura-violet/50 outline-none transition-all font-medium" 
                      placeholder="Search bank"
                    />
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-aura-text-secondary">
                      <ChevronDown className={`w-5 h-5 transition-transform ${showBankDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showBankDropdown && filteredBanks.length > 0 && (
                      <div className="absolute z-[100] left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-aura-navy border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl no-scrollbar">
                        {filteredBanks.map((bank, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setRegForm({...regForm, bankName: bank});
                              setTimeout(() => setShowBankDropdown(false), 100);
                            }}
                            className={`w-full px-5 py-3 text-left text-sm transition-all border-b border-white/5 last:border-0 font-medium flex items-center justify-between group cursor-pointer ${
                              regForm.bankName === bank 
                                ? 'bg-aura-violet text-white' 
                                : 'text-aura-text hover:bg-white/10'
                            }`}
                          >
                            <span>{bank}</span>
                            {regForm.bankName === bank && <Check className="w-4 h-4 text-white" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Account Number</label>
                  <input 
                    type="text" 
                    required
                    maxLength={10}
                    value={regForm.accountNumber}
                    onChange={e => setRegForm({...regForm, accountNumber: e.target.value.replace(/[^0-9]/g, '').slice(0, 10)})}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:border-aura-violet/50 outline-none transition-all font-medium" 
                    placeholder="10 Digits"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Bank Account Name</label>
                  <input 
                    type="text" 
                    required
                    value={regForm.accountName}
                    onChange={e => setRegForm({...regForm, accountName: e.target.value.replace(/[^a-zA-Z\s]/g, '')})}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:border-aura-violet/50 outline-none transition-all font-medium" 
                    placeholder="Exact name on account"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isUpdatingBank}
                className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-2xl shadow-aura-violet/30 disabled:opacity-50"
              >
                {isUpdatingBank ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={() => setShowWithdrawModal(false)} />
          <div className="relative w-full max-w-md glass-card p-8 animate-in zoom-in duration-300">
            <button onClick={() => setShowWithdrawModal(false)} className="absolute top-4 right-4 p-2 text-aura-text-secondary hover:text-white transition-colors">
              <Check className="w-6 h-6 rotate-45" />
            </button>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-aura-violet/20 flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-aura-violet" />
              </div>
              <h2 className="font-display font-bold text-2xl text-aura-text">Request Withdrawal</h2>
              <p className="text-aura-text-secondary text-sm text-center mt-2">
                Withdrawable: ₦{(affiliateData?.withdrawableBalance || 0).toLocaleString()}
              </p>
            </div>
            
            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Amount (₦)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    required
                    min="1000"
                    max={affiliateData?.withdrawableBalance}
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text text-xl font-bold focus:border-aura-violet/50 outline-none transition-all" 
                    placeholder="1000"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-aura-text-secondary text-xs font-bold">NGN</div>
                </div>
                <div className="flex justify-between px-1">
                  <p className="text-[10px] text-aura-text-secondary">Handling Fee (5%)</p>
                  <p className="text-[10px] text-aura-pink font-bold">- ₦{(parseFloat(withdrawAmount || '0') * 0.05).toLocaleString()}</p>
                </div>
                <div className="flex justify-between px-1 border-t border-white/5 pt-2">
                  <p className="text-[10px] font-bold text-aura-text uppercase tracking-widest">You Receive</p>
                  <p className="text-[10px] font-bold text-aura-mint">₦{(parseFloat(withdrawAmount || '0') * 0.95).toLocaleString()}</p>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) < 1000}
                className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-2xl shadow-aura-violet/30 disabled:opacity-50"
              >
                {isWithdrawing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm Withdrawal'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AffiliateSection;
