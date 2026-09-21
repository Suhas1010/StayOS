import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { propertyApi } from "../../api/property.api";
import { tenantApi } from "../../api/tenant.api";
import { rentApi } from "../../api/rent.api";
import { transactionApi } from "../../api/transaction.api";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Modal } from "../../components/common/Modal";
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  History,
  Receipt,
  FileText,
  Printer,
  DollarSign,
  Tag,
  Hash,
  ShieldCheck,
} from "lucide-react";

export const RentPage = () => {
  const { user, isOwner, isCaretaker, isTenant } = useAuth();
  const { showToast } = useToast();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState("rent"); // "rent" | "transactions"

  // Selection states
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");

  // Data states
  const [rentRecords, setRentRecords] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Payment modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRentForPayment, setSelectedRentForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [transactionReference, setTransactionReference] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Receipt modal states
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

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
        console.error("Failed to load initial properties/stay:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [isTenant]);

  // Load tenants when property is selected (Owner & Caretaker)
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
          setTransactions([]);
          setLedger(null);
        }
      } catch {
        setTenants([]);
      }
    };
    loadTenants();
  }, [selectedPropertyId, isTenant]);

  // Fetch transactions list
  const fetchTransactions = useCallback(async () => {
    if (!selectedPropertyId) return;
    setLoadingTransactions(true);
    try {
      if (isTenant) {
        const res = await transactionApi.getMyTransactions(selectedPropertyId);
        setTransactions(res.data?.transactions || []);
      } else if (selectedTenantId) {
        const res = await transactionApi.getTransactions(
          selectedPropertyId,
          selectedTenantId
        );
        setTransactions(res.data?.transactions || []);
      }
    } catch {
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  }, [selectedPropertyId, selectedTenantId, isTenant]);

  // Load rent, ledger, and transactions when selection changes
  useEffect(() => {
    if (!selectedPropertyId) return;
    if (!isTenant && !selectedTenantId) return;

    const loadFinancialData = async () => {
      setLoading(true);
      try {
        const rentRes = await rentApi.getRent(
          selectedPropertyId,
          selectedTenantId
        );
        setRentRecords(rentRes.data?.rent || []);
      } catch {
        setRentRecords([]);
      }

      try {
        const ledgerRes = await rentApi.getLedger(
          selectedPropertyId,
          selectedTenantId
        );
        setLedger(ledgerRes.data);
      } catch {
        setLedger(null);
      } finally {
        setLoading(false);
      }

      // Also refresh transactions
      fetchTransactions();
    };

    loadFinancialData();
  }, [selectedPropertyId, selectedTenantId, isTenant, fetchTransactions]);

  // Open Payment Modal
  const openPaymentModal = (rent) => {
    setSelectedRentForPayment(rent);
    setPaymentMethod("UPI");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setTransactionReference("");
    setIsPaymentModalOpen(true);
  };

  // Submit Payment / Record Transaction
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedRentForPayment) return;

    setIsSubmittingPayment(true);
    try {
      const payload = {
        amount: Number(selectedRentForPayment.amount),
        paymentDate,
        paymentMethod,
        transactionId: transactionReference.trim() || undefined,
      };

      await transactionApi.createTransaction(
        selectedPropertyId,
        selectedTenantId,
        selectedRentForPayment._id,
        payload
      );

      showToast("Payment recorded successfully!", "success");
      setIsPaymentModalOpen(false);
      setSelectedRentForPayment(null);

      // Refresh rent list & ledger
      const rentRes = await rentApi.getRent(
        selectedPropertyId,
        selectedTenantId
      );
      setRentRecords(rentRes.data?.rent || []);

      const ledgerRes = await rentApi.getLedger(
        selectedPropertyId,
        selectedTenantId
      );
      setLedger(ledgerRes.data);

      // Refresh transactions
      fetchTransactions();
    } catch (err) {
      showToast(err.friendlyMessage || "Failed to record payment", "error");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Open Receipt Modal
  const openReceiptModal = (item) => {
    // If it's already a full transaction
    if (item.paymentMethod && item.amount) {
      setSelectedReceipt(item);
      setIsReceiptModalOpen(true);
      return;
    }

    // If it's a paid rent record, find the associated transaction in transactions list
    const matched = transactions.find(
      (tx) => tx.rent === item._id || tx.rent?._id === item._id
    );
    if (matched) {
      setSelectedReceipt(matched);
      setIsReceiptModalOpen(true);
    } else {
      // Create synthetic receipt view from rent details
      setSelectedReceipt({
        _id: item._id,
        amount: item.amount,
        paymentDate: item.updatedAt || item.dueDate,
        paymentMethod: "CASH / RECORDED",
        transactionId: `INV-${item._id.slice(-6).toUpperCase()}`,
        status: "SUCCESS",
        rent: item._id,
      });
      setIsReceiptModalOpen(true);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Financial Ledger & Transactions</h1>
          <p>
            {isTenant
              ? "Track your rent invoices, payment receipts, and transaction history."
              : "Financial accounting ledger, rent invoicing, and transaction auditing."}
          </p>
        </div>
      </div>

      {/* Selectors for Owner / Caretaker */}
      {(isOwner || isCaretaker) && (
        <div className="filter-bar">
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Property:
              </span>
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
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Tenant:
              </span>
              <select
                className="form-select"
                style={{ minWidth: "240px" }}
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                disabled={tenants.length === 0}
              >
                {tenants.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.user?.fullName
                      ? `${t.user.fullName} (#${t._id.slice(-6)})`
                      : `Tenant ID #${t._id.slice(-6)}`}
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
            <h4>Total Rent Invoiced</h4>
            <span className="amount">
              ₹{ledger.totalRent?.toLocaleString() || 0}
            </span>
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

      {/* Tab Navigation */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === "rent" ? "active" : ""}`}
          onClick={() => setActiveTab("rent")}
        >
          <CreditCard size={18} />
          <span>Rent Records & Invoices</span>
          <span className="tab-badge">{rentRecords.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "transactions" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("transactions");
            fetchTransactions();
          }}
        >
          <History size={18} />
          <span>Transactions & Receipts</span>
          <span className="tab-badge">{transactions.length}</span>
        </button>
      </div>

      {/* TAB 1: RENT RECORDS */}
      {activeTab === "rent" && (
        <>
          {loading ? (
            <Spinner />
          ) : rentRecords.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No rent records found"
              description={
                isTenant
                  ? "You do not have any rent invoices registered for this stay."
                  : "No rent records have been generated for the selected tenant."
              }
            />
          ) : (
            <div className="table-container fade-in">
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
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                          }}
                        >
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
                        {r.status === "PAID" ? (
                          <button
                            onClick={() => openReceiptModal(r)}
                            className="btn btn-outline btn-sm"
                            title="View receipt"
                          >
                            <Receipt size={14} />
                            <span>Receipt</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openPaymentModal(r)}
                            className="btn btn-primary btn-sm"
                          >
                            <CheckCircle2 size={14} />
                            <span>
                              {isTenant ? "Pay Rent" : "Record Payment"}
                            </span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* TAB 2: TRANSACTION HISTORY */}
      {activeTab === "transactions" && (
        <>
          {loadingTransactions ? (
            <Spinner />
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={History}
              title="No transactions found"
              description={
                isTenant
                  ? "No payment transactions have been recorded for your account yet."
                  : "No payment transactions recorded for this tenant yet."
              }
            />
          ) : (
            <div className="table-container fade-in">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ref / TX ID</th>
                    <th>Rent Invoice</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Paid Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                        {tx.transactionId || `TX-${tx._id.slice(-6).toUpperCase()}`}
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        {tx.rent
                          ? typeof tx.rent === "object"
                            ? `INV-${tx.rent._id.slice(-6).toUpperCase()}`
                            : `INV-${String(tx.rent).slice(-6).toUpperCase()}`
                          : "N/A"}
                      </td>
                      <td
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: "700",
                          color: "#34d399",
                        }}
                      >
                        ₹{tx.amount?.toLocaleString()}
                      </td>
                      <td>
                        <Badge variant={tx.paymentMethod}>
                          {tx.paymentMethod}
                        </Badge>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <Calendar size={14} color="var(--text-muted)" />
                          <span>
                            {new Date(tx.paymentDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <Badge variant={tx.status}>{tx.status}</Badge>
                      </td>
                      <td>
                        <button
                          onClick={() => openReceiptModal(tx)}
                          className="btn btn-outline btn-sm"
                          title="View receipt"
                        >
                          <Receipt size={14} />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* RECORD PAYMENT / PAY RENT MODAL */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={isTenant ? "Pay Rent Invoice" : "Record Rent Payment"}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="btn btn-outline"
              disabled={isSubmittingPayment}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="payment-form"
              className="btn btn-primary"
              disabled={isSubmittingPayment}
            >
              {isSubmittingPayment ? (
                <span>Recording...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Confirm & Record</span>
                </>
              )}
            </button>
          </>
        }
      >
        {selectedRentForPayment && (
          <form id="payment-form" onSubmit={handleRecordPayment}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                marginBottom: "1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Invoice Reference
                </span>
                <div style={{ fontWeight: "600", fontFamily: "monospace" }}>
                  INV-{selectedRentForPayment._id.slice(-6).toUpperCase()}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Due Amount
                </span>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "700",
                    color: "#34d399",
                  }}
                >
                  ₹{selectedRentForPayment.amount?.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                <option value="CASH">Cash Payment</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT / IMPS)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Date</label>
              <input
                type="date"
                className="form-input"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Transaction ID / Reference / UTR Number
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.4rem" }}>
                  (Optional)
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. UPI/429184920194 or CHQ-00129"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
              />
            </div>
          </form>
        )}
      </Modal>

      {/* PAYMENT RECEIPT MODAL */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Official Payment Receipt"
        footer={
          <>
            <button
              onClick={() => window.print()}
              className="btn btn-outline"
            >
              <Printer size={16} />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="btn btn-primary"
            >
              Done
            </button>
          </>
        }
      >
        {selectedReceipt && (
          <div className="receipt-card fade-in">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--border-subtle)",
                paddingBottom: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldCheck size={24} color="var(--primary)" />
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>StayOS</h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Verified Payment Receipt
                  </span>
                </div>
              </div>
              <Badge variant={selectedReceipt.status || "SUCCESS"}>
                {selectedReceipt.status || "SUCCESS"}
              </Badge>
            </div>

            <div className="receipt-amount-box">
              <div className="receipt-amount-label">Total Amount Paid</div>
              <div className="receipt-amount-value">
                ₹{selectedReceipt.amount?.toLocaleString()}
              </div>
            </div>

            <div className="receipt-details-list">
              <div className="receipt-item">
                <span className="receipt-item-label">Transaction Reference:</span>
                <span className="receipt-item-value" style={{ fontFamily: "monospace" }}>
                  {selectedReceipt.transactionId ||
                    `TX-${selectedReceipt._id?.slice(-8).toUpperCase()}`}
                </span>
              </div>

              <div className="receipt-item">
                <span className="receipt-item-label">Payment Method:</span>
                <span className="receipt-item-value">
                  <Badge variant={selectedReceipt.paymentMethod}>
                    {selectedReceipt.paymentMethod}
                  </Badge>
                </span>
              </div>

              <div className="receipt-item">
                <span className="receipt-item-label">Date of Payment:</span>
                <span className="receipt-item-value">
                  {new Date(selectedReceipt.paymentDate).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>

              {selectedReceipt.rent && (
                <div className="receipt-item">
                  <span className="receipt-item-label">Rent Invoice:</span>
                  <span className="receipt-item-value" style={{ fontFamily: "monospace" }}>
                    INV-{String(selectedReceipt.rent?._id || selectedReceipt.rent).slice(-6).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="receipt-item">
                <span className="receipt-item-label">System Receipt ID:</span>
                <span className="receipt-item-value" style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {selectedReceipt._id}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
