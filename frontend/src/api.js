import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api' // ชี้ไปที่ Backend ของคุณ
});

// เพิ่ม Token ลงใน Header อัตโนมัติ (ถ้ามี)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;