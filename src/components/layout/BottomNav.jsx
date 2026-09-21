import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, ShoppingCart, Settings } from 'lucide-react';
import { useShoppingList } from '../../hooks/useShoppingList';

export default function BottomNav() {
  const { totalActiveCount } = useShoppingList();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`
          }
        >
          <Package className="w-6 h-6 mb-1" />
          <span className="text-xs">Dispensa</span>
        </NavLink>

        <NavLink
          to="/lista"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full min-h-[44px] relative transition-colors ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`
          }
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6 mb-1" />
            {totalActiveCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {totalActiveCount}
              </span>
            )}
          </div>
          <span className="text-xs">Lista Spesa</span>
        </NavLink>

        <NavLink
          to="/impostazioni"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`
          }
        >
          <Settings className="w-6 h-6 mb-1" />
          <span className="text-xs">Impostazioni</span>
        </NavLink>
      </div>
    </nav>
  );
}
