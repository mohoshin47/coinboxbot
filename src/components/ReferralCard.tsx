import { Copy, Gift, Share2, Users } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { useGlobalConfig } from "../contexts/GlobalConfigContext";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { getMyReferrals } from "../services/userService";



export default function ReferralCard() {
  const { user } = useUser();
  const { config } = useGlobalConfig();

  const [referrals, setReferrals] =
    useState<any[]>([]);

  useEffect(() => { loadReferrals(); }, []);
  const loadReferrals = async () => {
    try {
      const id = user?.telegramId?.toString();
      const response =await getMyReferrals(id || "0");

      setReferrals(
        response.data
      );
    } catch (err) {
      console.log(err);
    }
  };

   const getDaysAgo = ( date: string) => {
    const created = new Date(date);
    const now =new Date();
    const diff =
      Math.floor(
        (now.getTime() -
          created.getTime()) /
          (1000 *
            60 *
            60 *
            24)
      );

    return diff === 0
      ? "Joined Today"
      : `Joined ${diff} day${
          diff > 1 ? "s" : ""
        } ago`;
  };

  const referralLink = `https://t.me/${config?.bot_link}?start=${user?.telegramId}`;
  const referralIncome = Number(user?.refer?.totalreferralsincome || 0);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    console.log("test copy")
    toast.success("Referral Link Copied!", {
      duration: 2000,
      position: "top-center",
    }); 

  };

   const shareLink = async () => {
    try {
      if (navigator.share) {
        // Web Share API (mobile devices)
        await navigator.share({
          title: 'Join MiniTask with my referral',
          text: 'Earn rewards by joining through my referral link!',
          url: referralLink,
        });
      } else {
        // Fallback for desktop browsers
        const shareUrl = `https://telegram.me/share/url?url=${encodeURIComponent(referralLink)}&text=Join MiniTask with my referral link!`;
        window.open(shareUrl, '_blank');
      }
    } catch (err) {
      console.log('Error sharing:', err);
      // Fallback to copy if sharing fails
      copyLink();
    }
  };


  return (
    <div>
    <div className="overflow-hidden rounded-2xl border border-purple-400/15 bg-gradient-to-br from-[#18223A] via-[#0B1728] to-[#07111F] p-3 shadow-xl sm:p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-500/20">
          <Users size={24} className="text-purple-200" />
        </div>

        <div className="min-w-0 text-left">
          <h2 className="truncate text-[22px] font-semibold leading-7 text-white">
            Refer Friends
          </h2>

          <p className="mt-0.5 text-[13px] text-slate-300">
            Earn more by inviting friends
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <h3 className="text-[26px] font-bold leading-8 text-purple-200">
            {Number(config?.refer_reward ?? 0.01).toFixed(2)}
          </h3>

          <p className="mt-0.5 text-xs text-slate-300">
            Per Successful Referral Reward
          </p>
        </div>
      </div>
      </div>

      {/* refer top end */}

      <div className="mt-3 rounded-2xl border border-slate-800 bg-[#07111F] p-3 sm:p-4">
      <h3 className="mb-2 text-left text-h4 !text-white">
        Your Referral Link
      </h3>

      <div className="flex items-center gap-2">
        <div className="h-10 min-w-0 flex-1 truncate rounded-xl border border-slate-800 bg-[#0B1728] px-3 py-3 text-left text-xs text-slate-400">
          {referralLink}
        </div>

        <button
          type="button"
          onClick={copyLink}
          className="flex h-10 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/15 transition-transform duration-150 active:scale-95"
          aria-label="Copy referral link"
        >
          <Copy
            size={18}
            className="text-purple-200"
          />
        </button>
      </div>

      <button
        type="button"
        onClick={shareLink}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 active:scale-95"
      >
        <Share2 size={18} />
        Share Link
      </button>
    </div>

    {/* link share oftion end */}
     <div className="mt-3 grid grid-cols-2 gap-2.5">
      
      {/* Total Referrals */}
      <div className="flex flex-row rounded-xl border border-slate-800 bg-[#07111F] p-2.5 text-left">
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/5">
          <Users size={18} className="text-purple-300" />
        </div>
        <div className="ms-3">
          <p className="truncate text-[11px] leading-4 text-slate-400">
          Total Referrals
        </p>

        <h2 className="mt-0.5 truncate text-[20px] font-semibold leading-7 text-white">
          {user?.refer?.totalreferrals || 0}
        </h2>
        </div>
      </div>

      {/* Referral Income */}
      <div className="flex flex-row rounded-xl border border-slate-800 bg-[#07111F] p-2.5 text-left">
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/5">
          <Gift size={18} className="text-emerald-300" />
        </div>
        <div className="ms-3">
          <p className="truncate text-[11px] leading-4 text-slate-400">
          Referral Income
        </p>

        <h2 className="mt-0.5 truncate text-[20px] font-semibold leading-7 text-white">
          {referralIncome.toFixed(3)}
        </h2>
        </div>
      </div>
    </div>

     {/* refer list start */}

      <div className="mt-3 rounded-2xl border border-slate-800 bg-[#07111F] p-3 sm:p-4">
       <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="text-h3 !text-white">
        Recent Referrals
      </h3>
       </div>

      <div className="space-y-2.5">
        {referrals.map(
          (item) => (
            <div
              key={item.telegramId}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0B1728] p-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <img
                  src={
                    item.user?.photoUrl ||
                    "https://ui-avatars.com/api/?name=User&background=7c3aed&color=fff"
                  }
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />

                <div className="min-w-0 text-left">
                  <h4 className="truncate text-sm font-semibold text-white">
                    @{item.user?.username || 'user'}
                  </h4>

                  <p className="mt-0.5 text-xs text-slate-300">
                    Balance: {Number(item.balance || 0).toFixed(3)} Pts
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {getDaysAgo(item.createdAt)}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-sm font-semibold text-purple-300">
                +{Number(config?.refer_reward ?? 0.01).toFixed(2)}
              </div>
            </div>
          )
        )}

        {referrals.length ===
          0 && (
          <div className="flex flex-col items-center rounded-xl border border-slate-800 bg-[#0B1728] py-7">
            <Users
              size={36}
              className="text-slate-600"
            />

            <p className="mt-2 text-sm text-slate-500">
              No referrals yet
            </p>
          </div>
        )}
      </div>
    </div>



    </div>
  );
}
