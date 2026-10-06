import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  UtensilsCrossed, 
  CalendarCheck, 
  Search, 
  BookOpen, 
  Grid3X3, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  ChevronDown,
  Sparkles,
  PhoneCall,
  RotateCcw
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { 
    currentUser, 
    logout, 
    activeView, 
    setActiveView, 
    reservations, 
    users, 
    switchUser,
    resetAllData 
  } = useRestaurant();
  
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Today's total active bookings count for the admin badge
  const todayStr = new Date().toISOString().split('T')[0];
  const todayActiveCount = reservations.filter(
    r => r.date === todayStr && (r.status === 'confirmed' || r.status === 'pending' || r.status === 'seated')
  ).length;

  const navItems = [
    { id: 'reserve', label: '線上訂位', icon: CalendarCheck },
    { id: 'lookup', label: '訂位查詢與取消', icon: Search },
    { id: 'menu', label: '主廚精選菜單', icon: BookOpen },
    { id: 'floor', label: '餐廳座位全景', icon: Grid3X3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => setActiveView('reserve')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-900/30 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-brand text-xl font-bold tracking-wider text-amber-100 group-hover:text-amber-300 transition-colors">
                  饗聚 Bistro
                </span>
                <span className="text-[10px] tracking-widest font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  GRILL & WINE
                </span>
              </div>
              <p className="text-[11px] text-stone-400 tracking-wide">法義風尚炭火餐酒館 • 智慧訂位系統</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-stone-950/60 p-1.5 rounded-2xl border border-stone-800/80">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm font-semibold'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {currentUser && (
              <button
                onClick={() => setActiveView('member')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeView === 'member'
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>會員中心</span>
              </button>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            
            {/* Quick Staff / Admin Switcher Button */}
            <button
              onClick={() => setActiveView(activeView === 'admin' ? 'reserve' : 'admin')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                activeView === 'admin'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500 shadow-md shadow-purple-900/30'
                  : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-amber-500/30 hover:border-amber-400'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{activeView === 'admin' ? '返回顧客前台' : '餐廳管理者後台'}</span>
              {todayActiveCount > 0 && activeView !== 'admin' && (
                <span className="flex items-center justify-center w-5 h-5 bg-rose-600 text-white text-[10px] font-bold rounded-full animate-pulse">
                  {todayActiveCount}
                </span>
              )}
            </button>

            {/* User Profile / Quick Login Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-xl transition-colors text-left"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    currentUser.role === 'admin' ? 'bg-purple-600 text-white' :
                    currentUser.memberTier === 'vip' ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900' : 'bg-stone-700 text-stone-200'
                  }`}>
                    {currentUser.name.substring(0, 1)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-stone-200 flex items-center gap-1">
                      {currentUser.name}
                      {currentUser.memberTier === 'vip' && (
                        <Sparkles className="w-3 h-3 text-amber-400" />
                      )}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {currentUser.role === 'admin' ? '店經理' : currentUser.memberTier === 'vip' ? 'VIP 貴賓' : '會員'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-4 py-2.5 border-b border-stone-800">
                      <div className="text-xs font-bold text-stone-100">{currentUser.name}</div>
                      <div className="text-[11px] text-stone-400">{currentUser.phone}</div>
                      <div className="text-[11px] text-amber-400 mt-0.5">
                        {currentUser.role === 'admin' ? '餐廳主管身份' : `用餐次數：${currentUser.totalVisits} 次`}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveView('member');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-300 hover:bg-stone-800 flex items-center gap-2"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                        會員中心與訂位紀錄
                      </button>
                    </div>

                    {/* Switch to demo users */}
                    <div className="px-3 py-2 border-t border-stone-800">
                      <span className="text-[10px] font-semibold text-stone-500 block mb-1.5 uppercase">
                        切換身分測試
                      </span>
                      {users.map(u => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between mb-1 ${
                            u.id === currentUser.id ? 'bg-amber-600/30 text-amber-300 font-semibold' : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                          }`}
                        >
                          <span>{u.name} ({u.role === 'admin' ? '店經理' : u.memberTier.toUpperCase()})</span>
                          {u.id === currentUser.id && <span className="text-[10px]">目前使用</span>}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-stone-800 px-2 flex flex-col gap-1">
                      <button
                        onClick={() => {
                          if (window.confirm('確定要將系統資料重設為初始狀態嗎？')) {
                            resetAllData();
                            setUserDropdownOpen(false);
                          }
                        }}
                        className="w-full text-left px-3 py-1.5 text-[11px] text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg flex items-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        重設系統示範資料
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        會員登出
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
              >
                <UserIcon className="w-4 h-4" />
                <span>會員登入 / 註冊</span>
              </button>
            )}

          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-stone-800 text-xs overflow-x-auto gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap text-xs ${
                  isActive ? 'bg-amber-600 text-white font-semibold' : 'text-stone-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          {currentUser && (
            <button
              onClick={() => setActiveView('member')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap text-xs ${
                activeView === 'member' ? 'bg-amber-600 text-white font-semibold' : 'text-stone-300'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>會員中心</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
