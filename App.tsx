
import React, { useState, useEffect } from 'react';
import { AppScreen, UserRole, UserProfile, ApprovalStatus, Trip, Payout, SystemSettings } from './types';
import WelcomeScreen from './screens/WelcomeScreen';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import RequestRideScreen from './screens/RequestRideScreen';
import DriverMainScreen from './screens/DriverMainScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import { IMAGES } from './constants';
import { CapacitorService } from './services/CapacitorService';

const MOCK_USERS: UserProfile[] = [
  {
    id: '1',
    name: "Alex Morgan",
    email: "alex.morgan@email.com",
    phone: "+1 (555) 019-2834",
    role: UserRole.OWNER,
    rating: 4.9,
    trips: 240,
    avatar: IMAGES.USER_AVATAR,
    carType: "Mercedes S-Class",
    walletBalance: 0,
    gender: "Male",
    nationality: "American",
    age: "34",
    isBlocked: false
  },
  {
    id: '2',
    name: "John Driver",
    email: "john@bicadriver.com",
    phone: "+234 801 234 5678",
    role: UserRole.DRIVER,
    rating: 4.8,
    trips: 156,
    avatar: IMAGES.DRIVER_CARD,
    approvalStatus: 'APPROVED',
    backgroundCheckAccepted: true,
    walletBalance: 45250,
    transmission: 'Both',
    age: "28",
    nin: "12345678901",
    isBlocked: false
  }
];

const INITIAL_TRIPS: Trip[] = [
  { id: 't_101', driverName: 'John Driver', ownerName: 'Sarah Johnson', date: '2023-10-24 14:30', amount: 12500, status: 'COMPLETED', location: 'Lekki -> Ikeja' },
  { id: 't_102', driverName: 'Mike Peterson', ownerName: 'Alex Morgan', date: '2023-10-24 16:15', amount: 8000, status: 'CANCELLED', location: 'VI -> Ikoyi' },
  { id: 't_103', driverName: 'John Driver', ownerName: 'David Okon', date: '2023-10-25 09:00', amount: 25000, status: 'COMPLETED', location: 'Airport -> Eko Hotel' },
];

