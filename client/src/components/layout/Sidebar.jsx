import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  CreditCard,
  MessageSquareWarning,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Badge } from "../common/Badge";

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isOwner, isCaretaker, isTenant } = useAuth();

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <span className="brand-name">Stay<span className="text-gradient">OS</span></span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Overview</div>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={onClose}
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </NavLink>

        {/* Owner & Caretaker Links */}
        {(isOwner || isCaretaker) && (
          <>
            <div className="nav-section-title">Management</div>

            <NavLink
              to="/properties"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <Building2 size={19} />
              <span>Properties</span>
            </NavLink>

            <NavLink
              to="/rooms"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <DoorOpen size={19} />
              <span>Rooms</span>
            </NavLink>

            <NavLink
              to="/tenants"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <Users size={19} />
              <span>Tenants</span>
            </NavLink>

            <div className="nav-section-title">Finance & Support</div>

            <NavLink
              to="/rent"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <CreditCard size={19} />
              <span>Rent & Ledger</span>
            </NavLink>

            <NavLink
              to="/complaints"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <MessageSquareWarning size={19} />
              <span>Complaints</span>
            </NavLink>
          </>
        )}

        {/* Tenant Links */}
        {isTenant && (
          <>
            <div className="nav-section-title">My Stay</div>

            <NavLink
              to="/rent"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <CreditCard size={19} />
              <span>My Rent & Receipts</span>
            </NavLink>

            <NavLink
              to="/complaints"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <MessageSquareWarning size={19} />
              <span>My Complaints</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="user-snippet">
          <div className="user-avatar">
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="user-meta">
            <div className="user-name">{user?.fullName || "User"}</div>
            <Badge variant={user?.role}>{user?.role}</Badge>
          </div>
          <button
            onClick={logout}
            className="btn btn-outline btn-icon btn-sm"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
