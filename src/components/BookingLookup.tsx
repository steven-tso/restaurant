import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Edit3, 
  Trash2, 
  Copy, 
  Printer, 
  ArrowRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { Reservation, ReservationStatus } from '../types';

export const BookingLookup: React.FC = () => {
  const { 
    reservations, 
    cancelReservation, 
    updateReservation, 
    settings, 
    setActiveView 
  } = useRestaurant();

  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('行程變更');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Reservation | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editParty, setEditParty] = useState(2);
  const [editRemarks, setEditRemarks] = useState('');

  // Handle Search
  const cleanQ = searchQuery.trim().toUpperCase();
  const searchResults = reservations.filter(r => {
    if (!cleanQ) return false;
    const phoneClean = r.customerPhone.replace(/[^0-9]/g, '');
    const searchClean = cleanQ.replace(/[^0-9]/g, '');
    return (
      r.bookingCode.toUpperCase().includes(cleanQ) ||
      (searchClean && phoneClean.includes(searchClean)) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    if (searchResults.length > 0) {
      setSelectedRes(searchResults[0]);
    } else {
      setSelectedRes(null);
    }
  };

  const openCancelDialog = (resId: string) => {
    setCancelTargetId(resId);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (!cancelTargetId) return;
    cancelReservation(cancelTargetId, cancelReason);
    setShowCancelModal(false);
    setCancelTargetId(null);
  };

  const openEditDialog = (res: Reservation) => {
    setEditTarget(res);
    setEditDate(res.date);
    setEditTime(res.timeSlot);
    setEditParty(res.partySize);
    setEditRemarks(res.remarks || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    updateReservation(editTarget.id, {
      date: editDate,
      timeSlot: editTime,
      partySize: editParty,
      adults: editParty,
      remarks: editRemarks,
    });

    setShowEditModal(false);
    setEditTarget(null);
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            已確認訂位
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            待確認
          </span>
        );
      case 'seated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            用餐中 (已入座)
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-300">
            已結帳完成
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5" />
            已取消
          </span>
        );
      case 'no_show':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            未出席
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif-brand text-stone-900 tracking-wide">
          訂位查詢、修改與取消
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2">
          輸入您的訂位代碼（如 BK-8901）或預留的手機號碼，即可即時查詢訂單狀態或線上取消
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="請輸入訂位編號 (例如：BK-8901) 或 手機號碼 (例如：0988-765-432)"
              className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-2xl shadow-md shadow-amber-900/20 transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>查詢訂位</span>
          </button>
        </form>

        {/* Quick Demo Search suggestions */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500">
          <span>熱門測試示範：</span>
          {['BK-8901', 'BK-8902', '0988-765-432', '張美玲'].map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSearchQuery(tag);
                setHasSearched(true);
              }}
              className="px-2.5 py-1 bg-stone-100 hover:bg-amber-50 hover:text-amber-800 rounded-lg font-mono text-[11px] transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Display */}
      {hasSearched && (
        <div className="space-y-6">
          {searchResults.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-800 text-base">找不到相符的訂位資料</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                請確認您輸入的手機號碼或訂位編號是否正確；或撥打餐廳服務專線 {settings.phone} 由專人為您查詢。
              </p>
              <button
                type="button"
                onClick={() => setActiveView('reserve')}
                className="mt-5 px-6 py-2.5 bg-amber-700 text-white text-xs font-bold rounded-xl"
              >
                線上重新預約
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-stone-700">
                  找到 {searchResults.length} 筆訂位紀錄
                </h2>
                <span className="text-xs text-stone-400">點擊卡片可查看詳情或執行變更</span>
              </div>

              {searchResults.map(item => {
                const canModify = item.status === 'confirmed' || item.status === 'pending';

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200 hover:border-amber-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-stone-500 uppercase">訂位代碼</span>
                        <span className="text-xl font-mono font-bold text-amber-800 tracking-wider">
                          {item.bookingCode}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="text-xs text-stone-400">
                        建立時間：{new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
                      <div>
                        <span className="text-stone-400 block mb-0.5">用餐日期</span>
                        <div className="flex items-center gap-1.5 font-bold text-stone-800 text-sm">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          <span>{item.date}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-stone-400 block mb-0.5">預約時間</span>
                        <div className="flex items-center gap-1.5 font-bold text-stone-800 text-sm">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>{item.timeSlot}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-stone-400 block mb-0.5">用餐人數</span>
                        <div className="flex items-center gap-1.5 font-bold text-stone-800 text-sm">
                          <Users className="w-4 h-4 text-amber-600" />
                          <span>{item.partySize} 位賓客</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-stone-400 block mb-0.5">安排桌位</span>
                        <div className="flex items-center gap-1.5 font-bold text-stone-800 text-sm">
                          <MapPin className="w-4 h-4 text-amber-600" />
                          <span>{item.assignedTableNumber ? `桌號 ${item.assignedTableNumber}` : '現場帶位安排'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-stone-50 rounded-2xl text-xs space-y-1.5 text-stone-700 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900">貴賓姓名：</span>
                        <span>{item.customerName}</span>
                        <span className="text-stone-300">|</span>
                        <span className="font-semibold text-stone-900">連絡電話：</span>
                        <span>{item.customerPhone}</span>
                      </div>
                      {item.dietaryNotes.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="font-semibold text-stone-900">飲食偏好：</span>
                          <span className="text-amber-700">{item.dietaryNotes.join('、')}</span>
                        </div>
                      )}
                      {item.remarks && (
                        <div className="pt-1">
                          <span className="font-semibold text-stone-900">特殊備註：</span>
                          <span>{item.remarks}</span>
                        </div>
                      )}
                      {item.cancellationReason && (
                        <div className="text-rose-600 font-semibold pt-1">
                          取消原因：{item.cancellationReason}
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.bookingCode);
                            alert(`已複製訂位代碼 ${item.bookingCode}`);
                          }}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>複製代碼</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>列印憑證</span>
                        </button>
                      </div>

                      {canModify && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditDialog(item)}
                            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>修改時段人數</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openCancelDialog(item.id)}
                            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>取消訂位</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-stone-900">確認取消此筆訂位？</h3>
            <p className="text-xs text-stone-500 text-center mt-1">
              取消後系統將立即釋出保留桌位。如日後需要用餐，歡迎重新於線上系統預訂。
            </p>

            <div className="mt-5">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                請選擇取消原因 (協助我們持續改善服務)
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="行程變更或突發事件">行程臨時變更 / 另有安排</option>
                <option value="人數調整需重訂">人數變動，需另外重新下單</option>
                <option value="重複訂位">誤選時段 / 重複預約</option>
                <option value="天候交通因素">天候不佳或交通不便</option>
                <option value="其他原因">其他原因</option>
              </select>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl"
              >
                保留訂位
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-900/20"
              >
                確定取消訂位
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reservation Modal */}
      {showEditModal && editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900">
              修改訂位資訊 ({editTarget.bookingCode})
            </h3>
            <p className="text-xs text-stone-500 mt-1">請更新您的預約日期、時間與人數</p>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">用餐日期</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">用餐時間</label>
                  <input
                    type="time"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">用餐總人數</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={editParty}
                  onChange={(e) => setEditParty(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">備註需求</label>
                <textarea
                  rows={2}
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  儲存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
