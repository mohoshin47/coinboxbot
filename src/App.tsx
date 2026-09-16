import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import Earn from './pages/Earn';
import Referral from './pages/Referral';
import Withdraw from './pages/Withdraw';
import Profile from './pages/Profile';
import { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('earn');
  const [isAndroid, setIsAndroid] = useState<boolean | null>(null);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const androidCheck = userAgent.includes('android');
    setIsAndroid(androidCheck);
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case 'earn':
        return <Earn />;
      case 'referral':
        return <Referral />;
      case 'withdraw':
        return <Withdraw />;
      case 'profile':
        return <Profile />;
      default:
        return <Earn />;
    }
  };

  // Prevent flicker while checking
  if (isAndroid === null) {
    return <div className="min-h-screen bg-[#050B17]" />;
  }

  return (
    <div className="bg-[#050B17] min-h-screen text-white">
      <Toaster position="top-center" />

      {!isAndroid ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-[#151a26] p-6 text-center shadow-2xl">
            <h2 className="mb-4 text-lg font-bold text-white">Access Restricted</h2>
            <p className="mb-8 text-sm leading-relaxed text-gray-300">
              This app is only accessible from Android devices. Please open it on an Android phone to continue.
            </p>
            <button
              onClick={() => {
                if ((window as any).Telegram?.WebApp) {
                  (window as any).Telegram.WebApp.close();
                } else {
                  window.close();
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-sm text-white transition-colors active:scale-95"
            >
              Close App
            </button>
          </div>
        </div>
      ) : (
        <>
          {renderPage()}
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
      )}
    </div>
  );
}
