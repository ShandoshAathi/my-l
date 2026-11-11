import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Lock, Menu, X, Sparkles, Palette } from 'lucide-react';
import { birthdayConfig } from '../../config/birthdayConfig';
import { useTheme } from '../../context/ThemeContext';
import { useGiftConfig } from '../../context/GiftConfigContext';

interface NavbarProps {
  onSectionClick?: (sectionId: string) => void;
  onOpenThemePicker?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSectionClick, onOpenThemePicker }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isGiftParam =
    new URLSearchParams(location.search).has('surprise') ||
    new URLSearchParams(location.search).has('gift');
  const isGiftPath =
    location.pathname.startsWith('/gift') ||
    location.pathname.startsWith('/surprise') ||
    isGiftParam;
  const isAdmin = !isGiftPath;
  const { theme } = useTheme();
  const { config } = useGiftConfig();

  const navLinks = [
    { label: 'Surprise', id: 'welcome' },
    { label: 'Intro', id: 'intro' },
    { label: 'Memories', id: 'memories' },
    { label: 'Balloon Game', id: 'orbit' },
    { label: 'Love Letter', id: 'letter' },
    { label: 'Sweet Cake', id: 'cake' },
    { label: 'Finale', id: 'finale' }
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (onSectionClick) {
      onSectionClick(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-3 inset-x-0 z-40 px-4 sm:px-8 max-w-6xl mx-auto">
      <nav className="flex items-center justify-between rounded-full glass-nav px-5 py-3 shadow-glass border border-white/60 backdrop-blur-md">
        {/* Brand / Title */}
        <Link
          to={isAdmin ? '/' : '/gift'}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-white group-hover:scale-110 transition-transform shadow-sm"
            style={{ background: theme.primary }}
          >
            <Heart className="h-4 w-4 fill-current" />
          </div>
          <span
            className="font-romantic text-xl sm:text-2xl font-bold transition-colors"
            style={{ color: theme.primary }}
          >
            {config.recipientName || birthdayConfig.recipientName}
          </span>
        </Link>

        {/* Desktop Nav Links (Only on main page) */}
        {!isAdmin && (
          <div className="hidden md:flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 hover:bg-white/80 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Action Buttons: Theme Switcher & Admin Link */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenThemePicker && !isAdmin && (
            <button
              onClick={onOpenThemePicker}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/80 hover:bg-white border border-white shadow-sm transition-all"
              style={{ color: theme.primary }}
              title="Change Theme Colors"
            >
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Theme</span>
            </button>
          )}

          <Link
            to={isAdmin ? '/gift' : '/admin'}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/80 hover:bg-white border border-white shadow-sm transition-all"
            style={{ color: theme.primary }}
          >
            {isAdmin ? (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>View Surprise</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </>
            )}
          </Link>

          {!isAdmin && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-gray-700 hover:bg-white/80 transition-colors md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && !isAdmin && (
        <div className="mt-2 rounded-2xl glass-panel p-4 shadow-xl border border-white/60 md:hidden flex flex-col gap-2">
          {onOpenThemePicker && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenThemePicker();
              }}
              className="w-full text-left px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 bg-white/50"
              style={{ color: theme.primary }}
            >
              <Palette className="h-4 w-4" />
              <span>Change Color Theme ({theme.name})</span>
            </button>
          )}
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="w-full text-left px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white/80 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
