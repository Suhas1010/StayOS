import apiClient from "./client";

/**
 * Tenant API Service
 * Encapsulates tenant management endpoints (/api/v1/properties/:propertyId/tenants/*).
 */

export const tenantApi = {
  // Get all tenants in a property with search and room filter
  getTenants: (propertyId, params = {}) =>
    apiClient.get(`/properties/${propertyId}/tenants`, { params }),

  // Get single tenant details by ID
  getTenantById: (propertyId, tenantId) =>
    apiClient.get(`/properties/${propertyId}/tenants/${tenantId}`),

  // Register an existing user as a tenant of this property
  createTenant: (propertyId, data) =>
    apiClient.post(`/properties/${propertyId}/tenants`, data),

  // Update tenant's profile details
  updateTenant: (propertyId, tenantId, data) =>
    apiClient.patch(`/properties/${propertyId}/tenants/${tenantId}`, data),

  // Delete a tenant
  deleteTenant: (propertyId, tenantId) =>
    apiClient.delete(`/properties/${propertyId}/tenants/${tenantId}`),

  // Assign a tenant to a room
  assignRoom: (propertyId, tenantId, roomId) =>
    apiClient.post(`/properties/${propertyId}/tenants/${tenantId}/assign-room`, {
      roomId,
    }),

  // Remove a tenant from their current room
  removeRoom: (propertyId, tenantId) =>
    apiClient.post(`/properties/${propertyId}/tenants/${tenantId}/remove-room`),

  // Get active stay details for the logged-in tenant
  getMyStay: () => apiClient.get("/tenants/my-stay"),
};
