import React, { useState } from 'react';
import { UserProfile, UserRole, ApprovalStatus } from '../types';
// Import IMAGES constant to fix "Cannot find name 'IMAGES'" errors on lines 106 and 110
import { IMAGES } from '../constants';

interface AdminDashboardScreenProps {
  users: UserProfile[];
  onUpdateStatus: (userId: string, status: ApprovalStatus) => void;
  onBack: () => void;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ users, onUpdateStatus, onBack }) => {
  const pendingDrivers = users.filter(u => u.role === UserRole.DRIVER && u.approvalStatus === 'PENDING');
  const approvedDrivers = users.filter(u => u.role === UserRole.DRIVER && u.approvalStatus === 'APPROVED');
  const rejectedDrivers = users.filter(u => u.role === UserRole.DRIVER && u.approvalStatus === 'REJECTED');
  
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  return (
    <div className="flex h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
        </button>
        <h1 className="text-lg font-black leading-tight tracking-tight text-center uppercase">Admin Console</h1>
        <div className="size-10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary filled">admin_panel_settings</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-6 w-full overflow-y-auto no-scrollbar gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Pending Applications</h2>
            <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">{pendingDrivers.length}</span>
          </div>
          
          {pendingDrivers.length === 0 ? (
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-slate-400 text-4xl mb-2">done_all</span>
              <p className="text-slate-500 text-sm font-medium">No pending driver applications</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {pendingDrivers.map(user => (
                <div 
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary transition-all active:scale-[0.98]"
                >
                  <img src={user.avatar} className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700" alt={user.name} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{user.name}</h3>
                    <p className="text-slate-500 text-xs truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="bg-orange-500/10 text-orange-500 text-[9px] font-black uppercase px-2 py-0.5 rounded">Awaiting Review</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 text-center">
              <p className="text-green-500 text-[10px] font-black uppercase mb-1">Active Drivers</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{approvedDrivers.length}</p>
           </div>
           <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 text-center">
              <p className="text-red-500 text-[10px] font-black uppercase mb-1">Rejected</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{rejectedDrivers.length}</p>
           </div>
        </div>
      </main>

      {/* Driver Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
            <div className="p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Review Application</h3>
                <button onClick={() => setSelectedUser(null)} className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                   <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <img src={selectedUser.avatar} className="w-16 h-16 rounded-2xl object-cover border-2 border-primary" alt="" />
                <div>
                   <h4 className="text-lg font-bold">{selectedUser.name}</h4>
                   <p className="text-slate-500 text-sm">{selectedUser.phone}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Driver Credentials</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-slate-500 font-bold ml-1">Driver License</span>
                      <img src={selectedUser.licenseImage || IMAGES.MAP_BG} className="w-full h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-800" alt="License" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-slate-500 font-bold ml-1">Selfie Verification</span>
                      <img src={selectedUser.selfieImage || IMAGES.USER_AVATAR} className="w-full h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-800" alt="Selfie" />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                      <span className="text-xs font-bold">Background Check Consent</span>
                   </div>
                   <p className="text-[11px] text-slate-500">Applicant has consented to the mandatory platform verification process.</p>
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <button 
                  onClick={() => {
                    onUpdateStatus(selectedUser.id, 'REJECTED');
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all active:scale-[0.98]"
                >
                  Reject
                </button>
                <button 
                  onClick={() => {
                    onUpdateStatus(selectedUser.id, 'APPROVED');
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:brightness-110 transition-all active:scale-[0.98]"
                >
                  Approve Driver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardScreen;