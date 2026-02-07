
import React, { useState } from 'react';
import { UserProfile, UserRole, ApprovalStatus } from '../types';
import { IMAGES } from '../constants';

interface AdminDashboardScreenProps {
  users: UserProfile[];
  onUpdateStatus: (userId: string, status: ApprovalStatus) => void;
  onBack: () => void;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ users, onUpdateStatus, onBack }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'rejected'>('pending');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const pendingDrivers = users.filter(u => u.role === UserRole.DRIVER && u.approvalStatus === 'PENDING');
  const approvedDrivers = users.filter(u => u.role === UserRole.DRIVER && u.approvalStatus === 'APPROVED');
  const rejectedDrivers = users.filter(u => u.role === UserRole.DRIVER && u.approvalStatus === 'REJECTED');

  const getList = () => {
    switch (activeTab) {
      case 'pending': return pendingDrivers;
      case 'active': return approvedDrivers;
      case 'rejected': return rejectedDrivers;
    }
  };

  const listToDisplay = getList();

  return (
    <div className="flex h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
        </button>
        <h1 className="text-lg font-black leading-tight tracking-tight text-center uppercase">Fleet Control</h1>
        <div className="size-10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary filled">admin_panel_settings</span>
        </div>
      </header>

      <div className="px-6 pt-6">
        <div className="flex bg-slate-100 dark:bg-input-dark p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 ${activeTab === 'pending' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'}`}
          >
            Pending {pendingDrivers.length > 0 && <span className="bg-primary text-white text-[8px] px-1.5 py-0.5 rounded-full">{pendingDrivers.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'active' ? 'bg-white dark:bg-slate-700 shadow-sm text-green-500' : 'text-slate-500'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setActiveTab('rejected')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'rejected' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-500' : 'text-slate-500'}`}
          >
            Rejected
          </button>
        </div>
      </div>

      <main className="flex-1 flex flex-col p-6 w-full overflow-y-auto no-scrollbar gap-4">
        {listToDisplay.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
            <span className="material-symbols-outlined text-6xl mb-4">person_off</span>
            <p className="font-bold">No drivers found here</p>
          </div>
        ) : (
          listToDisplay.map(user => (
            <div 
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex items-center gap-4 cursor-pointer hover:border-primary transition-all active:scale-[0.98] shadow-sm"
            >
              <div className="relative">
                <img src={user.avatar} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700" alt={user.name} />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-surface-dark ${user.approvalStatus === 'APPROVED' ? 'bg-green-500' : user.approvalStatus === 'REJECTED' ? 'bg-red-500' : 'bg-orange-500 animate-pulse'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-slate-900 dark:text-white truncate">{user.name}</h3>
                <p className="text-slate-500 text-xs truncate font-medium">{user.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                   <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                     user.approvalStatus === 'APPROVED' ? 'bg-green-500/10 text-green-500' :
                     user.approvalStatus === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                     'bg-orange-500/10 text-orange-500'
                   }`}>
                     {user.approvalStatus}
                   </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </div>
          ))
        )}
      </main>

      {/* Driver Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="p-8 flex flex-col gap-6 overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black">Driver Dossier</h3>
                <button onClick={() => setSelectedUser(null)} className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-90">
                   <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <div className="flex items-center gap-5 p-2">
                <img src={selectedUser.avatar} className="w-20 h-20 rounded-3xl object-cover ring-4 ring-primary/20" alt="" />
                <div>
                   <h4 className="text-2xl font-black">{selectedUser.name}</h4>
                   <p className="text-slate-500 font-bold">{selectedUser.phone}</p>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-500 uppercase">ID: {selectedUser.id.slice(0, 6)}</span>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verifiable Documents</p>
                    <span className="text-[10px] text-green-500 font-black uppercase flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">verified</span> Encrypted</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Front License</span>
                      <div className="relative group cursor-zoom-in">
                        <img src={selectedUser.licenseImage || IMAGES.MAP_BG} className="w-full h-32 object-cover rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md group-hover:brightness-75 transition-all" alt="License" />
                        <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined">zoom_in</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Profile Selfie</span>
                      <div className="relative group cursor-zoom-in">
                        <img src={selectedUser.selfieImage || IMAGES.USER_AVATAR} className="w-full h-32 object-cover rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md group-hover:brightness-75 transition-all" alt="Selfie" />
                        <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined">zoom_in</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                   <div className="bg-primary/20 p-2 rounded-xl">
                      <span className="material-symbols-outlined text-primary">security</span>
                   </div>
                   <div>
                      <p className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white mb-1">Background Verification</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">System scan suggests no anomalies. Manual verification of driving records is recommended before final approval.</p>
                   </div>
                </div>
              </div>

              <div className="flex gap-4 mt-4 pb-4">
                {selectedUser.approvalStatus !== 'REJECTED' && (
                  <button 
                    onClick={() => {
                      onUpdateStatus(selectedUser.id, 'REJECTED');
                      setSelectedUser(null);
                    }}
                    className="flex-1 py-4 rounded-2xl bg-red-500/10 text-red-500 font-black hover:bg-red-500 hover:text-white transition-all active:scale-[0.98]"
                  >
                    Reject Access
                  </button>
                )}
                {selectedUser.approvalStatus !== 'APPROVED' && (
                  <button 
                    onClick={() => {
                      onUpdateStatus(selectedUser.id, 'APPROVED');
                      setSelectedUser(null);
                    }}
                    className="flex-1 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/25 hover:brightness-110 transition-all active:scale-[0.98]"
                  >
                    {selectedUser.approvalStatus === 'REJECTED' ? 'Re-Approve' : 'Approve Driver'}
                  </button>
                )}
                {selectedUser.approvalStatus === 'APPROVED' && (
                   <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-500/10 text-green-500 font-black border border-green-500/20">
                         <span className="material-symbols-outlined">verified</span>
                         Active Member
                      </div>
                      <button 
                        onClick={() => {
                          onUpdateStatus(selectedUser.id, 'REJECTED');
                          setSelectedUser(null);
                        }}
                        className="text-[10px] text-red-500 font-bold uppercase hover:underline"
                      >
                        Revoke Access
                      </button>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardScreen;
