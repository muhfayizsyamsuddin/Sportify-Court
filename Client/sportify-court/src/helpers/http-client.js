// src/helpers/http-client.js
import axios from "axios";

export const api = axios.create({
  baseURL: "https://api-sportifycourt.faizms.com",
});
// export const api = axios.create({
//   // baseURL: import.meta.env.VITE_API_BASE_URL,
//   baseURL: "http://localhost:3000",
// });

// export const apiPrivate = axios.create({
//   baseURL: "http://localhost:3000",
// });

// Tambahkan token ke setiap request private
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(">>> Axios Config:", config);
  return config;
});
// apiPrivate.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access_token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
