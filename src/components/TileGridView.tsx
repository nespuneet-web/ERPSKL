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
  ArrowUpRight
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
}

export const ALL_TILES: ModuleTile[] = [
  // Core Academic
  {
    id: 'sis',
    name: 'Student Info & Admission',
    shortDesc: 'Student records, admission portal, documents & profiles',
    icon: Users,
    category: 'Core Academic',
    gradient: 'from-blue-600 to-indigo-600',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    badge: '1,200 Students',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'examination',
    name: 'Examination & Reports',
    shortDesc: 'CBSE marks entry, grade calculation & printable report cards',
    icon: Award,
    category: 'Core Academic',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    badge: 'Report Engine',
    color: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'attendance',
    name: 'Daily Attendance',
    shortDesc: 'Real-time class registers, leave requests & monthly statistics',
    icon: Calendar,
    category: 'Core Academic',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    badge: 'Live Sync',
    color: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 'timetable',
    name: 'Timetable Engine',
    shortDesc: 'Master schedule, automatic substitutions & period allocation',
    icon: Clock,
    category: 'Core Academic',
    gradient: 'from-purple-600 to-indigo-600',
    bgLight: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
    badge: 'Auto Substitute',
    color: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'lesson_plans',
    name: 'Lesson Plans & Syllabus',
    shortDesc: 'Weekly lesson trackers, curriculum progress & learning goals',
    icon: BookOpen,
    category: 'Core Academic',
    gradient: 'from-cyan-600 to-blue-600',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900',
    badge: 'Curriculum',
    color: 'text-cyan-600 dark:text-cyan-400'
  },

  // Finance & Admin
  {
    id: 'fees',
    name: 'Fees & Collections',
    shortDesc: 'Fee receipts, installment schedules, online ledger & defaulters',
    icon: DollarSign,
    category: 'Finance & Admin',
    gradient: 'from-emerald-600 to-green-700',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    badge: 'Instant Receipt',
    color: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 'staff',
    name: 'Staff & Faculty Directory',
    shortDesc: 'Teacher profiles, designations, subject load & payroll data',
    icon: Users,
    category: 'Finance & Admin',
    gradient: 'from-violet-600 to-purple-700',
    bgLight: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900',
    badge: '70 Teachers',
    color: 'text-violet-600 dark:text-violet-400'
  },
  {
    id: 'interview',
    name: 'Interview & HR Panel',
    shortDesc: 'Recruitment pipeline, candidate evaluations & interview scoring',
    icon: Briefcase,
    category: 'Finance & Admin',
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
    badge: 'HR Portal',
    color: 'text-rose-600 dark:text-rose-400'
  },
  {
    id: 'reports',
    name: 'Executive Analytics',
    shortDesc: 'Comprehensive academic graphs, attendance trends & KPI summaries',
    icon: BarChart3,
    category: 'Finance & Admin',
    gradient: 'from-indigo-600 to-cyan-600',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
    badge: 'Analytics',
    color: 'text-indigo-600 dark:text-indigo-400'
  },

  // Campus Logistics
  {
    id: 'transport',
    name: 'Transport & GPS Routes',
    shortDesc: 'School bus fleets, live routes, pickup points & driver info',
    icon: Bus,
    category: 'Campus Logistics',
    gradient: 'from-amber-600 to-yellow-600',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    badge: 'GPS Tracking',
    color: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'library',
    name: 'Library Catalog',
    shortDesc: 'Book catalog, ISBN search, active issues & overdue tracking',
    icon: Book,
    category: 'Campus Logistics',
    gradient: 'from-teal-600 to-emerald-600',
    bgLight: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900',
    badge: 'Barcode Ready',
    color: 'text-teal-600 dark:text-teal-400'
  },
  {
    id: 'inventory',
    name: 'Inventory & Lab Assets',
    shortDesc: 'Science lab equipment, stationery inventory & purchase logs',
    icon: Package,
    category: 'Campus Logistics',
    gradient: 'from-blue-600 to-slate-700',
    bgLight: 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800',
    badge: 'Stock Ledger',
    color: 'text-slate-600 dark:text-slate-300'
  },
  {
    id: 'hostel',
    name: 'Hostel & Dormitories',
    shortDesc: 'Dorm allocation, mess meal logs & warden visitor registry',
    icon: Home,
    category: 'Campus Logistics',
    gradient: 'from-orange-500 to-amber-600',
    bgLight: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
    badge: 'Dorm Registry',
    color: 'text-orange-600 dark:text-orange-400'
  },
  {
    id: 'visitor',
    name: 'Visitor Gate Pass',
    shortDesc: 'Reception check-in, visitor badges & security logbook',
    icon: Shield,
    category: 'Campus Logistics',
    gradient: 'from-red-600 to-rose-700',
    bgLight: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900',
    badge: 'Gate Security',
    color: 'text-red-600 dark:text-red-400'
  },

  // Tools & Utilities
  {
    id: 'communication',
    name: 'Digital Noticeboard',
    shortDesc: 'Circulars, parental SMS broadcasts & emergency alerts',
    icon: Bell,
    category: 'Tools & Utilities',
    gradient: 'from-yellow-500 to-amber-600',
    bgLight: 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-900',
    badge: 'Broadcast',
    color: 'text-yellow-600 dark:text-yellow-400'
  },
  {
    id: 'certificates',
    name: 'TC & Certificates',
    shortDesc: 'Transfer certificates, bonafide letters & character certificates',
    icon: GraduationCap,
    category: 'Tools & Utilities',
    gradient: 'from-emerald-600 to-cyan-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    badge: 'Govt Compliant',
    color: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 'idcards',
    name: 'Smart ID Cards',
    shortDesc: 'Student & Staff PVC identity cards with QR and barcode',
    icon: CreditCard,
    category: 'Tools & Utilities',
    gradient: 'from-indigo-500 to-purple-600',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
    badge: 'QR Generator',
    color: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    id: 'supabase_cloud',
    name: 'Supabase & Cloud Sync',
    shortDesc: 'Real-time database sync, cloud tables & cloud backup hub',
    icon: Database,
    category: 'Tools & Utilities',
    gradient: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    badge: 'Real-Time Sync',
    color: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 'settings',
    name: 'System Settings',
    shortDesc: 'Academic sessions, role permissions & school configuration',
    icon: Settings,
    category: 'Tools & Utilities',
    gradient: 'from-slate-700 to-slate-900',
    bgLight: 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800',
    badge: 'Admin Only',
    color: 'text-slate-700 dark:text-slate-300'
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
              className="group relative p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between cursor-pointer active:scale-98 overflow-hidden"
            >
              {/* Top Row: Icon + Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tile.gradient} flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                {tile.badge && (
                  <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                    {tile.badge}
                  </span>
                )}
              </div>

              {/* Title and Short Description */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tile.name}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                  {tile.shortDesc}
                </p>
              </div>

              {/* Bottom Category Marker & Stage indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span className="font-semibold">{tile.category}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 group-hover:underline">
                  Open Stage <ChevronRight className="w-3 h-3" />
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
