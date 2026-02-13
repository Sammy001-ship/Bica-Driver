
import React, { useState, useEffect } from 'react';
import { AppScreen, UserRole, UserProfile, ApprovalStatus } from './types';
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
    age: "34"
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
    nin: "12345678901"
  }
];

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.WELCOME);
  const [selectedSignupRole, setSelectedSignupRole] = useState<UserRole>(UserRole.UNSET);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(MOCK_USERS);

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
      rating: 0,
      trips: 0,
      avatar: userData.avatar || (selectedSignupRole === UserRole.DRIVER ? IMAGES.DRIVER_CARD : IMAGES.USER_AVATAR),
      carType: userData.carType,
      licenseImage: userData.licenseImage,
      selfieImage: userData.selfieImage,
      backgroundCheckAccepted: userData.backgroundCheckAccepted,
      approvalStatus: selectedSignupRole === UserRole.DRIVER ? 'PENDING' : 'APPROVED',
      walletBalance: 0,
      // New Fields
      gender: userData.gender,
      address: userData.address,
      nationality: userData.nationality,
      age: userData.age,
      nin: userData.nin,
      ninImage: userData.ninImage,
      transmission: userData.transmission
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

  const handleUpdateDriverStatus = (userId: string, status: ApprovalStatus) => {
    setAllUsers(prevUsers => prevUsers.map(u => 
      u.id === userId ? { ...u, approvalStatus: status } : u
    ));
    
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, approvalStatus: status } : null);
    }
  };

  const handleUpdateEarnings = (amount: number) => {
    if (!currentUser) return;
    
    const newBalance = (currentUser.walletBalance || 0) + amount;
    
    setCurrentUser(prev => prev ? { ...prev, walletBalance: newBalance } : null);
    setAllUsers(prevUsers => prevUsers.map(u => 
      u.id === currentUser.id ? { ...u, walletBalance: newBalance } : u
    ));
  };

  const handleLogout = () => {
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
        return <RequestRideScreen onOpenProfile={() => navigateTo(AppScreen.PROFILE)} onBack={handleLogout} />;
      case AppScreen.DRIVER_DASHBOARD:
        return <DriverMainScreen user={currentUser} onOpenProfile={() => navigateTo(AppScreen.PROFILE)} onBack={handleLogout} onUpdateEarnings={handleUpdateEarnings} />;
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
        return <AdminDashboardScreen users={allUsers} onUpdateStatus={handleUpdateDriverStatus} onBack={() => navigateTo(AppScreen.WELCOME)} />;
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
