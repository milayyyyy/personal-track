import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../lib/navItems';

export default function MobileBottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe"
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-6 gap-0 px-1 pt-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2 min-h-14 rounded-lg transition-colors touch-manipulation ${
                  isActive ? item.activeClass : 'text-slate-500'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="text-[10px] font-semibold leading-none">{item.shortLabel}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
