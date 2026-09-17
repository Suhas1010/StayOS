import apiClient from "./client";

/**
 * Rent & Financial Ledger API Service
 * Encapsulates rent and ledger endpoints (/api/v1/properties/:propertyId/tenants/:tenantId/rent/*).
 */

export const rentApi = {
  // Get rent records for a tenant with optional status filter & pagination
  getRent: (propertyId, tenantId, params = {}) =>
    apiClient.get(`/properties/${propertyId}/tenants/${tenantId}/rent`, {
      params,
    }),

  // Get a single rent record
  getRentById: (propertyId, tenantId, rentId) =>
    apiClient.get(
      `/properties/${propertyId}/tenants/${tenantId}/rent/${rentId}`
    ),

  // Create a new rent record for a tenant
  createRent: (propertyId, tenantId, data) =>
    apiClient.post(`/properties/${propertyId}/tenants/${tenantId}/rent`, data),

  // Update a rent record (amount, dueDate, status)
  updateRent: (propertyId, tenantId, rentId, data) =>
    apiClient.patch(
      `/properties/${propertyId}/tenants/${tenantId}/rent/${rentId}`,
      data
    ),

  // Delete a rent record
  deleteRent: (propertyId, tenantId, rentId) =>
    apiClient.delete(
      `/properties/${propertyId}/tenants/${tenantId}/rent/${rentId}`
    ),

  // Mark a rent record as PAID
  markPaid: (propertyId, tenantId, rentId) =>
    apiClient.post(
      `/properties/${propertyId}/tenants/${tenantId}/rent/${rentId}/pay`
    ),

  // Fetch aggregated rent ledger (totalRent, totalPaid, totalPending, totalOverdue, outstanding)
  getLedger: (propertyId, tenantId) =>
    apiClient.get(
      `/properties/${propertyId}/tenants/${tenantId}/rent/ledger`
    ),
};
