import apiClient from "./client";

/**
 * Property API Service
 * Encapsulates property management endpoints (/api/v1/properties/*).
 */

export const propertyApi = {
  // Get paginated list of properties with optional search and type filter
  getProperties: (params = {}) => apiClient.get("/properties", { params }),

  // Get a single property by its ID
  getPropertyById: (propertyId) => apiClient.get(`/properties/${propertyId}`),

  // Create a new property (OWNER only)
  createProperty: (data) => apiClient.post("/properties", data),

  // Update an existing property (OWNER only)
  updateProperty: (propertyId, data) =>
    apiClient.patch(`/properties/${propertyId}`, data),

  // Delete a property and its cascaded rooms/tenants (OWNER only)
  deleteProperty: (propertyId) => apiClient.delete(`/properties/${propertyId}`),

  // Assign a caretaker to a property (OWNER only)
  assignCaretaker: (propertyId, caretakerId) =>
    apiClient.put(`/properties/${propertyId}/caretaker`, { caretakerId }),
};
