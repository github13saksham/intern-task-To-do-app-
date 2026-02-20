import React, { useEffect, useState } from 'react';
import { CheckSquare, Clock, BarChart2, ListTodo, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

const StatCard = ({ icon: Icon, label, value, colorClass, delay = 0 }) => (
  <div className="stat-card" style={{ animationDelay: `${delay}ms` }}>
    <div className={`stat-icon ${colorClass}`}>
      <Icon size={22} />
    </div>
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/tasks?sortBy=createdAt&order=desc');
        setStats(data.stats);
        setRecentTasks(data.tasks.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting('Good morning');
      else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
      else if (hour >= 17 && hour < 22) setGreeting('Good evening');
      else setGreeting('Good night');
    };
    
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your tasks today.</p>
        </div>
        <Link to="/dashboard/tasks" className="btn btn-primary">
          <CheckSquare size={16} />
          New Task
        </Link>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="card-grid card-grid-4" style={{ marginBottom: '28px' }}>
          <StatCard icon={ListTodo} label="Total Tasks" value={loading ? '—' : stats?.total ?? 0} colorClass="purple" delay={0} />
          <StatCard icon={Clock} label="To Do" value={loading ? '—' : stats?.todo ?? 0} colorClass="blue" delay={80} />
          <StatCard icon={BarChart2} label="In Progress" value={loading ? '—' : stats?.inProgress ?? 0} colorClass="yellow" delay={160} />
          <StatCard icon={CheckSquare} label="Completed" value={loading ? '—' : stats?.done ?? 0} colorClass="green" delay={240} />
        </div>

        {/* Profile + Recent Tasks */}
        <div className="card-grid card-grid-2">
          {/* Profile Card */}
          <div className="card animate-fade-up">
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Profile
            </h3>
            <div className="profile-header">
              <div className="avatar avatar-lg">{initials}</div>
              <div className="profile-meta">
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>
            <Link to="/dashboard/profile" className="btn btn-secondary btn-sm">
              <User size={14} /> Edit Profile
            </Link>
          </div>

          {/* Recent Tasks */}
          <div className="card animate-fade-up" style={{ animationDelay: '80ms' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Recent Tasks
              </h3>
              <Link to="/dashboard/tasks" className="btn btn-ghost btn-sm" style={{ fontSize: '12px' }}>View all →</Link>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div className="spinner spinner-large" style={{ margin: '0 auto' }} />
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px' }}>
                <div className="empty-state-icon">📋</div>
                <p>No tasks yet. <Link to="/dashboard/tasks" className="auth-link">Create one!</Link></p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentTasks.map(task => (
                  <div key={task._id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)'
                  }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div className="task-title" style={{ fontSize: '13px' }}>{task.title}</div>
                    </div>
                    <span className={`badge badge-${task.status}`}>
                      {task.status === 'in-progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
