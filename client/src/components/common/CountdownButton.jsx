import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

const CountdownTimer = ({ startDate = new Date() }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = new Date(startDate).getTime();
      const end = start + (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [startDate]);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  const TimeUnit = ({ value, label, gradient }) => (
    <div className="relative group">
      <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}>
        <div className="text-center">
          <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-mono tracking-wider">
            {formatNumber(value)}
          </div>
          <div className="text-white/80 text-sm uppercase tracking-widest font-medium">
            {label}
          </div>
        </div>
        <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Clock className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              7-Day Countdown
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2 text-purple-300">
            <Calendar className="w-5 h-5" />
            <p className="text-lg">
              Started: {new Date(startDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Countdown Display */}
        {!isExpired ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <TimeUnit 
              value={timeLeft.days} 
              label="Days" 
              gradient="from-pink-500 to-rose-500"
            />
            <TimeUnit 
              value={timeLeft.hours} 
              label="Hours" 
              gradient="from-purple-500 to-indigo-500"
            />
            <TimeUnit 
              value={timeLeft.minutes} 
              label="Minutes" 
              gradient="from-blue-500 to-cyan-500"
            />
            <TimeUnit 
              value={timeLeft.seconds} 
              label="Seconds" 
              gradient="from-emerald-500 to-teal-500"
            />
          </div>
        ) : (
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl p-8 shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Time's Up!
              </h2>
              <p className="text-white/90 text-lg">
                The 7-day countdown has completed
              </p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="bg-slate-800/50 rounded-full p-2 backdrop-blur-sm">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ 
              width: `${isExpired ? 100 : (((7 * 24 * 60 * 60) - (timeLeft.days * 24 * 60 * 60 + timeLeft.hours * 60 * 60 + timeLeft.minutes * 60 + timeLeft.seconds)) / (7 * 24 * 60 * 60)) * 100}%` 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
        
        {/* Progress Text */}
        <div className="text-center mt-4">
          <p className="text-purple-300 text-sm">
            {isExpired ? 'Completed!' : `${Math.round((((7 * 24 * 60 * 60) - (timeLeft.days * 24 * 60 * 60 + timeLeft.hours * 60 * 60 + timeLeft.minutes * 60 + timeLeft.seconds)) / (7 * 24 * 60 * 60)) * 100)}% Complete`}
          </p>
        </div>
      </div>
    </div>
  );
};

// Demo component with date picker
const CountdownDemo = ({startDate}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div>
      {/* Date Picker Controls */}
      <div className="fixed top-4 right-4 z-10">
        <div className="bg-slate-800/90 backdrop-blur-md rounded-lg p-4 shadow-xl">
          <label className="block text-white text-sm font-medium mb-2">
            Start Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-700 text-white rounded-md px-3 py-2 text-sm border border-slate-600 focus:border-purple-400 focus:outline-none"
          />
        </div>
      </div>

      <CountdownTimer startDate={new Date(selectedDate)} />
    </div>
  );
};

export default CountdownDemo;