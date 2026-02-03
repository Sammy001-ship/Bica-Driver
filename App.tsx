
import React, { useState, useEffect } from 'react';
import { AppScreen, UserRole, UserProfile } from './types';
import WelcomeScreen from './screens/WelcomeScreen';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import RequestRideScreen from './screens/RequestRideScreen';
import DriverMainScreen from './screens/DriverMainScreen';
import ProfileScreen from './screens/ProfileScreen';
import { IMAGES } from './constants';

const MOCK_USER: UserProfile = {
  name: "Alex Morgan",
  email: "alex.morgan@email.com",
  phone: "+1 (555) 019-2834",
  rating: 4.9,
  trips: 240,
  avatar: IMAGES.USER_AVATAR
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.WELCOME);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.UNSET);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Transition helper
  const navigateTo = (screen: AppScreen) => {
    setCurrentScreen(screen);
  };

  const handleCreateAccount = () => {
    navigateTo(AppScreen.SIGN_UP);
  };

  const handleGoToLogin = () => {
    navigateTo(AppScreen.LOGIN);
  };

  const handleAuthComplete = () => {
    setIsLoggedIn(true);
    navigateTo(AppScreen.ROLE_SELECTION);
  };

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    if (role === UserRole.DRIVER) {
      navigateTo(AppScreen.DRIVER_DASHBOARD);
    } else {
      navigateTo(AppScreen.MAIN_REQUEST);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(UserRole.UNSET);
    navigateTo(AppScreen.WELCOME);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.WELCOME:
        return <WelcomeScreen onCreateAccount={handleCreateAccount} onLogin={handleGoToLogin} />;
      case AppScreen.SIGN_UP:
        return <SignUpScreen onSignUp={handleAuthComplete} onBack={() => navigateTo(AppScreen.WELCOME)} onGoToLogin={handleGoToLogin} />;
      case AppScreen.LOGIN:
        return <LoginScreen onLogin={handleAuthComplete} onBack={() => navigateTo(AppScreen.WELCOME)} onGoToSignUp={handleCreateAccount} />;
      case AppScreen.ROLE_SELECTION:
        return <RoleSelectionScreen onSelectRole={handleRoleSelect} onBack={() => navigateTo(AppScreen.WELCOME)} onGoToLogin={handleGoToLogin} />;
      case AppScreen.MAIN_REQUEST:
        return (
          <RequestRideScreen 
            onOpenProfile={() => navigateTo(AppScreen.PROFILE)} 
            onBack={() => navigateTo(AppScreen.ROLE_SELECTION)}
          />
        );
      case AppScreen.DRIVER_DASHBOARD:
        return (
          <DriverMainScreen 
            onOpenProfile={() => navigateTo(AppScreen.PROFILE)} 
            onBack={() => navigateTo(AppScreen.ROLE_SELECTION)}
          />
        );
      case AppScreen.PROFILE:
        return (
          <ProfileScreen 
            user={MOCK_USER} 
            initialRole={userRole} 
            onBack={() => {
              if (userRole === UserRole.DRIVER) {
                navigateTo(AppScreen.DRIVER_DASHBOARD);
              } else {
                navigateTo(AppScreen.MAIN_REQUEST);
              }
            }} 
            onLogout={handleLogout}
          />
        );
      default:
        return <WelcomeScreen onCreateAccount={handleCreateAccount} onLogin={handleGoToLogin} />;
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-slate-950">
      <div className="w-full max-w-md min-h-screen bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden relative">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
