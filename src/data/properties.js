import axios from "axios";
import { getToken } from "../lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function getAuthHeaders() {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}

// Fetch all properties from live backend / MongoDB
export async function fetchProperties(status = "") {
  const response = await axios.get(`${API_BASE}/api/properties`, {
    params: status ? { status } : {},
  });
  return response.data;
}

// Fetch a single property by ID or slug
export async function fetchPropertyByIdOrSlug(idOrSlug) {
  const response = await axios.get(`${API_BASE}/api/properties/${idOrSlug}`);
  return response.data;
}

// Create a new property
export async function createProperty(propertyData) {
  const response = await axios.post(`${API_BASE}/api/properties`, propertyData, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

// Update a property by Mongo ID
export async function updateProperty(mongoId, propertyData) {
  const response = await axios.put(`${API_BASE}/api/properties/${mongoId}`, propertyData, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

// Delete a property by Mongo ID
export async function deleteProperty(mongoId) {
  const response = await axios.delete(`${API_BASE}/api/properties/${mongoId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}
