import React, { useState } from 'react';
import { useSisStore } from './sisStore';
import { Shield, Award, Plus, CheckCircle2, UserCheck, Activity } from 'lucide-react';
import { GROUP_A_INDOOR_ACTIVITIES, GROUP_B_OUTDOOR_ACTIVITIES } from '../../data/mockData';

export const HouseAndClubManager: React.FC = () => {
  const { houses, clubs, students, addHouse, addClub } = useSisStore();

  const [activeTab, setActiveTab] = useState<'houses' | 'clubs' | 'activities'>('houses');

  // House form state
  const [showHouseModal, setShowHouseModal] = useState(false);
  const [houseName, setHouseName] = useState('');
  const [houseColor, setHouseColor] = useState('#3b82f6');
  const [houseMotto, setHouseMotto] = useState('');
  const [houseMaster, setHouseMaster] = useState('');

  // Club form state
  const [showClubModal, setShowClubModal] = useState(false);
  const [clubName, setClubName] = useState('');
  const [clubCategory, setClubCategory] = useState<'Academic' | 'Cultural' | 'Sports' | 'Technical' | 'Social Service' | 'Arts'>('Academic');
  const [clubDesc, setClubDesc] = useState('');
  const [clubIncharge, setClubIncharge] = useState('');

  const handleCreateHouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseName) return;
    addHouse({
      name: houseName,
      color: houseColor,
      motto: houseMotto || 'Excellence and Integrity',
      masterTeacher: houseMaster || 'Senior Faculty'
    });
    setHouseName('');
    setHouseMotto('');
    setShowHouseModal(false);
  };

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName) return;
    addClub({
      name: clubName,
      category: clubCategory,
      description: clubDesc || 'Student development and co-curricular club.',
      inchargeTeacher: clubIncharge || 'Club Director'
    });
    setClubName('');
    setClubDesc('');
    setShowClubModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Custom House, Club & Co-Curricular Activity Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure customizable house systems, dynamic clubs, and enforce the 1 Indoor (Group A) + 1 Outdoor (Group B) co-curricular activity rule.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHouseModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" /> Add Custom House
          </button>
          <button
            onClick={() => setShowClubModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 dark:text-amber-100 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Club
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('houses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'houses'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Shield className="w-4 h-4" />
          School Houses ({houses.length})
        </button>

        <button
          onClick={() => setActiveTab('clubs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'clubs'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Award className="w-4 h-4" />
          Student Clubs ({clubs.length})
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'activities'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          Activity Rules & Allocation
        </button>
      </div>

      {/* HOUSES TAB */}
      {activeTab === 'houses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {houses.map((h) => {
            const memberCount = students.filter((s) => s.house === h.name).length;
            return (
              <div key={h.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-2"
                  style={{ backgroundColor: h.color || '#3b82f6' }}
                />
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-4 h-4" style={{ color: h.color || '#3b82f6' }} />
                    {h.name}
                  </h3>
                  <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full">
                    {memberCount} Students
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  "{h.motto || 'Excellence in all endeavors'}"
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex justify-between">
                  <span>House Master: <strong>{h.masterTeacher || 'Unassigned'}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CLUBS TAB */}
      {activeTab === 'clubs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((c) => {
            const memberCount = students.filter((s) => s.clubName === c.name).length;
            return (
              <div key={c.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    {c.category}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {memberCount} Enrolled
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  {c.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {c.description}
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  Incharge: <strong className="text-slate-800 dark:text-slate-200">{c.inchargeTeacher || 'Director'}</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ACTIVITIES TAB */}
      {activeTab === 'activities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Indoor Group A */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Group A Activities (Indoor) - Max 1 Per Child
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Indoor co-curricular games, arts, coding, and intellectual development activities.
              </p>
            </div>
            <div className="space-y-2">
              {GROUP_A_INDOOR_ACTIVITIES.map((act) => {
                const count = students.filter((s) => s.groupAActivity === act).length;
                return (
                  <div key={act} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{act}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {count} Students
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outdoor Group B */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Group B Activities (Outdoor) - Max 1 Per Child
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Outdoor sports, athletics, physical conditioning, and field games.
              </p>
            </div>
            <div className="space-y-2">
              {GROUP_B_OUTDOOR_ACTIVITIES.map((act) => {
                const count = students.filter((s) => s.groupBActivity === act).length;
                return (
                  <div key={act} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{act}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {count} Students
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CREATE HOUSE MODAL */}
      {showHouseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Add New Custom School House
            </h3>
            <form onSubmit={handleCreateHouse} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">House Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tagore, Raman, Kalam, Emerald..."
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Theme Color</label>
                <input
                  type="color"
                  value={houseColor}
                  onChange={(e) => setHouseColor(e.target.value)}
                  className="w-full h-10 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">House Motto</label>
                <input
                  type="text"
                  placeholder="e.g. Truth, Courage and Valor"
                  value={houseMotto}
                  onChange={(e) => setHouseMotto(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Master Teacher Incharge</label>
                <input
                  type="text"
                  placeholder="Teacher Name"
                  value={houseMaster}
                  onChange={(e) => setHouseMaster(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowHouseModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save House
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CLUB MODAL */}
      {showClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Add New Student Club
            </h3>
            <form onSubmit={handleCreateClub} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Club Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robotics & AI Club, Drama Guild..."
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <select
                  value={clubCategory}
                  onChange={(e) => setClubCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Academic">Academic</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Technical">Technical</option>
                  <option value="Social Service">Social Service</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Club objectives and activities"
                  value={clubDesc}
                  onChange={(e) => setClubDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Incharge Teacher</label>
                <input
                  type="text"
                  placeholder="Teacher Name"
                  value={clubIncharge}
                  onChange={(e) => setClubIncharge(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowClubModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  Save Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
