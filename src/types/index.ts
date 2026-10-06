export type UserRole = 'customer' | 'admin' | 'staff';
export type MemberTier = 'regular' | 'gold' | 'vip';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  memberTier: MemberTier;
  avatar?: string;
  totalVisits: number;
  dietaryPreferences?: string[];
  notes?: string;
  createdAt: string;
}

export type MealPeriod = 'lunch' | 'tea' | 'dinner';

export type DiningArea = 'all' | 'any' | 'main' | 'window' | 'vip' | 'terrace';

export type ReservationStatus = 
  | 'pending'    // 待確認
  | 'confirmed'  // 已確認
  | 'seated'     // 已入座
  | 'completed'  // 已完成
  | 'cancelled'  // 已取消
  | 'no_show';   // 未出席

export type SpecialOccasion = 
  | 'none'
  | 'birthday'
  | 'anniversary'
  | 'business'
  | 'date'
  | 'family'
  | 'gathering';

export interface Reservation {
  id: string;
  bookingCode: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  partySize: number;
  adults: number;
  children: number;
  needHighChair: boolean;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "18:00"
  mealPeriod: MealPeriod;
  areaPreference: DiningArea;
  assignedTableId?: string;
  assignedTableNumber?: string;
  status: ReservationStatus;
  specialOccasion: SpecialOccasion;
  dietaryNotes: string[];
  remarks?: string;
  depositRequired: boolean;
  depositStatus: 'not_required' | 'unpaid' | 'paid';
  depositAmount?: number;
  source: 'online' | 'phone' | 'walk_in';
  createdAt: string;
  checkedInAt?: string;
  completedAt?: string;
  cancellationReason?: string;
}

export type TableStatus = 
  | 'available'   // 空桌可入座
  | 'reserved'    // 已預約保留
  | 'occupied'    // 用餐中
  | 'cleaning'    // 清理消毒中
  | 'maintenance'; // 暫停使用

export type TableShape = 'round' | 'square' | 'rect' | 'booth';

export interface RestaurantTable {
  id: string;
  tableNumber: string;
  name: string;
  zone: DiningArea;
  minCapacity: number;
  maxCapacity: number;
  shape: TableShape;
  status: TableStatus;
  currentReservationId?: string;
  currentGuests?: number;
  occupiedSince?: string;
  // Layout coordinates for 2D floor visualizer
  x: number; // percentage or px
  y: number;
  width: number;
  height: number;
}

export interface MenuItem {
  id: string;
  category: 'starter' | 'main' | 'dessert' | 'wine';
  name: string;
  nameEn: string;
  price: number;
  description: string;
  image: string;
  isPopular?: boolean;
  isChefSpecial?: boolean;
}

export interface RestaurantSettings {
  name: string;
  subName: string;
  address: string;
  phone: string;
  businessHours: {
    lunch: string;
    tea: string;
    dinner: string;
  };
  slotIntervalMinutes: number;
  diningDurationMinutes: number;
  maxAdvanceBookingDays: number;
  depositThresholdGuests: number;
  depositPerPerson: number;
  noticePolicy: string;
}
