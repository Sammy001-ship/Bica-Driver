
import React, { useState, useMemo } from 'react';
import { UserProfile, UserRole, ApprovalStatus } from '../types';
import { IMAGES } from '../constants';

interface AdminDashboardScreenProps {
  users: UserProfile[];
  onUpdateStatus: (userId: string, status: ApprovalStatus) => void;
  onBack: () => void;
}

type AdminSection = 'overview' | 'drivers' | 'owners' | 'trips' | 'finance' | 'settings';

// Mock Data for Admin Features
const MOCK_TRIPS = [
  { id: 't_101', driver: 'John Driver', owner: 'Sarah Johnson', date: '2023-10-24 14:30', amount: 12500, status: 'COMPLETED', location: 'Lekki -> Ikeja' },
  { id: 't_102', driver: 'Mike Peterson', owner: 'Alex Morgan', date: '2023-10-24 16:15', amount: 8000, status: 'CANCELLED', location: 'VI -> Ikoyi' },
  { id: 't_103', driver: 'John Driver', owner: 'David Okon', date: '2023-10-25 09:00', amount: 25000, status: 'COMPLETED', location: 'Airport -> Eko Hotel' },
  { id: 't_104', driver: 'Unassigned', owner: 'Lisa Ray', date: '2023-10-25 10:30', amount: 0, status: 'PENDING', location: 'Surulere -> Yaba' },
];

