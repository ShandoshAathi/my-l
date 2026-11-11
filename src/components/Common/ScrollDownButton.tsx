import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ScrollDownButtonProps {
  targetId: string;
  label?: string;
}

export const ScrollDownButton: React.FC<ScrollDownButtonProps> = ({ targetId, label = 'Next Chapter' }) => {
  const { theme } = useTheme();

  const handleScroll = () => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="pt-1 pb-2 flex justify-center select-none flex-shrink-0 z-20">
      <button
        onClick={handleScroll}
        type="button"
        className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/85 hover:bg-white text-gray-700 shadow-sm border border-white hover:shadow-md transition-all hover:scale-105"
        aria-label={`Scroll down to ${label}`}
      >
        <span style={{ color: theme.primary }}>{label}</span>
        <ChevronDown
          className="h-3.5 w-3.5 animate-bounce"
          style={{ color: theme.primary }}
        />
      </button>
    </div>
  );
};
