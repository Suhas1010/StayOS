import apiClient from "./client";

/**
 * Room API Service
 * Encapsulates room management endpoints (/api/v1/properties/:propertyId/rooms/*).
 */

export const roomApi = {
  // Get rooms under a specific property with search, capacity filter, pagination
  getRooms: (propertyId, params = {}) =>
    apiClient.get(`/properties/${propertyId}/rooms`, { params }),

  // Get a single room by ID
  getRoomById: (propertyId, roomId) =>
    apiClient.get(`/properties/${propertyId}/rooms/${roomId}`),

  // Create a room under a property
  createRoom: (propertyId, data) =>
    apiClient.post(`/properties/${propertyId}/rooms`, data),

  // Update room capacity or rent amount
  updateRoom: (propertyId, roomId, data) =>
    apiClient.patch(`/properties/${propertyId}/rooms/${roomId}`, data),

  // Delete a room (must have 0 occupants)
  deleteRoom: (propertyId, roomId) =>
    apiClient.delete(`/properties/${propertyId}/rooms/${roomId}`),
};
