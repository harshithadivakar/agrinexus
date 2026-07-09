import React, { useState } from 'react';
import { ShoppingBag, Sparkles, RefreshCw, Check, ArrowRight, Star } from 'lucide-react';

export default function PodsScreen() {
  const [cartCount, setCartCount] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | null>('monthly');
  const [successMsg, setSuccessMsg] = useState('');

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Sprouts',
      price: '₹349/mo',
      savings: 'Save 15%',
      deliverables: '1 custom pod of choice delivered monthly',
      rating: 4.8
    },
    {
      id: 'quarterly',
      name: 'Seasonal Harvest',
      price: '₹899/quarter',
      savings: 'Save 25% (Popular)',
      deliverables: '3 custom pods + nutrient booster pack seasonal delivery',
      rating: 4.9
    }
  ];

  const handleSubscribe = () => {
    setSuccessMsg('Opening AgriNexus web portal for billing setup...');
    setTimeout(() => {
      window.open('https://ais-dev-2emaq6d7fq7256ej4hr3rs-292322906587.europe-west2.run.app', '_blank');
      setSuccessMsg('');
    }, 1500);
  };

  const handlePurchaseOneTime = () => {
    setCartCount(prev => prev + 1);
    setSuccessMsg('Added 1x Sweet Basil Smart Capsule to your cart list!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="bg-[#f7faf6] min-h-screen pb-24 text-[#181c1a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#f7faf6] border-b border-[#D8E4DA]/40 px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006038] text-[24px]">shopping_cart</span>
          <h1 className="font-heading text-lg font-bold text-[#006038]">Pods &amp; Refills</h1>
        </div>
        <div className="relative">
          <ShoppingBag className="w-6 h-6 text-[#006038]" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#ba1a1a] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {cartCount}
            </span>
          )}
        </div>
      </header>

      <main className="px-5 mt-6 max-w-md mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#006038] to-[#1f7a4d] text-white p-5 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="relative z-10 max-w-[70%]">
            <span className="inline-flex items-center gap-1 bg-[#9ef5be] text-[#002110] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" /> Smart Member
            </span>
            <h2 className="font-heading font-extrabold text-xl leading-tight">Never Run Dry of Fresh Herbs</h2>
            <p className="text-xs text-white/80 mt-1 leading-relaxed">
              Subscribe to automated crop refills and receive new seed capsules right on schedule.
            </p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        </div>

        {successMsg && (
          <div className="p-3 bg-[#e2f2e5] border border-[#82d8a3] text-[#00522f] text-xs font-medium rounded-xl text-center">
            {successMsg}
          </div>
        )}

        {/* Subscription Choice */}
        <section className="space-y-3">
          <h3 className="font-heading font-bold text-sm text-[#181c1a] tracking-tight uppercase tracking-wider ml-1">
            Membership Refill Plans
          </h3>
          
          <div className="grid gap-3">
            {plans.map(p => {
              const isSelected = selectedPlan === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id as any)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-white border-[#006038] ring-1 ring-[#006038] shadow-sm'
                      : 'bg-white border-[#D8E4DA]/40 hover:border-[#D8E4DA]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-heading font-bold text-base text-[#181c1a]">{p.name}</h4>
                      <p className="text-xs text-[#3f4941] mt-1">{p.deliverables}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-extrabold text-sm text-[#006038]">{p.price}</p>
                      <span className="inline-block text-[9px] font-bold bg-[#9ef5be] text-[#002110] px-1.5 py-0.5 rounded-md mt-1">
                        {p.savings}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-[10px] text-amber-600 font-semibold border-t border-[#D8E4DA]/30 pt-2">
                    <Star className="w-3 h-3 fill-amber-500 stroke-none" />
                    <span>{p.rating} rating from 400+ homes</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSubscribe}
            id="pods-subscribe-btn"
            className="w-full h-12 bg-[#006038] hover:bg-[#165E3A] text-white font-heading font-bold text-sm rounded-full flex items-center justify-center gap-2 transition-all mt-4"
          >
            Configure Refill Subscription
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* Individual Smart Capsules Catalog */}
        <section className="space-y-3">
          <h3 className="font-heading font-bold text-sm text-[#181c1a] tracking-tight uppercase tracking-wider ml-1">
            A la Carte Capsules (₹149 each)
          </h3>

          <div className="bg-white rounded-xl border border-[#D8E4DA]/40 overflow-hidden divide-y divide-[#D8E4DA]/30">
            {[
              { name: 'Sweet Basil', days: '28-32 days cycle', difficulty: 'Easy' },
              { name: 'Peppermint', days: '35-40 days cycle', difficulty: 'Vigorous' },
              { name: 'Butterhead Lettuce', days: '40-45 days cycle', difficulty: 'Quick' },
              { name: 'Cilantro Coriander', days: '25-30 days cycle', difficulty: 'Easy' }
            ].map((item, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-[#f1f4f0]/40 transition-colors">
                <div>
                  <h4 className="font-heading font-semibold text-sm text-[#181c1a]">{item.name}</h4>
                  <p className="text-[10px] text-[#58605b] mt-0.5">{item.days} • {item.difficulty}</p>
                </div>
                <button
                  onClick={handlePurchaseOneTime}
                  className="px-3.5 py-1.5 border border-[#006038] hover:bg-[#006038]/5 text-[#006038] font-heading font-bold text-xs rounded-full transition-colors"
                >
                  Add Pod
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Sustainable Tagline */}
        <div className="p-4 bg-[#f1f4f0] rounded-xl text-center border border-[#D8E4DA]/50">
          <p className="text-[10px] text-[#58605b] leading-relaxed">
            All AgriNexus smart capsules are built with 100% biodegradable organic coir hulls, ensuring zero microplastics in your water system.
          </p>
        </div>
      </main>
    </div>
  );
}
