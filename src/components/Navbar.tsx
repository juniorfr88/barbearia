import React from 'react';
import { ActiveTab, ClientProfile } from '../types';
import { ClientAvatar } from './ClientAvatar';
import { getRgba } from '../utils/theme';
import {
  Scissors,
  Calendar,
  User,
  Palette,
  Clock,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  clientProfile: ClientProfile;
  activeAppointmentsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  clientProfile,
  activeAppointmentsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const themeColor = clientProfile.themeColor;

  const navItems = [
    {
      id: 'book' as ActiveTab,
      label: 'Agendar Horário',
      icon: Scissors,
    },
    {
      id: 'my-appointments' as ActiveTab,
      label: 'Meus Agendamentos',
      icon: Calendar,
      badge: activeAppointmentsCount > 0 ? activeAppointmentsCount : undefined,
    },
    {
      id: 'profile' as ActiveTab,
      label: 'Meu Perfil & Cores',
      icon: Palette,
      highlight: true,
    },
    {
      id: 'shop-agenda' as ActiveTab,
      label: 'Mural da Barbearia',
      icon: Clock,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div
            onClick={() => onSelectTab('book')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 shadow-md"
              style={{
                backgroundColor: getRgba(themeColor, 0.15),
                borderColor: themeColor,
                borderWidth: '2px',
                color: themeColor,
              }}
            >
              <Scissors className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-base uppercase text-white font-serif">
                  Barbearia Club
                </span>
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: themeColor }}
                />
              </div>
              <div className="text-[10px] tracking-widest uppercase text-neutral-400 font-mono">
                Cortes, Barboterapia & Estilo
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-sm border border-neutral-700/80'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                  }`}
                  style={isActive ? { borderColor: themeColor } : {}}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: isActive ? themeColor : 'inherit' }}
                  />
                  <span>{item.label}</span>

                  {item.badge !== undefined && (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold"
                      style={{
                        backgroundColor: getRgba(themeColor, 0.25),
                        color: themeColor,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.highlight && !isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: themeColor }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Side: Quick Client Profile Pill */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer group"
              title="Personalizar seu perfil e cor"
            >
              <ClientAvatar
                iconId={clientProfile.avatarIcon}
                themeColor={themeColor}
                size="sm"
              />
              <div className="text-left">
                <div className="text-xs font-bold text-white group-hover:text-neutral-200 flex items-center gap-1.5">
                  <span>{clientProfile.name.split(' ')[0]}</span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: themeColor }}
                  />
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  Perfil VIP
                </div>
              </div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onSelectTab('profile')}
              className="p-1 rounded-xl"
            >
              <ClientAvatar
                iconId={clientProfile.avatarIcon}
                themeColor={themeColor}
                size="sm"
              />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-800/80 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  style={isActive ? { color: themeColor } : {}}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: getRgba(themeColor, 0.2),
                        color: themeColor,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
