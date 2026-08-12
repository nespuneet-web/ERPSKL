import React, { useState } from 'react';
import { useOtherModulesStore } from '../otherModules/otherStore';
import { Users, UserPlus, Search, CheckCircle, AlertCircle, Trash2, Mail, Phone, ShieldCheck } from 'lucide-react';

export const StaffModule: React.FC = () => {
  const { staff, addStaffMember, deleteStaffMember, updateStaffStatus } = useOtherModulesStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New staff form state
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('PGT Teacher');
  const [department, setDepartment] = useState('Mathematics');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('M.Sc. / B.Ed.');
  const [monthlySalary, setMonthlySalary] = useState(65000);
  const [employeeCode, setEmployeeCode] = useState('');

  const filteredStaff = staff.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.employeeCode.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.designation.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const newStaff = await addStaffMember({
      employeeCode: employeeCode.trim() || `EMP-${String(staff.length + 1).padStart(3, '0')}`,
      fullName: fullName.trim().toUpperCase(),
      designation: designation.trim(),
      department: department.trim(),
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@school.edu`,
      phone: phone.trim() || '+91 98100 00000',
      joiningDate: new Date().toISOString().split('T')[0],
      qualification: qualification.trim(),
      monthlySalary: Number(monthlySalary) || 50000,
      status: 'Active'
    });

    setSuccessMsg(`🟢 Teacher "${newStaff.fullName}" added & synced across Timetable, Attendance & Database!`);
    setTimeout(() => setSuccessMsg(null), 5000);

    // Reset form
    setFullName('');
    setEmployeeCode('');
    setEmail('');
    setPhone('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Staff & Faculty Central Directory
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              {staff.length} Active Staff
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Centralized Database: Teachers added here automatically reflect in Timetable, Lesson Plans, Substitutions & Class Teacher sections.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow cursor-pointer flex items-center gap-2 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Add New Teacher / Staff Member
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-sm font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search staff member by name, employee code, designation or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs font-bold text-slate-400 hover:text-slate-600">
            Clear
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Staff Member & Contacts</th>
              <th className="py-3 px-4">Designation & Dept</th>
              <th className="py-3 px-4">Qualification</th>
              <th className="py-3 px-4">Monthly Salary</th>
              <th className="py-3 px-4">Attendance & Timetable Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                  No staff members found matching "{searchTerm}".
                </td>
              </tr>
            ) : (
              filteredStaff.map((stf) => (
                <tr key={stf.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{stf.employeeCode}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{stf.fullName}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span><Mail className="w-3 h-3 inline mr-0.5 text-slate-400" />{stf.email}</span>
                      <span>•</span>
                      <span><Phone className="w-3 h-3 inline mr-0.5 text-slate-400" />{stf.phone}</span>
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{stf.designation}</p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {stf.department}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">{stf.qualification}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    ₹{stf.monthlySalary ? stf.monthlySalary.toLocaleString() : '50,000'}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={stf.status}
                      onChange={(e) => updateStaffStatus(stf.id, e.target.value as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                        stf.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                          : stf.status === 'Absent'
                          ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                          : stf.status === 'Half Day'
                          ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300'
                      }`}
                    >
                      <option value="Active">🟢 Active / Present</option>
                      <option value="Absent">🔴 Absent</option>
                      <option value="Half Day">🟡 Half Day Leave</option>
                      <option value="On Leave">🟣 On Leave</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        if (confirm(`Remove staff member "${stf.fullName}" from central directory?`)) {
                          deleteStaffMember(stf.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all"
                      title="Delete Staff Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Add New Faculty / Staff Member
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Employee Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder={`EMP-${String(staff.length + 1).padStart(3, '0')}`}
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUNIL KUMAR SHARMA"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Designation
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PGT Physics">PGT Physics</option>
                    <option value="PGT Chemistry">PGT Chemistry</option>
                    <option value="PGT Mathematics">PGT Mathematics</option>
                    <option value="PGT Biology">PGT Biology</option>
                    <option value="PGT Commerce">PGT Commerce</option>
                    <option value="PGT Economics">PGT Economics</option>
                    <option value="PGT English">PGT English</option>
                    <option value="TGT Mathematics">TGT Mathematics</option>
                    <option value="TGT Science">TGT Science</option>
                    <option value="TGT Social Studies">TGT Social Studies</option>
                    <option value="TGT English">TGT English</option>
                    <option value="TGT Hindi">TGT Hindi</option>
                    <option value="TGT Sanskrit">TGT Sanskrit</option>
                    <option value="PRT Primary Teacher">PRT Primary Teacher</option>
                    <option value="Physical Education Teacher">Physical Education Teacher</option>
                    <option value="Art & Music Teacher">Art & Music Teacher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Social Science">Social Science</option>
                    <option value="Commerce & Economics">Commerce & Economics</option>
                    <option value="Primary Block">Primary Block</option>
                    <option value="Sports & PE">Sports & PE</option>
                    <option value="Arts & Crafts">Arts & Crafts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="teacher@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98100 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    placeholder="M.Sc., B.Ed."
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Monthly Salary (₹)
                  </label>
                  <input
                    type="number"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow cursor-pointer"
                >
                  Save & Sync Central Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

