import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Reservation, 
  RestaurantTable, 
  RestaurantSettings, 
  ReservationStatus,
  TableStatus,
  DiningArea
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_RESERVATIONS, 
  INITIAL_TABLES, 
  INITIAL_SETTINGS 
} from '../data/initialData';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface RestaurantContextType {
  currentUser: User | null;
  users: User[];
  reservations: Reservation[];
  tables: RestaurantTable[];
  settings: RestaurantSettings;
  activeView: 'home' | 'reserve' | 'lookup' | 'member' | 'menu' | 'floor' | 'admin';
  setActiveView: (view: 'home' | 'reserve' | 'lookup' | 'member' | 'menu' | 'floor' | 'admin') => void;
  adminTab: 'dashboard' | 'reservations' | 'tables' | 'customers' | 'settings';
  setAdminTab: (tab: 'dashboard' | 'reservations' | 'tables' | 'customers' | 'settings') => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  
  // Auth
  login: (identifier: string, isManager?: boolean) => boolean;
  logout: () => void;
  register: (name: string, phone: string, email: string) => User;
  switchUser: (userId: string) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  
  // Reservations
  createReservation: (data: Omit<Reservation, 'id' | 'bookingCode' | 'createdAt' | 'status'>) => Reservation;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  cancelReservation: (id: string, reason?: string) => boolean;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  assignTable: (reservationId: string, tableId: string | null) => void;
  checkInReservation: (id: string, targetTableId?: string) => boolean;
  completeReservation: (id: string) => void;
  lookupReservations: (query: string) => Reservation[];
  
  // Tables
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  seatWalkIn: (customerName: string, phone: string, partySize: number, tableId: string, remarks?: string) => Reservation;
  addTable: (table: Omit<RestaurantTable, 'id'>) => RestaurantTable;
  updateTable: (id: string, updates: Partial<RestaurantTable>) => void;
  deleteTable: (id: string) => void;
  
  // Settings & Reset
  updateSettings: (newSettings: Partial<RestaurantSettings>) => void;
  resetAllData: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'bistro_users_v1',
  RESERVATIONS: 'bistro_reservations_v1',
  TABLES: 'bistro_tables_v1',
  SETTINGS: 'bistro_settings_v1',
  CURRENT_USER_ID: 'bistro_current_user_id_v1',
};

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from LocalStorage or defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (savedId) {
      const u = users.find(x => x.id === savedId);
      if (u) return u;
    }
    // Default to VIP customer for a great demo experience
    return users.find(x => x.id === 'user-vip') || users[0] || null;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_RESERVATIONS;
  });

  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TABLES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_TABLES;
  });

  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_SETTINGS;
  });

  const [activeView, setActiveView] = useState<'home' | 'reserve' | 'lookup' | 'member' | 'menu' | 'floor' | 'admin'>('reserve');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'reservations' | 'tables' | 'customers' | 'settings'>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentUser]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Auth functions
  const login = (identifier: string, isManager: boolean = false): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    if (isManager) {
      const admin = users.find(u => u.role === 'admin');
      if (admin) {
        setCurrentUser(admin);
        showToast(`歡迎回來，店經理 ${admin.name}！`, 'success');
        return true;
      }
    }

    const found = users.find(u => 
      u.email.toLowerCase() === cleanId || 
      u.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '')
    );

    if (found) {
      setCurrentUser(found);
      showToast(`登入成功！歡迎您，${found.name} 會員`, 'success');
      return true;
    }

    showToast('找不到符合的會員資料，您可以直接線上註冊加入！', 'warning');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('您已安全登出', 'info');
  };

  const register = (name: string, phone: string, email: string): User => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      role: 'customer',
      memberTier: 'regular',
      totalVisits: 0,
      createdAt: new Date().toISOString().split('T')[0],
      dietaryPreferences: [],
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    showToast(`註冊成功！恭喜加入饗聚尊榮會員`, 'success');
    return newUser;
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      showToast(`已切換至身分：${target.name} (${target.role === 'admin' ? '管理員' : '顧客'})`, 'info');
    }
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    showToast('個人資料已更新', 'success');
  };

  // Generate unique booking code e.g. BK-9281
  const generateBookingCode = (): string => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `BK-${num}`;
  };

  // Reservations
  const createReservation = (data: Omit<Reservation, 'id' | 'bookingCode' | 'createdAt' | 'status'>): Reservation => {
    const id = `res-${Date.now()}`;
    const bookingCode = generateBookingCode();

    const newRes: Reservation = {
      ...data,
      id,
      bookingCode,
      status: 'confirmed', // Auto confirm standard online bookings
      createdAt: new Date().toISOString(),
    };

    // If an auto-assigned or selected table is provided, link it
    if (data.assignedTableId) {
      setTables(prev => prev.map(t => {
        if (t.id === data.assignedTableId) {
          return {
            ...t,
            status: 'reserved',
            currentReservationId: id,
            currentGuests: data.partySize,
          };
        }
        return t;
      }));
    }

    setReservations(prev => [newRes, ...prev]);
    showToast(`🎉 訂位完成！您的訂位代碼為【${bookingCode}】`, 'success');
    return newRes;
  };

  const updateReservation = (id: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    showToast('訂位資料已順利更新', 'success');
  };

  const cancelReservation = (id: string, reason?: string): boolean => {
    const target = reservations.find(r => r.id === id);
    if (!target) return false;

    // Release table if any
    if (target.assignedTableId) {
      setTables(prev => prev.map(t => {
        if (t.id === target.assignedTableId) {
          return {
            ...t,
            status: 'available',
            currentReservationId: undefined,
            currentGuests: undefined,
          };
        }
        return t;
      }));
    }

    setReservations(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'cancelled',
          cancellationReason: reason || '顧客主動取消',
        };
      }
      return r;
    }));

    showToast(`訂位【${target.bookingCode}】已成功取消`, 'info');
    return true;
  };

  const updateReservationStatus = (id: string, status: ReservationStatus) => {
    const target = reservations.find(r => r.id === id);
    if (!target) return;

    if (status === 'cancelled' || status === 'no_show') {
      if (target.assignedTableId) {
        setTables(prev => prev.map(t => {
          if (t.id === target.assignedTableId) {
            return {
              ...t,
              status: 'available',
              currentReservationId: undefined,
              currentGuests: undefined,
            };
          }
          return t;
        }));
      }
    }

    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    showToast(`訂位狀態已變更為【${status === 'confirmed' ? '已確認' : status === 'seated' ? '已入座' : status === 'completed' ? '已完成' : status === 'cancelled' ? '已取消' : '未出席'}】`, 'success');
  };

  const assignTable = (reservationId: string, tableId: string | null) => {
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return;

    const oldTableId = res.assignedTableId;

    // Release old table
    if (oldTableId && oldTableId !== tableId) {
      setTables(prev => prev.map(t => {
        if (t.id === oldTableId && t.currentReservationId === reservationId) {
          return {
            ...t,
            status: 'available',
            currentReservationId: undefined,
            currentGuests: undefined,
          };
        }
        return t;
      }));
    }

    // Set new table
    let assignedTableNumber: string | undefined = undefined;
    if (tableId) {
      const tbl = tables.find(t => t.id === tableId);
      if (tbl) {
        assignedTableNumber = tbl.tableNumber;
        setTables(prev => prev.map(t => {
          if (t.id === tableId) {
            return {
              ...t,
              status: res.status === 'seated' ? 'occupied' : 'reserved',
              currentReservationId: reservationId,
              currentGuests: res.partySize,
            };
          }
          return t;
        }));
      }
    }

    setReservations(prev => prev.map(r => {
      if (r.id === reservationId) {
        return {
          ...r,
          assignedTableId: tableId || undefined,
          assignedTableNumber: assignedTableNumber,
        };
      }
      return r;
    }));

    showToast(tableId ? `已成功安排桌位 ${assignedTableNumber}` : '已取消桌位綁定', 'success');
  };

  const checkInReservation = (id: string, targetTableId?: string): boolean => {
    const res = reservations.find(r => r.id === id);
    if (!res) return false;

    const tableToUse = targetTableId || res.assignedTableId;
    if (!tableToUse) {
      showToast('請先選擇或指定入座桌號！', 'warning');
      return false;
    }

    const nowTime = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
    const targetTable = tables.find(t => t.id === tableToUse);

    setReservations(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'seated',
          checkedInAt: nowTime,
          assignedTableId: tableToUse,
          assignedTableNumber: targetTable?.tableNumber,
        };
      }
      return r;
    }));

    setTables(prev => prev.map(t => {
      if (t.id === tableToUse) {
        return {
          ...t,
          status: 'occupied',
          currentReservationId: id,
          currentGuests: res.partySize,
          occupiedSince: nowTime,
        };
      }
      return t;
    }));

    showToast(`賓客 ${res.customerName} 已入座 (${targetTable?.tableNumber || ''})`, 'success');
    return true;
  };

  const completeReservation = (id: string) => {
    const res = reservations.find(r => r.id === id);
    if (!res) return;

    const nowTime = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Release table and set to cleaning
    if (res.assignedTableId) {
      setTables(prev => prev.map(t => {
        if (t.id === res.assignedTableId) {
          return {
            ...t,
            status: 'cleaning',
            currentReservationId: undefined,
            currentGuests: undefined,
            occupiedSince: undefined,
          };
        }
        return t;
      }));
    }

    setReservations(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'completed',
          completedAt: nowTime,
        };
      }
      return r;
    }));

    // Update member visit count if registered
    if (res.userId) {
      setUsers(prev => prev.map(u => {
        if (u.id === res.userId) {
          return { ...u, totalVisits: u.totalVisits + 1 };
        }
        return u;
      }));
    }

    showToast(`訂位【${res.bookingCode}】結帳離席，桌位已轉為清潔消毒中`, 'info');
  };

  const lookupReservations = (query: string): Reservation[] => {
    const q = query.trim().toUpperCase();
    if (!q) return [];
    return reservations.filter(r => 
      r.bookingCode.toUpperCase().includes(q) ||
      r.customerPhone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) ||
      r.customerName.toLowerCase().includes(q.toLowerCase())
    );
  };

  // Tables
  const updateTableStatus = (tableId: string, status: TableStatus) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        const updates: Partial<RestaurantTable> = { status };
        if (status === 'available') {
          updates.currentReservationId = undefined;
          updates.currentGuests = undefined;
          updates.occupiedSince = undefined;
        } else if (status === 'occupied' && !t.occupiedSince) {
          updates.occupiedSince = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        return { ...t, ...updates };
      }
      return t;
    }));
    showToast(`桌況已變更`, 'info');
  };

  const seatWalkIn = (
    customerName: string, 
    phone: string, 
    partySize: number, 
    tableId: string, 
    remarks?: string
  ): Reservation => {
    const targetTable = tables.find(t => t.id === tableId);
    const nowTime = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
    const todayStr = new Date().toISOString().split('T')[0];
    const bookingCode = generateBookingCode();

    const walkInRes: Reservation = {
      id: `res-${Date.now()}`,
      bookingCode,
      customerName: customerName || '現場候位賓客',
      customerPhone: phone || '0900-000-000',
      customerEmail: '',
      partySize,
      adults: partySize,
      children: 0,
      needHighChair: false,
      date: todayStr,
      timeSlot: nowTime,
      mealPeriod: 'dinner',
      areaPreference: targetTable ? (targetTable.zone as DiningArea) : 'main',
      assignedTableId: tableId,
      assignedTableNumber: targetTable?.tableNumber,
      status: 'seated',
      specialOccasion: 'none',
      dietaryNotes: [],
      remarks: remarks || '現場來店入座 (Walk-in)',
      depositRequired: false,
      depositStatus: 'not_required',
      source: 'walk_in',
      createdAt: new Date().toISOString(),
      checkedInAt: nowTime,
    };

    setReservations(prev => [walkInRes, ...prev]);

    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status: 'occupied',
          currentReservationId: walkInRes.id,
          currentGuests: partySize,
          occupiedSince: nowTime,
        };
      }
      return t;
    }));

    showToast(`現場開桌成功！桌號 ${targetTable?.tableNumber} (${partySize} 位)`, 'success');
    return walkInRes;
  };

  const addTable = (tableData: Omit<RestaurantTable, 'id'>): RestaurantTable => {
    const newTable: RestaurantTable = {
      ...tableData,
      id: `tbl-${Date.now()}`,
    };
    setTables(prev => [...prev, newTable]);
    showToast(`已新增桌位【${newTable.tableNumber}】`, 'success');
    return newTable;
  };

  const updateTable = (id: string, updates: Partial<RestaurantTable>) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    showToast('桌位資訊已更新', 'success');
  };

  const deleteTable = (id: string) => {
    setTables(prev => prev.filter(t => t.id !== id));
    showToast('桌位已刪除', 'info');
  };

  const updateSettings = (newSettings: Partial<RestaurantSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showToast('餐廳設定已成功儲存', 'success');
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.RESERVATIONS);
    localStorage.removeItem(STORAGE_KEYS.TABLES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    setUsers(INITIAL_USERS);
    setReservations(INITIAL_RESERVATIONS);
    setTables(INITIAL_TABLES);
    setSettings(INITIAL_SETTINGS);
    setCurrentUser(INITIAL_USERS.find(u => u.id === 'user-vip') || null);
    showToast('已重設為系統預設示範資料', 'info');
  };

  return (
    <RestaurantContext.Provider
      value={{
        currentUser,
        users,
        reservations,
        tables,
        settings,
        activeView,
        setActiveView,
        adminTab,
        setAdminTab,
        toasts,
        showToast,
        login,
        logout,
        register,
        switchUser,
        updateUserProfile,
        createReservation,
        updateReservation,
        cancelReservation,
        updateReservationStatus,
        assignTable,
        checkInReservation,
        completeReservation,
        lookupReservations,
        updateTableStatus,
        seatWalkIn,
        addTable,
        updateTable,
        deleteTable,
        updateSettings,
        resetAllData,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
