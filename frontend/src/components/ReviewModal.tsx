import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { auth } from '../config/firebase';
import { API_V1_URL } from '../config/api';
import { toast } from 'sonner';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReviewModal = ({ isOpen, onClose }: ReviewModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({ 
    quote: '', 
    name: '', 
    role: '', 
    avatar: null as File | null 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.quote || !reviewForm.name || !reviewForm.role) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      formData.append('quote', reviewForm.quote);
      formData.append('name', reviewForm.name);
      formData.append('role', reviewForm.role);
      if (reviewForm.avatar) {
        formData.append('avatar', reviewForm.avatar);
      }

      const response = await fetch(`${API_V1_URL}/testimonials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Thank you for your review!');
        onClose();
        setReviewForm({ quote: '', name: '', role: '', avatar: null });
        // Optional: refresh testimonials if on homepage
        window.location.reload();
      } else {
        throw new Error(data.message || 'Failed to submit review');
      }
    } catch (error: any) {
      toast.error('Submission failed', { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-aura-navy/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-md glass-card p-8 shadow-[0_0_50px_rgba(123,97,255,0.2)] animate-in zoom-in duration-300" data-lenis-prevent>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-aura-text-secondary hover:text-aura-text">
          <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-aura-violet/20 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-aura-violet" />
          </div>
          <h2 className="font-display font-bold text-2xl text-aura-text">Share your Aura!</h2>
          <p className="text-aura-text-secondary text-sm text-center mt-2">Let others know how Aura Tree is helping you grow.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Your Review</label>
              <textarea 
                required 
                rows={3}
                placeholder="e.g. Aura Tree changed my link-in-bio game!"
                value={reviewForm.quote} 
                onChange={(e) => setReviewForm({ ...reviewForm, quote: e.target.value })} 
                className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium resize-none" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  value={reviewForm.name} 
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} 
                  className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Role</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Creator"
                  value={reviewForm.role} 
                  onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })} 
                  className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-aura-text focus:outline-none focus:border-aura-violet/50 transition-all font-medium" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-aura-text-secondary uppercase tracking-widest ml-1">Profile Picture (Optional)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setReviewForm({ ...reviewForm, avatar: e.target.files?.[0] || null })}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-aura-text text-xs focus:outline-none focus:border-aura-violet/50 transition-all font-medium" 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-2xl shadow-aura-violet/30 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
