import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useUser } from '../contexts/UserContext';
import { useGlobalConfig } from '../contexts/GlobalConfigContext';
import { Megaphone, Play, Clock, Calendar, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { showRewardedPopup, initAdHandler } from '../utils/monetagAds';
import { watchAdComplete, getUserHistory, checkCountry } from '../services/userService';

export default function Earn() {
  const { user, loadUser } = useUser();
  const { config, loading: configLoading } = useGlobalConfig();
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [adLoading, setAdLoading] = useState(false);

  // Country Restriction State
  const [countryBlocked, setCountryBlocked] = useState(false);
  const [countryNotice, setCountryNotice] = useState("");

  // History Pagination States
  const [histories, setHistories] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Timer State
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  // Pre-initialize Ad Handler
  useEffect(() => {
    if (config?.tasksetting?.monetagzoneid) {
      initAdHandler(config.tasksetting.monetagzoneid);
    }
  }, [config?.tasksetting?.monetagzoneid]);

  // Country Check
  useEffect(() => {
    const performCountryCheck = async () => {
      try {
        const res = await checkCountry();
        if (res && !res.allow) {
          setCountryBlocked(true);
          setCountryNotice(res.message || "Access Denied: App not available in your region.");
        }
      } catch (err) {
        console.error("Country check error:", err);
      }
    };

    performCountryCheck();
  }, []);

  const fetchHistory = async (page: number) => {
    if (!user?.telegramId) return;
    setHistoryLoading(true);
    try {
      const res = await getUserHistory(user.telegramId, page, 20);
      if (res?.success) {
        setHistories(res.data || []);
        setCurrentPage(res.pagination?.currentPage || 1);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (user?.telegramId) {
      fetchHistory(currentPage);
    }
  }, [user?.telegramId, currentPage]);

  const handleRefresh = async () => {
    setRefreshLoading(true);
    try {
      await loadUser();
      await fetchHistory(1);
    } finally {
      setRefreshLoading(false);
    }
  };

  // Extract Limits configuration
  const hourlyLimitSetting = config?.tasksetting?.hourlylimit ?? 2;
  const dailyLimitSetting = config?.tasksetting?.dailylimit ?? 5;

  // Extract User Current Counts
  const currentHourlyCount = user?.adStats?.hourlyCount ?? 0;
  const currentDailyCount = user?.adStats?.dailyCount ?? 0;

  // Local helper checks if resets are due client-side before full load
  const isHourlyLimitReached = currentHourlyCount >= hourlyLimitSetting;
  const isDailyLimitReached = currentDailyCount >= dailyLimitSetting;
  const isLimitReached = isHourlyLimitReached || isDailyLimitReached;

  useEffect(() => {
    let timer: any;

    const updateTimer = () => {
      if (!user?.adStats) return;

      const now = new Date().getTime();
      let targetTime = 0;

      if (isDailyLimitReached) {
        const lastReset = new Date(user.adStats.lastDailyResetAt).getTime();
        targetTime = lastReset + 24 * 60 * 60 * 1000;
      } else if (isHourlyLimitReached) {
        const lastReset = new Date(user.adStats.lastHourlyResetAt).getTime();
        targetTime = lastReset + 60 * 60 * 1000;
      }

      if (targetTime > now) {
        const diff = targetTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft(null);
        // If limit was reached but time is up, refresh user data
        if (isLimitReached) {
          handleRefresh();
        }
      }
    };

    if (isLimitReached) {
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    } else {
      setTimeLeft(null);
    }

    return () => clearInterval(timer);
  }, [isLimitReached, user?.adStats, isDailyLimitReached, isHourlyLimitReached]);

  const formatTime = (time: { hours: number; minutes: number; seconds: number } | null) => {
    if (!time) return "";
    const h = time.hours > 0 ? `${time.hours.toString().padStart(2, '0')}:` : "";
    const m = String(time.minutes).padStart(2, '0');
    const s = String(time.seconds).padStart(2, '0');
    return `${h}${m}:${s}`;
  };

  const handleWatchAd = async () => {
    if (isLimitReached || adLoading) return;

    const zoneId = config?.tasksetting?.monetagzoneid || "11722740";
    const telegramId = user?.telegramId;

    if (!telegramId) return;

    setAdLoading(true);
    try {
      // Trigger ad show (fire and forget / async without forcing success)
      showRewardedPopup(zoneId, telegramId.toString());

      // Instantly complete task and update point balance, just like before
      await watchAdComplete(telegramId);
      await loadUser();
      await fetchHistory(1);
    } catch (error) {
      console.error("Ad playback or processing error:", error);
    } finally {
      setAdLoading(false);
    }
  };

  if (configLoading) {
    return <div className="p-4 text-white text-center">Loading Config...</div>;
  }

  return (
    <div className="min-h-[100svh] bg-[#050B17]">
      {/* Country Restriction Popup */}
      {countryBlocked && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-[#151a26] p-6 text-center shadow-2xl">
            <h2 className="mb-4 text-lg font-bold text-white">Access Restricted</h2>

            <p className="mb-8 text-sm leading-relaxed text-gray-300 whitespace-pre-line">
              {config?.countryNotice || countryNotice}
            </p>

            <button
              onClick={() => {
                if (window.Telegram?.WebApp) {
                  window.Telegram.WebApp.close();
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
      )}

      <Header onRefresh={handleRefresh} showRefresh loading={refreshLoading} />

      <div className="px-3 pt-[76px] pb-24 flex flex-col gap-4">
        {config?.notice && (
          <div className="flex items-start gap-3 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 shadow-lg">
            <Megaphone className="h-5 w-5 shrink-0 text-purple-400 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-bold text-purple-300 uppercase tracking-wider">Notice</span>
              <p className="text-[13px] leading-5 text-gray-200">
                {config.notice}
              </p>
            </div>
          </div>
        )}

        {/* Watch & Earn Section */}
        {config?.task_on_off !== false ? (
          <div className="w-full flex flex-col rounded-xl border border-purple-500/20 bg-gradient-to-br from-[#120a2e] to-[#080e1e] p-4 text-white shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                  <Play className="h-6 w-6 fill-current" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-[16px] font-bold text-white">Watch & Earn</h4>
                  <p className="text-[12px] text-gray-400">
                    Reward per ad: <span className="text-purple-400 font-bold">+{config?.tasksetting?.rewardsperads || 1} Points</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Limits Status Display */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2.5 rounded-lg bg-white/5 p-3 border border-white/5">
                <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-400">Hourly Limit</span>
                  <span className="text-[13px] font-bold text-gray-200">
                    {currentHourlyCount} / <span className="text-indigo-400">{hourlyLimitSetting}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg bg-white/5 p-3 border border-white/5">
                <Calendar className="h-4 w-4 text-purple-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-400">Daily Limit</span>
                  <span className="text-[13px] font-bold text-gray-200">
                    {currentDailyCount} / <span className="text-purple-400">{dailyLimitSetting}</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleWatchAd}
              disabled={adLoading || isLimitReached}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-[14px] transition-all bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] disabled:from-gray-800 disabled:to-gray-800 disabled:opacity-50 disabled:border disabled:border-gray-700 text-white shadow-lg shadow-purple-500/20"
            >
              {isDailyLimitReached ? (
                <div className="flex items-center gap-2">
                  <span>Daily Limit Reached</span>
                  {timeLeft && <span className="bg-white/10 px-2 py-0.5 rounded text-purple-300 tabular-nums">{formatTime(timeLeft)}</span>}
                </div>
              ) : isHourlyLimitReached ? (
                <div className="flex items-center gap-2">
                  <span>Hourly Limit Reached</span>
                  {timeLeft && <span className="bg-white/10 px-2 py-0.5 rounded text-indigo-300 tabular-nums">{formatTime(timeLeft)}</span>}
                </div>
              ) : (
                "Watch Video Ad"
              )}
            </button>
          </div>
        ) : (
          <div className="w-full text-center py-6 text-gray-400 bg-white/5 border border-white/5 rounded-xl text-[13px] font-medium">
            Tasks are currently disabled by admin.
          </div>
        )}

        {/* History Task Logs Section */}
        <div className="w-full flex flex-col rounded-xl border border-white/5 bg-[#0d1424] p-4 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
            <History className="h-5 w-5 text-purple-400" />
            <h3 className="text-[15px] font-bold">Earning History</h3>
          </div>

          {historyLoading && histories.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-[13px]">Loading records...</div>
          ) : histories.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-[13px]">No records found</div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              {histories.map((item: any) => (
                <div key={item._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 transition-all">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-gray-100">{item.type}</span>
                      {item.country && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5 uppercase font-bold tracking-tighter">
                          {item.country}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''} {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[13px] font-bold text-purple-400/90">+{item.point} Points</span>
                    <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/5 text-emerald-500/60 border border-emerald-500/10">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || historyLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="text-[12px] text-gray-400">
                Page <span className="text-purple-400 font-bold">{currentPage}</span> of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || historyLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
