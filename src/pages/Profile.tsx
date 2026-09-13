import Header from "../components/Header";
import {
  BadgeCheck,
  Copy,
  Crown,
  Gift,
  IdCard,
  Medal,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Headphones,
} from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { useGlobalConfig } from "../contexts/GlobalConfigContext";
import toast from "react-hot-toast";

const DEFAULT_PROFILE_PHOTO = `${import.meta.env.BASE_URL}astronaut.png`;

export default function Profile() {
  const { user } = useUser();
  const { config } = useGlobalConfig();

  const balance = Number(user?.balance || 0);
  const adCredit = Number(user?.adcredit || 0);
  const referralIncome = Number(user?.refer?.totalreferralsincome || 0);
  const status = user?.accountStatus || "inactive";
 const isVipEligible = user?.vipuser === true || (user?.totalAdsClicked || 0) >= 5 || (user?.totalAdsShow || 0) >= 10;
  const statusClass =
    status === "active"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : status === "banned"
        ? "border-red-500/30 bg-red-500/10 text-red-300"
        : "border-amber-500/30 bg-amber-500/10 text-amber-300";

  const copyUserId = () => {
    navigator.clipboard.writeText(String(user?.telegramId || "123456789"));
    toast.success("User ID Copied!", {
      duration: 2000,
      position: "top-center",
    });
  };

  const handleVipAccess = () => {
    window.open("https://telegram.me/+bKWFJI1xgwZhMGM1", "_blank", "noopener,noreferrer");
  };

  const handleSupportAccess = () => {
    if (config?.supportchannel) {
      window.open(config.supportchannel, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Support channel is not configured yet.");
    }
  };

  const stats = [
    {
      label: "Tasks Completed",
      value: user?.totaltaskscompleted || 0,
      icon: Medal,
      accent: "text-cyan-300",
    },
    {
      label: "Referrals",
      value: user?.refer?.totalreferrals || 0,
      icon: Users,
      accent: "text-violet-300",
    },
    {
      label: "Referral Income",
      value: `${referralIncome} Pts`,
      icon: Gift,
      accent: "text-emerald-300",
    },
    {
      label: "Ad Credit",
      value: `${adCredit} Pts`,
      icon: Wallet,
      accent: "text-amber-300",
    },
  ];

  return (
    <div>
      <Header title="Profile" subtitle="User" />
      <div className="h-dvh overflow-y-auto px-2.5 pb-20 pt-[72px] no-scrollbar sm:px-3">
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#07111F] shadow-xl">
          <div className="bg-gradient-to-br from-[#18223A] via-[#0B1728] to-[#07111F] p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="relative h-14 w-14 shrink-0 rounded-2xl border border-white/10 bg-slate-900 p-1 shadow-lg sm:h-16 sm:w-16">
                  <img
                    src={user?.user?.photoUrl || DEFAULT_PROFILE_PHOTO}
                    alt="Profile"
                    className="h-full w-full rounded-xl object-cover"
                    onError={(event) => {
                      if (event.currentTarget.src !== DEFAULT_PROFILE_PHOTO) {
                        event.currentTarget.src = DEFAULT_PROFILE_PHOTO;
                      }
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 rounded-full border border-[#07111F] bg-emerald-500 p-1">
                    <BadgeCheck size={14} className="text-white" />
                  </div>
                </div>

                <div className="min-w-0 text-left">
                  <h2 className="truncate text-[20px] font-semibold leading-7 text-white sm:text-h2">
                    {user?.user?.fullname || "Mini Task User"}
                  </h2>
                  <p className="truncate text-[13px] text-slate-400">
                    @{user?.user?.username || "unknown"}
                  </p>
                  <span
                    className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${statusClass}`}
                  >
                    <ShieldCheck size={13} /> {status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-cyan-400/10 bg-cyan-400/10 p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-left">
                  <p className="text-[13px] text-cyan-100/70">Available Balance</p>
                  <h1 className="mt-0.5 text-[28px] font-bold leading-9 text-white">
                    {balance} Pts
                  </h1>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15">
                  <Wallet size={24} className="text-cyan-300" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4">
            <div className="rounded-xl border border-slate-800 bg-[#0B1728] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 text-left">
                  <IdCard size={18} className="shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Telegram ID</p>
                    <p className="truncate text-sm font-semibold text-slate-200">
                      {user?.telegramId || "123456789"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyUserId}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 active:scale-95"
                  aria-label="Copy user ID"
                >
                  <Copy size={17} />
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="flex min-w-0 rounded-xl border border-slate-800 bg-[#0B1728] p-2.5 text-left"
                >
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/5">
                    <item.icon size={18} className={item.accent} />
                  </div>
                 <div className="ms-3">
                   <p className="truncate text-[11px] leading-4 text-slate-400">
                    {item.label}
                  </p>
                  <h2 className="mt-0.5 truncate text-[18px] font-semibold leading-6 text-white">
                    {item.value}
                  </h2>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-3 rounded-2xl border border-slate-800 bg-[#07111F] p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <Headphones size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-white">Need Help?</h3>
                <p className="truncate text-xs text-slate-400">Join our support channel</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSupportAccess}
              className="shrink-0 whitespace-nowrap rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 text-xs font-bold text-white shadow-lg active:scale-95"
            >
              Contact Support
            </button>
          </div>
        </section>

        {isVipEligible && (
          <section
            className="mt-3 overflow-hidden rounded-2xl border border-[rgba(59,130,246,.18)] bg-[linear-gradient(135deg,_#13233A_0%,_#16314A_45%,_#1B2440_100%)] p-3 shadow-[0_0_20px_rgba(59,130,246,0.12)] sm:p-4"
            style={{ animation: "vipFadeIn 0.35s ease-out" }}
          >
            <div className="relative">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-sky-300" />
                    <h3 className="text-[15px] font-semibold text-white">VIP Access</h3>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-[#AFC4E6]">
                    Unlock exclusive VIP tasks and higher rewards.
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {[
                      "Premium Tasks",
                      "Higher Rewards",
                      "Fast Withdraw",
                      "Priority Support",
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[rgba(59,130,246,.20)] bg-[rgba(59,130,246,.10)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#7DD3FC]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full border border-[rgba(34,197,94,.25)] bg-[rgba(34,197,94,.15)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4ADE80]">
                    Eligible
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(59,130,246,.12)] text-[#38BDF8] shadow-lg shadow-blue-500/10">
                    <Crown size={20} />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVipAccess}
                className="w-full rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(59,130,246,0.18)] transition-transform duration-200 hover:scale-[1.03] hover:brightness-110 active:scale-[1.01]"
              >
                Join VIP
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
