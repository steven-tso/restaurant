import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { DiningArea } from '../types';
import { MapPin, Users, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const FloorPlanPreview: React.FC = () => {
  const { tables, setActiveView } = useRestaurant();
  const [selectedZone, setSelectedZone] = useState<DiningArea>('all');

  const zoneCards = [
    {
      id: 'window' as DiningArea,
      name: '城市浪漫景觀窗景區 (Window View)',
      desc: '依傍落地窗玻璃幕牆，將信義夜景與都市天際線盡收眼底。雙人雅座與小四人座，是情人節、求婚、週年紀念與浪漫約會的第一指名。',
      image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80',
      tablesCount: tables.filter(t => t.zone === 'window').length,
      capacityText: '2 - 6 人席次',
      features: ['信義繁華夜景', '法式復古絲絨軟座', '燭光佐餐氛圍'],
    },
    {
      id: 'main' as DiningArea,
      name: '經典中庭主用餐大廳 (Main Hall)',
      desc: '挑高 4 米開闊空間，搭配法式胡桃木炭火吧檯與柔和暖色吊燈。座位間距寬裕不壓迫，無論平日小酌或多人聚餐皆舒適用餐。',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
      tablesCount: tables.filter(t => t.zone === 'main').length,
      capacityText: '2 - 8 人席次',
      features: ['挑高舒適寬敞', '開放式炙烤廚房視野', '友善嬰兒推車動線'],
    },
    {
      id: 'vip' as DiningArea,
      name: '尊榮私人包廂區 (Private VIP Suites)',
      desc: '香檳廳 (8-10人) 與勃艮第廳 (10-14人) 兩間獨立隔音包廂。專屬侍酒師隨侍服務、自備獨立影音設備與空調系統，適合家族慶生宴席與高階商務餐會。',
      image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600&auto=format&fit=crop&q=80',
      tablesCount: tables.filter(t => t.zone === 'vip').length,
      capacityText: '6 - 14 人獨立包廂',
      features: ['尊榮完全隱私隔音', '專屬侍酒師進駐', '附設商務投影影音'],
    },
    {
      id: 'terrace' as DiningArea,
      name: '星空花園露台區 (Garden Terrace)',
      desc: '戶外微風綠意空間，綠植圍繞與溫暖露天串燈，享受自然清風吹拂與無拘無束的戶外歐風酒食愜意。',
      image: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=600&auto=format&fit=crop&q=80',
      tablesCount: tables.filter(t => t.zone === 'terrace').length,
      capacityText: '2 - 4 人席次',
      features: ['戶外自然微風', '璀璨星空夜景', '寵物友善空間 (繫繩)'],
    },
  ];

  const filtered = selectedZone === 'all' 
    ? zoneCards 
    : zoneCards.filter(z => z.id === selectedZone);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-3">
          Space & Ambiance
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-brand text-stone-900 tracking-wide">
          座位空間全景與氛圍
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2">
          探索四大多元用餐區域，為您下一次的浪漫聚會或重要宴席挑選最適宜的理想座位
        </p>

        {/* Zone buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setSelectedZone('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedZone === 'all'
                ? 'bg-amber-700 text-white shadow-md'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            全部區域
          </button>
          {zoneCards.map(z => (
            <button
              key={z.id}
              onClick={() => setSelectedZone(z.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedZone === z.id
                  ? 'bg-amber-700 text-white shadow-md'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {z.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Zone Display Cards */}
      <div className="space-y-8 mb-12">
        {filtered.map(zone => (
          <div
            key={zone.id}
            className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-lg transition-all grid grid-cols-1 md:grid-cols-12"
          >
            <div className="md:col-span-5 h-64 md:h-auto overflow-hidden relative">
              <img
                src={zone.image}
                alt={zone.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                共 {zone.tablesCount} 組桌席
              </div>
            </div>

            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{zone.capacityText}</span>
                </div>
                <h2 className="text-xl font-bold font-serif-brand text-stone-900 mb-2">
                  {zone.name}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {zone.desc}
                </p>

                {/* Features list */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {zone.features.map(f => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-400">
                  可於線上訂位時點選此區域偏好
                </span>
                <button
                  onClick={() => setActiveView('reserve')}
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>立即預訂此區域</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
