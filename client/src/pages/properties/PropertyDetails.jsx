import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { propertyApi } from "../../api/property.api";
import { roomApi } from "../../api/room.api";
import { tenantApi } from "../../api/tenant.api";
import { rentApi } from "../../api/rent.api";
import { complaintApi } from "../../api/complaint.api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import {
  Building2,
  DoorOpen,
  Users,
  CreditCard,
  MessageSquareWarning,
  Plus,
  Trash2,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

export const PropertyDetails = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { isOwner, isCaretaker } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("overview");
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [tenantModalOpen, setTenantModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState("");

  // Forms state
  const [roomForm, setRoomForm] = useState({ roomNumber: "", capacity: 2, rentAmount: 6000 });
  const [tenantUserId, setTenantUserId] = useState("");

  // Rent sub-feature state
  const [selectedTenantForRent, setSelectedTenantForRent] = useState(null);
  const [rentRecords, setRentRecords] = useState([]);
  const [rentLedger, setRentLedger] = useState(null);
  const [rentModalOpen, setRentModalOpen] = useState(false);
  const [rentForm, setRentForm] = useState({ amount: "", dueDate: "" });

  const fetchPropertyData = async () => {
    try {
      const res = await propertyApi.getPropertyById(propertyId);
      setProperty(res.data);
    } catch (err) {
      showToast(err.friendlyMessage || "Failed to load property details", "error");
      navigate("/properties");
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await roomApi.getRooms(propertyId);
      setRooms(res.data?.rooms || []);
    } catch {
      setRooms([]);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await tenantApi.getTenants(propertyId);
      setTenants(res.data?.tenants || []);
    } catch {
      setTenants([]);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await complaintApi.getComplaints(propertyId);
      setComplaints(res.data?.complaints || []);
    } catch {
      setComplaints([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchPropertyData();
      await fetchRooms();
      await fetchTenants();
      await fetchComplaints();
      setLoading(false);
    };
    init();
  }, [propertyId]);

  // Load rent data whenever a tenant is selected in the Rent tab
  useEffect(() => {
    if (activeTab === "rent" && tenants.length > 0 && !selectedTenantForRent) {
      setSelectedTenantForRent(tenants[0]);
    }
  }, [activeTab, tenants]);

  useEffect(() => {
    if (selectedTenantForRent) {
      fetchTenantRent(selectedTenantForRent._id);
    }
  }, [selectedTenantForRent]);

  const fetchTenantRent = async (tenantId) => {
    try {
      const rentRes = await rentApi.getRent(propertyId, tenantId);
      setRentRecords(rentRes.data?.rent || []);
    } catch {
      setRentRecords([]);
    }

    try {
      const ledgerRes = await rentApi.getLedger(propertyId, tenantId);
      setRentLedger(ledgerRes.data);
    } catch {
      setRentLedger(null);
    }
  };

  // Handlers for Room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await roomApi.createRoom(propertyId, {
        roomNumber: roomForm.roomNumber,
        capacity: Number(roomForm.capacity),
        rentAmount: Number(roomForm.rentAmount),
      });
      showToast("Room added successfully!", "success");
      setRoomModalOpen(false);
      setRoomForm({ roomNumber: "", capacity: 2, rentAmount: 6000 });
      fetchRooms();
    } catch (err) {
      showToast(err.friendlyMessage || "Failed to add room", "error");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await roomApi.deleteRoom(propertyId, roomId);
      showToast("Room deleted", "success");
      fetchRooms();
    } catch (err) {
      showToast(err.friendlyMessage || "Cannot delete room with active occupants", "error");
    }
  };

  // Handlers for Tenant
  const handleAddTenant = async (e) => {
    e.preventDefault();
    try {
      await tenantApi.createTenant(propertyId, { userId: tenantUserId });
      showToast("Tenant added to property!", "success");
      setTenantModalOpen(false);
      setTenantUserId("");
      fetchTenants();
    } catch (err) {
      showToast(err.friendlyMessage || "Could not register tenant", "error");
    }
  };

  const handleAssignRoom = async (e) => {
    e.preventDefault();
    if (!selectedTenant || !selectedRoomId) return;

    try {
      await tenantApi.assignRoom(propertyId, selectedTenant._id, selectedRoomId);
      showToast("Tenant assigned to room successfully!", "success");
      setAssignModalOpen(false);
      setSelectedTenant(null);
      setSelectedRoomId("");
      fetchRooms();
      fetchTenants();
    } catch (err) {
      showToast(err.friendlyMessage || "Could not assign room", "error");
    }
  };

  const handleRemoveFromRoom = async (tenantId) => {
    if (!window.confirm("Remove this tenant from their room?")) return;
    try {
      await tenantApi.removeRoom(propertyId, tenantId);
      showToast("Tenant removed from room", "success");
      fetchRooms();
      fetchTenants();
    } catch (err) {
      showToast(err.friendlyMessage || "Failed to remove tenant", "error");
    }
  };

  // Handlers for Rent
  const handleCreateRent = async (e) => {
    e.preventDefault();
    if (!selectedTenantForRent) return;

    try {
      await rentApi.createRent(propertyId, selectedTenantForRent._id, {
        amount: Number(rentForm.amount),
        dueDate: rentForm.dueDate,
      });
      showToast("Rent invoice created!", "success");
      setRentModalOpen(false);
      setRentForm({ amount: "", dueDate: "" });
      fetchTenantRent(selectedTenantForRent._id);
    } catch (err) {
      showToast(err.friendlyMessage || "Could not generate rent record", "error");
    }
  };

  const handleMarkRentPaid = async (rentId) => {
    if (!selectedTenantForRent) return;
    try {
      await rentApi.markPaid(propertyId, selectedTenantForRent._id, rentId);
      showToast("Rent record marked as PAID!", "success");
      fetchTenantRent(selectedTenantForRent._id);
    } catch (err) {
      showToast(err.friendlyMessage || "Failed to update rent status", "error");
    }
  };

  // Handlers for Complaints
  const handleUpdateComplaintStatus = async (complaintId, newStatus) => {
    try {
      await complaintApi.updateStatus(propertyId, complaintId, newStatus);
      showToast(`Complaint marked as ${newStatus}`, "success");
      fetchComplaints();
    } catch (err) {
      showToast(err.friendlyMessage || "Could not update status", "error");
    }
  };

  const handleDeleteProperty = async () => {
    if (
      !window.confirm(
        "WARNING: This will permanently delete this property and all associated rooms and rent records. Continue?"
      )
    )
      return;

    try {
      await propertyApi.deleteProperty(propertyId);
      showToast("Property deleted successfully", "success");
      navigate("/properties");
    } catch (err) {
      showToast(err.friendlyMessage || "Failed to delete property", "error");
    }
  };

  if (loading) return <Spinner size={48} />;
  if (!property) return null;

  return (
    <div className="fade-in">
      {/* Property Header */}
      <div className="page-header">
        <div className="page-header-text">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h1>{property.name}</h1>
            <Badge variant={property.type}>{property.type}</Badge>
          </div>
          <p>
            <MapPin size={14} style={{ display: "inline", marginRight: "4px" }} />
            {property.address?.street}, {property.address?.city}, {property.address?.state} - {property.address?.pincode}
          </p>
        </div>

        {isOwner && (
          <button onClick={handleDeleteProperty} className="btn btn-danger btn-sm">
            <Trash2 size={16} />
            <span>Delete Property</span>
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <Building2 size={18} />
          <span>Overview</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "rooms" ? "active" : ""}`}
          onClick={() => setActiveTab("rooms")}
        >
          <DoorOpen size={18} />
          <span>Rooms ({rooms.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "tenants" ? "active" : ""}`}
          onClick={() => setActiveTab("tenants")}
        >
          <Users size={18} />
          <span>Tenants ({tenants.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "rent" ? "active" : ""}`}
          onClick={() => setActiveTab("rent")}
        >
          <CreditCard size={18} />
          <span>Rent & Ledger</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "complaints" ? "active" : ""}`}
          onClick={() => setActiveTab("complaints")}
        >
          <MessageSquareWarning size={18} />
          <span>Complaints ({complaints.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="card">
          <h2 style={{ marginBottom: "1rem" }}>Property Information</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            {property.description}
          </p>

          <div className="form-row" style={{ marginBottom: "1.5rem" }}>
            <div className="card" style={{ background: "var(--bg-elevated)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Phone size={16} color="var(--primary)" />
                <h4 style={{ fontSize: "0.9rem" }}>Contact Phone</h4>
              </div>
              <p style={{ fontWeight: "600" }}>{property.contact?.phone}</p>
            </div>

            <div className="card" style={{ background: "var(--bg-elevated)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Mail size={16} color="var(--primary)" />
                <h4 style={{ fontSize: "0.9rem" }}>Contact Email</h4>
              </div>
              <p style={{ fontWeight: "600" }}>{property.contact?.email}</p>
            </div>
          </div>

          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Amenities</h3>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {property.amenities?.length > 0 ? (
              property.amenities.map((item, idx) => (
                <Badge key={idx} variant="primary">{item}</Badge>
              ))
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                WiFi, Power Backup, RO Water, Biometric Entry, Housekeeping
              </span>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ROOMS */}
      {activeTab === "rooms" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2>Rooms & Bed Allocation</h2>
            {isOwner && (
              <button onClick={() => setRoomModalOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={16} />
                <span>Add Room</span>
              </button>
            )}
          </div>

          {rooms.length === 0 ? (
            <EmptyState
              icon={DoorOpen}
              title="No rooms added yet"
              description="Create room numbers with capacity and monthly rent amounts."
              actionText={isOwner ? "Add First Room" : null}
              onAction={() => setRoomModalOpen(true)}
            />
          ) : (
            <div className="properties-grid">
              {rooms.map((room) => {
                const occupantsCount = room.occupants?.length || 0;
                const isFull = occupantsCount >= room.capacity;
                const percent = Math.min(100, Math.round((occupantsCount / room.capacity) * 100));

                return (
                  <div key={room._id} className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3>Room #{room.roomNumber}</h3>
                      <Badge variant={isFull ? "danger" : "success"}>
                        {isFull ? "Full" : "Vacant"}
                      </Badge>
                    </div>

                    <div style={{ margin: "1rem 0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
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

                      {isOwner && occupantsCount === 0 && (
                        <button
                          onClick={() => handleDeleteRoom(room._id)}
                          className="btn btn-outline btn-icon btn-sm"
                          title="Delete empty room"
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TENANTS */}
      {activeTab === "tenants" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2>Registered Residents</h2>
            {(isOwner || isCaretaker) && (
              <button onClick={() => setTenantModalOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={16} />
                <span>Register Tenant</span>
              </button>
            )}
          </div>

          {tenants.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No tenants registered"
              description="Register tenants to this property and assign them to vacant rooms."
              actionText={isOwner ? "Register First Tenant" : null}
              onAction={() => setTenantModalOpen(true)}
            />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tenant ID / User</th>
                    <th>Assigned Room</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => {
                    const assignedRoom = rooms.find((r) => r._id === t.room);

                    return (
                      <tr key={t._id}>
                        <td>
                          <div style={{ fontWeight: "600" }}>{t.user}</div>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ID: {t._id}</span>
                        </td>
                        <td>
                          {assignedRoom ? (
                            <Badge variant="success">Room #{assignedRoom.roomNumber}</Badge>
                          ) : (
                            <Badge variant="warning">No Room Assigned</Badge>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            {!t.room ? (
                              <button
                                onClick={() => {
                                  setSelectedTenant(t);
                                  setAssignModalOpen(true);
                                }}
                                className="btn btn-primary btn-sm"
                              >
                                Assign Room
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRemoveFromRoom(t._id)}
                                className="btn btn-outline btn-sm"
                              >
                                Remove Room
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RENT & LEDGER */}
      {activeTab === "rent" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2>Financial Ledger & Rent Records</h2>
            {selectedTenantForRent && (isOwner || isCaretaker) && (
              <button onClick={() => setRentModalOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={16} />
                <span>Create Rent Record</span>
              </button>
            )}
          </div>

          {/* Tenant Selector for Ledger */}
          {tenants.length > 0 && (
            <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Select Tenant:</span>
              <select
                className="form-select"
                style={{ maxWidth: "340px" }}
                value={selectedTenantForRent?._id || ""}
                onChange={(e) => {
                  const found = tenants.find((t) => t._id === e.target.value);
                  setSelectedTenantForRent(found);
                }}
              >
                {tenants.map((t) => (
                  <option key={t._id} value={t._id}>
                    Tenant: {t.user} (ID: {t._id.slice(-6)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Aggregated Ledger Card */}
          {rentLedger && (
            <div className="ledger-banner fade-in">
              <div className="ledger-metric">
                <h4>Total Rent Billed</h4>
                <span className="amount">₹{rentLedger.totalRent?.toLocaleString() || 0}</span>
              </div>
              <div className="ledger-metric">
                <h4>Total Paid</h4>
                <span className="amount" style={{ color: "#34d399" }}>
                  ₹{rentLedger.totalPaid?.toLocaleString() || 0}
                </span>
              </div>
              <div className="ledger-metric">
                <h4>Total Pending</h4>
                <span className="amount" style={{ color: "#fbbf24" }}>
                  ₹{rentLedger.totalPending?.toLocaleString() || 0}
                </span>
              </div>
              <div className="ledger-metric">
                <h4>Outstanding Balance</h4>
                <span className="amount" style={{ color: "#f87171" }}>
                  ₹{rentLedger.outstanding?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          )}

          {/* Rent Records Table */}
          {rentRecords.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No rent records found"
              description="Generate a monthly rent record with a due date for this tenant."
              actionText={isOwner ? "Generate Rent" : null}
              onAction={() => setRentModalOpen(true)}
            />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rent ID</th>
                    <th>Due Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rentRecords.map((rent) => (
                    <tr key={rent._id}>
                      <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                        {rent._id.slice(-8)}
                      </td>
                      <td>{new Date(rent.dueDate).toLocaleDateString()}</td>
                      <td style={{ fontWeight: "700" }}>₹{rent.amount?.toLocaleString()}</td>
                      <td>
                        <Badge variant={rent.status}>{rent.status}</Badge>
                      </td>
                      <td>
                        {rent.status !== "PAID" && (isOwner || isCaretaker) && (
                          <button
                            onClick={() => handleMarkRentPaid(rent._id)}
                            className="btn btn-primary btn-sm"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: COMPLAINTS */}
      {activeTab === "complaints" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2>Maintenance & Complaints</h2>
          </div>

          {complaints.length === 0 ? (
            <EmptyState
              icon={MessageSquareWarning}
              title="No complaints reported"
              description="Great! There are no outstanding maintenance issues reported for this property."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {complaints.map((c) => (
                <div key={c._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
                      <h3 style={{ fontSize: "1.1rem" }}>{c.title}</h3>
                      <Badge variant={c.status}>{c.status}</Badge>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{c.description}</p>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "inline-block", marginTop: "0.5rem" }}>
                      Reported on: {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {(isOwner || isCaretaker) && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {c.status !== "IN_PROGRESS" && c.status !== "RESOLVED" && (
                        <button
                          onClick={() => handleUpdateComplaintStatus(c._id, "IN_PROGRESS")}
                          className="btn btn-secondary btn-sm"
                        >
                          <Clock size={15} />
                          <span>In Progress</span>
                        </button>
                      )}
                      {c.status !== "RESOLVED" && (
                        <button
                          onClick={() => handleUpdateComplaintStatus(c._id, "RESOLVED")}
                          className="btn btn-primary btn-sm"
                        >
                          <CheckCircle2 size={15} />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD ROOM */}
      <Modal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        title="Add Room to Property"
      >
        <form onSubmit={handleCreateRoom}>
          <div className="form-group">
            <label className="form-label">Room Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 101, 202-A"
              value={roomForm.roomNumber}
              onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Capacity (Beds)</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Rent (₹)</label>
              <input
                type="number"
                min="0"
                step="500"
                className="form-input"
                value={roomForm.rentAmount}
                onChange={(e) => setRoomForm({ ...roomForm, rentAmount: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="button" className="btn btn-outline" onClick={() => setRoomModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Room
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: REGISTER TENANT */}
      <Modal
        isOpen={tenantModalOpen}
        onClose={() => setTenantModalOpen(false)}
        title="Register Tenant"
      >
        <form onSubmit={handleAddTenant}>
          <div className="form-group">
            <label className="form-label">Tenant User ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter User ObjectId of registered tenant"
              value={tenantUserId}
              onChange={(e) => setTenantUserId(e.target.value)}
              required
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
              Note: The user must already be registered in StayOS with the 'TENANT' role.
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="button" className="btn btn-outline" onClick={() => setTenantModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Tenant
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ASSIGN ROOM */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Tenant to Room"
      >
        <form onSubmit={handleAssignRoom}>
          <div className="form-group">
            <label className="form-label">Choose Vacant Room</label>
            <select
              className="form-select"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              required
            >
              <option value="">-- Select a Room --</option>
              {rooms
                .filter((r) => r.occupants?.length < r.capacity)
                .map((r) => (
                  <option key={r._id} value={r._id}>
                    Room #{r.roomNumber} ({r.occupants?.length || 0}/{r.capacity} occupied) - ₹{r.rentAmount}/mo
                  </option>
                ))}
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="button" className="btn btn-outline" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Assign to Room
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CREATE RENT RECORD */}
      <Modal
        isOpen={rentModalOpen}
        onClose={() => setRentModalOpen(false)}
        title="Generate Monthly Rent"
      >
        <form onSubmit={handleCreateRent}>
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 6000"
              value={rentForm.amount}
              onChange={(e) => setRentForm({ ...rentForm, amount: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={rentForm.dueDate}
              onChange={(e) => setRentForm({ ...rentForm, dueDate: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="button" className="btn btn-outline" onClick={() => setRentModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Rent Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
