import React from "react";

/**
 * Metric KPI Card Component
 * Highlights stats with colored icons and left accent bars.
 */
export const StatCard = ({ label, value, icon: Icon, color = "#6366f1", bg = "rgba(99, 102, 241, 0.15)" }) => {
  return (
    <div
      className="stat-card"
      style={{
        "--stat-color": color,
        "--stat-bg": bg,
      }}
    >
      {Icon && (
        <div className="stat-icon">
          <Icon size={24} />
        </div>
      )}
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
};
