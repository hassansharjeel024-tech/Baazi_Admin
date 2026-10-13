import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    platform: "web",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("baazi_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong. Please try again.";

    if (status === 401) {
      localStorage.removeItem("baazi_admin_token");
      localStorage.removeItem("baazi_admin_user");
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject({ status, message, raw: error });
  }
);

export default axiosClient;