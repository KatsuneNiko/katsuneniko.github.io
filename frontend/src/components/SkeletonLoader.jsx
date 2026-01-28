import './SkeletonLoader.css';

const SkeletonLoader = () => {
  return (
    <div className="skeleton-container">
      {/* Profile Section */}
      <div className="skeleton-profile-section">
        <div className="skeleton-profile-header">
          <div className="skeleton-avatar" />
          <div className="skeleton-profile-info">
            <div className="skeleton-name" />
            <div className="skeleton-meta-line" />
            <div className="skeleton-bio" />
          </div>
          <div className="skeleton-refresh-button" />
        </div>

        {/* Profile Stats */}
        <div className="skeleton-stats">
          <div className="skeleton-stat">
            <div className="skeleton-stat-number" />
            <div className="skeleton-stat-label" />
          </div>
          <div className="skeleton-stat">
            <div className="skeleton-stat-number" />
            <div className="skeleton-stat-label" />
          </div>
          <div className="skeleton-stat">
            <div className="skeleton-stat-number" />
            <div className="skeleton-stat-label" />
          </div>
        </div>

        {/* Location */}
        <div className="skeleton-location" />

        {/* View Profile Link */}
        <div className="skeleton-link" />
      </div>

      {/* Repos Section */}
      <div className="skeleton-repos-section">
        <div className="skeleton-section-title" />
        <div className="skeleton-repo-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-repo-card">
              <div className="skeleton-repo-name" />
              <div className="skeleton-repo-desc-short" />
              <div className="skeleton-repo-desc-short" />
              <div className="skeleton-repo-footer">
                <div className="skeleton-repo-stat" />
                <div className="skeleton-repo-stat" />
                <div className="skeleton-repo-stat" />
              </div>
            </div>
          ))}
        </div>
        <div className="skeleton-view-all-link" />
      </div>

      {/* Activity Section */}
      <div className="skeleton-activity-section">
        <div className="skeleton-section-title" />
        <div className="skeleton-activity-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-activity-item" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
