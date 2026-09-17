import React from "react";

export const Spinner = ({ size = 36 }) => {
  return (
    <div className="spinner-container">
      <div
        className="spinner"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
};
