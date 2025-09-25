// src/utils/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL:  "https://chatgpt-2r0k.onrender.com",
  withCredentials: true
});

export default axiosInstance;
