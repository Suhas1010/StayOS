import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { propertyApi } from "../../api/property.api";
import { complaintApi } from "../../api/complaint.api";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import {
  MessageSquareWarning,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
} from "lucide-react";

export const ComplaintsPage = () => {
  const { user, isOwner, isCaretaker, isTenant } = useAuth();
  const { showToast } = useToast();

  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Raise complaint modal for Tenant
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    title: "",
    description: "",
  });

  // Load stay info for Tenant OR properties for Owner/Caretaker
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        if (isTenant) {
          const stayRes = await tenantApi.getMyStay();
          if (stayRes.data && stayRes.data.property) {
            setSelectedPropertyId(stayRes.data.property._id);
          }
        } else {
          const res = await propertyApi.getProperties();
          const list = res.data?.properties || [];
          setProperties(list);
          if (list.length > 0) {
            setSelectedPropertyId(list[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [isTenant]);

  // Load complaints for selected property
  const loadComplaints = async () => {
    if (!selectedPropertyId) return;

    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      let res;
      if (isTenant) {
        res = await complaintApi.getMyComplaints(selectedPropertyId, params);
      } else {
        res = await complaintApi.getComplaints(selectedPropertyId, params);
      }
      setComplaints(res.data?.complaints || []);
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [selectedPropertyId, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadComplaints();
  };

  const handleRaiseComplaint = async (e) => {
    e.preventDefault();
    if (!selectedPropertyId) {
      showToast("Please select a property first", "error");
      return;
    }

    try {
      await complaintApi.createComplaint(selectedPropertyId, complaintForm);
      showToast("Complaint reported successfully!", "success");
      setIsModalOpen(false);
      setComplaintForm({ title: "", description: "" });
      loadComplaints();
    } catch (err) {
      showToast(err.friendlyMessage || "Failed to submit complaint", "error");
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      await complaintApi.updateStatus(selectedPropertyId, complaintId, newStatus);
      showToast(`Status updated to ${newStatus}`, "success");
      loadComplaints();
    } catch (err) {
      showToast(err.friendlyMessage || "Failed to update complaint", "error");
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Complaints & Maintenance Hub</h1>
          <p>
            {isTenant
              ? "Report issues regarding WiFi, electricity, plumbing, or room cleanliness."
              : "Track and resolve maintenance tickets logged by property residents."}
          </p>
        </div>

        {isTenant && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Raise Complaint</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          {properties.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Property:</span>
              <select
                className="form-select"
                style={{ minWidth: "220px" }}
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
          )}

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="REPORTED">Reported</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="search-input"
            placeholder="Search complaint title or issue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {loading ? (
        <Spinner />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="No complaints found"
          description="Everything is running smoothly! No tickets match your filters."
          actionText={isTenant ? "Raise an Issue" : null}
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {complaints.map((c) => (
            <div key={c._id} className="card card-hover" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.25rem" }}>
              <div style={{ flex: 1, minWidth: "280px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.15rem" }}>{c.title}</h3>
                  <Badge variant={c.status}>{c.status}</Badge>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6" }}>
                  {c.description}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.75rem", color: "var(--text-muted)", fontSize: "0.775rem" }}>
                  <Calendar size={14} />
                  <span>Reported on {new Date(c.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {(isOwner || isCaretaker) && (
                <div style={{ display: "flex", gap: "0.5rem", alignSelf: "center" }}>
                  {c.status !== "IN_PROGRESS" && c.status !== "RESOLVED" && (
                    <button
                      onClick={() => handleUpdateStatus(c._id, "IN_PROGRESS")}
                      className="btn btn-secondary btn-sm"
                    >
                      <Clock size={15} />
                      <span>Start Working</span>
                    </button>
                  )}
                  {c.status !== "RESOLVED" && (
                    <button
                      onClick={() => handleUpdateStatus(c._id, "RESOLVED")}
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

      {/* Modal: Raise Complaint */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Raise Maintenance Ticket"
      >
        <form onSubmit={handleRaiseComplaint}>
          <div className="form-group">
            <label className="form-label">Issue Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. WiFi not connecting in Room 102"
              value={complaintForm.title}
              onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea
              className="form-textarea"
              placeholder="Please specify details (when it started, error messages, etc.)..."
              value={complaintForm.description}
              onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Complaint
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
