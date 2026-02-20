import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

const LiveClock = ({ name }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    let greeting = 'Good Evening';
    
    if (hour >= 5 && hour < 12) {
      greeting = 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good Afternoon';
    } else if (hour >= 17 && hour < 22) {
      greeting = 'Good Evening';
    } else {
      greeting = 'Good Night';
    }
    
    // Only use first name for greeting
    const firstName = name ? name.split(' ')[0] : '';
    return firstName ? `${greeting}, ${firstName}` : greeting;
  };

  const formattedTime = time.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });
  
  const formattedDate = time.toLocaleDateString([], { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="live-clock-container animate-fade-in">
      <div className="live-clock-header">
        <span className="live-clock-greeting">{getGreeting()} 👋</span>
      </div>
      <div className="live-clock-body">
        <div className="live-clock-time-wrapper">
          <Clock size={16} className="live-clock-icon" />
          <span className="live-clock-time">{formattedTime}</span>
        </div>
        <div className="live-clock-date-wrapper">
          <Calendar size={12} className="live-clock-icon-small" />
          <span className="live-clock-date">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveClock;
