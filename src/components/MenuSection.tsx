import React, { useState } from 'react';
import { MENU_HIGHLIGHTS } from '../data/initialData';
import { useRestaurant } from '../context/RestaurantContext';
import { Sparkles, Utensils, Wine, Award, ArrowRight } from 'lucide-react';

export const MenuSection: React.FC = () => {
  const { setActiveView } = useRestaurant();
  const [activeCategory, setActiveCategory] = useState<'all' | 'main' | 'starter' | 'dessert'>('all');

  const filtered = activeCategory === 'all' 
    ? MENU_HIGHLIGHTS 
    : MENU_HIGHLIGHTS.filter(m => m.category === activeCategory);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-3">
          Culinary Excellence
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-brand text-stone-900 tracking-wide">
          主廚精選季節美饌
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2">
          嚴選熟成肉品、每日基隆與東港現流海鮮，融合法式傳統熬汁技術與炭火炙烤風韻
        </p>

        {/* Category filters */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[
            { id: 'all', label: '全部精選' },
            { id: 'starter', label: '前菜開胃' },
            { id: 'main', label: '炭烤主餐' },
            { id: 'dessert', label: '法式甜點' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === c.id
                  ? 'bg-amber-700 text-white shadow-md'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {filtered.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-lg transition-all flex flex-col group"
          >
            <div className="h-48 overflow-hidden relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                {item.isChefSpecial && (
                  <span className="px-2.5 py-1 bg-amber-600 text-white text-[11px] font-bold rounded-lg shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    主廚推薦
                  </span>
                )}
                {item.isPopular && (
                  <span className="px-2.5 py-1 bg-stone-900/80 backdrop-blur-sm text-amber-300 text-[11px] font-bold rounded-lg shadow-sm">
                    熱門經典
                  </span>
                )}
              </div>
              <div className="absolute bottom-3 right-3 bg-stone-900/90 backdrop-blur-md px-3 py-1 rounded-xl font-bold font-mono text-amber-300 text-sm shadow">
                NT$ {item.price.toLocaleString()}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-stone-900">{item.name}</h3>
                <div className="text-xs text-amber-800 font-serif-brand font-medium tracking-wide mt-0.5">
                  {item.nameEn}
                </div>
                <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1">
                  <Wine className="w-3.5 h-3.5 text-amber-600" />
                  現場提供侍酒師專業搭酒建議
                </span>
                <span className="text-amber-700 font-semibold">內用可點</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reservation CTA Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-amber-950 rounded-3xl p-8 text-white text-center shadow-xl border border-stone-800">
        <h2 className="text-2xl font-bold font-serif-brand text-amber-100">
          期待為您呈獻非凡的味蕾體驗
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-lg mx-auto">
          每日限量熟成手工肉品，線上立即訂位即可預先保留座位與專屬慶祝安排。
        </p>
        <button
          onClick={() => setActiveView('reserve')}
          className="mt-6 px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-2xl shadow-lg transition-all inline-flex items-center gap-2"
        >
          <span>立即線上預約美好時光</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
