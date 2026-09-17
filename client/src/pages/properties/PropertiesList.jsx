import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { propertyApi } from "../../api/property.api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";

export const PropertiesList = () => {
  const { isOwner } = useAuth();
  const { showToast } = useToast();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for creating a property
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "PG",
    street: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    phone: "",
    email: "",
  });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterType) params.type = filterType;

      const res = await propertyApi.getProperties(params);
      setProperties(res.data?.properties || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setProperties([]);
      } else {
        showToast(err.friendlyMessage || "Failed to load properties", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [filterType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: form.name,
      description: form.description,
      type: form.type,
      address: {
        street: form.street,
        city: form.city,
        state: form.state,
        country: form.country,
        pincode: form.pincode,
      },
      contact: {
        phone: form.phone,
        email: form.email,
      },
    };

    try {
      await propertyApi.createProperty(payload);
      showToast("Property registered successfully!", "success");
      setIsModalOpen(false);
      // Reset form
      setForm({
        name: "",
        description: "",
        type: "PG",
        street: "",
        city: "",
        state: "",
        country: "India",
        pincode: "",
        phone: "",
        email: "",
      });
      fetchProperties();
    } catch (err) {
      showToast(err.friendlyMessage || "Could not create property", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Properties Directory</h1>
          <p>Explore, create, and manage your PG, Hostel, and Co-Living locations.</p>
        </div>

        {isOwner && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Property</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by property name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="filter-actions">
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ minWidth: "150px" }}
          >
            <option value="">All Types</option>
            <option value="PG">PG</option>
            <option value="HOSTEL">Hostel</option>
            <option value="APARTMENT">Apartment</option>
          </select>

          <button onClick={fetchProperties} className="btn btn-secondary">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Spinner />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties found"
          description="We couldn't find any properties matching your criteria."
          actionText={isOwner ? "Create Your First Property" : null}
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property._id} className="card card-hover">
              <div className="property-card-header">
                <div>
                  <h3 className="property-title">{property.name}</h3>
                  <span className="property-address">
                    <MapPin size={14} />
                    {property.address?.city}, {property.address?.state}
                  </span>
                </div>
                <Badge variant={property.type}>{property.type}</Badge>
              </div>

              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.875rem",
                  marginBottom: "1rem",
                  minHeight: "42px",
                }}
              >
                {property.description}
              </p>

              <div
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: "0.85rem",
                  marginBottom: "1rem",
                  fontSize: "0.825rem",
                  color: "var(--text-muted)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Phone size={13} />
                  <span>{property.contact?.phone || "No phone"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Mail size={13} />
                  <span>{property.contact?.email || "No email"}</span>
                </div>
              </div>

              <Link
                to={`/properties/${property._id}`}
                className="btn btn-secondary"
                style={{ width: "100%" }}
              >
                <span>Manage Details</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Property"
      >
        <form onSubmit={handleCreateProperty}>
          <div className="form-group">
            <label className="form-label">Property Name</label>
            <input
              name="name"
              type="text"
              className="form-input"
              placeholder="e.g. Sunrise Co-Living Space"
              value={form.name}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                name="type"
                className="form-select"
                value={form.type}
                onChange={handleFormChange}
              >
                <option value="PG">PG</option>
                <option value="HOSTEL">Hostel</option>
                <option value="APARTMENT">Apartment</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                name="phone"
                type="tel"
                className="form-input"
                placeholder="+91 9876543210"
                value={form.phone}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="contact@property.com"
              value={form.email}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input
              name="street"
              type="text"
              className="form-input"
              placeholder="12th Main, Indiranagar"
              value={form.street}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                name="city"
                type="text"
                className="form-input"
                placeholder="Bengaluru"
                value={form.city}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                name="state"
                type="text"
                className="form-input"
                placeholder="Karnataka"
                value={form.state}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                name="pincode"
                type="text"
                className="form-input"
                placeholder="560038"
                value={form.pincode}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              placeholder="Describe amenities, location highlights, rules..."
              value={form.description}
              onChange={handleFormChange}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Save Property"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
