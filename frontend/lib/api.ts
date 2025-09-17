import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", 
});

// interceptor thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signupApi = async (email: string, password: string) => {
  const res = await api.post("/auth/register", { email, password });
  // nếu backend trả token thì lưu
  if (res.data.access_token) {
    localStorage.setItem("access_token", res.data.access_token);
  }
  return res.data;
};

export const loginApi = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  if (res.data.access_token) {
    localStorage.setItem("access_token", res.data.access_token);
  }
  return res.data;
};
