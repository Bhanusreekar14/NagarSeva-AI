import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

export const analyzeTextComplaint = async (text) => {
  const response = await api.post("/agent/run", {
    type: "text",
    payload: text,
  });

  return response.data;
};

export const analyzeImageComplaint = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    "/agent/upload-and-run",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export default api;
