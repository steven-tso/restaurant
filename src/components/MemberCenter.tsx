import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  User, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Award, 
  ChevronRight, 
  CheckCircle2, 
  Edit3, 
  RotateCcw, 
  Heart, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Reservation } from '../types';

export const MemberCenter: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { 
    currentUser, 
    reservations, 
    setActiveView, 
    updateUserProfile, 
    cancelReservation 
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'profile'>('upcoming');
  
  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileNotes, setProfileNotes] = useState(currentUser?.notes || '');

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-serif-brand text-stone-900">歡迎進入會員中心</h2>
        <p className="text-xs text-stone-500 mt-2 mb-6">
          登入即可查看您的專屬訂位紀錄、歷史用餐消費、累積會員權益與偏好設定。
        </p>
        <button
          onClick={onOpenAuth}
          className="px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-2xl shadow-lg shadow-amber-900/20"
        >
          立即登入 / 免費註冊
        </button>
      </div>
    );
  }

  // Filter reservations for current user
  const userReservations = reservations.filter(r => 
    r.userId === currentUser.id || 
    r.customerPhone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, '')
  );

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingReservations = userReservations.filter(r => 
    (r.date >= todayStr && r.status !== 'cancelled' && r.status !== 'completed')
  );

  const pastReservations = userReservations.filter(r => 
    (r.date < todayStr || r.status === 'completed' || r.status === 'cancelled')
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: profileName,
      phone: profilePhone,
      notes: profileNotes,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Member VIP Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-6 sm:p-8 text-white shadow-2xl border border-stone-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold font-serif-brand shadow-lg ${
              currentUser.memberTier === 'vip' 
                ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-stone-900 ring-4 ring-amber-400/30'
                : 'bg-stone-700 text-amber-300 ring-2 ring-stone-600'
            }`}>
              {currentUser.name.substring(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold font-serif-brand text-amber-100">
                  {currentUser.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase ${
                  currentUser.memberTier === 'vip'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-700 text-amber-200'
                }`}>
                  {currentUser.memberTier === 'vip' ? '★ VIP 頂級黑卡' : '金卡尊榮會員'}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1 flex items-center gap-2">
                <span>{currentUser.phone}</span>
                <span>•</span>
                <span>{currentUser.email}</span>
              </p>
              <div className="text-[11px] text-amber-300 mt-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>累計蒞臨品味：{currentUser.totalVisits} 次</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <button
              onClick={() => setActiveView('reserve')}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>立即預約新席位</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-stone-400">專屬會員預約通道已開通</span>
          </div>
        </div>

        {/* Member privileges bar */}
        <div className="mt-6 pt-5 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-300">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>優先席位保留禮遇</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400 shrink-0" />
            <span>生日招待專屬甜點</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>免除大額預付手續</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>主廚隱藏菜單品嚐</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'border-amber-700 text-amber-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>即將到來的訂位</span>
          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">
            {upcomingReservations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-amber-700 text-amber-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>歷史用餐紀錄</span>
          <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold flex items-center justify-center">
            {pastReservations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-amber-700 text-amber-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          會員偏好與資料
        </button>
      </div>

      {/* Tab 1: Upcoming Reservations */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingReservations.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200">
              <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-stone-800">目前沒有即將到來的訂位</h3>
              <p className="text-xs text-stone-500 mt-1 mb-5">
                今天想犒賞自己或與摯愛共度時光嗎？挑選一個美好時段吧！
              </p>
              <button
                onClick={() => setActiveView('reserve')}
                className="px-6 py-2.5 bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                前往線上訂位
              </button>
            </div>
          ) : (
            upcomingReservations.map(res => (
              <div
                key={res.id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 hover:border-amber-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400">訂位代碼</span>
                    <span className="text-lg font-mono font-bold text-amber-800">{res.bookingCode}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {res.status === 'confirmed' ? '已確認席位' : res.status === 'seated' ? '已入座' : '待確認'}
                    </span>
                  </div>
                  <div className="text-xs text-stone-400">
                    預訂時間：{new Date(res.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
                  <div>
                    <span className="text-stone-400 block mb-0.5">預約日期</span>
                    <div className="font-bold text-stone-800 text-sm flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      {res.date}
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-0.5">預約時段</span>
                    <div className="font-bold text-stone-800 text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4 text-amber-600" />
                      {res.timeSlot}
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-0.5">人數配置</span>
                    <div className="font-bold text-stone-800 text-sm flex items-center gap-1">
                      <Users className="w-4 h-4 text-amber-600" />
                      {res.partySize} 位貴賓
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-0.5">預留桌號</span>
                    <div className="font-bold text-stone-800 text-sm flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      {res.assignedTableNumber ? `桌號 ${res.assignedTableNumber}` : '依當日桌況精選'}
                    </div>
                  </div>
                </div>

                {res.remarks && (
                  <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 mb-3">
                    <span className="font-semibold text-stone-800">特殊備註：</span> {res.remarks}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <span className="text-xs text-stone-500">
                    當日敬請提前 5-10 分鐘抵達現場由侍酒師接待
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm(`確定要取消訂位【${res.bookingCode}】嗎？`)) {
                        cancelReservation(res.id, '會員線上中心主動取消');
                      }
                    }}
                    className="px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors"
                  >
                    取消此訂位
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Dining History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {pastReservations.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200">
              <Clock className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-stone-800">暫無歷史用餐紀錄</h3>
              <p className="text-xs text-stone-500 mt-1">過去完成的每次美好饗宴都會留存於此</p>
            </div>
          ) : (
            pastReservations.map(res => (
              <div
                key={res.id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-stone-900 text-sm">{res.date}</span>
                    <span className="text-xs text-stone-400">{res.timeSlot}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      res.status === 'completed' ? 'bg-stone-100 text-stone-700' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {res.status === 'completed' ? '已完成用餐' : '已取消'}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 flex items-center gap-3">
                    <span>訂位代碼: {res.bookingCode}</span>
                    <span>•</span>
                    <span>{res.partySize} 位賓客</span>
                    {res.assignedTableNumber && (
                      <>
                        <span>•</span>
                        <span>桌號 {res.assignedTableNumber}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setActiveView('reserve')}
                  className="px-4 py-2 bg-stone-100 hover:bg-amber-50 hover:text-amber-800 text-stone-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-center"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>再次預約此席</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Member Profile & Preferences */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-stone-800">會員基本資料與備註偏好</h3>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-1.5 text-xs text-amber-700 font-bold hover:underline"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>編輯資料</span>
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">姓名</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">手機號碼</label>
                <input
                  type="tel"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  個人常態飲食習慣與偏好備註 (系統將於每次訂位自動關照)
                </label>
                <textarea
                  rows={3}
                  value={profileNotes}
                  onChange={(e) => setProfileNotes(e.target.value)}
                  placeholder="例如：不吃生食、偏好靠窗安靜位、過敏食材等..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  儲存偏好
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-stone-100">
                <div>
                  <span className="text-stone-400 block">會員姓名</span>
                  <span className="font-bold text-stone-800 text-sm mt-0.5">{currentUser.name}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">會員電話</span>
                  <span className="font-bold text-stone-800 text-sm mt-0.5">{currentUser.phone}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">電子信箱</span>
                  <span className="font-bold text-stone-800 text-sm mt-0.5">{currentUser.email}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">加入日期</span>
                  <span className="font-bold text-stone-800 text-sm mt-0.5">{currentUser.createdAt}</span>
                </div>
              </div>

              <div>
                <span className="text-stone-400 block mb-1">常態偏好備忘：</span>
                <p className="p-3 bg-stone-50 rounded-xl text-stone-700">
                  {currentUser.notes || '尚未填寫偏好，可點擊上方「編輯資料」登記您的飲食喜好。'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
