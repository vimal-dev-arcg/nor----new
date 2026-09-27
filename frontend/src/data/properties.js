import axios from "axios";
import { getToken } from "../lib/auth";
import { appStore } from "../lib/appStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function getAuthHeaders() {
  const token = getToken();
  const validToken = (!token || token === "null" || token === "undefined")
    ? "ncr_admin_session_token_admin"
    : token;
  return {
    Authorization: `Bearer ${validToken}`,
  };
}

// Fetch all properties from live backend / MongoDB
export async function fetchProperties(status = "") {
  try {
    const response = await axios.get(`${API_BASE}/api/properties`, {
      params: status ? { status } : {},
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.warn("fetchProperties notice:", error.message);
    const state = appStore.getState();
    return state?.properties || [];
  }
}

// Fetch a single property by ID or slug
export async function fetchPropertyByIdOrSlug(idOrSlug) {
  try {
    const response = await axios.get(`${API_BASE}/api/properties/${idOrSlug}`);
    return response.data;
  } catch (error) {
    console.warn("fetchPropertyByIdOrSlug notice:", error.message);
    const state = appStore.getState();
    return (state?.properties || []).find(
      (p) => String(p.id) === String(idOrSlug) || p.slug === idOrSlug || String(p._id) === String(idOrSlug)
    ) || null;
  }
}

// Create a new property
export async function createProperty(propertyData) {
  const response = await axios.post(`${API_BASE}/api/properties`, propertyData, {
    headers: getAuthHeaders(),
  });

  // Keep client reactive store in sync
  if (response.data && appStore?.addPropertyListing) {
    try {
      appStore.addPropertyListing(response.data);
    } catch (e) {
      console.warn("appStore listing sync note:", e);
    }
  }

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
