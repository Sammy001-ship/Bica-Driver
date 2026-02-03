
import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { IMAGES } from '../constants';

interface ProfileScreenProps {
  user: UserProfile;
  initialRole: UserRole;
  onBack: () => void;
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, initialRole, onBack, onLogout }) => {
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);

  const handleFeatureAlert = (feature: string) => {
    alert(`${feature} is not available in the demo.`);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen pb-10 flex flex-col">
      {/* Top App Bar */}
      <div className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between max-w-md mx-auto">
          <button 
            onClick={onBack}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors active:scale-90"
          >
            <span className="material-symbols-outlined text-slate-900 dark:text-white" style={{ fontSize: '24px' }}>arrow_back</span>
          </button>
          <h2 className="text-lg font-bold leading-tight flex-1 text-center">Profile</h2>
          <button 
            onClick={() => handleFeatureAlert("Profile Editing")}
            className="flex w-10 items-center justify-end active:scale-95"
          >
            <span className="text-primary text-base font-bold">Edit</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 pb-8 overflow-y-auto no-scrollbar">
        {/* Profile Header */}
        <div className="flex flex-col items-center pt-6 px-4">
          <div className="relative">
            <div 
              className="bg-center bg-no-repeat bg-cover rounded-full h-28 w-28 ring-4 ring-surface-light dark:ring-surface-dark shadow-lg" 
              style={{ backgroundImage: `url("${user.avatar}")` }}
            />
            <button 
              onClick={() => handleFeatureAlert("Camera/Photo Upload")}
              className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 shadow-md flex items-center justify-center ring-2 ring-background-light dark:ring-background-dark active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_camera</span>
            </button>
          </div>
          <div className="mt-4 flex flex-col items-center">
            <h1 className="text-2xl font-bold leading-tight">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
                {activeRole === UserRole.DRIVER ? 'Driver' : 'Owner'}
              </span>
              <span className="text-text-secondary text-sm font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-yellow-500 filled" style={{ fontSize: '16px' }}>star</span>
                {user.rating} ({user.trips})
              </span>
            </div>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="px-4">
          <div className="bg-slate-200 dark:bg-surface-dark p-1 rounded-xl flex">
            <button 
              onClick={() => setActiveRole(UserRole.DRIVER)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold text-center transition-all active:scale-[0.98] ${
                activeRole === UserRole.DRIVER ? 'bg-surface-light dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-text-secondary'
              }`}
            >
              Driver Mode
            </button>
            <button 
              onClick={() => setActiveRole(UserRole.OWNER)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold text-center transition-all active:scale-[0.98] ${
                activeRole === UserRole.OWNER ? 'bg-surface-light dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-text-secondary'
              }`}
            >
              Owner Mode
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="flex flex-col gap-4">
          <div className="px-4">
            <h3 className="text-lg font-bold">Personal Information</h3>
          </div>
          <div className="px-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Full Name</label>
              <div className="flex items-center px-4 h-12 rounded-xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800">
                <input className="w-full bg-transparent border-none text-slate-900 dark:text-white focus:ring-0 p-0 text-base" readOnly value={user.name}/>
                <span className="material-symbols-outlined text-green-500" style={{ fontSize: '20px' }}>check_circle</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Email Address</label>
              <div className="flex items-center px-4 h-12 rounded-xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800">
                <input className="w-full bg-transparent border-none text-slate-900 dark:text-white focus:ring-0 p-0 text-base" readOnly value={user.email}/>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Phone Number</label>
              <div className="flex items-center px-4 h-12 rounded-xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800">
                <input className="w-full bg-transparent border-none text-slate-900 dark:text-white focus:ring-0 p-0 text-base" readOnly value={user.phone}/>
                <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Details (Always shown for demo) */}
        <div className="flex flex-col gap-4">
          <div className="px-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Vehicle Details</h3>
            <button 
              onClick={() => handleFeatureAlert("Adding a Vehicle")}
              className="text-primary text-sm font-semibold active:scale-95"
            >
              Add New
            </button>
          </div>
          <div className="px-4">
            <div 
              onClick={() => handleFeatureAlert("Vehicle Management")}
              className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="w-20 h-20 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden">
                <img className="w-full h-full object-cover" src={IMAGES.CAR_IMAGE}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base truncate">Toyota Prius</h4>
                    <p className="text-text-secondary text-sm">Dark Grey • Sedan</p>
                  </div>
                  <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded-full">Active</span>
                </div>
                <div className="mt-3 flex items-center gap-2 bg-background-light dark:bg-background-dark rounded-lg px-2 py-1.5 w-fit">
                  <span className="material-symbols-outlined text-text-secondary" style={{ fontSize: '16px' }}>directions_car</span>
                  <span className="text-sm font-mono font-medium">ABC 1234</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="flex flex-col gap-4">
          <div className="px-4">
            <h3 className="text-lg font-bold">Documents</h3>
          </div>
          <div className="px-4 flex flex-col gap-3">
            <div 
              onClick={() => handleFeatureAlert("Viewing Documents")}
              className="flex items-center justify-between bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg text-primary">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Driving License</p>
                  <p className="text-xs text-text-secondary">Exp: Dec 2025</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-green-500">check_circle</span>
            </div>
            <div 
              onClick={() => handleFeatureAlert("Document Verification")}
              className="flex items-center justify-between bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500">
                  <span className="material-symbols-outlined">security</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Vehicle Insurance</p>
                  <p className="text-xs text-text-secondary">Exp: Mar 2024</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-yellow-500">pending</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex flex-col gap-4">
          <div className="px-4">
            <h3 className="text-lg font-bold">Payment Methods</h3>
          </div>
          <div className="px-4">
            <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 dark:bg-slate-800 h-10 w-14 rounded flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-500">credit_card</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Mastercard</p>
                  <p className="text-xs text-text-secondary">•••• 4829</p>
                </div>
              </div>
              <button 
                onClick={() => handleFeatureAlert("Editing Payment Methods")}
                className="text-text-secondary hover:text-primary transition-colors active:scale-90"
              >
                <span className="material-symbols-outlined">edit</span>
              </button>
            </div>
            <button 
              onClick={() => handleFeatureAlert("Adding Payment Methods")}
              className="mt-3 w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-sm font-medium text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Add Payment Method
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="px-4 pt-4 flex flex-col gap-3">
          <button 
            onClick={() => handleFeatureAlert("System Settings")}
            className="flex items-center justify-between w-full p-4 rounded-xl bg-surface-light dark:bg-surface-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">settings</span>
              <span className="font-medium">Settings</span>
            </div>
            <span className="material-symbols-outlined text-text-secondary" style={{ fontSize: '20px' }}>chevron_right</span>
          </button>
          <button 
            onClick={() => handleFeatureAlert("Help & Support")}
            className="flex items-center justify-between w-full p-4 rounded-xl bg-surface-light dark:bg-surface-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">help</span>
              <span className="font-medium">Help & Support</span>
            </div>
            <span className="material-symbols-outlined text-text-secondary" style={{ fontSize: '20px' }}>chevron_right</span>
          </button>
          <button 
            onClick={onLogout}
            className="mt-4 w-full py-4 rounded-xl bg-red-500/10 text-red-500 font-bold text-base hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
