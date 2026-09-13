import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import Earn from './pages/Earn';
import Referral from './pages/Referral';
import Withdraw from './pages/Withdraw';
import Profile from './pages/Profile';
import { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('earn');


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

  return (
    <div className="bg-[#050B17] min-h-screen text-white">
      <Toaster position="top-center" />
      {renderPage()}

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