const MOCK_PAYOUTS = [
  { id: 'p_01', driverId: '2', amount: 45000, status: 'PENDING', date: '2023-10-25' },
  { id: 'p_02', driverId: 'd_55', amount: 12500, status: 'PAID', date: '2023-10-23' },
];

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ users, onUpdateStatus, onBack }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Settings State
  const [settings, setSettings] = useState({
    baseFare: 1500,
    pricePerKm: 250,
    commission: 15,
    autoApprove: false
  });

  // Derived Data
  const drivers = users.filter(u => u.role === UserRole.DRIVER);
  const owners = users.filter(u => u.role === UserRole.OWNER);
  const pendingDrivers = drivers.filter(u => u.approvalStatus === 'PENDING');
  
  const totalRevenue = MOCK_TRIPS.reduce((acc, t) => t.status === 'COMPLETED' ? acc + t.amount : acc, 0);
  const platformFees = totalRevenue * (settings.commission / 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount).replace('NGN', '₦');
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-green-500/10 rounded-lg text-green-500 material-symbols-outlined">payments</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(platformFees)}</p>
          <p className="text-xs text-green-500 font-bold mt-1">+12% this week</p>
        </div>
        <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-primary/10 rounded-lg text-primary material-symbols-outlined">directions_car</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Trips</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{MOCK_TRIPS.filter(t => t.status === 'COMPLETED').length}</p>
          <p className="text-xs text-slate-400 font-bold mt-1">Total volume</p>
        </div>
      </div>

      <div className="bg-primary text-white p-6 rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div>
             <p className="text-sm font-medium opacity-80 mb-1">Pending Verifications</p>
             <h3 className="text-4xl font-black">{pendingDrivers.length}</h3>
          </div>
          <button 
            onClick={() => setActiveSection('drivers')}
            className="bg-white text-primary px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-slate-100 transition-colors"
          >
            Review Now
          </button>
        </div>
        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10">badge</span>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {MOCK_TRIPS.slice(0, 3).map(trip => (
            <div key={trip.id} className="flex items-center justify-between py-2 border-b border-dashed border-slate-200 dark:border-slate-700 last:border-0">
              <div className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${trip.status === 'COMPLETED' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                 <div>
                    <p className="text-sm font-bold">{trip.location}</p>
                    <p className="text-xs text-slate-500">{trip.date.split(' ')[1]}</p>
                 </div>
              </div>
              <span className="text-sm font-mono font-medium">{formatCurrency(trip.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDrivers = () => (
    <div className="space-y-4 animate-slide-up">
      <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar pb-2">
         {['All', 'Pending', 'Active', 'Rejected'].map((filter) => (
           <button key={filter} className="px-4 py-2 bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold uppercase whitespace-nowrap hover:border-primary transition-colors">
             {filter}
           </button>
         ))}
      </div>
      {drivers.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).map(driver => (
        <div 
          key={driver.id}
          onClick={() => setSelectedUser(driver)}
          className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="relative">
            <img src={driver.avatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-surface-dark ${driver.approvalStatus === 'APPROVED' ? 'bg-green-500' : driver.approvalStatus === 'PENDING' ? 'bg-orange-500 animate-pulse' : 'bg-red-500'}`}></div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm truncate">{driver.name}</h4>
            <p className="text-xs text-slate-500 truncate">{driver.email}</p>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">{driver.carType || 'No Car'}</span>
               {driver.approvalStatus === 'PENDING' && <span className="text-[10px] text-orange-500 font-bold uppercase">Review Needed</span>}
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-300">chevron_right</span>
        </div>
      ))}
    </div>
  );

  const renderOwners = () => (
    <div className="space-y-4 animate-slide-up">
      {owners.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase())).map(owner => (
        <div key={owner.id} className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <img src={owner.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">{owner.name}</h4>
            <p className="text-xs text-slate-500">{owner.phone}</p>
            <div className="flex items-center gap-1 mt-1">
               <span className="material-symbols-outlined text-yellow-500 text-[14px] filled">star</span>
               <span className="text-xs font-bold">{owner.rating}</span>
               <span className="text-xs text-slate-500">• {owner.trips} trips</span>
            </div>
          </div>
          <button className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">block</span>
          </button>
        </div>
      ))}
    </div>
  );

  const renderTrips = () => (
    <div className="space-y-4 animate-slide-up">
       {MOCK_TRIPS.map(trip => (
         <div key={trip.id} className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            <div className="flex justify-between items-start">
               <div>
                  <h4 className="font-bold text-sm">{trip.location}</h4>
                  <p className="text-xs text-slate-500">{trip.date}</p>
               </div>
               <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                 trip.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 
                 trip.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
               }`}>{trip.status}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
               <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                     <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-surface-dark"></div>
                     <div className="w-6 h-6 rounded-full bg-slate-500 border-2 border-surface-dark"></div>
                  </div>
                  <span className="text-xs text-slate-500">{trip.owner} & {trip.driver}</span>
               </div>
               <p className="font-black text-sm">{formatCurrency(trip.amount)}</p>
            </div>
         </div>
       ))}
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-6 animate-slide-up">
       <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-800 to-black text-white shadow-lg">
          <p className="text-xs font-medium opacity-70 uppercase tracking-widest mb-1">Total Platform Balance</p>
          <h2 className="text-3xl font-black">{formatCurrency(platformFees * 124)}</h2>
       </div>

       <div>
          <h3 className="font-bold text-sm mb-3 uppercase tracking-wider text-slate-500">Payout Requests</h3>
          <div className="space-y-3">
             {MOCK_PAYOUTS.map(payout => (
               <div key={payout.id} className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                     <p className="font-bold text-sm">Driver #{payout.driverId}</p>
                     <p className="text-xs text-slate-500">{payout.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="font-black">{formatCurrency(payout.amount)}</span>
                     {payout.status === 'PENDING' ? (
                       <button className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition-colors">
                         Approve
                       </button>
                     ) : (
                       <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                         <span className="material-symbols-outlined text-sm">check</span> Paid
                       </span>
                     )}
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-slide-up">
       <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold border-b border-slate-100 dark:border-slate-700 pb-2">Pricing Configuration</h3>
          
          <div className="flex flex-col gap-2">
             <label className="text-xs font-bold text-slate-500 uppercase">Base Fare (₦)</label>
             <input 
               type="number" 
               value={settings.baseFare}
               onChange={(e) => setSettings({...settings, baseFare: Number(e.target.value)})}
               className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white"
             />
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-xs font-bold text-slate-500 uppercase">Price Per KM (₦)</label>
             <input 
               type="number" 
               value={settings.pricePerKm}
               onChange={(e) => setSettings({...settings, pricePerKm: Number(e.target.value)})}
               className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white"
             />
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-xs font-bold text-slate-500 uppercase">Platform Commission (%)</label>
             <input 
               type="number" 
               value={settings.commission}
               onChange={(e) => setSettings({...settings, commission: Number(e.target.value)})}
               className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white"
             />
          </div>
       </div>

       <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
             <h4 className="font-bold text-sm">Auto-Approve Drivers</h4>
             <p className="text-xs text-slate-500">Skip manual verification (Not Recommended)</p>
          </div>
          <button 
            onClick={() => setSettings({...settings, autoApprove: !settings.autoApprove})}
            className={`w-12 h-7 rounded-full transition-colors relative ${settings.autoApprove ? 'bg-green-500' : 'bg-slate-600'}`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.autoApprove ? 'left-6' : 'left-1'}`}></div>
          </button>
       </div>

       <button className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20">
          Save System Changes
       </button>
    </div>
  );

  return (
    <div className="flex h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden">
      {/* Header */}
      <header className="px-4 py-3 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 shrink-0 z-20">
        <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h1 className="font-black text-lg uppercase tracking-tight">Admin Console</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bicadriver v1.0.4</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined filled">admin_panel_settings</span>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="px-4 py-3 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark shrink-0">
        <div className="flex gap-4 min-w-max">
          {[
            { id: 'overview', icon: 'dashboard', label: 'Overview' },
            { id: 'drivers', icon: 'badge', label: 'Drivers' },
            { id: 'owners', icon: 'groups', label: 'Owners' },
            { id: 'trips', icon: 'route', label: 'Trips' },
            { id: 'finance', icon: 'account_balance', label: 'Finance' },
            { id: 'settings', icon: 'settings', label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as AdminSection)}
              className={`flex flex-col items-center gap-1 min-w-[60px] p-2 rounded-xl transition-all ${
                activeSection === item.id 
                  ? 'text-primary bg-primary/5' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <span className={`material-symbols-outlined ${activeSection === item.id ? 'filled' : ''}`}>{item.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 relative">
        {/* Global Search (visible on lists) */}
        {(activeSection === 'drivers' || activeSection === 'owners') && (
           <div className="mb-6 sticky top-0 z-10">
              <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center px-4 h-12 shadow-sm">
                 <span className="material-symbols-outlined text-slate-400 mr-2">search</span>
                 <input 
                   type="text" 
                   placeholder={`Search ${activeSection}...`}
                   className="bg-transparent border-none w-full text-sm font-medium focus:ring-0 p-0 text-slate-900 dark:text-white placeholder-slate-400"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>
        )}

        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'drivers' && renderDrivers()}
        {activeSection === 'owners' && renderOwners()}
        {activeSection === 'trips' && renderTrips()}
        {activeSection === 'finance' && renderFinance()}
        {activeSection === 'settings' && renderSettings()}
      </main>

      {/* Driver Detail Modal (Enhanced) */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
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
                   <h4 className="text-2xl font-black leading-tight">{selectedUser.name}</h4>
                   <p className="text-slate-500 font-bold">{selectedUser.phone}</p>
                   <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-500 uppercase">ID: {selectedUser.id.slice(0, 6)}</span>
                      {selectedUser.approvalStatus === 'PENDING' && <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-[10px] font-bold uppercase">Pending Review</span>}
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-xl">
                      <p className="text-[10px] uppercase text-slate-500 font-bold">NIN Number</p>
                      <p className="font-mono font-bold text-sm truncate">{selectedUser.nin || 'Not Provided'}</p>
                   </div>
                   <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-xl">
                      <p className="text-[10px] uppercase text-slate-500 font-bold">Age</p>
                      <p className="font-bold text-sm">{selectedUser.age || 'N/A'} Years</p>
                   </div>
                   <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-xl col-span-2">
                      <p className="text-[10px] uppercase text-slate-500 font-bold">Home Address</p>
                      <p className="font-bold text-sm">{selectedUser.address || 'Not Provided'}</p>
                   </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verifiable Documents</p>
                    <span className="text-[10px] text-green-500 font-black uppercase flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">verified</span> Encrypted</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Front License</span>
                      <div className="relative group cursor-zoom-in">
                        <img src={selectedUser.licenseImage || IMAGES.MAP_BG} className="w-full h-24 object-cover rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md group-hover:brightness-75 transition-all" alt="License" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase">NIN Card</span>
                      <div className="relative group cursor-zoom-in">
                        <img src={selectedUser.ninImage || IMAGES.MAP_BG} className="w-full h-24 object-cover rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md group-hover:brightness-75 transition-all" alt="NIN" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                   <div className="bg-primary/20 p-1.5 rounded-lg shrink-0">
                      <span className="material-symbols-outlined text-primary text-lg">security</span>
                   </div>
                   <div>
                      <p className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white mb-1">Background Check Consent</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {selectedUser.backgroundCheckAccepted ? 'User has digitally signed consent for criminal record verification.' : 'Consent MISSING.'}
                      </p>
                   </div>
                </div>
              </div>

              <div className="flex gap-4 mt-2 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                {selectedUser.approvalStatus !== 'REJECTED' && (
                  <button 
                    onClick={() => {
                      onUpdateStatus(selectedUser.id, 'REJECTED');
                      setSelectedUser(null);
                    }}
                    className="flex-1 py-4 rounded-2xl bg-red-500/10 text-red-500 font-black hover:bg-red-500 hover:text-white transition-all active:scale-[0.98]"
                  >
                    Reject
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
                    Approve Driver
                  </button>
                )}
                 {selectedUser.approvalStatus === 'APPROVED' && (
                   <div className="flex-1 flex flex-col items-center justify-center">
                      <span className="text-green-500 font-bold text-sm uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">check_circle</span> Approved
                      </span>
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
