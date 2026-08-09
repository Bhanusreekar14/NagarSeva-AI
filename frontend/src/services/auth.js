import api from "./api";

export const registerApi = async (formData) => {
  const response = await api.post("/auth/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const loginApi = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const getCurrentUserApi = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
