import axios from "axios";
import router from "@/router";

const baseURL = process.env.VUE_APP_INVENTORY_API; // ✅ Correct for Vue 2 CLI

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to set/remove token
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// ✅ Intercept 401s and logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect
      localStorage.removeItem("authToken");
      setAuthToken(null);
      if (router.currentRoute.path !== "/login") {
        router.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
