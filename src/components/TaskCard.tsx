import { useEffect, useState } from 'react';
import { Send, PlayCircle } from 'lucide-react';

import type { Task } from '../types/usertask';

interface Props {
  task: Task;
  onReload: () => void;
  onOpenVerification?: (task: Task) => void;
}

export default function TaskCard({ task, onReload, onOpenVerification }: Props) {
  const [remaining, setRemaining] = useState(task.remainingSeconds || 0);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (task.available || task.completed) return;

    setRemaining(task.remainingSeconds);

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          onReload();

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [task]);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!task.available || starting || task.completed) return;

    const shouldOpenVerification = [
      'telegram_channel',
      'telegram_bot',
      'telegram_group',
      'youtube_video',
      'facebook_video',
      'website_visitor',
      'custom_url',
    ].includes(task.type);

    if (shouldOpenVerification) {
      setStarting(true);
      onOpenVerification?.(task);
      return;
    }

    setStarting(true);
    const url = new URL(task.url);
    url.search = '';
    url.searchParams.set('startapp', `task_${task._id}`);

    const shouldOpenAsLink = task.type === 'rewarded_popup' || task.type === 'watch_ads';

    if (window.Telegram?.WebApp) {
      if (shouldOpenAsLink) {
        window.Telegram.WebApp.openLink(url.toString());
      } else {
        window.Telegram.WebApp.openTelegramLink(url.toString());
      }
    } else {
      window.open(url.toString(), '_blank');
      console.log('Opened in new tab:', url.toString());
    }
  };

  const getIcon = () => {
    switch (task.type) {
      case 'telegram_bot':
        return <Send className="text-white" size={20} />;

      case 'telegram_channel':
        return <Send className="text-white" size={20} />;

      default:
        return <PlayCircle className="text-white" size={20} />;
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[#2A3146] bg-[#111827] p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600">{getIcon()}</div>
        <div className="flex min-w-0 flex-col items-start">
          <h4 className="max-w-full truncate text-[15px] font-semibold leading-5 text-white">{task.title}</h4>
          <p className="max-w-full truncate text-sm text-gray-400">{task.description}</p>
        </div>
      </div>

      <div className="flex w-[86px] shrink-0 flex-col items-end gap-1">
        <span className="max-w-full truncate text-sm font-bold text-violet-400">{task.reward} Pts</span>

        <button
          onClick={handleStart}
          disabled={!task.available || starting || task.completed}
          className={`h-7 w-full rounded-lg px-2 text-xs font-semibold transition ${
            task.completed
              ? 'bg-gray-700 text-green-100 cursor-not-allowed'
              : task.available && !starting
                ? 'bg-violet-600 hover:bg-violet-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {starting
            ? 'Opening...'
            : task.completed
              ? 'Completed'
              : task.available
                ? 'Start'
                : formatTime(remaining)}
        </button>
      </div>
    </div>
  );
}
