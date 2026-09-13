export interface User {
  _id: string;
  telegramId: number;
  user: {
    username: string | null;
    fullname: string;
    photoUrl: string;
  };
  refer: {
    totalreferrals: number;
    totalreferralsincome: number;
    referredBy: number | null;
    referralCode: string | null;
  };
  balance: number;
  adcredit: number;
  completedTasks: string[];
  totaltaskscompleted: number;
  accountStatus: "active" | "inactive" | "banned";
  vipuser: boolean;
  dailyadsshow: number;
  lastAdClickedAt?: string | null;
  totalAdsClicked: number;
}