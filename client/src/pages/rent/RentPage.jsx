import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { propertyApi } from "../../api/property.api";
import { tenantApi } from "../../api/tenant.api";
import { rentApi } from "../../api/rent.api";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { CreditCard, CheckCircle2, DollarSign, Calendar } from "lucide-react";

export const RentPage = () => {
  const { user, isOwner, isCaretaker, isTenant } = useAuth();
  const { showToast } = useToast();

  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [rentRecords, setRentRecords] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load stay info for Tenant OR properties for Owner/Caretaker
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        if (isTenant) {
          const stayRes = await tenantApi.getMyStay();
          if (stayRes.data && stayRes.data.property) {
            setSelectedPropertyId(stayRes.data.property._id);
            setSelectedTenantId(stayRes.data._id);
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

  // Load tenants when property is selected
  useEffect(() => {
    if (!selectedPropertyId || isTenant) return;

    const loadTenants = async () => {
      try {
        const res = await tenantApi.getTenants(selectedPropertyId);
        const list = res.data?.tenants || [];
        setTenants(list);
        if (list.length > 0) {
          setSelectedTenantId(list[0]._id);
        } else {
          setSelectedTenantId("");
          setRentRecords([]);
          setLedger(null);
        }
      } catch {
        setTenants([]);
      }
    };
    loadTenants();
  }, [selectedPropertyId, isTenant]);

  // Load rent and ledger when tenant is selected
  useEffect(() => {
    if (!selectedPropertyId || !selectedTenantId) return;

    const loadRentAndLedger = async () => {
      setLoading(true);
      try {
        const rentRes = await rentApi.getRent(selectedPropertyId, selectedTenantId);
        setRentRecords(rentRes.data?.rent || []);
      } catch {
        setRentRecords([]);
      }

      try {
        const ledgerRes = await rentApi.getLedger(selectedPropertyId, selectedTenantId);
        setLedger(ledgerRes.data);
      } catch {
        setLedger(null);
      } finally {
        setLoading(false);
      }
    };
    loadRentAndLedger();
  }, [selectedPropertyId, selectedTenantId]);

  const handleMarkPaid = async (rentId) => {
    try {
      await rentApi.markPaid(selectedPropertyId, selectedTenantId, rentId);
      showToast("Rent marked as PAID", "success");

      // Reload rent data
      const rentRes = await rentApi.getRent(selectedPropertyId, selectedTenantId);
      setRentRecords(rentRes.data?.rent || []);
      const ledgerRes = await rentApi.getLedger(selectedPropertyId, selectedTenantId);
      setLedger(ledgerRes.data);
    } catch (err) {
      showToast(err.friendlyMessage || "Failed to mark rent as paid", "error");
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Financial Ledger & Rent Records</h1>
          <p>
            {isTenant
              ? "Track your monthly rent invoices, due dates, and payment history."
              : "Financial accounting ledger, tracking paid, pending, and overdue rent."}
          </p>
        </div>
      </div>

      {/* Selectors for Owner / Caretaker */}
      {(isOwner || isCaretaker) && (
        <div className="filter-bar">
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
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

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Tenant:</span>
              <select
                className="form-select"
                style={{ minWidth: "240px" }}
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                disabled={tenants.length === 0}
              >
                {tenants.map((t) => (
                  <option key={t._id} value={t._id}>
                    Tenant ID #{t._id.slice(-6)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Aggregated Ledger Metrics */}
      {ledger && (
        <div className="ledger-banner fade-in">
          <div className="ledger-metric">
            <h4>Total Rent Generated</h4>
            <span className="amount">₹{ledger.totalRent?.toLocaleString() || 0}</span>
          </div>
          <div className="ledger-metric">
            <h4>Total Collected</h4>
            <span className="amount" style={{ color: "#34d399" }}>
              ₹{ledger.totalPaid?.toLocaleString() || 0}
            </span>
          </div>
          <div className="ledger-metric">
            <h4>Pending Payment</h4>
            <span className="amount" style={{ color: "#fbbf24" }}>
              ₹{ledger.totalPending?.toLocaleString() || 0}
            </span>
          </div>
          <div className="ledger-metric">
            <h4>Outstanding Balance</h4>
            <span className="amount" style={{ color: "#f87171" }}>
              ₹{ledger.outstanding?.toLocaleString() || 0}
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : rentRecords.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No rent records found"
          description={
            isTenant
              ? "You do not have any pending rent invoices."
              : "No rent records have been generated for the selected tenant."
          }
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentRecords.map((r) => (
                <tr key={r._id}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                    INV-{r._id.slice(-6).toUpperCase()}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      <span>{new Date(r.dueDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: "1.05rem", fontWeight: "700" }}>
                    ₹{r.amount?.toLocaleString()}
                  </td>
                  <td>
                    <Badge variant={r.status}>{r.status}</Badge>
                  </td>
                  <td>
                    {r.status !== "PAID" && (
                      <button
                        onClick={() => handleMarkPaid(r._id)}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle2 size={14} />
                        <span>Pay Rent</span>
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
  );
};
