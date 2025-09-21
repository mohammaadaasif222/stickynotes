import React, { memo } from 'react';

const TimerCard = memo(({ timeRemaining, label = "Times" }) => {
  if (timeRemaining.days <= 0) return null;

  return (
    <button
      type="button"
      className="relative px-3 py-1.5 rounded-lg text-[14px] font-semibold text-gray-100 focus:outline-none border bg-gradient-to-tr from-[#4151ff] to-[#698f96] shadow-lg"
    >
      <p>
        {timeRemaining.days}:{timeRemaining.hours}:
        {timeRemaining.minutes}:{timeRemaining.seconds}{" "}
        <span className="block text-[11px] font-medium">{label}</span>
      </p>
    </button>
  );
});

TimerCard.displayName = 'TimerCard';
export default TimerCard
