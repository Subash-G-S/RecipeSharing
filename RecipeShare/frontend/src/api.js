import axios from "axios";

// Automatically uses VITE_API_URL when deployed, or falls back to localhost:5000 for local development
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json"
  }
});

// Helper for image URLs (handles relative uploads from backend or Cloudinary)
export const resolveImageUrl = (url) => {
  if (!url) {
    return "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80";
  }
  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

export default api;
