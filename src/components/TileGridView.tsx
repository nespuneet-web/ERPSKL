import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Award,
  Calendar,
  Clock,
  BookOpen,
  DollarSign,
  Briefcase,
  BarChart3,
  Bus,
  Book,
  Package,
  Home,
  Shield,
  Bell,
  GraduationCap,
  CreditCard,
  Settings,
  Database,
  Search,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Zap,
  Layers,
  ArrowUpRight,
  UserPlus
} from 'lucide-react';

export interface ModuleTile {
  id: string;
  name: string;
  shortDesc: string;
  icon: any;
  category: 'Core Academic' | 'Finance & Admin' | 'Campus Logistics' | 'Tools & Utilities';
  gradient: string;
  bgLight: string;
  badge?: string;
  color: string;
  accentBorder: string;
  iconBg: string;
}

export const ALL_TILES: ModuleTile[] = [
  // Core Academic
  {
    id: 'sis',
    name: 'Student Information (SIS)',
    shortDesc: 'Student records, directory, academic profiles & class lists',
    icon: Users,
    category: 'Core Academic',
    gradient: 'from-blue-600 to-indigo-600',
    bgLight: 'bg-sky-50/90 dark:bg-sky-950/40',
    accentBorder: 'border-sky-200 dark:border-sky-800/70 hover:border-sky-400',
    iconBg: 'from-blue-600 to-sky-600',
    badge: '1,200 Students',
    color: 'text-sky-700 dark:text-sky-300'
  },
  {
    id: 'admission',
    name: 'Admission & Inquiries',
    shortDesc: '3-Step admissions, prospect inquiries, registration & leads CRM',
    icon: UserPlus,
    category: 'Core Academic',
    gradient: 'from-emerald-600 to-teal-600',
    bgLight: 'bg-emerald-50/90 dark:bg-emerald-950/40',
    accentBorder: 'border-emerald-200 dark:border-emerald-800/70 hover:border-emerald-400',
    iconBg: 'from-emerald-600 to-teal-600',
    badge: 'Admission Team',
    color: 'text-emerald-700 dark:text-emerald-300'
  },
  {
    id: 'examination',
    name: 'Examination & Reports',
    shortDesc: 'CBSE marks entry, grade calculation & printable report cards',
    icon: Award,
    category: 'Core Academic',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50/90 dark:bg-amber-950/40',
    accentBorder: 'border-amber-200 dark:border-amber-800/70 hover:border-amber-400',
    iconBg: 'from-amber-500 to-orange-600',
    badge: 'Report Engine',
    color: 'text-amber-700 dark:text-amber-300'
  },
  {
    id: 'attendance',
    name: 'Daily Attendance',
    shortDesc: 'Real-time class registers, leave requests & monthly statistics',
    icon: Calendar,
    category: 'Core Academic',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50/90 dark:bg-emerald-950/40',
    accentBorder: 'border-emerald-200 dark:border-emerald-800/70 hover:border-emerald-400',
    iconBg: 'from-emerald-600 to-teal-600',
    badge: 'Live Sync',
    color: 'text-emerald-700 dark:text-emerald-300'
  },
  {
    id: 'timetable',
    name: 'Timetable Engine',
    shortDesc: 'Master schedule, round patrol radar, auto-substitution & period radar',
    icon: Clock,
    category: 'Core Academic',
    gradient: 'from-purple-600 to-indigo-600',
    bgLight: 'bg-purple-50/90 dark:bg-purple-950/40',
    accentBorder: 'border-purple-200 dark:border-purple-800/70 hover:border-purple-400',
    iconBg: 'from-purple-600 to-indigo-600',
    badge: 'Round & Sub',
    color: 'text-purple-700 dark:text-purple-300'
  },
  {
    id: 'lesson_plans',
    name: 'Lesson Plans & Syllabus',
    shortDesc: 'Weekly lesson trackers, curriculum progress & learning goals',
    icon: BookOpen,
    category: 'Core Academic',
    gradient: 'from-cyan-600 to-blue-600',
    bgLight: 'bg-cyan-50/90 dark:bg-cyan-950/40',
    accentBorder: 'border-cyan-200 dark:border-cyan-800/70 hover:border-cyan-400',
    iconBg: 'from-cyan-600 to-blue-600',
    badge: 'Curriculum',
    color: 'text-cyan-700 dark:text-cyan-300'
  },

  // Finance & Admin
  {
    id: 'fees',
    name: 'Fees & Collections',
    shortDesc: 'Fee receipts, installment schedules, online ledger & defaulters',
    icon: DollarSign,
    category: 'Finance & Admin',
    gradient: 'from-lime-600 to-green-700',
    bgLight: 'bg-lime-50/90 dark:bg-lime-950/40',
    accentBorder: 'border-lime-200 dark:border-lime-800/70 hover:border-lime-400',
    iconBg: 'from-lime-600 to-green-700',
    badge: 'Instant Receipt',
    color: 'text-lime-800 dark:text-lime-300'
  },
  {
    id: 'staff',
    name: 'Staff & Faculty Directory',
    shortDesc: 'Teacher profiles, designations, subject load & payroll data',
    icon: Users,
    category: 'Finance & Admin',
    gradient: 'from-fuchsia-600 to-pink-700',
    bgLight: 'bg-fuchsia-50/90 dark:bg-fuchsia-950/40',
    accentBorder: 'border-fuchsia-200 dark:border-fuchsia-800/70 hover:border-fuchsia-400',
    iconBg: 'from-fuchsia-600 to-pink-700',
    badge: '70 Teachers',
    color: 'text-fuchsia-700 dark:text-fuchsia-300'
  },
  {
    id: 'interview',
    name: 'Interview & HR Panel',
    shortDesc: 'Recruitment pipeline, candidate evaluations & interview scoring',
    icon: Briefcase,
    category: 'Finance & Admin',
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50/90 dark:bg-rose-950/40',
    accentBorder: 'border-rose-200 dark:border-rose-800/70 hover:border-rose-400',
    iconBg: 'from-rose-500 to-pink-600',
    badge: 'HR Portal',
    color: 'text-rose-700 dark:text-rose-300'
  },
  {
    id: 'reports',
    name: 'Custom Student Reports',
    shortDesc: 'Comprehensive report engine, column picker, topper/average, PDF & Excel',
    icon: BarChart3,
    category: 'Finance & Admin',
    gradient: 'from-indigo-600 to-cyan-600',
    bgLight: 'bg-indigo-50/90 dark:bg-indigo-950/40',
    accentBorder: 'border-indigo-200 dark:border-indigo-800/70 hover:border-indigo-400',
    iconBg: 'from-indigo-600 to-blue-600',
    badge: 'PDF & Excel',
    color: 'text-indigo-700 dark:text-indigo-300'
  },

  // Campus Logistics
  {
    id: 'transport',
    name: 'Transport & GPS Routes',
    shortDesc: 'School bus fleets, live routes, pickup points & driver info',
    icon: Bus,
    category: 'Campus Logistics',
    gradient: 'from-orange-600 to-amber-600',
    bgLight: 'bg-orange-50/90 dark:bg-orange-950/40',
    accentBorder: 'border-orange-200 dark:border-orange-800/70 hover:border-orange-400',
    iconBg: 'from-orange-600 to-amber-600',
    badge: 'GPS Tracking',
    color: 'text-orange-700 dark:text-orange-300'
  },
  {
    id: 'library',
    name: 'Library Catalog',
    shortDesc: 'Book catalog, ISBN search, active issues & overdue tracking',
    icon: Book,
    category: 'Campus Logistics',
    gradient: 'from-teal-600 to-emerald-600',
    bgLight: 'bg-teal-50/90 dark:bg-teal-950/40',
    accentBorder: 'border-teal-200 dark:border-teal-800/70 hover:border-teal-400',
    iconBg: 'from-teal-600 to-emerald-600',
    badge: 'Barcode Ready',
    color: 'text-teal-700 dark:text-teal-300'
  },
  {
    id: 'inventory',
    name: 'Inventory & Lab Assets',
    shortDesc: 'Science lab equipment, stationery inventory & purchase logs',
    icon: Package,
    category: 'Campus Logistics',
    gradient: 'from-slate-700 to-zinc-800',
    bgLight: 'bg-slate-100/90 dark:bg-slate-900/80',
    accentBorder: 'border-slate-300 dark:border-slate-700/80 hover:border-slate-500',
    iconBg: 'from-slate-700 to-zinc-800',
    badge: 'Stock Ledger',
    color: 'text-slate-800 dark:text-slate-200'
  },
  {
    id: 'hostel',
    name: 'Hostel & Dormitories',
    shortDesc: 'Dorm allocation, mess meal logs & warden visitor registry',
    icon: Home,
    category: 'Campus Logistics',
    gradient: 'from-yellow-500 to-amber-600',
    bgLight: 'bg-yellow-50/90 dark:bg-yellow-950/40',
    accentBorder: 'border-yellow-200 dark:border-yellow-800/70 hover:border-yellow-400',
    iconBg: 'from-yellow-600 to-amber-600',
    badge: 'Dorm Registry',
    color: 'text-yellow-800 dark:text-yellow-300'
  },
  {
    id: 'visitor',
    name: 'Visitor Gate Pass',
    shortDesc: 'Reception check-in, visitor badges & security logbook',
    icon: Shield,
    category: 'Campus Logistics',
    gradient: 'from-red-600 to-rose-700',
    bgLight: 'bg-red-50/90 dark:bg-red-950/40',
    accentBorder: 'border-red-200 dark:border-red-800/70 hover:border-red-400',
    iconBg: 'from-red-600 to-rose-700',
    badge: 'Gate Security',
    color: 'text-red-700 dark:text-red-300'
  },

  // Tools & Utilities
  {
    id: 'communication',
    name: 'Digital Noticeboard',
    shortDesc: 'Circulars, parental SMS broadcasts & emergency alerts',
    icon: Bell,
    category: 'Tools & Utilities',
    gradient: 'from-amber-600 to-yellow-600',
    bgLight: 'bg-amber-100/70 dark:bg-amber-950/50',
    accentBorder: 'border-amber-300 dark:border-amber-800/80 hover:border-amber-500',
    iconBg: 'from-amber-600 to-yellow-600',
    badge: 'Broadcast',
    color: 'text-amber-800 dark:text-amber-300'
  },
  {
    id: 'certificates',
    name: 'TC & Certificates',
    shortDesc: 'Transfer certificates, bonafide letters & character certificates',
    icon: GraduationCap,
    category: 'Tools & Utilities',
    gradient: 'from-emerald-600 to-cyan-600',
    bgLight: 'bg-emerald-100/70 dark:bg-emerald-950/50',
    accentBorder: 'border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-500',
    iconBg: 'from-emerald-600 to-teal-700',
    badge: 'Govt Compliant',
    color: 'text-emerald-800 dark:text-emerald-300'
  },
  {
    id: 'idcards',
    name: 'Smart ID Cards',
    shortDesc: 'Student & Staff PVC identity cards with QR and barcode',
    icon: CreditCard,
    category: 'Tools & Utilities',
    gradient: 'from-violet-600 to-purple-700',
    bgLight: 'bg-violet-50/90 dark:bg-violet-950/40',
    accentBorder: 'border-violet-200 dark:border-violet-800/70 hover:border-violet-400',
    iconBg: 'from-violet-600 to-purple-700',
    badge: 'QR Generator',
    color: 'text-violet-700 dark:text-violet-300'
  },
  {
    id: 'supabase_cloud',
    name: 'Supabase & Cloud Sync',
    shortDesc: 'Real-time database sync, cloud tables & cloud backup hub',
    icon: Database,
    category: 'Tools & Utilities',
    gradient: 'from-teal-500 to-cyan-600',
    bgLight: 'bg-cyan-100/70 dark:bg-cyan-950/50',
    accentBorder: 'border-cyan-300 dark:border-cyan-800/80 hover:border-cyan-500',
    iconBg: 'from-teal-600 to-cyan-700',
    badge: 'Real-Time Sync',
    color: 'text-cyan-800 dark:text-cyan-300'
  },
  {
    id: 'settings',
    name: 'System Settings',
    shortDesc: 'Academic sessions, role permissions & school configuration',
    icon: Settings,
    category: 'Tools & Utilities',
    gradient: 'from-stone-700 to-zinc-900',
    bgLight: 'bg-stone-100/90 dark:bg-stone-900/80',
    accentBorder: 'border-stone-300 dark:border-stone-700/80 hover:border-stone-500',
    iconBg: 'from-stone-700 to-zinc-900',
    badge: 'Admin Only',
    color: 'text-stone-800 dark:text-stone-200'
  }
];

