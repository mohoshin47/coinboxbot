import type { User } from '../types/user';

interface UserProfileCardProps {
  user: User | null;
}

export default function ProfileCardProps({ user }: UserProfileCardProps) {
  if (!user) {
    return <div className="p-4">No user data available.</div>;
  }
  const profileImage = user.user.photoUrl || 'astronaut.png';

  return (
    <div className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-700/40 bg-gray-900 p-3 text-white shadow-lg">
      {/* Left side: Avatar + Info */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Avatar placeholder */}
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full">
          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
        </div>

        <div className="flex min-w-0 flex-col items-start">
          <span className="max-w-full truncate text-h3">{user.user.fullname}</span>
          <span className="max-w-full truncate text-sm text-gray-400">@{user.user.username}</span>
        </div>
      </div>

      {/* Right side: Balance */}
      <div className="flex shrink-0 flex-col items-end">
        <span className="text-gray-400 text-sm">Balance</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-purple-400">{user.balance} Pts</span>
        </div>
      </div>
    </div>
  );
}
