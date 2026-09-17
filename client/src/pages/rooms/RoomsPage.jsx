import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { propertyApi } from "../../api/property.api";
import { roomApi } from "../../api/room.api";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { DoorOpen, Building2, ArrowRight } from "lucide-react";

export const RoomsPage = () => {
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterVacancy, setFilterVacancy] = useState("ALL");

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

    const loadRooms = async () => {
      setLoading(true);
      try {
        const res = await roomApi.getRooms(selectedPropertyId);
        setRooms(res.data?.rooms || []);
      } catch {
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, [selectedPropertyId]);

  const filteredRooms = rooms.filter((r) => {
    const isFull = (r.occupants?.length || 0) >= r.capacity;
    if (filterVacancy === "VACANT") return !isFull;
    if (filterVacancy === "OCCUPIED") return isFull;
    return true;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Rooms & Bed Capacity</h1>
          <p>Monitor room allocations, capacity limits, and vacancies across your properties.</p>
        </div>
      </div>

      {/* Property Selector & Filter */}
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
                {p.name} ({p.type})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          <select
            className="form-select"
            value={filterVacancy}
            onChange={(e) => setFilterVacancy(e.target.value)}
          >
            <option value="ALL">All Rooms</option>
            <option value="VACANT">Vacant Beds Only</option>
            <option value="OCCUPIED">Fully Occupied Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filteredRooms.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="No rooms found"
          description="No rooms match the selected property and vacancy filter."
        />
      ) : (
        <div className="properties-grid">
          {filteredRooms.map((room) => {
            const occupantsCount = room.occupants?.length || 0;
            const isFull = occupantsCount >= room.capacity;
            const percent = Math.min(100, Math.round((occupantsCount / room.capacity) * 100));

            return (
              <div key={room._id} className="card card-hover">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3>Room #{room.roomNumber}</h3>
                  <Badge variant={isFull ? "danger" : "success"}>
                    {isFull ? "Fully Occupied" : "Vacant Available"}
                  </Badge>
                </div>

                <div style={{ margin: "1rem 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Occupancy</span>
                    <span style={{ fontWeight: "600" }}>{occupantsCount} / {room.capacity} Beds</span>
                  </div>
                  <div className="capacity-bar">
                    <div
                      className={`capacity-fill ${isFull ? "full" : ""}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.85rem" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: "700", fontFamily: "Outfit" }}>
                    ₹{room.rentAmount?.toLocaleString()} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/month</span>
                  </span>

                  <Link
                    to={`/properties/${selectedPropertyId}`}
                    className="btn btn-outline btn-sm"
                  >
                    <span>Manage</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
