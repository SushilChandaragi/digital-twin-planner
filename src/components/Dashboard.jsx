import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Import component-specific styles

function Dashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalPlans: 12,
    activePlans: 3,
    completedPlans: 9,
    totalResources: 147
  });

  // Update time every second for live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const quickActions = [
    {
      icon: '🏗️',
      title: 'New Plan',
      description: 'Create a new digital twin plan',
      action: () => navigate('/plan'),
      color: 'primary'
    },
    {
      icon: '💾',
      title: 'Saved Plans',
      description: 'View and manage your saved plans',
      action: () => navigate('/saved-plans'),
      color: 'secondary'
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'View detailed analytics and reports',
      action: () => navigate('/analytics'),
      color: 'tertiary'
    },
  ];

  const recentActivity = [
    { action: 'Created', item: 'Smart City Prototype', time: '2 hours ago', icon: '🆕' },
    { action: 'Modified', item: 'Urban Planning Model', time: '5 hours ago', icon: '✏️' },
    { action: 'Exported', item: 'Sustainable Village Layout', time: '1 day ago', icon: '📤' },
    { action: 'Duplicated', item: 'Industrial Complex Beta', time: '2 days ago', icon: '📋' }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard-page">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1 className="dashboard-title">Digital Twin Command Center</h1>
            <p className="welcome-message">Welcome back, Architect</p>
          </div>
          <div className="header-info">
            <div className="live-clock">
              <div className="time">{formatTime(currentTime)}</div>
              <div className="date">{formatDate(currentTime)}</div>
            </div>
            <button className="logout-button" onClick={() => navigate('/')}>
              <span className="logout-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="dashboard-main">
        {/* Statistics Cards */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-number">{stats.totalPlans}</div>
                <div className="stat-label">Total Plans</div>
              </div>
            </div>
            <div className="stat-card secondary">
              <div className="stat-icon">🚀</div>
              <div className="stat-content">
                <div className="stat-number">{stats.activePlans}</div>
                <div className="stat-label">Active Plans</div>
              </div>
            </div>
            <div className="stat-card tertiary">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-number">{stats.completedPlans}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            <div className="stat-card quaternary">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-number">{stats.totalResources}</div>
                <div className="stat-label">Resources</div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <div key={index} className={`action-card ${action.color}`} onClick={action.action}>
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h3 className="action-title">{action.title}</h3>
                  <p className="action-description">{action.description}</p>
                </div>
                <div className="action-arrow">→</div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="activity-section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <div className="activity-main">
                    <span className="activity-action">{activity.action}</span>
                    <span className="activity-item-name">"{activity.item}"</span>
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Progress Overview */}
        <section className="progress-section">
          <h2 className="section-title">Project Progress</h2>
          <div className="progress-container">
            <div className="progress-item">
              <div className="progress-header">
                <span className="progress-label">Plans Completion</span>
                <span className="progress-percentage">75%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '75%'}}></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;