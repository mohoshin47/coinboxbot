import { MessageCircle, RefreshCw } from 'lucide-react';
import { useGlobalConfig } from '../contexts/GlobalConfigContext';
import { useUser } from '../contexts/UserContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  showRefresh?: boolean;
  loading?: boolean;
}
export default function Header({ onRefresh, showRefresh = false }: HeaderProps) {
  const { config } = useGlobalConfig();
  const { user } = useUser();

  const handleContactClick = () => {
    const url = config?.supportchannel || config?.contractus;
    if (url) {
      window.open(url, '_blank');
    }
  };

  const profileImage = user?.user?.photoUrl || 'astronaut.png';

  return (
    <div className="fixed top-0 left-1/2 z-50 h-16 w-full max-w-[720px] -translate-x-1/2 border-b border-white/5 bg-[#081425]/95 backdrop-blur-md">
      
      <div className="flex h-16 items-center justify-between gap-3 px-3">
        {/* User Profile Section */}
        <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-slate-800 shadow-lg">
            <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-bold text-white tracking-tight">
              {user?.user?.fullname || 'Guest User'}
            </span>
            <div className="mt-0.5 flex w-fit items-center gap-1 rounded-full border border-cyan-500/10 bg-cyan-500/5 px-2 py-0.5">
              <span className="text-[12px] font-black text-cyan-400">
                {user?.balance || 0}
              </span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Pts</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showRefresh && (
            <button
              onClick={onRefresh}
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/5 transition-all duration-200 hover:bg-white/10 active:scale-95 shadow-sm"
            >
              <RefreshCw className="w-5 h-5 text-white transition-transform duration-500 group-active:rotate-180 group-hover:rotate-45" />
            </button>
          )}

          {/* Telegram Chat */}
          <button
            onClick={handleContactClick}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/5 transition-all duration-200 hover:bg-white/10 active:scale-95 shadow-sm"
            aria-label="Telegram chat"
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

