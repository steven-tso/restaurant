import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { 
  BarChart3, 
  CalendarDays, 
  Grid, 
  Users2, 
  Settings as SettingsIcon, 
  PlusCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  DollarSign, 
  MapPin, 
  Search, 
  Filter, 
  PhoneCall, 
  Sparkles, 
  AlertTriangle, 
  ArrowUpRight, 
  LogOut, 
  Trash2, 
  Edit2, 
  Eye, 
  CheckCheck,
  UserCheck,
  RotateCcw,
  Sparkle,
  Baby,
  Coffee,
  X
} from 'lucide-react';
import { Reservation, RestaurantTable, TableStatus, ReservationStatus, DiningArea } from '../../types';

export const AdminBackend: React.FC = () => {
  const { 
    reservations, 
    tables, 
    settings, 
    users, 
    adminTab, 
    setAdminTab, 
    setActiveView, 
    updateReservationStatus, 
    assignTable, 
    checkInReservation, 
    completeReservation, 
    cancelReservation, 
    seatWalkIn, 
    updateTableStatus, 
    addTable, 
    deleteTable, 
    updateSettings, 
    resetAllData,
    showToast
  } = useRestaurant();

  // Current real-time clock
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('zh-TW', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filters for Reservations tab
  const [filterDate, setFilterDate] = useState<string>(todayStr);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [selectedTableForDrawer, setSelectedTableForDrawer] = useState<RestaurantTable | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetReservationForAssign, setTargetReservationForAssign] = useState<Reservation | null>(null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);

  // Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInParty, setWalkInParty] = useState(2);
  const [walkInTableId, setWalkInTableId] = useState('');
  const [walkInRemarks, setWalkInRemarks] = useState('');

  // Add table form state
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newTableZone, setNewTableZone] = useState<DiningArea>('main');
  const [newTableMin, setNewTableMin] = useState(2);
  const [newTableMax, setNewTableMax] = useState(4);
  const [newTableShape, setNewTableShape] = useState<'round' | 'square' | 'rect' | 'booth'>('square');

  // Stats Calculations
  const todayReservations = reservations.filter(r => r.date === todayStr);
  const todayTotalGuests = todayReservations
    .filter(r => r.status !== 'cancelled' && r.status !== 'no_show')
    .reduce((sum, r) => sum + r.partySize, 0);

  const todaySeated = todayReservations.filter(r => r.status === 'seated').length;
  const todayPending = todayReservations.filter(r => r.status === 'pending').length;
  const todayConfirmed = todayReservations.filter(r => r.status === 'confirmed').length;

  const totalTableCount = tables.length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const reservedTables = tables.filter(t => t.status === 'reserved').length;
  const availableTables = tables.filter(t => t.status === 'available').length;
  const cleaningTables = tables.filter(t => t.status === 'cleaning').length;

  const floorOccupancyRate = totalTableCount > 0 
    ? Math.round(((occupiedTables + reservedTables) / totalTableCount) * 100) 
    : 0;

  // Estimated revenue for today (avg NT$1,200 per guest)
  const estimatedRevenue = todayTotalGuests * 1200;

  // Filtered Reservations
  const filteredReservations = reservations.filter(r => {
    const matchDate = filterDate === 'all' || r.date === filterDate;
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q || 
      r.customerName.toLowerCase().includes(q) || 
      r.customerPhone.includes(q) || 
      r.bookingCode.toLowerCase().includes(q);
    return matchDate && matchStatus && matchSearch;
  });

  const handleOpenWalkIn = (presetTableId?: string) => {
    const defaultTable = presetTableId 
      ? tables.find(t => t.id === presetTableId) 
      : tables.find(t => t.status === 'available');
    
    setWalkInName('現場候位貴賓');
    setWalkInPhone('0900-000-000');
    setWalkInParty(2);
    setWalkInTableId(defaultTable?.id || (tables[0]?.id || ''));
    setWalkInRemarks('');
    setShowWalkInModal(true);
  };

  const handleSubmitWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInTableId) {
      showToast('請指定開桌之空桌！', 'warning');
      return;
    }
    seatWalkIn(walkInName, walkInPhone, walkInParty, walkInTableId, walkInRemarks);
    setShowWalkInModal(false);
  };

  const handleCreateNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum || !newTableName) return;

    addTable({
      tableNumber: newTableNum.trim().toUpperCase(),
      name: newTableName.trim(),
      zone: newTableZone,
      minCapacity: newTableMin,
      maxCapacity: newTableMax,
      shape: newTableShape,
      status: 'available',
      x: 45,
      y: 45,
      width: 14,
      height: 14,
    });

    setShowAddTableModal(false);
    setNewTableNum('');
    setNewTableName('');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 pb-16">
      
      {/* Top Admin Header Bar */}
      <header className="bg-stone-900 border-b border-stone-800 text-stone-100 sticky top-20 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3">
            
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold font-serif-brand text-amber-100">
                    饗聚 Bistro 後台營運中樞
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                    LIVE SYSTEM
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 flex items-center gap-2">
                  <span>系統即時時間：{currentTimeStr}</span>
                  <span>•</span>
                  <span>今日營業日：{todayStr}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleOpenWalkIn()}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>現場快速開桌 (Walk-in)</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('確定重設所有桌況與訂位為示範初始狀態？')) {
                    resetAllData();
                  }
                }}
                title="重設示範資料"
                className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveView('reserve')}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold rounded-xl border border-stone-700 transition-colors flex items-center gap-1.5"
              >
                <span>返回前台顧客視角</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 border-t border-stone-800 pt-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'dashboard', label: '今日營運總覽', icon: BarChart3 },
              { id: 'reservations', label: '訂位清單管理', icon: CalendarDays, badge: todayPending > 0 ? todayPending : undefined },
              { id: 'tables', label: '即時桌況平面圖', icon: Grid },
              { id: 'customers', label: '顧客名錄與常客', icon: Users2 },
              { id: 'settings', label: '時段與營運設定', icon: SettingsIcon },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = adminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD (今日營運總覽) */}
        {/* ========================================================= */}
        {adminTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-bold">今日預約客數</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-900">
                  {todayTotalGuests} <span className="text-xs font-sans font-normal text-stone-500">位賓客</span>
                </div>
                <div className="text-xs text-stone-500 mt-2 flex items-center gap-1.5">
                  <span className="font-semibold text-emerald-600">{todayReservations.length} 組預約</span>
                  <span>• 已確認 {todayConfirmed} 組</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-bold">目前現場桌位佔用率</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Grid className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-900">
                  {floorOccupancyRate}%
                </div>
                <div className="text-xs text-stone-500 mt-2 flex items-center gap-1.5">
                  <span className="text-blue-600 font-semibold">{occupiedTables} 桌用餐中</span>
                  <span>• {reservedTables} 桌保留中</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-bold">現場空桌 / 清理中</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Coffee className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700">
                  {availableTables} <span className="text-xs font-sans font-normal text-stone-500">桌可用</span>
                </div>
                <div className="text-xs text-stone-500 mt-2 flex items-center gap-1.5">
                  <span className="text-amber-600">{cleaningTables} 桌清理消毒中</span>
                  <span>• 總桌數 {totalTableCount}</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-bold">今日預估營業額</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-900">
                  NT$ {estimatedRevenue.toLocaleString()}
                </div>
                <div className="text-xs text-stone-500 mt-2">
                  均消客單價約 NT$ 1,200 / 人
                </div>
              </div>

            </div>

            {/* Quick Actions & Live Queuing Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Today's Timeline Schedule */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold text-stone-900">今日預約席位時程表</h2>
                    <p className="text-xs text-stone-500">掌握今日各時段貴賓到店狀況，點選即可快速完成接待與帶位</p>
                  </div>
                  <button
                    onClick={() => setAdminTab('reservations')}
                    className="text-xs font-bold text-amber-700 hover:underline"
                  >
                    查看全部清單 &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {todayReservations.length === 0 ? (
                    <div className="p-8 text-center text-stone-400 text-xs">
                      今日尚無預約資料，可點擊上方按鈕現場快速開桌
                    </div>
                  ) : (
                    todayReservations.map(res => {
                      const isSeated = res.status === 'seated';
                      const isConfirmed = res.status === 'confirmed';

                      return (
                        <div
                          key={res.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSeated ? 'bg-blue-50/50 border-blue-200' :
                            isConfirmed ? 'bg-emerald-50/30 border-emerald-200' : 'bg-stone-50 border-stone-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 text-center">
                              <span className="font-mono font-bold text-sm text-stone-800 block">{res.timeSlot}</span>
                              <span className="text-[10px] text-stone-400">{res.mealPeriod === 'lunch' ? '午餐' : '晚宴'}</span>
                            </div>

                            <div className="h-8 w-[1px] bg-stone-200" />

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-stone-900">{res.customerName}</span>
                                <span className="text-xs text-stone-500">({res.partySize} 人)</span>
                                {res.specialOccasion !== 'none' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-medium">
                                    {res.specialOccasion === 'birthday' ? '🎂 生日' : res.specialOccasion === 'anniversary' ? '💐 紀念日' : '💼 商務'}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[11px] text-stone-400">{res.bookingCode}</span>
                                <span>•</span>
                                <span>桌位：{res.assignedTableNumber ? `桌號 ${res.assignedTableNumber}` : '尚未排定'}</span>
                                {res.remarks && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-700 truncate max-w-xs">{res.remarks}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Action buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {isConfirmed && (
                              <button
                                onClick={() => {
                                  if (res.assignedTableId) {
                                    checkInReservation(res.id);
                                  } else {
                                    setTargetReservationForAssign(res);
                                    setShowAssignModal(true);
                                  }
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>接待帶位入座</span>
                              </button>
                            )}

                            {isSeated && (
                              <button
                                onClick={() => completeReservation(res.id)}
                                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>結帳離席</span>
                              </button>
                            )}

                            {!res.assignedTableId && !isSeated && (
                              <button
                                onClick={() => {
                                  setTargetReservationForAssign(res);
                                  setShowAssignModal(true);
                                }}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl transition-colors"
                              >
                                指派桌位
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right 1 Col: Real-time Seating Status Mini-Widget */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-stone-900">即時各區桌況摘要</h2>
                    <button
                      onClick={() => setAdminTab('tables')}
                      className="text-xs font-bold text-amber-700 hover:underline"
                    >
                      平面圖 &rarr;
                    </button>
                  </div>

                  <div className="space-y-3">
                    {[
                      { zone: 'window', name: '景觀窗景區', color: 'border-l-blue-500' },
                      { zone: 'main', name: '主用餐大廳', color: 'border-l-amber-500' },
                      { zone: 'vip', name: '尊榮包廂區', color: 'border-l-purple-500' },
                      { zone: 'terrace', name: '星空露台區', color: 'border-l-emerald-500' },
                    ].map(z => {
                      const zoneTables = tables.filter(t => t.zone === z.zone);
                      const zoneOccupied = zoneTables.filter(t => t.status === 'occupied').length;
                      const zoneAvailable = zoneTables.filter(t => t.status === 'available').length;

                      return (
                        <div key={z.zone} className={`p-3 bg-stone-50 rounded-2xl border-l-4 ${z.color} border border-stone-200`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-stone-800">{z.name}</span>
                            <span className="text-[11px] text-stone-500">共 {zoneTables.length} 桌</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs mt-1.5">
                            <span className="text-blue-700 font-semibold">{zoneOccupied} 桌用餐中</span>
                            <span className="text-emerald-700 font-semibold">{zoneAvailable} 桌空桌</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100">
                  <button
                    onClick={() => handleOpenWalkIn()}
                    className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-2xl shadow transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>現場候位即刻開桌</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: RESERVATIONS LIST & OPERATIONS (訂位清單管理) */}
        {/* ========================================================= */}
        {adminTab === 'reservations' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Filter Controls Bar */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Date Picker Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-600">日期篩選:</span>
                  <input
                    type="date"
                    value={filterDate === 'all' ? '' : filterDate}
                    onChange={(e) => setFilterDate(e.target.value || 'all')}
                    className="p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {filterDate !== 'all' && (
                    <button
                      onClick={() => setFilterDate('all')}
                      className="text-xs text-amber-700 hover:underline font-semibold"
                    >
                      全部日期
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-600">狀態:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">全部狀態</option>
                    <option value="pending">待確認 (Pending)</option>
                    <option value="confirmed">已確認 (Confirmed)</option>
                    <option value="seated">已入座用餐中 (Seated)</option>
                    <option value="completed">已結帳完成 (Completed)</option>
                    <option value="cancelled">已取消 (Cancelled)</option>
                    <option value="no_show">未出席 (No-show)</option>
                  </select>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜尋姓名、手機、訂位編號..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

            </div>

            {/* Reservations Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase">
                    <tr>
                      <th className="py-3.5 px-4">訂位代碼</th>
                      <th className="py-3.5 px-4">日期 / 時段</th>
                      <th className="py-3.5 px-4">貴賓姓名 / 手機</th>
                      <th className="py-3.5 px-4">人數配置</th>
                      <th className="py-3.5 px-4">指派桌號</th>
                      <th className="py-3.5 px-4">特殊目的 / 偏好</th>
                      <th className="py-3.5 px-4">狀態</th>
                      <th className="py-3.5 px-4 text-right">操作管理</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-stone-400">
                          無符合篩選條件的訂位資料
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map(res => {
                        return (
                          <tr key={res.id} className="hover:bg-amber-50/30 transition-colors">
                            {/* Booking Code */}
                            <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                              {res.bookingCode}
                              <div className="text-[10px] text-stone-400 font-sans font-normal">
                                {res.source === 'walk_in' ? '現場開桌' : res.source === 'phone' ? '電話代訂' : '線上預約'}
                              </div>
                            </td>

                            {/* Date / Time */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-stone-800">{res.date}</div>
                              <div className="text-stone-500 font-mono">{res.timeSlot}</div>
                            </td>

                            {/* Customer */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-stone-900">{res.customerName}</div>
                              <div className="text-stone-500 font-mono text-[11px]">{res.customerPhone}</div>
                            </td>

                            {/* Party Size */}
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-stone-800">{res.partySize} 位</span>
                              {res.children > 0 && (
                                <span className="text-[10px] text-stone-400 block">({res.adults}大 {res.children}童)</span>
                              )}
                              {res.needHighChair && (
                                <span className="text-[10px] text-amber-700 block">需兒童椅</span>
                              )}
                            </td>

                            {/* Assigned Table */}
                            <td className="py-3.5 px-4">
                              {res.assignedTableNumber ? (
                                <span className="px-2.5 py-1 bg-stone-100 border border-stone-300 rounded-lg font-bold font-mono text-stone-800">
                                  {res.assignedTableNumber}
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setTargetReservationForAssign(res);
                                    setShowAssignModal(true);
                                  }}
                                  className="text-amber-700 hover:underline font-semibold"
                                >
                                  + 指派桌號
                                </button>
                              )}
                            </td>

                            {/* Occasion & Remarks */}
                            <td className="py-3.5 px-4 max-w-xs">
                              {res.specialOccasion !== 'none' && (
                                <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold mr-1 mb-1">
                                  {res.specialOccasion === 'birthday' ? '生日' : res.specialOccasion === 'anniversary' ? '紀念日' : '商務'}
                                </span>
                              )}
                              {res.remarks && (
                                <p className="text-stone-500 truncate" title={res.remarks}>{res.remarks}</p>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                res.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                res.status === 'seated' ? 'bg-blue-100 text-blue-800' :
                                res.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                res.status === 'completed' ? 'bg-stone-100 text-stone-600' :
                                res.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {res.status === 'confirmed' ? '已確認' :
                                 res.status === 'seated' ? '已入座' :
                                 res.status === 'pending' ? '待確認' :
                                 res.status === 'completed' ? '已完成' :
                                 res.status === 'cancelled' ? '已取消' : '未出席'}
                              </span>
                            </td>

                            {/* Actions dropdown/buttons */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {res.status === 'pending' && (
                                  <button
                                    onClick={() => updateReservationStatus(res.id, 'confirmed')}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                                  >
                                    確認
                                  </button>
                                )}

                                {res.status === 'confirmed' && (
                                  <button
                                    onClick={() => {
                                      if (res.assignedTableId) {
                                        checkInReservation(res.id);
                                      } else {
                                        setTargetReservationForAssign(res);
                                        setShowAssignModal(true);
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                                  >
                                    帶位入座
                                  </button>
                                )}

                                {res.status === 'seated' && (
                                  <button
                                    onClick={() => completeReservation(res.id)}
                                    className="px-2.5 py-1 bg-stone-800 hover:bg-stone-900 text-white rounded-lg font-bold"
                                  >
                                    結帳離席
                                  </button>
                                )}

                                {res.status !== 'cancelled' && res.status !== 'completed' && (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`確認將 ${res.customerName} 的訂位標記為未出席 (No-show)？`)) {
                                        updateReservationStatus(res.id, 'no_show');
                                      }
                                    }}
                                    className="px-2 py-1 text-stone-400 hover:text-stone-700 rounded-lg text-[11px]"
                                    title="標記未出席"
                                  >
                                    未到
                                  </button>
                                )}

                                {res.status !== 'cancelled' && res.status !== 'completed' && (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`確定取消 ${res.customerName} 的訂位【${res.bookingCode}】？`)) {
                                        cancelReservation(res.id, '管理者後台取消');
                                      }
                                    }}
                                    className="px-2 py-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-[11px]"
                                    title="取消訂位"
                                  >
                                    取消
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: REAL-TIME FLOOR MAP & TABLE MANAGEMENT (即時桌況平面圖) */}
        {/* ========================================================= */}
        {adminTab === 'tables' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top Toolbar */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 flex flex-wrap items-center justify-between gap-4">
              
              {/* Status Color Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-sm" />
                  <span>空桌可用 ({availableTables})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-rose-500 shadow-sm" />
                  <span>用餐中 ({occupiedTables})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-amber-500 shadow-sm" />
                  <span>已預約保留 ({reservedTables})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-blue-500 shadow-sm" />
                  <span>清理消毒中 ({cleaningTables})</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddTableModal(true)}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>新增實體桌位</span>
                </button>
              </div>

            </div>

            {/* Interactive 2D Floor Plan Canvas Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">餐廳實體平面圖 (點擊任一桌號即可快速開桌或變更桌況)</h3>
                  <p className="text-xs text-stone-500">四大多元區位佈局，即時同步現場與預約席次狀態</p>
                </div>
                <span className="text-xs font-mono text-stone-400">LAYOUT: MAIN FLOOR LEVEL 2</span>
              </div>

              {/* Graphic Floor Layout Grid */}
              <div className="relative min-h-[520px] bg-stone-900 rounded-3xl p-6 border-4 border-stone-800 overflow-hidden shadow-2xl">
                
                {/* Zone Area Borders & Background Watermarks */}
                <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                  {/* Window Zone */}
                  <div className="col-span-3 border-r border-dashed border-stone-700/80 p-4 relative">
                    <span className="text-stone-600 font-bold text-xs uppercase tracking-widest">
                      🪟 景觀窗景區 (Window)
                    </span>
                  </div>
                  {/* Main Hall */}
                  <div className="col-span-6 border-r border-dashed border-stone-700/80 p-4 relative">
                    <span className="text-stone-600 font-bold text-xs uppercase tracking-widest">
                      🍽️ 主用餐大廳 (Main Hall)
                    </span>
                  </div>
                  {/* VIP & Terrace */}
                  <div className="col-span-3 p-4 relative flex flex-col justify-between">
                    <span className="text-stone-600 font-bold text-xs uppercase tracking-widest">
                      👑 尊榮私人包廂 (VIP)
                    </span>
                    <span className="text-stone-600 font-bold text-xs uppercase tracking-widest">
                      🌿 星空露台 (Terrace)
                    </span>
                  </div>
                </div>

                {/* Table Cards Grid */}
                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
                  {tables.map(table => {
                    const isOccupied = table.status === 'occupied';
                    const isReserved = table.status === 'reserved';
                    const isCleaning = table.status === 'cleaning';
                    const isAvailable = table.status === 'available';

                    // Get reservation info if linked
                    const linkedRes = reservations.find(r => r.id === table.currentReservationId);

                    let statusBorder = 'border-emerald-500/80 bg-stone-800/90 text-emerald-400';
                    let statusLabel = '空桌可入座';
                    let statusBg = 'bg-emerald-500';

                    if (isOccupied) {
                      statusBorder = 'border-rose-500/80 bg-rose-950/40 text-rose-300';
                      statusLabel = '用餐中';
                      statusBg = 'bg-rose-500';
                    } else if (isReserved) {
                      statusBorder = 'border-amber-500/80 bg-amber-950/40 text-amber-300';
                      statusLabel = '已預約保留';
                      statusBg = 'bg-amber-500';
                    } else if (isCleaning) {
                      statusBorder = 'border-blue-500/80 bg-blue-950/40 text-blue-300';
                      statusLabel = '清潔消毒中';
                      statusBg = 'bg-blue-500';
                    }

                    return (
                      <div
                        key={table.id}
                        onClick={() => setSelectedTableForDrawer(table)}
                        className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 hover:scale-[1.03] hover:shadow-xl backdrop-blur-md ${statusBorder}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-base font-bold text-white tracking-wider">
                            {table.tableNumber}
                          </span>
                          <span className={`w-2.5 h-2.5 rounded-full ${statusBg} animate-pulse`} />
                        </div>

                        <div className="text-xs text-stone-300 font-medium truncate mb-1">
                          {table.name}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-stone-400 mt-2 pt-2 border-t border-white/10">
                          <span>{table.minCapacity}-{table.maxCapacity} 人席</span>
                          <span className="font-semibold text-white/90">{statusLabel}</span>
                        </div>

                        {/* If occupied or reserved, show guest name */}
                        {linkedRes && (
                          <div className="mt-2 p-1.5 bg-black/40 rounded-lg text-[10px] text-amber-200 truncate flex items-center justify-between">
                            <span className="font-bold">{linkedRes.customerName}</span>
                            <span>{linkedRes.partySize} 人 ({linkedRes.timeSlot})</span>
                          </div>
                        )}

                        {isOccupied && table.occupiedSince && !linkedRes && (
                          <div className="mt-2 text-[10px] text-stone-400">
                            入座時間: {table.occupiedSince}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CUSTOMERS CRM (顧客名錄與常客) */}
        {/* ========================================================= */}
        {adminTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-stone-900">貴賓常客管理簿 (CRM)</h3>
                  <p className="text-xs text-stone-500">追蹤顧客來訪歷史、會員等級、飲食禁忌與喜好紀錄</p>
                </div>
                <span className="text-xs text-stone-500 font-semibold">總計 {users.length} 位登記會員</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(u => (
                  <div
                    key={u.id}
                    className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-amber-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            u.memberTier === 'vip' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
                          }`}>
                            {u.name.substring(0, 1)}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-stone-900">{u.name}</div>
                            <div className="text-[11px] text-stone-500">{u.phone}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.memberTier === 'vip' ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700'
                        }`}>
                          {u.memberTier.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-stone-600 mb-4">
                        <div><span className="text-stone-400">信箱：</span>{u.email}</div>
                        <div><span className="text-stone-400">總造訪次數：</span><span className="font-bold text-amber-800">{u.totalVisits} 次</span></div>
                        {u.notes && (
                          <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-[11px] text-stone-700 mt-2">
                            <span className="font-semibold text-stone-900">特點備註：</span>{u.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs">
                      <span className="text-stone-400 text-[11px]">加入日期: {u.createdAt}</span>
                      <button
                        onClick={() => {
                          const note = prompt('請輸入新增或更新之客戶備忘紀錄：', u.notes || '');
                          if (note !== null) {
                            // updates
                            const target = users.find(x => x.id === u.id);
                            if (target) {
                              target.notes = note;
                              showToast('顧客備忘已更新', 'success');
                            }
                          }
                        }}
                        className="text-amber-700 hover:underline font-semibold"
                      >
                        編輯備忘
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SETTINGS (時段與營運設定) */}
        {/* ========================================================= */}
        {adminTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 max-w-3xl space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-stone-900">餐廳營業與訂位規則設定</h3>
              <p className="text-xs text-stone-500">自訂營業時間、用餐時長限制與大額定金規範</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">餐廳名稱</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => updateSettings({ name: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">副標題特色</label>
                <input
                  type="text"
                  value={settings.subName}
                  onChange={(e) => updateSettings({ subName: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">聯絡電話</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => updateSettings({ phone: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">用餐時長 (分鐘)</label>
                <input
                  type="number"
                  value={settings.diningDurationMinutes}
                  onChange={(e) => updateSettings({ diningDurationMinutes: parseInt(e.target.value) || 120 })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">團體定金門檻人數</label>
                <input
                  type="number"
                  value={settings.depositThresholdGuests}
                  onChange={(e) => updateSettings({ depositThresholdGuests: parseInt(e.target.value) || 6 })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">每人定金金額 (NT$)</label>
                <input
                  type="number"
                  value={settings.depositPerPerson}
                  onChange={(e) => updateSettings({ depositPerPerson: parseInt(e.target.value) || 500 })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">顧客訂位須知條款公告</label>
              <textarea
                rows={3}
                value={settings.noticePolicy}
                onChange={(e) => updateSettings({ noticePolicy: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-400">變更將即時儲存至系統設定檔中</span>
              <button
                onClick={() => showToast('設定已成功儲存', 'success')}
                className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow"
              >
                儲存設定
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* MODAL 1: WALK-IN / PHONE QUICK SEAT MODAL */}
      {/* ========================================================= */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <span>現場快速開桌 / 電話預約帶位</span>
              </h3>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWalkIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">顧客姓名</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="例如: 現場候位 4 位 或 王先生"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">用餐人數</label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    required
                    value={walkInParty}
                    onChange={(e) => setWalkInParty(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">指派桌號</label>
                  <select
                    value={walkInTableId}
                    onChange={(e) => setWalkInTableId(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  >
                    {tables.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.tableNumber} - {t.name} ({t.maxCapacity}人) [{t.status === 'available' ? '空桌' : t.status === 'cleaning' ? '清潔中' : '使用中'}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">聯絡電話 (可選填)</label>
                <input
                  type="tel"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="0900-000-000"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">備註需求</label>
                <input
                  type="text"
                  value={walkInRemarks}
                  onChange={(e) => setWalkInRemarks(e.target.value)}
                  placeholder="例如: 需要兒童椅、自備酒水等"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow"
                >
                  確認開桌入座
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER / MODAL 2: TABLE DETAILS & STATUS CHANGE MODAL */}
      {/* ========================================================= */}
      {selectedTableForDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold text-stone-900">
                    桌號 {selectedTableForDrawer.tableNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedTableForDrawer.status === 'occupied' ? 'bg-rose-100 text-rose-800' :
                    selectedTableForDrawer.status === 'reserved' ? 'bg-amber-100 text-amber-800' :
                    selectedTableForDrawer.status === 'cleaning' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedTableForDrawer.status === 'occupied' ? '用餐中' :
                     selectedTableForDrawer.status === 'reserved' ? '已預約保留' :
                     selectedTableForDrawer.status === 'cleaning' ? '清潔消毒中' : '空桌可入座'}
                  </span>
                </div>
                <div className="text-xs text-stone-500 mt-0.5">{selectedTableForDrawer.name}</div>
              </div>

              <button
                onClick={() => setSelectedTableForDrawer(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table Details */}
            <div className="space-y-3 text-xs mb-6">
              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-2xl">
                <div>
                  <span className="text-stone-400 block">容納人數</span>
                  <span className="font-bold text-stone-800">{selectedTableForDrawer.minCapacity} - {selectedTableForDrawer.maxCapacity} 位</span>
                </div>
                <div>
                  <span className="text-stone-400 block">所屬區域</span>
                  <span className="font-bold text-stone-800">
                    {selectedTableForDrawer.zone === 'window' ? '景觀窗景區' :
                     selectedTableForDrawer.zone === 'main' ? '主用餐大廳' :
                     selectedTableForDrawer.zone === 'vip' ? '尊榮包廂區' : '星空露台區'}
                  </span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">手動變更桌況狀態：</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      updateTableStatus(selectedTableForDrawer.id, 'available');
                      setSelectedTableForDrawer(null);
                    }}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs text-left"
                  >
                    🟢 設為空桌 (Available)
                  </button>

                  <button
                    onClick={() => {
                      updateTableStatus(selectedTableForDrawer.id, 'cleaning');
                      setSelectedTableForDrawer(null);
                    }}
                    className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl font-bold text-xs text-left"
                  >
                    🔵 設為清理中 (Cleaning)
                  </button>

                  <button
                    onClick={() => {
                      updateTableStatus(selectedTableForDrawer.id, 'occupied');
                      setSelectedTableForDrawer(null);
                    }}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl font-bold text-xs text-left"
                  >
                    🔴 設為用餐中 (Occupied)
                  </button>

                  <button
                    onClick={() => {
                      updateTableStatus(selectedTableForDrawer.id, 'maintenance');
                      setSelectedTableForDrawer(null);
                    }}
                    className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xl font-bold text-xs text-left"
                  >
                    ⚪ 暫停使用 (Maintenance)
                  </button>
                </div>
              </div>

              {/* Fast seat on this table */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    const tid = selectedTableForDrawer.id;
                    setSelectedTableForDrawer(null);
                    handleOpenWalkIn(tid);
                  }}
                  className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>在此桌開桌帶位</span>
                </button>
              </div>

              {/* Delete table */}
              <div className="pt-2 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => {
                    if (window.confirm(`確定要刪除桌位【${selectedTableForDrawer.tableNumber}】嗎？`)) {
                      deleteTable(selectedTableForDrawer.id);
                      setSelectedTableForDrawer(null);
                    }
                  }}
                  className="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>刪除此桌位</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ASSIGN RESERVATION TO TABLE MODAL */}
      {/* ========================================================= */}
      {showAssignModal && targetReservationForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-stone-900 text-base mb-1">
              指派桌位給 {targetReservationForAssign.customerName}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              訂位時間：{targetReservationForAssign.date} {targetReservationForAssign.timeSlot} ({targetReservationForAssign.partySize}人)
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto mb-5 pr-1">
              {tables.map(t => {
                const isFit = t.maxCapacity >= targetReservationForAssign.partySize;
                const isFree = t.status === 'available';

                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      assignTable(targetReservationForAssign.id, t.id);
                      setShowAssignModal(false);
                      setTargetReservationForAssign(null);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isFree && isFit ? 'bg-stone-50 hover:bg-amber-50 border-stone-200 hover:border-amber-300' : 'bg-stone-100 opacity-60 border-stone-200'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold text-sm text-stone-900 mr-2">{t.tableNumber}</span>
                      <span className="text-xs text-stone-600">{t.name}</span>
                      <span className="text-[11px] text-stone-400 block">容量：{t.minCapacity}-{t.maxCapacity}人 ({t.zone})</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      t.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {t.status === 'available' ? '可指派' : t.status === 'occupied' ? '用餐中' : '已保留'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setTargetReservationForAssign(null);
                }}
                className="flex-1 py-2.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-xl"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD TABLE MODAL */}
      {/* ========================================================= */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-stone-900 text-base mb-1">新增餐廳實體桌位</h3>
            <p className="text-xs text-stone-500 mb-4">設定桌號編號、容納人數與所在用餐區域</p>

            <form onSubmit={handleCreateNewTable} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">桌號代碼</label>
                  <input
                    type="text"
                    required
                    value={newTableNum}
                    onChange={(e) => setNewTableNum(e.target.value)}
                    placeholder="如: M07, W05"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">所屬區域</label>
                  <select
                    value={newTableZone}
                    onChange={(e) => setNewTableZone(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  >
                    <option value="main">主用餐大廳</option>
                    <option value="window">景觀窗景區</option>
                    <option value="vip">尊榮包廂區</option>
                    <option value="terrace">星空露台區</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">桌位名稱描述</label>
                <input
                  type="text"
                  required
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="如: 大廳四人雅座 M07"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">最少人數</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newTableMin}
                    onChange={(e) => setNewTableMin(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">最多人數</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newTableMax}
                    onChange={(e) => setNewTableMax(parseInt(e.target.value) || 2)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">桌形</label>
                  <select
                    value={newTableShape}
                    onChange={(e) => setNewTableShape(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  >
                    <option value="square">方桌</option>
                    <option value="round">圓桌</option>
                    <option value="rect">長桌</option>
                    <option value="booth">沙發卡座</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTableModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow"
                >
                  建立桌位
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
