import apiClient from "./client";

/**
 * Complaint API Service
 * Encapsulates complaint management endpoints (/api/v1/properties/:propertyId/complaints/*).
 */

export const complaintApi = {
  // Create a new complaint (TENANT only)
  createComplaint: (propertyId, data) =>
    apiClient.post(`/properties/${propertyId}/complaints`, data),

  // Get complaints for a property (OWNER and CARETAKER) with search and status filter
  getComplaints: (propertyId, params = {}) =>
    apiClient.get(`/properties/${propertyId}/complaints`, { params }),

  // Get personal complaints submitted by the logged-in tenant
  getMyComplaints: (propertyId, params = {}) =>
    apiClient.get(`/properties/${propertyId}/complaints/my-complaints`, {
      params,
    }),

  // Get a single complaint by ID
  getComplaintById: (propertyId, complaintId) =>
    apiClient.get(`/properties/${propertyId}/complaints/${complaintId}`),

  // Update complaint status (REPORTED, IN_PROGRESS, RESOLVED)
  updateStatus: (propertyId, complaintId, status) =>
    apiClient.patch(`/properties/${propertyId}/complaints/${complaintId}/status`, {
      status,
    }),

  // Delete a complaint (OWNER only)
  deleteComplaint: (propertyId, complaintId) =>
    apiClient.delete(`/properties/${propertyId}/complaints/${complaintId}`),
};
