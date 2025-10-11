// api.ts
import axios, { Method } from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

// interceptor: gắn token vào header nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Hàm gọi API chung
 * @param endpoint đường dẫn API (vd: "auth/login")
 * @param method phương thức HTTP ("GET", "POST", ...)
 * @param body dữ liệu gửi đi (optional)
 */
export const requestApi = async (
  endpoint: string,
  method: Method,
  body?: any
) => {
  try {
    const res = await api.request({
      url: endpoint,
      method,
      data: body,
    });

    // Nếu login/register trả token thì lưu
    // if (res.data?.access_token) {
    //   localStorage.setItem("access_token", res.data.access_token);
    // }

    return res.data;
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
