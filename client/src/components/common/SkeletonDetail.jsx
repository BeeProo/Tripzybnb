export default function SkeletonDetail() {
  return (
    <div className="skeleton-detail">
      <div className="skeleton skeleton-gallery" />
      <div className="skeleton-detail-layout">
        <div className="skeleton-detail-main">
          <div className="skeleton skeleton-heading" />
          <div className="skeleton skeleton-text-long" />
          <div className="skeleton skeleton-text-long" />
          <div className="skeleton skeleton-text" />
          <div style={{ marginTop: 24 }}>
            <div className="skeleton skeleton-heading-sm" />
            <div className="skeleton-amenities-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton skeleton-chip" />
              ))}
            </div>
          </div>
        </div>
        <div className="skeleton-detail-aside">
          <div className="skeleton skeleton-booking-card" />
        </div>
      </div>
    </div>
  );
}
