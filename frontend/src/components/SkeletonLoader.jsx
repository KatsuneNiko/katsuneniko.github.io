import './SkeletonLoader.css';

const SkeletonLoader = () => {
  return (
    <div className="profile-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-avatar" />
        <div className="skeleton-info">
          <div className="skeleton-name" />
          <div className="skeleton-pronouns" />
          <div className="skeleton-bio" />
          <div className="skeleton-stats">
            <div className="skeleton-stat" />
            <div className="skeleton-stat" />
            <div className="skeleton-stat" />
          </div>
        </div>
      </div>

      <div className="skeleton-repos">
        <div className="skeleton-section-title" />
        <div className="skeleton-repo-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-repo-card">
              <div className="skeleton-repo-name" />
              <div className="skeleton-repo-desc" />
              <div className="skeleton-repo-footer">
                <div className="skeleton-repo-stat" />
                <div className="skeleton-repo-stat" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
