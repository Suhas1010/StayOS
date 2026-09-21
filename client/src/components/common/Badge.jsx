import React from "react";

/**
 * Status and Role Badge Component
 * Automatically styles badges based on their value (e.g. PAID, PENDING, OWNER, etc.)
 */
export const Badge = ({ children, variant, className = "" }) => {
  const text = String(children || "");
  const normalized = (variant || text).toLowerCase().replace(/\s+/g, "_");

  return (
    <span className={`badge badge-${normalized} ${className}`}>
      {children}
    </span>
  );
};