const INITIAL_PAYOUTS: Payout[] = [
  { id: 'p_01', driverId: '2', driverName: 'John Driver', amount: 45000, status: 'PENDING', date: '2023-10-25' },
];

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.WELCOME);
  const [selectedSignupRole, setSelectedSignupRole] = useState<UserRole>(UserRole.UNSET);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(MOCK_USERS);
  
  // Global State for Real-time features
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [payouts, setPayouts] = useState<Payout[]>(INITIAL_PAYOUTS);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    baseFare: 1500,
    pricePerKm: 250,
    commission: 15,
    autoApprove: false
  });

  useEffect(() => {
    CapacitorService.initStatusBar();
  }, []);

  const navigateTo = (screen: AppScreen) => {
    CapacitorService.triggerHaptic();
    setCurrentScreen(screen);
  };

  const handleStart = () => navigateTo(AppScreen.ROLE_SELECTION);
  
  const handleRoleSelect = (role: UserRole) => {
    setSelectedSignupRole(role);
    navigateTo(AppScreen.SIGN_UP);
  };

  const handleSignUpComplete = (userData: Partial<UserProfile>) => {
    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      role: selectedSignupRole,
      rating: 5.0,
      trips: 0,
      avatar: userData.avatar || (selectedSignupRole === UserRole.DRIVER ? IMAGES.DRIVER_CARD : IMAGES.USER_AVATAR),
      carType: userData.carType,
      licenseImage: userData.licenseImage,
      selfieImage: userData.selfieImage,
      backgroundCheckAccepted: userData.backgroundCheckAccepted,
      approvalStatus: systemSettings.autoApprove ? 'APPROVED' : (selectedSignupRole === UserRole.DRIVER ? 'PENDING' : 'APPROVED'),
      walletBalance: 0,
      gender: userData.gender,
      address: userData.address,
      nationality: userData.nationality,
      age: userData.age,
      nin: userData.nin,
      ninImage: userData.ninImage,
      transmission: userData.transmission,
      isBlocked: false
    };

    setAllUsers([...allUsers, newUser]);
    setCurrentUser(newUser);
    
    if (newUser.role === UserRole.DRIVER) {
      navigateTo(AppScreen.DRIVER_DASHBOARD);
    } else {
      navigateTo(AppScreen.MAIN_REQUEST);
    }
  };

  const handleLogin = (email?: string, password?: string) => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    if (email.toLowerCase() === 'admin@bicadrive.app' && password === 'admin') {
      navigateTo(AppScreen.ADMIN_DASHBOARD);
      return;
    }

    const user = allUsers.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      if (user.isBlocked) {
         alert("Account Suspended: Please contact support.");
         return;
      }

      if (user.role === UserRole.DRIVER) {
        if (user.approvalStatus === 'REJECTED') {
          alert("Login Denied: Your driver application was rejected. Please contact support.");
          return;
        }
        setCurrentUser(user);
        navigateTo(AppScreen.DRIVER_DASHBOARD);
      } else {
        setCurrentUser(user);
        navigateTo(AppScreen.MAIN_REQUEST);
      }
    } else {
      alert("Invalid credentials. Please try again.");
    }
  };

  // ADMIN ACTIONS
  const handleUpdateDriverStatus = (userId: string, status: ApprovalStatus) => {
    setAllUsers(prevUsers => prevUsers.map(u => 
      u.id === userId ? { ...u, approvalStatus: status } : u
    ));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, approvalStatus: status } : null);
    }
  };

  const handleBlockUser = (userId: string, blocked: boolean) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: blocked } : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, isBlocked: blocked } : null);
    }
  };

  const handleApprovePayout = (payoutId: string) => {
    setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: 'PAID' } : p));
  };

  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setSystemSettings(newSettings);
  };

  // USER ACTIONS
  const handleUpdateEarnings = (amount: number) => {
    if (!currentUser) return;
    const newBalance = (currentUser.walletBalance || 0) + amount;
    
    // Update local currentUser
    setCurrentUser(prev => prev ? { ...prev, walletBalance: newBalance } : null);
    // Update in global users list
    setAllUsers(prevUsers => prevUsers.map(u => 
      u.id === currentUser.id ? { ...u, walletBalance: newBalance } : u
    ));
  };

  const handleAddTrip = (trip: Trip) => {
    setTrips(prev => [trip, ...prev]);
  };

  const handleRequestPayout = (amount: number) => {
    if (!currentUser) return;
    const newPayout: Payout = {
      id: `p_${Math.random().toString(36).substr(2, 5)}`,
      driverId: currentUser.id,
      driverName: currentUser.name,
      amount: amount,
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0]
    };
    setPayouts(prev => [newPayout, ...prev]);
    // Optionally deduct from wallet immediately or wait for approval
    // For visual clarity, we'll reset wallet here to show it's "moved" to payout
    const newBalance = (currentUser.walletBalance || 0) - amount;
    setCurrentUser(prev => prev ? { ...prev, walletBalance: newBalance } : null);
    setAllUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? { ...u, walletBalance: newBalance } : u));
  };

  const handleSimulate = (role: UserRole) => {
    const adminUser: UserProfile = {
      id: 'admin_preview',
      name: 'Admin Preview',
      email: 'admin@bicadrive.app',
      phone: '+000 000 0000',
      role: role,
      rating: 5.0,
      trips: 0,
      avatar: role === UserRole.DRIVER ? IMAGES.DRIVER_CARD : IMAGES.USER_AVATAR,
      approvalStatus: 'APPROVED',
      backgroundCheckAccepted: true,
      walletBalance: 500000,
      carType: 'Admin Vehicle',
      gender: 'N/A',
      address: 'Admin HQ',
      nationality: 'Global',
      age: '99',
      transmission: 'Automatic',
      isBlocked: false
    };
    
    setCurrentUser(adminUser);
    if (role === UserRole.DRIVER) {
      navigateTo(AppScreen.DRIVER_DASHBOARD);
    } else {
      navigateTo(AppScreen.MAIN_REQUEST);
    }
  };

  const handleLogout = () => {
    if (currentUser?.id === 'admin_preview') {
      setCurrentUser(null);
      navigateTo(AppScreen.ADMIN_DASHBOARD);
      return;
    }
    setCurrentUser(null);
    navigateTo(AppScreen.WELCOME);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.WELCOME:
        return <WelcomeScreen onCreateAccount={handleStart} onLogin={() => navigateTo(AppScreen.LOGIN)} />;
      case AppScreen.ROLE_SELECTION:
        return <RoleSelectionScreen onSelectRole={handleRoleSelect} onBack={() => navigateTo(AppScreen.WELCOME)} onGoToLogin={() => navigateTo(AppScreen.LOGIN)} />;
      case AppScreen.SIGN_UP:
        return <SignUpScreen role={selectedSignupRole} onSignUp={handleSignUpComplete} onBack={() => navigateTo(AppScreen.ROLE_SELECTION)} onGoToLogin={() => navigateTo(AppScreen.LOGIN)} />;
      case AppScreen.LOGIN:
        return <LoginScreen onLogin={handleLogin} onBack={() => navigateTo(AppScreen.WELCOME)} onGoToSignUp={handleStart} />;
      case AppScreen.MAIN_REQUEST:
        return <RequestRideScreen 
          settings={systemSettings} 
          onOpenProfile={() => navigateTo(AppScreen.PROFILE)} 
          onBack={handleLogout} 
          onRideComplete={handleAddTrip}
          currentUser={currentUser}
        />;
      case AppScreen.DRIVER_DASHBOARD:
        return <DriverMainScreen 
          user={currentUser} 
          onOpenProfile={() => navigateTo(AppScreen.PROFILE)} 
          onBack={handleLogout} 
          onUpdateEarnings={handleUpdateEarnings}
          onRequestPayout={handleRequestPayout}
          onRideComplete={handleAddTrip}
        />;
      case AppScreen.PROFILE:
        if (!currentUser) return <WelcomeScreen onCreateAccount={handleStart} onLogin={() => navigateTo(AppScreen.LOGIN)} />;
        return (
          <ProfileScreen 
            user={currentUser} 
            initialRole={currentUser.role} 
            onBack={() => currentUser.role === UserRole.DRIVER ? navigateTo(AppScreen.DRIVER_DASHBOARD) : navigateTo(AppScreen.MAIN_REQUEST)} 
            onLogout={handleLogout} 
            onUpdateAvatar={(a) => {
              setCurrentUser({...currentUser, avatar: a});
              setAllUsers(users => users.map(u => u.id === currentUser.id ? {...u, avatar: a} : u));
            }} 
          />
        );
      case AppScreen.ADMIN_DASHBOARD:
        return (
          <AdminDashboardScreen 
            users={allUsers} 
            trips={trips}
            payouts={payouts}
            settings={systemSettings}
            onUpdateStatus={handleUpdateDriverStatus} 
            onBlockUser={handleBlockUser}
            onApprovePayout={handleApprovePayout}
            onUpdateSettings={handleUpdateSettings}
            onBack={() => navigateTo(AppScreen.WELCOME)} 
            onSimulate={handleSimulate} 
          />
        );
      default:
        return <WelcomeScreen onCreateAccount={handleStart} onLogin={() => navigateTo(AppScreen.LOGIN)} />;
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-slate-950">
      <div className="w-full max-w-md min-h-screen bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden relative">
        <div key={currentScreen} className="h-full w-full screen-transition overflow-hidden">
          {renderScreen()}
        </div>
      </div>
    </div>
  );
};

export default App;
