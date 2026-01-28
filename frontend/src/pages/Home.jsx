import { useState, useEffect } from 'react';
import { githubService } from '../services/api';
import './Home.css';

const Home = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updateNotification, setUpdateNotification] = useState(false);

  useEffect(() => {
    fetchProfile();
    
    // Set up periodic check for changes (every 5 minutes)
    const changeCheckInterval = setInterval(async () => {
      try {
        const { hasChanged } = await githubService.checkForChanges();
        if (hasChanged) {
          setUpdateNotification(true);
          // Auto-refresh after showing notification for 2 seconds
          setTimeout(() => {
            handleRefresh();
          }, 2000);
        }
      } catch (err) {
        console.error('Error checking for changes:', err);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(changeCheckInterval);
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await githubService.getProfile();
      setProfile(data);
      setError(null);
      setUpdateNotification(false);
    } catch (err) {
      setError('Failed to load GitHub profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const { profile: updatedProfile } = await githubService.refreshProfile();
      setProfile(updatedProfile);
      setError(null);
      setUpdateNotification(false);
    } catch (err) {
      setError('Failed to refresh GitHub profile');
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error">{error}</div>
        <button onClick={handleRefresh} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="home-container">
      {updateNotification && (
        <div className="update-notification">
          ✨ GitHub profile updated! Refreshing...
        </div>
      )}
      
      <div className="profile-section">
        <div className="profile-header">
          <img 
            src={profile.avatar_url} 
            alt={profile.name} 
            className="profile-avatar"
          />
          <div className="profile-info-wrapper">
            <h2 className="profile-name">{profile.name}</h2>
            <div className="profile-meta">
              <p className="profile-username">@{profile.login}</p>
              {profile.pronouns && (
                <>
                  <span className="profile-separator">·</span>
                  <p className="profile-pronouns">{profile.pronouns}</p>
                </>
              )}
            </div>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="refresh-button"
            title="Refresh GitHub profile"
          >
            {refreshing ? '⟳ Refreshing...' : '↻ Refresh'}
          </button>
        </div>
        
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-number">{profile.public_repos}</span>
            <span className="stat-label">Repositories</span>
          </div>
          <div className="stat">
            <span className="stat-number">{profile.followers}</span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="stat">
            <span className="stat-number">{profile.following}</span>
            <span className="stat-label">Following</span>
          </div>
        </div>

        {profile.location && (
          <div className="profile-info">
            <span className="info-icon">📍</span>
            <span>{profile.location}</span>
          </div>
        )}
        
        <a 
          href={profile.html_url} 
          target="_blank"
          rel="noopener noreferrer"
          className="profile-link"
        >
          View GitHub Profile →
        </a>
      </div>

      <div className="repos-section">
        <h3>Recent Repositories</h3>
        <div className="repos-grid">
          {profile.repos && profile.repos.slice(0, 6).map((repo, index) => (
            <a 
              key={index}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-card"
            >
              <h4 className="repo-name">{repo.name}</h4>
              {repo.description && (
                <p className="repo-description">{repo.description}</p>
              )}
              <div className="repo-meta">
                {repo.language && (
                  <span className="repo-language">
                    <span className="language-dot"></span>
                    {repo.language}
                  </span>
                )}
                <span className="repo-stars">⭐ {repo.stargazers_count}</span>
                <span className="repo-forks">🍴 {repo.forks_count}</span>
              </div>
            </a>
          ))}
        </div>
        <a 
          href="https://github.com/KatsuneNiko?tab=repositories" 
          target="_blank"
          rel="noopener noreferrer"
          className="view-all-repos-button"
        >
          View all repositories →
        </a>
      </div>

      {profile.recentActivity && profile.recentActivity.length > 0 && (
        <div className="activity-section">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            {profile.recentActivity.slice(0, 3).map((activity, index) => (
              <li key={index} className="activity-item">
                <span className="activity-type">{activity.type.replace('Event', '')}</span>
                <span className="activity-repo">{activity.repo}</span>
                <span className="activity-date">
                  {new Date(activity.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;
