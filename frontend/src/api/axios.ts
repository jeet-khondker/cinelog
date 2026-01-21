import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // バックエンドのURL
});

// リクエスト送信前に毎回実行される設定（インターセプター）
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // 後で Zustand 等で管理するトークン
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
