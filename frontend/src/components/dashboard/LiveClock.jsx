import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });
  
  const formattedDate = time.toLocaleDateString([], { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="live-clock-container animate-fade-in" style={{ padding: '8px 12px', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <div className="live-clock-time-wrapper">
        <Clock size={14} className="live-clock-icon" />
        <span className="live-clock-time" style={{ fontSize: '14px' }}>{formattedTime}</span>
      </div>
      <div className="live-clock-date-wrapper">
        <span className="live-clock-date" style={{ fontSize: '10px' }}>{formattedDate}</span>
      </div>
    </div>
  );
};

export default LiveClock;
