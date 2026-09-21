import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { propertyApi } from "../../api/property.api";
import { tenantApi } from "../../api/tenant.api";
import { StatCard } from "../../components/common/StatCard";
import { Spinner } from "../../components/common/Spinner";
import { Badge } from "../../components/common/Badge";
import {
  Building2,
  DoorOpen,
  Users,
  MessageSquareWarning,
  Plus,
  ArrowRight,
  Sparkles,
  Home,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  AlertCircle,
} from "lucide-react";

export const Dashboard = () => {
  const { user, isOwner, isCaretaker, isTenant } = useAuth();

  const [properties, setProperties] = useState([]);
  const [stay, setStay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (isOwner || isCaretaker) {
          const res = await propertyApi.getProperties({ limit: 5 });
          setProperties(res.data?.properties || []);
        } else if (isTenant) {
          const stayRes = await tenantApi.getMyStay();
          setStay(stayRes.data);
        }
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isOwner, isCaretaker, isTenant]);

  if (loading) return <Spinner size={48} />;

  return (
    <div className="fade-in">
      {/* Welcome Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>
            Hello, <span className="text-gradient">{user?.fullName}</span> 👋
          </h1>
          <p>
            {isOwner && "Manage your properties, tenants, and rent collections in real-time."}
            {isCaretaker && "Overview of your assigned properties and maintenance requests."}
            {isTenant && "Welcome to your resident dashboard. View your room and stay details."}
          </p>
        </div>

        {isOwner && (
          <Link to="/properties" className="btn btn-primary">
            <Plus size={18} />
            <span>Manage Properties</span>
          </Link>
        )}
      </div>

      {/* Owner & Caretaker Metrics */}
      {(isOwner || isCaretaker) && (
        <>
          <div className="dashboard-grid">
            <StatCard
              label="Total Properties"
              value={properties.length || "0"}
              icon={Building2}
              color="#6366f1"
              bg="rgba(99, 102, 241, 0.15)"
            />
            <StatCard
              label="Active Status"
              value="Operational"
              icon={CheckCircle2}
              color="#10b981"
              bg="rgba(16, 185, 129, 0.15)"
            />
            <StatCard
              label="Role Scope"
              value={user?.role}
              icon={Users}
              color="#06b6d4"
              bg="rgba(6, 182, 212, 0.15)"
            />
            <StatCard
              label="System Health"
              value="100% Online"
              icon={Sparkles}
              color="#a855f7"
              bg="rgba(168, 85, 247, 0.15)"
            />
          </div>

          {/* Properties Overview Section */}
          <div className="card" style={{ marginTop: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <h2>Your Properties</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  Select any property to manage rooms, assign tenants, and track rent
                </p>
              </div>
              <Link to="/properties" className="btn btn-outline btn-sm">
                <span>View All</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {properties.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                <Building2 size={40} color="var(--text-muted)" style={{ margin: "0 auto 0.75rem" }} />
                <h3>No Properties Registered Yet</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  Get started by creating your first PG, Hostel, or Apartment.
                </p>
                {isOwner && (
                  <Link to="/properties" className="btn btn-primary btn-sm">
                    <Plus size={16} />
                    <span>Add First Property</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="properties-grid">
                {properties.map((property) => (
                  <div key={property._id} className="card card-hover" style={{ padding: "1.25rem" }}>
                    <div className="property-card-header">
                      <div>
                        <h3 className="property-title">{property.name}</h3>
                        <span className="property-address">
                          <Home size={14} />
                          {property.address?.city || "City"}, {property.address?.state || "State"}
                        </span>
                      </div>
                      <Badge variant={property.type}>{property.type}</Badge>
                    </div>

                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0.75rem 0" }}>
                      {property.description}
                    </p>

                    <Link
                      to={`/properties/${property._id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ width: "100%", marginTop: "0.5rem" }}
                    >
                      <span>Manage Property</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Tenant Dashboard View */}
      {isTenant && (
        <div>
          {stay && stay.property ? (
            <div>
              {/* Active Property Stay Banner */}
              <div
                className="card"
                style={{
                  background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  marginBottom: "2rem",
                  padding: "1.75rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--primary)", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.05em" }}>
                      Current Residence
                    </span>
                    <h2 style={{ fontSize: "1.75rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span>{stay.property.name}</span>
                      <Badge variant={stay.property.type}>{stay.property.type}</Badge>
                    </h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.4rem" }}>
                      <MapPin size={15} />
                      {stay.property.address?.street}, {stay.property.address?.city}, {stay.property.address?.state} - {stay.property.address?.pincode}
                    </p>
                  </div>

                  <div style={{ textAlign: "right", alignSelf: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Your Allocated Room
                    </span>
                    <div style={{ fontSize: "1.4rem", fontWeight: "700", fontFamily: "Outfit", color: "var(--text-main)", marginTop: "0.2rem" }}>
                      {stay.room ? `Room #${stay.room.roomNumber}` : "Room Not Assigned Yet"}
                    </div>
                    {stay.room && (
                      <span style={{ fontSize: "0.85rem", color: "#34d399", fontWeight: "600" }}>
                        ₹{stay.room.rentAmount?.toLocaleString()} / month
                      </span>
                    )}
                  </div>
                </div>

                {/* Property Contact Details */}
                <div
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    borderTop: "1px solid var(--border-subtle)",
                    marginTop: "1.5rem",
                    paddingTop: "1rem",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Phone size={15} color="var(--primary)" />
                    <span>Management Phone: <strong>{stay.property.contact?.phone || "N/A"}</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Mail size={15} color="var(--primary)" />
                    <span>Management Email: <strong>{stay.property.contact?.email || "N/A"}</strong></span>
                  </div>
                </div>
              </div>

              {/* Quick Action Cards */}
              <div className="dashboard-grid">
                <div className="card card-hover" style={{ background: "var(--bg-card)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <div className="stat-icon" style={{ width: "40px", height: "40px" }}>
                      <CreditCard size={20} />
                    </div>
                    <h3 style={{ fontSize: "1.15rem" }}>Rent & Ledger</h3>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem", lineHeight: "1.5" }}>
                    Review your monthly rent billing dates, track payment receipts, or pay upcoming rent.
                  </p>
                  <Link to="/rent" className="btn btn-primary btn-sm" style={{ width: "100%" }}>
                    <span>View Rent Receipts</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>

                <div className="card card-hover" style={{ background: "var(--bg-card)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <div className="stat-icon" style={{ width: "40px", height: "40px", background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
                      <MessageSquareWarning size={20} />
                    </div>
                    <h3 style={{ fontSize: "1.15rem" }}>Complaints & Maintenance</h3>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem", lineHeight: "1.5" }}>
                    Submit a maintenance ticket for room cleanliness, plumbing, electrical, or WiFi issues.
                  </p>
                  <Link to="/complaints" className="btn btn-secondary btn-sm" style={{ width: "100%" }}>
                    <span>Submit Ticket</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Unassigned Tenant Notice */
            <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "var(--warning-light)",
                  color: "#fbbf24",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.25rem",
                }}
              >
                <AlertCircle size={36} />
              </div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                Not Assigned to a Property Yet
              </h2>
              <p style={{ color: "var(--text-secondary)", maxWidth: "480px", margin: "0 auto 1.5rem", fontSize: "0.95rem", lineHeight: "1.6" }}>
                You are registered with the <strong style={{ color: "var(--text-main)" }}>TENANT</strong> role, but the PG or Hostel owner has not added your account to their property.
              </p>
              <div
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  padding: "1rem 1.5rem",
                  borderRadius: "var(--radius-md)",
                  display: "inline-block",
                  fontSize: "0.9rem",
                  color: "var(--text-main)",
                  border: "1px dashed var(--border-subtle)",
                }}
              >
                Your Registered Email: <strong>{user?.email}</strong>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "1rem" }}>
                Please ask your PG Owner to add you using this email address or your User ID: <code>{user?._id}</code>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
