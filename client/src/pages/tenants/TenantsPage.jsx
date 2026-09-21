import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { propertyApi } from "../../api/property.api";
import { tenantApi } from "../../api/tenant.api";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Users, Search, ArrowRight, Building2 } from "lucide-react";

export const TenantsPage = () => {
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const res = await propertyApi.getProperties();
        const list = res.data?.properties || [];
        setProperties(list);
        if (list.length > 0) {
          setSelectedPropertyId(list[0]._id);
        }
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, []);

  useEffect(() => {
    if (!selectedPropertyId) return;

    const loadTenants = async () => {
      setLoading(true);
      try {
        const res = await tenantApi.getTenants(selectedPropertyId, { search });
        setTenants(res.data?.tenants || []);
      } catch {
        setTenants([]);
      } finally {
        setLoading(false);
      }
    };
    loadTenants();
  }, [selectedPropertyId, search]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Tenants Directory</h1>
          <p>View registered residents and their room assignments.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Property:</label>
          <select
            className="form-select"
            style={{ minWidth: "260px" }}
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
          >
            {properties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="search-box">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tenant name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : tenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tenants found"
          description="There are no tenants registered for the selected property."
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant ID</th>
                <th>Resident</th>
                <th>Assigned Room</th>
                <th>Registered Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => {
                const userName = typeof tenant.user === "object" ? tenant.user?.fullName : tenant.user;
                const userEmail = typeof tenant.user === "object" ? tenant.user?.email : null;
                const userPhone = typeof tenant.user === "object" ? tenant.user?.phone : null;
                const roomNumber = typeof tenant.room === "object" ? tenant.room?.roomNumber : null;

                return (
                  <tr key={tenant._id}>
                    <td style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: "600" }}>
                      #{tenant._id.slice(-6)}
                    </td>
                    <td>
                      <div style={{ fontWeight: "600" }}>{userName || "Resident"}</div>
                      {userEmail && (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{userEmail}</div>
                      )}
                      {userPhone && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{userPhone}</div>
                      )}
                    </td>
                    <td>
                      {tenant.room ? (
                        <Badge variant="success">
                          {roomNumber ? `Room #${roomNumber}` : "Room Assigned"}
                        </Badge>
                      ) : (
                        <Badge variant="warning">Unassigned</Badge>
                      )}
                    </td>
                    <td>{new Date(tenant.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link
                      to={`/properties/${selectedPropertyId}`}
                      className="btn btn-outline btn-sm"
                    >
                      <span>Manage</span>
                      <ArrowRight size={14} />
                    </Link>
                  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
