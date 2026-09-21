import React from "react";
import { Menu, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../common/Badge";

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          onClick={onToggleSidebar}
          className="btn btn-outline btn-icon"
          style={{ display: "none" }} // Show via CSS on mobile
          id="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShieldCheck size={18} color="var(--primary)" />
          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            StayOS Multi-Property Portal
          </span>
        </div>
      </div>

      <div className="topbar-right">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Badge variant={user?.role}>{user?.role}</Badge>
          <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>
            {user?.fullName}
          </span>
        </div>

        <button
          onClick={logout}
          className="btn btn-outline btn-sm"
          title="Sign out of your account"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
