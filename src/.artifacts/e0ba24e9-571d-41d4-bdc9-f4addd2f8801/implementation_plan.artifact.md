# Implementation Plan - Update Referral History Unit

Update the `ReferralCard.tsx` component to display user balances in "Pts" instead of "USDT" in the recent referrals history list.

## Proposed Changes

### apps Component

#### [MODIFY] [ReferralCard.tsx](file:///I:/AndroidStudioProjects2/Bot/CoinBox/apps/src/components/ReferralCard.tsx)

- Locate the `Recent Referrals` list item rendering.
- Change the text "USDT" to "Pts" in the user balance display line.
- (Optional but good for consistency) Check if other reward displays in this file should explicitly say "Pts".

## Verification Plan

### Manual Verification
- Navigate to the Referral page.
- Look at the "Recent Referrals" section.
- Verify that the balance for each referred user is displayed with "Pts" instead of "USDT".
