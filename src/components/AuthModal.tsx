import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { X, User, Lock, Phone, Mail, Sparkles, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, switchUser, users } = useRestaurant();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [identifier, setIdentifier] = useState('');
  
  // Register fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    const ok = login(identifier);
    if (ok) onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) return;
    register(name, phone, email);
    onClose();
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header with decorative background */}
        <div className="relative bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 mb-3 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-serif-brand tracking-wide">饗聚會員專區</h2>
          <p className="text-xs text-stone-300 mt-1">登入會員享有專屬訂位禮遇、快速預約與歷史訂位紀錄</p>

          {/* Tab selector */}
          <div className="flex bg-stone-950/40 p-1 rounded-xl mt-5 border border-stone-700/50">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === 'login' ? 'bg-amber-600 text-white shadow-md' : 'text-stone-300 hover:text-white'
              }`}
            >
              會員登入
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === 'register' ? 'bg-amber-600 text-white shadow-md' : 'text-stone-300 hover:text-white'
              }`}
            >
              免費註冊
            </button>
          </div>
        </div>

        <div className="p-6">
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  手機號碼或電子郵件
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="例如: 0988-765-432 或 meiling.chang@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-amber-900/20 transition-colors"
              >
                立即登入
              </button>

              {/* Demo 1-Click Login Accounts for immediate testing */}
              <div className="pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    ⚡ 快速示範帳號一鍵切換
                  </span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">免輸入密碼</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {users.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u.id)}
                      className="flex items-center justify-between p-2.5 bg-stone-50 hover:bg-amber-50/80 border border-stone-200/80 hover:border-amber-300 rounded-xl text-left transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          u.memberTier === 'vip' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
                        }`}>
                          {u.name.substring(0, 1)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                            {u.name}
                            {u.role === 'admin' && (
                              <span className="px-1.5 py-0.2 bg-purple-600 text-white text-[10px] rounded font-medium">
                                系統管理者
                              </span>
                            )}
                            {u.memberTier === 'vip' && u.role !== 'admin' && (
                              <span className="px-1.5 py-0.2 bg-amber-600 text-white text-[10px] rounded font-medium">
                                VIP 貴賓
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500">{u.phone}</div>
                        </div>
                      </div>
                      <span className="text-xs text-amber-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                        切換登入 &rarr;
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  貴賓姓名
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="請輸入姓名 (如：林曉華 小姐)"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  手機號碼 (接收訂位簡訊)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="例如: 0912-345-678"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  電子信箱 (寄送訂位憑證)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="例如: name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>註冊即享專屬生日前夕雙人飲品兌換券，並可保存用餐偏好與過敏紀錄。</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-amber-900/20 transition-colors"
              >
                確認註冊並登入
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
