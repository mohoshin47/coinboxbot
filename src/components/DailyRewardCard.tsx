import React, { useEffect, useState } from 'react';
import type { User } from '../types/user';
import { useGlobalConfig } from '../contexts/GlobalConfigContext';
import { useUser } from '../contexts/UserContext';
import { showRewardedPopup, initAdHandler } from '../utils/monetagAds';

interface DailyRewardProps {
  user?: User;
  rewardAmount: number;
  totalTasks?: number;
  loading?: boolean;
  countryBlocked?: boolean;
}

const DailyRewardCard: React.FC<DailyRewardProps> = ({
  user,
  rewardAmount,
  totalTasks,
  loading = false,
  countryBlocked = false,
}) => {
  const { config } = useGlobalConfig();
  const { loadUser } = useUser();
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);

  const completedCount = user?.dailyadsshow ?? 0 ;
  const targetCount = totalTasks ?? config?.daily?.daily_task_target ?? 0;
  const targetReached = targetCount > 0 && completedCount >= targetCount;
  const breakTimeMinutes = config?.daily?.breaktime ?? 0;
  const taskEnabled = config?.daily?.taskonoff ?? false;
  const lastAdClickedAt = user?.lastAdClickedAt ? new Date(user.lastAdClickedAt) : null;
  const canClaim = !loading && !targetReached && cooldownSeconds === 0 && !cooldownActive && !countryBlocked && taskEnabled;
  const isButtonDisabled = !canClaim;

  // Pre-initialize Ad Handler
  useEffect(() => {
    if (config?.adSettings?.MonetagZoneId) {
      initAdHandler(config.adSettings.MonetagZoneId);
    }
  }, [config?.adSettings?.MonetagZoneId]);

  const getInitialCooldownSeconds = () => {
    if (lastAdClickedAt && breakTimeMinutes > 0) {
      const elapsedMs = Date.now() - lastAdClickedAt.getTime();
      const cooldownMs = breakTimeMinutes * 60 * 1000;
      const remainingMs = cooldownMs - elapsedMs;

      if (remainingMs > 0) {
        return Math.ceil(remainingMs / 1000);
      }
    }

    return 15;
  };

  useEffect(() => {
    // console.log(user);
    if (cooldownActive) return;

    if (lastAdClickedAt && breakTimeMinutes > 0) {
      const elapsedMs = Date.now() - lastAdClickedAt.getTime();
      const cooldownMs = breakTimeMinutes * 60 * 1000;
      const remainingMs = cooldownMs - elapsedMs;

      if (remainingMs > 0) {
        setCooldownSeconds(Math.ceil(remainingMs / 1000));
        return;
      }
    }

    setCooldownSeconds(0);
  }, [cooldownActive, lastAdClickedAt, breakTimeMinutes, user?.telegramId]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (!cooldownActive || cooldownSeconds > 0) return;

    const refreshUserData = async () => {
      if (user?.telegramId) {
        await loadUser();
      }
      setCooldownSeconds(0);
      setCooldownActive(false);
    };

    void refreshUserData();
  }, [cooldownActive, cooldownSeconds, loadUser, user?.telegramId]);

  const handleClick = async () => {
    if (!canClaim) return;

    const initialCooldownSeconds = getInitialCooldownSeconds();
    setCooldownActive(true);
    setCooldownSeconds(initialCooldownSeconds);

    if (config?.adSettings?.MonetagZoneId) {
      void showRewardedPopup(config.adSettings.MonetagZoneId, user?.telegramId.toString());
    }
  };

  return (
    <div className="w-full flex flex-col rounded-lg border border-[#2e1d51] bg-gradient-to-br from-[#140c3a] to-[#070d1d] p-3.5 text-white shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <span className="text-2xl">🗓️</span>
          </div>
          <div className="flex min-w-0 flex-col items-start">
            <h4 className="max-w-full truncate text-h3 text-white">Daily Task</h4>
            <div className="flex max-w-full items-center gap-1.5 text-sm">
              <span className="text-gray-300">Reward : </span>
              <span className="text-purple-400 font-bold">{rewardAmount} Pts</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1 text-sm font-semibold text-purple-300">
          {completedCount} / {targetCount}
        </div>
      </div>

      <div className="mx-auto mt-5 mb-2 h-4 w-20 rounded-full bg-white/10 animate-pulse" />

      <button
        onClick={handleClick}
        disabled={isButtonDisabled}
        className={`mt-2 h-11 w-full rounded-lg text-sm font-semibold transition duration-150 active:scale-95 ${
          canClaim
            ? 'bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        {loading
          ? 'Claiming...'
          : countryBlocked
          ? 'Country restricted'
          : canClaim
          ? 'Watch Ad'
          : cooldownSeconds > 0
          ? `Wait ${cooldownSeconds}s`
          : 'Ads not available'}
      </button>
    </div>
  );
};

export default DailyRewardCard;
