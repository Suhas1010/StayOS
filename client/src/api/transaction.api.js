import apiClient from "./client";

/**
 * Transaction & Financial Payments API Service
 * Interacts with /api/v1/properties/:propertyId/.../transactions endpoints.
 */

export const transactionApi = {
  // Create a new transaction (records payment and marks rent as PAID)
  createTransaction: (propertyId, tenantId, rentId, data) =>
    apiClient.post(
      `/properties/${propertyId}/tenants/${tenantId}/rent/${rentId}/transactions`,
      data
    ),

  // Get all transactions for a specific tenant (Owner & Caretaker view)
  getTransactions: (propertyId, tenantId, params = {}) =>
    apiClient.get(
      `/properties/${propertyId}/tenants/${tenantId}/transactions`,
      { params }
    ),

  // Get personal transactions for logged-in Tenant
  getMyTransactions: (propertyId, params = {}) =>
    apiClient.get(`/properties/${propertyId}/transactions/my-transactions`, {
      params,
    }),

  // Get a single transaction by ID
  getTransactionById: (propertyId, tenantId, rentId, transactionId) =>
    apiClient.get(
      `/properties/${propertyId}/tenants/${tenantId}/rent/${rentId}/transactions/${transactionId}`
    ),

  // Update transaction metadata (e.g. payment date, payment method, UTR reference)
  updateTransaction: (propertyId, tenantId, rentId, transactionId, data) =>
    apiClient.put(
      `/properties/${propertyId}/tenants/${tenantId}/rent/${rentId}/transactions/${transactionId}`,
      data
    ),
};
