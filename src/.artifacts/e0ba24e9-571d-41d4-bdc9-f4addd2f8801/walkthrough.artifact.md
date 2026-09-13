# Walkthrough - Referral History Unit Update

I have updated the referral history list to display user balances in "Pts" instead of "USDT" for consistency with the app's point-based economy.

## Changes Made

### components

#### [ReferralCard.tsx](file:///I:/AndroidStudioProjects2/Bot/CoinBox/apps/src/components/ReferralCard.tsx)

- Changed the balance unit from "USDT" to "Pts" in the `Recent Referrals` list.

```diff
- Balance: {Number(item.balance || 0).toFixed(3)} USDT
+ Balance: {Number(item.balance || 0).toFixed(3)} Pts
```

## Verification Results

### Manual Verification
- Verified that the "Recent Referrals" section in the Referral page now correctly labels user balances with "Pts".
