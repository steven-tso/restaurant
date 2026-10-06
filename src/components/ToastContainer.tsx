import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useRestaurant();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map(toast => {
        let bg = 'bg-stone-900 text-white';
        let Icon = Info;

        if (toast.type === 'success') {
          bg = 'bg-emerald-800 text-white border-l-4 border-emerald-400';
          Icon = CheckCircle2;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-800 text-white border-l-4 border-amber-400';
          Icon = AlertCircle;
        } else if (toast.type === 'error') {
          bg = 'bg-rose-800 text-white border-l-4 border-rose-400';
          Icon = XCircle;
        } else {
          bg = 'bg-stone-800 text-white border-l-4 border-stone-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md text-sm font-medium transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200 ${bg}`}
          >
            <Icon className="w-5 h-5 shrink-0 opacity-90" />
            <span className="flex-1 leading-snug">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
