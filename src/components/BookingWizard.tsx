import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  HeartHandshake, 
  Sparkles, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  Baby, 
  Wine, 
  Utensils, 
  Copy, 
  CalendarPlus, 
  Phone, 
  Mail, 
  User, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DiningArea, MealPeriod, SpecialOccasion, Reservation } from '../types';

export const BookingWizard: React.FC = () => {
  const { 
    currentUser, 
    settings, 
    createReservation, 
    tables, 
    reservations, 
    setActiveView 
  } = useRestaurant();

  // Wizard Step: 1 = Date & Time & Party, 2 = Area & Occasion, 3 = Contact, 4 = Confirmed
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [needHighChair, setNeedHighChair] = useState<boolean>(false);
  
  // Date selection (default today)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedMealPeriod, setSelectedMealPeriod] = useState<MealPeriod>('dinner');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('18:30');
  
  // Preferences
  const [areaPreference, setAreaPreference] = useState<DiningArea>('any');
  const [specialOccasion, setSpecialOccasion] = useState<SpecialOccasion>('date');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [remarks, setRemarks] = useState<string>('');

  // Contact
  const [customerName, setCustomerName] = useState<string>(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState<string>(currentUser?.email || '');

  // Result state
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  // Sync current user info if user logs in during session
  useEffect(() => {
    if (currentUser && !customerName) {
      setCustomerName(currentUser.name);
      setCustomerPhone(currentUser.phone);
      setCustomerEmail(currentUser.email);
    }
  }, [currentUser]);

  // Generate next 14 dates for quick selection
  const availableDates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][d.getDay()];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    return {
      dateStr,
      displayDate: `${d.getMonth() + 1}/${d.getDate()}`,
      dayOfWeek,
      isWeekend,
      isToday: i === 0,
      isTomorrow: i === 1,
    };
  });

  // Time slot configurations
  const timeSlotsByPeriod: Record<MealPeriod, string[]> = {
    lunch: ['11:30', '12:00', '12:30', '13:00', '13:30'],
    tea: ['14:30', '15:00', '15:30', '16:00'],
    dinner: ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'],
  };

  const totalGuests = adults + children;
  const isLargeParty = totalGuests >= settings.depositThresholdGuests;
  const depositAmount = isLargeParty ? totalGuests * settings.depositPerPerson : 0;

  // Capacity helper: calculate booked count for date & time slot
  const getSlotAvailability = (time: string) => {
    const bookedForSlot = reservations
      .filter(r => r.date === selectedDate && r.timeSlot === time && r.status !== 'cancelled' && r.status !== 'no_show')
      .reduce((sum, r) => sum + r.partySize, 0);
    
    const maxCapacity = 45; // total restaurant seating capacity estimate
    const remaining = Math.max(0, maxCapacity - bookedForSlot);
    return {
      isAvailable: remaining >= totalGuests,
      remaining,
      isPopular: bookedForSlot > 15,
    };
  };

  const toggleDietary = (item: string) => {
    setSelectedDietary(prev => 
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const areaOptions: Array<{ id: DiningArea; name: string; tag: string; desc: string; img: string }> = [
    {
      id: 'any',
      name: '不拘，由餐廳貼心安排',
      tag: '推薦首選',
      desc: '由主廚與服務領班依同行人數與當日桌況安排最佳座位。',
      img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'window',
      name: '城市浪漫景觀窗景區',
      tag: '約會熱門',
      desc: '眺望信義繁華街景與溫潤夜色，適合雙人約會與摯友小酌。',
      img: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'main',
      name: '經典中庭主用餐大廳',
      tag: '寬敞舒適',
      desc: '法式復古皮革沙發與挑高木質暖調，氛圍溫馨優雅。',
      img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'vip',
      name: '尊榮私人包廂區',
      tag: '隱私首選',
      desc: '獨立隔音影音包廂空間，適合 6-14 人商務宴客或家族慶生。',
      img: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'terrace',
      name: '星空花園露台區',
      tag: '微風景致',
      desc: '戶外綠意庭園座位，微風徐徐，享受自在開闊用餐體驗。',
      img: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=400&auto=format&fit=crop&q=80',
    },
  ];

  const occasions: Array<{ id: SpecialOccasion; label: string; icon: string }> = [
    { id: 'date', label: '浪漫約會', icon: '🍷' },
    { id: 'birthday', label: '生日慶祝', icon: '🎂' },
    { id: 'anniversary', label: '紀念日', icon: '💐' },
    { id: 'gathering', label: '親友聚餐', icon: '🥂' },
    { id: 'business', label: '商務宴請', icon: '💼' },
    { id: 'family', label: '家庭聚會', icon: '👨‍👩‍👦' },
    { id: 'none', label: '一般用餐', icon: '🍽️' },
  ];

  const dietaryOptions = [
    '素食 (蛋奶素)',
    '全素食 (純素)',
    '不吃牛肉',
    '甲殼類海鮮過敏',
    '堅果過敏',
    '孕婦飲食避生食',
    '自備酒水 (知悉開瓶費)',
  ];

  const handleCompleteBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    // Smart table assignment: find an available table in preference zone with capacity matching party
    let matchedTable = tables.find(t => {
      const matchZone = areaPreference === 'any' || t.zone === areaPreference;
      const matchCap = t.maxCapacity >= totalGuests && t.minCapacity <= totalGuests;
      const isFree = t.status === 'available';
      return matchZone && matchCap && isFree;
    });

    // If no exact zone match, find any available table fitting capacity
    if (!matchedTable && areaPreference !== 'any') {
      matchedTable = tables.find(t => 
        t.maxCapacity >= totalGuests && t.minCapacity <= totalGuests && t.status === 'available'
      );
    }

    const created = createReservation({
      userId: currentUser?.id,
      customerName,
      customerPhone,
      customerEmail,
      partySize: totalGuests,
      adults,
      children,
      needHighChair,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      mealPeriod: selectedMealPeriod,
      areaPreference,
      assignedTableId: matchedTable?.id,
      assignedTableNumber: matchedTable?.tableNumber,
      specialOccasion,
      dietaryNotes: selectedDietary,
      remarks,
      depositRequired: isLargeParty,
      depositStatus: isLargeParty ? 'paid' : 'not_required',
      depositAmount: isLargeParty ? depositAmount : undefined,
      source: 'online',
    });

    setConfirmedReservation(created);
    setStep(4);

    // Confetti celebration!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d97706', '#b45309', '#f59e0b', '#10b981'],
      });
    } catch (e) {
      // ignore
    }
  };

  const copyBookingCode = () => {
    if (!confirmedReservation) return;
    navigator.clipboard.writeText(confirmedReservation.bookingCode);
    alert(`訂位代碼【${confirmedReservation.bookingCode}】已複製到剪貼簿！`);
  };

  const addToGoogleCalendar = () => {
    if (!confirmedReservation) return;
    const startTime = `${confirmedReservation.date.replace(/-/g, '')}T${confirmedReservation.timeSlot.replace(':', '')}00`;
    const endTime = `${confirmedReservation.date.replace(/-/g, '')}T${(parseInt(confirmedReservation.timeSlot.split(':')[0]) + 2).toString().padStart(2, '0')}${confirmedReservation.timeSlot.split(':')[1]}00`;
    
    const title = encodeURIComponent(`饗聚 Bistro 用餐預約 (${confirmedReservation.partySize}人)`);
    const details = encodeURIComponent(`訂位代碼: ${confirmedReservation.bookingCode}\n餐廳電話: ${settings.phone}\n地址: ${settings.address}`);
    const location = encodeURIComponent(settings.address);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Wizard Header Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-6 sm:p-8 text-white shadow-xl mb-8 border border-stone-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>即時線上即約即訂 • 免電話等候</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-brand tracking-wide text-amber-100">
            {settings.name}
          </h1>
          <p className="text-sm text-stone-300 mt-2 leading-relaxed">
            享受炭火炙烤頂級熟成肉品、法義旬味美饌與精選酒款。
            請選擇您的用餐人數與時段，我們將用心為您保留美好席位。
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 mt-4 pt-4 border-t border-stone-800">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>用餐時間 120 分鐘</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{settings.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {[
            { num: 1, title: '人數與日期時段' },
            { num: 2, title: '區域與特殊偏好' },
            { num: 3, title: '聯絡資料確認' },
            { num: 4, title: '完成訂位' },
          ].map((st, idx) => {
            const isCompleted = step > st.num;
            const isCurrent = step === st.num;
            return (
              <div key={st.num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted ? 'bg-emerald-600 text-white shadow' :
                  isCurrent ? 'bg-amber-600 text-white ring-4 ring-amber-100 shadow-md' :
                  'bg-stone-200 text-stone-500'
                }`}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : st.num}
                </div>
                <span className={`hidden sm:inline text-xs font-semibold ${
                  isCurrent ? 'text-amber-800' : isCompleted ? 'text-emerald-700' : 'text-stone-400'
                }`}>
                  {st.title}
                </span>
                {idx < 3 && <div className="hidden sm:block w-8 h-[2px] bg-stone-200 mx-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Party Size & Date & Time Slot */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-8 animate-in fade-in duration-200">
          
          {/* Party Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-800">選擇用餐人數</h3>
                  <p className="text-xs text-stone-500">6 人以上預約請提早訂位，系統將為您預留大桌或包廂</p>
                </div>
              </div>
              <span className="text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                共 {totalGuests} 位貴賓
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Adults Counter */}
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div>
                  <div className="font-semibold text-sm text-stone-800">大人人數</div>
                  <div className="text-xs text-stone-500">12 歲以上</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                    className="w-9 h-9 rounded-xl bg-white border border-stone-300 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold text-stone-800 text-base">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(Math.min(14, adults + 1))}
                    disabled={adults >= 14}
                    className="w-9 h-9 rounded-xl bg-white border border-stone-300 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children Counter */}
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div>
                  <div className="font-semibold text-sm text-stone-800">兒童人數</div>
                  <div className="text-xs text-stone-500">12 歲以下幼童</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                    className="w-9 h-9 rounded-xl bg-white border border-stone-300 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold text-stone-800 text-base">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(Math.min(6, children + 1))}
                    disabled={children >= 6}
                    className="w-9 h-9 rounded-xl bg-white border border-stone-300 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Need High Chair Checkbox */}
            {children > 0 && (
              <label className="mt-3 flex items-center gap-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={needHighChair}
                  onChange={(e) => setNeedHighChair(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <Baby className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-semibold text-amber-900">需要事先預留嬰兒高腳椅與幼童餐具組</span>
              </label>
            )}

            {isLargeParty && (
              <div className="mt-3 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">團體訂位須知：</span>
                  人數達 {settings.depositThresholdGuests} 位以上，系統將安排包廂或專屬大桌，預約需預繳訂金 NT${settings.depositPerPerson}/人（共 NT${depositAmount}），訂金可於現場結帳時全額折抵。
                </div>
              </div>
            )}
          </div>

          {/* Date Selector */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-800">選擇用餐日期</h3>
                  <p className="text-xs text-stone-500">可提前預約 30 天內席位</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-stone-600">已選：{selectedDate}</span>
            </div>

            {/* Horizontal date slider cards */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {availableDates.map(item => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-20 py-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-amber-700 text-white border-amber-700 shadow-md ring-2 ring-amber-300'
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                    }`}
                  >
                    <span className={`text-[11px] font-medium ${isSelected ? 'text-amber-200' : item.isWeekend ? 'text-rose-600' : 'text-stone-500'}`}>
                      {item.isToday ? '今天' : item.isTomorrow ? '明天' : item.dayOfWeek}
                    </span>
                    <span className="text-base font-bold mt-0.5">{item.displayDate}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meal Period & Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-800">用餐時段與時間</h3>
                  <p className="text-xs text-stone-500">午餐、下午茶、晚餐時段任選</p>
                </div>
              </div>
            </div>

            {/* Period selector */}
            <div className="flex bg-stone-100 p-1.5 rounded-2xl mb-4">
              {[
                { id: 'lunch', label: '午餐時段', time: settings.businessHours.lunch },
                { id: 'tea', label: '午後微醺', time: settings.businessHours.tea },
                { id: 'dinner', label: '晚宴時段', time: settings.businessHours.dinner },
              ].map(p => {
                const isAct = selectedMealPeriod === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedMealPeriod(p.id as MealPeriod);
                      setSelectedTimeSlot(timeSlotsByPeriod[p.id as MealPeriod][0]);
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-center transition-all ${
                      isAct
                        ? 'bg-white text-stone-900 font-bold shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <div className="text-xs">{p.label}</div>
                    <div className="text-[10px] text-stone-400">{p.time}</div>
                  </button>
                );
              })}
            </div>

            {/* Time Slot Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {timeSlotsByPeriod[selectedMealPeriod].map(slot => {
                const availability = getSlotAvailability(slot);
                const isSelected = selectedTimeSlot === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={!availability.isAvailable}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`relative p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-700 text-white border-amber-700 shadow-md ring-2 ring-amber-200'
                        : availability.isAvailable
                        ? 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                        : 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="text-sm font-bold">{slot}</div>
                    <div className={`text-[10px] mt-1 ${isSelected ? 'text-amber-200' : 'text-stone-500'}`}>
                      {availability.isAvailable ? (availability.isPopular ? '熱門時段' : '尚有名額') : '已客滿'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-8 py-3.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-2xl shadow-lg shadow-amber-900/20 transition-all hover:translate-x-0.5"
            >
              <span>下一步：座位區域與偏好</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* STEP 2: Dining Area & Occasion & Dietary Preferences */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-8 animate-in fade-in duration-200">
          
          {/* Area Preference */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-800">選擇座位區域偏好</h3>
                <p className="text-xs text-stone-500">我們會儘可能滿足您的位置偏好，視現場實際桌況做最適安排</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {areaOptions.map(opt => {
                const isSelected = areaPreference === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setAreaPreference(opt.id)}
                    className={`cursor-pointer rounded-2xl border overflow-hidden transition-all group ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-300 shadow-md'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="h-28 overflow-hidden relative">
                      <img
                        src={opt.img}
                        alt={opt.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-stone-900/80 backdrop-blur-sm text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {opt.tag}
                      </div>
                    </div>
                    <div className="p-3.5">
                      <div className="font-bold text-sm text-stone-800 mb-1 flex items-center justify-between">
                        <span>{opt.name}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-amber-600" />}
                      </div>
                      <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dining Occasion */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-800">用餐目的與慶祝活動</h3>
                <p className="text-xs text-stone-500">若有慶生或週年紀念，主廚將為您準備特製甜點祝福</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {occasions.map(occ => {
                const isSelected = specialOccasion === occ.id;
                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => setSpecialOccasion(occ.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-700 text-white border-amber-700 shadow-md'
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                    }`}
                  >
                    <span className="text-lg">{occ.icon}</span>
                    <span className="text-xs font-bold">{occ.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary Restrictions & Remarks */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-800">特殊飲食需求或偏好</h3>
                <p className="text-xs text-stone-500">可複選，我們將提前安排專屬備料</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {dietaryOptions.map(item => {
                const isChecked = selectedDietary.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleDietary(item)}
                    className={`text-xs px-3.5 py-2 rounded-xl border font-medium transition-all ${
                      isChecked
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}{item}
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                其他備註需求 (例如：行動不便需輪椅友善位、希望靠近插座、蛋糕題字等)
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                placeholder="有任何細節需要我們留意，請在此填寫..."
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-5 py-3 text-stone-600 hover:text-stone-900 text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>上一步</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-8 py-3.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-2xl shadow-lg shadow-amber-900/20 transition-all hover:translate-x-0.5"
            >
              <span>下一步：填寫聯絡人資訊</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* STEP 3: Contact Info & Review */}
      {step === 3 && (
        <form onSubmit={handleCompleteBooking} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-8 animate-in fade-in duration-200">
          
          {/* Reservation Summary Preview Box */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3 border-b border-amber-200/60 pb-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                預約行程摘要
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-amber-700 hover:underline font-semibold"
              >
                修改時段
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-stone-500 block">用餐日期</span>
                <span className="font-bold text-stone-800 text-sm">{selectedDate}</span>
              </div>
              <div>
                <span className="text-stone-500 block">時間時段</span>
                <span className="font-bold text-stone-800 text-sm">{selectedTimeSlot} ({selectedMealPeriod === 'lunch' ? '午餐' : selectedMealPeriod === 'tea' ? '下午茶' : '晚餐'})</span>
              </div>
              <div>
                <span className="text-stone-500 block">總計人數</span>
                <span className="font-bold text-stone-800 text-sm">{totalGuests} 位 ({adults} 大 {children > 0 ? `${children} 小` : ''})</span>
              </div>
              <div>
                <span className="text-stone-500 block">區域偏好</span>
                <span className="font-bold text-stone-800 text-sm">
                  {areaOptions.find(o => o.id === areaPreference)?.name.split(' ')[0] || '不拘'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Input Form */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-800">訂位人聯絡資訊</h3>
                <p className="text-xs text-stone-500">系統將透過簡訊與 Email 寄送訂位確認通知與保留憑證</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  訂位人姓名 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="請輸入訂位人姓名 (例如：林佳樺 小姐)"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    聯絡手機號碼 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="例如: 0912-345-678"
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    電子信箱 (寄送訂位憑證)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="例如: contact@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Policy Notice */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-600 space-y-1.5">
            <div className="font-bold text-stone-800">📋 訂位須知與取消政策：</div>
            <p>1. 訂位席次將保留 10 分鐘，如逾時未到且未主動聯繫，餐廳保留釋出座位予現場候位賓客之權利。</p>
            <p>2. 用餐時間自預約時間起算 120 分鐘；如需變更日期或取消訂位，請於用餐前透過線上系統取消。</p>
            {isLargeParty && (
              <p className="text-amber-800 font-semibold">
                3. 本次預約人數達 {settings.depositThresholdGuests} 位，系統已為您確認保留大桌/包廂席位，現場可憑此預約全額折抵低消。
              </p>
            )}
          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-5 py-3 text-stone-600 hover:text-stone-900 text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>上一步</span>
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-9 py-4 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02]"
            >
              <span>確認預訂並送出</span>
              <CheckCircle className="w-5 h-5" />
            </button>
          </div>

        </form>
      )}

      {/* STEP 4: Success & Confirmation Ticket Card */}
      {step === 4 && confirmedReservation && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-200/80 text-center animate-in zoom-in-95 duration-300">
          
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold font-serif-brand text-stone-900">
            訂位已順利確認！
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            我們期待於 {confirmedReservation.date} 為您提供賓至如歸的用餐體驗
          </p>

          {/* Ticket Card */}
          <div className="mt-8 max-w-lg mx-auto bg-stone-900 text-white rounded-3xl p-6 sm:p-8 text-left shadow-2xl relative overflow-hidden border border-stone-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-5">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
                  饗聚 BISTRO & GRILL
                </span>
                <span className="text-lg font-bold font-serif-brand">訂位憑證單</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 block">專屬訂位代碼</span>
                <span className="text-xl font-mono font-bold text-amber-300 tracking-wider">
                  {confirmedReservation.bookingCode}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-6">
              <div>
                <span className="text-stone-400 block">用餐人姓名</span>
                <span className="font-semibold text-stone-100 text-sm">{confirmedReservation.customerName}</span>
              </div>
              <div>
                <span className="text-stone-400 block">預約電話</span>
                <span className="font-semibold text-stone-100 text-sm">{confirmedReservation.customerPhone}</span>
              </div>
              <div>
                <span className="text-stone-400 block">日期與時間</span>
                <span className="font-semibold text-amber-300 text-sm">
                  {confirmedReservation.date} {confirmedReservation.timeSlot}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block">用餐人數</span>
                <span className="font-semibold text-stone-100 text-sm">
                  {confirmedReservation.partySize} 位貴賓
                </span>
              </div>
              <div>
                <span className="text-stone-400 block">座位區域</span>
                <span className="font-semibold text-stone-100">
                  {confirmedReservation.assignedTableNumber ? `桌號 ${confirmedReservation.assignedTableNumber}` : '現場為您安排'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block">用餐目的</span>
                <span className="font-semibold text-stone-100">
                  {occasions.find(o => o.id === confirmedReservation.specialOccasion)?.label || '一般用餐'}
                </span>
              </div>
            </div>

            {confirmedReservation.dietaryNotes.length > 0 && (
              <div className="p-3 bg-stone-800/80 rounded-xl text-xs mb-4">
                <span className="text-stone-400 block mb-1">備註飲食需求：</span>
                <div className="flex flex-wrap gap-1.5">
                  {confirmedReservation.dietaryNotes.map(d => (
                    <span key={d} className="bg-amber-600/30 text-amber-300 px-2 py-0.5 rounded text-[11px]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions inside ticket */}
            <div className="flex items-center gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={copyBookingCode}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>複製代碼</span>
              </button>
              <button
                type="button"
                onClick={addToGoogleCalendar}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>加入 Google 行事曆</span>
              </button>
            </div>

          </div>

          {/* Bottom view switch buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setConfirmedReservation(null);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors"
            >
              再預約一筆訂位
            </button>
            <button
              type="button"
              onClick={() => setActiveView('lookup')}
              className="w-full sm:w-auto px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>前往訂位查詢與管理專區</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
