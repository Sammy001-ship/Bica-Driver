
import React from 'react';
import { IMAGES } from '../constants';

interface WelcomeScreenProps {
  onCreateAccount: () => void;
  onLogin: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateAccount, onLogin }) => {
  return (
    <div className="relative h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] rounded-full bg-primary/10 blur-[100px] pointer-events-none"></div>
      
      <div className="h-12 w-full"></div>
      
      <div className="flex items-center justify-center px-6 py-2 z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
            <span className="material-symbols-outlined text-xl">directions_car</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Bicadriver</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto no-scrollbar pb-10">
        <div className="w-full relative aspect-[4/3] mb-8 mt-4">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background-light dark:to-background-dark z-10"></div>
          <div 
            className="w-full h-full bg-center bg-cover rounded-2xl shadow-lg ring-1 ring-white/10"
            style={{ backgroundImage: `url('${IMAGES.WELCOME_HERO}')` }}
          />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-white/10 dark:bg-gray-800/80 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl border border-white/10 w-[85%]">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 text-green-500">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">Verified Drivers</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center text-center mt-4">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-[1.15] mb-4">
            Your Car, <br/>
            <span className="text-primary">Our Driver.</span>
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-[280px] leading-relaxed">
            Connect with reliable drivers instantly. Bicadriver ensures a safe journey for you and your vehicle.
          </p>
        </div>

        <div className="flex gap-2 mt-8 mb-4">
          <div className="w-6 h-1.5 rounded-full bg-primary"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>

      <div className="w-full p-6 pb-12 flex flex-col gap-3 z-20">
        <button 
          onClick={onCreateAccount}
          className="flex w-full items-center justify-center rounded-xl h-14 px-5 bg-primary hover:bg-primary/90 transition-all text-white text-[17px] font-bold shadow-lg shadow-primary/25 active:scale-[0.98]"
        >
          Create Account
        </button>
        <button 
          onClick={onLogin}
          className="flex w-full items-center justify-center rounded-xl h-14 px-5 bg-transparent border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-900 dark:text-white text-[17px] font-bold active:scale-[0.98]"
        >
          Log In
        </button>
        <p className="text-xs text-center text-gray-500 mt-2">
          By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span>.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
