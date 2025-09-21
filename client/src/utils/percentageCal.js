export function calculatePlanProgress(totalInvested, totalEarned, multiplier = 3) {
  const invested = parseFloat(totalInvested || 0);
  const earned = parseFloat(totalEarned || 0);

  const planLimit = invested * multiplier;
  const planLimitLeft = Math.max(planLimit - earned, 0);
  const progressPercent = Math.min((earned / planLimit) * 100, 100);

  return {
    planLimitLeft,
    progressPercent
  };
}