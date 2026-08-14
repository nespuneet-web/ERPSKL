import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wifi,
  BatteryCharging,
  Signal,
  ArrowLeft,
  Search,
  Bell,
  Home,
  Calendar,
  Award,
  Settings,
  User,
  LogOut,
  Smartphone,
  Monitor,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building2,
  Lock,
  Layers,
  RotateCcw
} from 'lucide-react';
import { ALL_TILES } from './TileGridView';

interface AndroidMobileLayoutProps {
  activeModule: string;
  setActiveModule: (moduleId: string) => void;
  renderActiveModule: () => React.ReactNode;
  onOpenUserModal: () => void;
  onOpenSyncModal: () => void;
  onOpenPermissionsModal: () => void;
}

export const AndroidMobileLayout: React.FC<AndroidMobileLayoutProps> = ({
  activeModule,
  setActiveModule,
  renderActiveModule,
  onOpenUserModal,
  onOpenSyncModal,
  onOpenPermissionsModal
}) => {
  const {
    currentUser,
    activeRole,
    logout,
    viewMode,
    setViewMode,
    notifications,
    isModuleAllowed,
    currentAcademicSession
  } = useAuth();

  const [currentTime, setCurrentTime] = useState('09:41');
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const currentTile = ALL_TILES.find((t) => t.id === activeModule);

  const handleNavClick = (modId: string) => {
    setActiveModule(modId);
    setIsDrawerOpen(false);
  };

  const MobileAppBody = (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans select-none">
      
      {/* 1. Android Native Top Status Bar */}
      <div className="bg-slate-900 text-white px-4 py-1.5 flex items-center justify-between text-[11px] font-semibold tracking-wide border-b border-slate-800 shrink-0 z-50">
        <span className="font-mono font-black">{currentTime}</span>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-[10px] bg-indigo-600 px-1 py-0.2 rounded font-bold">5G</span>
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px]">100%</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* 2. Android App Top Bar */}
      <header className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white px-3.5 py-2.5 shadow-md flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-2.5">
          {activeModule !== 'home_tiles' ? (
            <button
              onClick={() => setActiveModule('home_tiles')}
              className="p-1.5 -ml-1 rounded-full hover:bg-white/20 active:scale-90 transition-all text-white cursor-pointer"
              title="Back to All Sections"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 -ml-1 rounded-xl hover:bg-white/20 active:scale-90 transition-all text-white cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-400 text-indigo-950 font-black flex items-center justify-center text-xs shadow-xs">
              G
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-black text-white leading-tight tracking-tight">
                {activeModule === 'home_tiles' ? 'Goingka Public School' : (currentTile?.name || 'Goingka ERP')}
              </h1>
              <p className="text-[10px] text-indigo-200 font-semibold leading-tight">
                Agra • {activeRole}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Desktop Mode Switcher */}
          <button
            onClick={() => setViewMode('desktop')}
            className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-lg text-[10px] font-bold border border-white/15 transition-all cursor-pointer"
            title="Switch to Desktop View"
          >
            <Monitor className="w-3 h-3" />
            <span>Desktop</span>
          </button>

          {/* User Profile Avatar Trigger */}
          <button
            onClick={onOpenUserModal}
            className="flex items-center gap-1 p-1 bg-indigo-700/80 hover:bg-indigo-600 rounded-xl border border-indigo-400/30 text-white cursor-pointer active:scale-95 transition-all"
            title="Switch User / View Credentials"
          >
            <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-[10px]">
              {currentUser.name.charAt(0)}
            </div>
          </button>
        </div>
      </header>

      {/* Stage Indicator when inside a specific module */}
      {activeModule !== 'home_tiles' && (
        <div className="bg-indigo-50 dark:bg-indigo-950/60 border-b border-indigo-100 dark:border-indigo-900/60 px-3.5 py-1.5 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200 font-bold text-[11px]">
            <button
              onClick={() => setActiveModule('home_tiles')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <Home className="w-3 h-3" />
              <span>All Sections</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="truncate max-w-[180px] font-black">{currentTile?.name || activeModule}</span>
          </div>

          <button
            onClick={() => setActiveModule('home_tiles')}
            className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-600 text-white rounded-md shadow-xs active:scale-95 cursor-pointer"
          >
            ← Back to Tiles
          </button>
        </div>
      )}

      {/* 3. Main Stage Content Area */}
      <main className="flex-1 overflow-y-auto p-3.5 pb-20 scrollbar-none">
        {renderActiveModule()}
      </main>

      {/* 4. Android Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto sm:max-w-none bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl z-40">
        {[
          { id: 'home_tiles', label: 'All Tiles', icon: Layers },
          { id: 'attendance', label: 'Attendance', icon: Calendar },
          { id: 'examination', label: 'Exams/Marks', icon: Award },
          { id: 'communication', label: 'Notices', icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : undefined },
          { id: 'user_settings', label: 'Profile', icon: User, action: onOpenUserModal }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  handleNavClick(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl relative ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400' : ''}`}>
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 5. Android Navigation Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-slate-900 text-white h-full shadow-2xl flex flex-col z-10">
            {/* Drawer Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-900 to-blue-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-indigo-950 font-black flex items-center justify-center text-base shadow-md">
                  G
                </div>
                <div>
                  <h2 className="font-black text-sm text-white">Goingka Public School</h2>
                  <p className="text-[10px] text-indigo-200 font-semibold">Agra • ERP Engine</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active User Card in Drawer */}
            <div className="p-3.5 bg-slate-800/80 border-b border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-xs text-white truncate">{currentUser.name}</p>
                <span className="inline-block text-[10px] font-bold text-indigo-300 bg-indigo-950/80 px-1.5 py-0.2 rounded">
                  {activeRole}
                </span>
              </div>
            </div>

            {/* Drawer Links */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-none">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
                Quick Navigation
              </p>
              <button
                onClick={() => handleNavClick('home_tiles')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeModule === 'home_tiles' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>All Sections (Tile Grid)</span>
              </button>

              <div className="my-2 border-t border-slate-800" />
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
                Academic Modules
              </p>

              {ALL_TILES.filter((t) => isModuleAllowed(t.id)).map((tile) => {
                const Icon = tile.icon;
                const isActive = activeModule === tile.id;
                return (
                  <button
                    key={tile.id}
                    onClick={() => handleNavClick(tile.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      <span>{tile.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 space-y-2">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenUserModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Switch User / Roster</span>
              </button>

              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold rounded-xl cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      {/* Device Frame Option Toolbar (Floating top-right) */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-2xl shadow-xl">
        <button
          onClick={() => setDeviceFrameMode(!deviceFrameMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            deviceFrameMode
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white bg-slate-800'
          }`}
          title="Toggle Android Device Frame Simulation"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{deviceFrameMode ? 'Phone Frame: ON' : 'Phone Frame: OFF'}</span>
        </button>

        <button
          onClick={() => setViewMode('desktop')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          title="Switch to Desktop Mode"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Desktop View</span>
        </button>
      </div>

      {deviceFrameMode ? (
        // Simulated Android Phone Frame
        <div className="my-6 p-3 bg-slate-950 rounded-[48px] border-4 border-slate-700 shadow-2xl shadow-indigo-950/50 w-full max-w-md">
          {/* Phone Top Notch / Camera Dot */}
          <div className="w-full flex justify-center items-center pb-2">
            <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
            </div>
          </div>
          {/* Phone Inner Screen */}
          <div className="rounded-[36px] overflow-hidden border border-slate-800 h-[780px] flex flex-col bg-slate-100 dark:bg-slate-950">
            {MobileAppBody}
          </div>
        </div>
      ) : (
        // Full Width Fluid Mobile View (Ideal for mobile devices & tablet viewing)
        <div className="w-full min-h-screen">
          {MobileAppBody}
        </div>
      )}
    </div>
  );
};