interface TileGridViewProps {
  onSelectModule: (moduleId: string) => void;
  isMobileMode?: boolean;
}

export const TileGridView: React.FC<TileGridViewProps> = ({ onSelectModule, isMobileMode = false }) => {
  const { currentUser, activeRole, isModuleAllowed } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Core Academic', 'Finance & Admin', 'Campus Logistics', 'Tools & Utilities'];

  const filteredTiles = ALL_TILES.filter((tile) => {
    const matchesAuth = isModuleAllowed(tile.id);
    const matchesCategory = selectedCategory === 'All' || tile.category === selectedCategory;
    const matchesSearch =
      tile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tile.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tile.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAuth && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Welcome & Role Quick Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-black mb-2 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GOENKA Public School, Agra • ERP Portal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Welcome, {currentUser.name}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
              Role: <span className="font-bold text-white bg-indigo-700/80 px-2 py-0.5 rounded-md">{activeRole}</span> • Tap any tile below to launch that section.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 rounded-2xl bg-black/25 backdrop-blur-md border border-white/10 text-center shrink-0">
              <span className="block text-[10px] uppercase font-black text-indigo-300">Active Stage</span>
              <span className="text-xs font-bold text-white">App Launcher</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search school sections (e.g., Attendance, Exam, Fees, Timetable)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tiles Grid (Android Style Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filteredTiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              onClick={() => onSelectModule(tile.id)}
              className={`group relative p-4.5 rounded-3xl ${tile.bgLight} border ${tile.accentBorder} shadow-sm hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between cursor-pointer active:scale-98 overflow-hidden`}
            >
              {/* Top Row: Icon + Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tile.iconBg || tile.gradient} flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                {tile.badge && (
                  <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs backdrop-blur-xs">
                    {tile.badge}
                  </span>
                )}
              </div>

              {/* Title and Short Description */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-black text-sm sm:text-base ${tile.color} group-hover:underline transition-colors`}>
                    {tile.name}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                  {tile.shortDesc}
                </p>
              </div>

              {/* Bottom Category Marker & Stage indicator */}
              <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-bold">{tile.category}</span>
                <span className="font-extrabold text-indigo-700 dark:text-indigo-400 flex items-center gap-0.5 group-hover:underline">
                  Launch <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredTiles.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-3">
          <Layers className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No School Sections Found</h3>
          <p className="text-xs text-slate-500">
            No sections match "{searchQuery}" under {selectedCategory}. Try another keyword.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
