import React, { useState } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './components/AuthModal';
import { BookingWizard } from './components/BookingWizard';
import { BookingLookup } from './components/BookingLookup';
import { MemberCenter } from './components/MemberCenter';
import { MenuSection } from './components/MenuSection';
import { FloorPlanPreview } from './components/FloorPlanPreview';
import { AdminBackend } from './components/admin/AdminBackend';
import { 
  Phone, 
  MapPin, 
  Clock, 
  UtensilsCrossed, 
  ShieldCheck, 
  Heart,
  ChevronRight,
  Wine
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, setActiveView, settings } = useRestaurant();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // If in admin view, render AdminBackend cleanly
  if (activeView === 'admin') {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col">
        <Navbar onOpenAuth={() => setAuthModalOpen(true)} />
        <AdminBackend />
        <ToastContainer />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-800">
      <Navbar onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Main Routed View */}
      <main className="flex-1">
        {activeView === 'reserve' && <BookingWizard />}
        {activeView === 'lookup' && <BookingLookup />}
        {activeView === 'menu' && <MenuSection />}
        {activeView === 'floor' && <FloorPlanPreview />}
        {activeView === 'member' && <MemberCenter onOpenAuth={() => setAuthModalOpen(true)} />}
      </main>

      {/* Gourmet Restaurant Footer */}
      <footer className="bg-stone-900 border-t border-stone-800 text-stone-300 py-12 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-serif-brand text-lg font-bold text-amber-100">
                {settings.name}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              法義風尚炭火餐酒館。融合旬味食材、頂級乾式熟成牛排與侍酒師精選佳釀，為每一刻珍貴相聚打造極致五感饗宴。
            </p>
            <div className="pt-2 text-xs text-amber-400 font-medium">
              ★ 系統化管理訂位資料 • 提高席次效益
            </div>
          </div>

          {/* Quick Nav Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200 mb-4">
              顧客服務導覽
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => setActiveView('reserve')} className="hover:text-amber-300 transition-colors">
                  &rarr; 線上預約訂位
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('lookup')} className="hover:text-amber-300 transition-colors">
                  &rarr; 訂位查詢與取消
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('menu')} className="hover:text-amber-300 transition-colors">
                  &rarr; 主廚精選美饌
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('floor')} className="hover:text-amber-300 transition-colors">
                  &rarr; 座位空間全景
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('member')} className="hover:text-amber-300 transition-colors">
                  &rarr; 會員中心與權益
                </button>
              </li>
            </ul>
          </div>

          {/* Dining Policies & Hours */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200 mb-4">
              營業時間與規範
            </h4>
            <div className="space-y-2 text-xs text-stone-400">
              <div>
                <span className="text-stone-300 font-semibold block">午間餐期：</span>
                {settings.businessHours.lunch}
              </div>
              <div>
                <span className="text-stone-300 font-semibold block">午後微醺：</span>
                {settings.businessHours.tea}
              </div>
              <div>
                <span className="text-stone-300 font-semibold block">星夜晚宴：</span>
                {settings.businessHours.dinner}
              </div>
              <div className="text-[11px] text-stone-500 pt-1">
                * 訂位保留 10 分鐘，用餐時間為 120 分鐘
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200 mb-4">
              門市資訊與客服
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>預約專線：{settings.phone}</span>
              </div>
              
              <div className="pt-3">
                <button
                  onClick={() => setActiveView('admin')}
                  className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-medium border border-stone-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>進入餐廳工作人員管理後台</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div>
            &copy; 2026 {settings.name}. 智慧餐廳訂位與桌況管理系統. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <span>隱私權政策</span>
            <span>•</span>
            <span>顧客訂位服務條款</span>
            <span>•</span>
            <span>食品安全認證</span>
          </div>
        </div>
      </footer>

      {/* Floating Elements */}
      <ToastContainer />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <MainContent />
    </RestaurantProvider>
  );
}
