import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nagarseva_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const analyzeTextComplaint = async (text, locationData = {}) => {
  const response = await api.post("/agent/run", {
    type: "text",
    payload: text,
    latitude: locationData.latitude || null,
    longitude: locationData.longitude || null,
    address: locationData.address || null,
    location_source: locationData.location_source || null,
  });

  return response.data;
};

export const analyzeImageComplaint = async (file, locationData = {}) => {
  const formData = new FormData();
  formData.append("file", file);
  if (locationData.latitude) formData.append("latitude", locationData.latitude);
  if (locationData.longitude) formData.append("longitude", locationData.longitude);
  if (locationData.address) formData.append("address", locationData.address);
  if (locationData.location_source) formData.append("location_source", locationData.location_source);

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

export const uploadEvidenceAttachments = async (complaintNumber, files) => {
  if (!files || files.length === 0) return null;
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post(
    `/complaints/${complaintNumber}/attachments`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getComplaintDetails = async (complaintNumber) => {
  const response = await api.get(`/complaints/${complaintNumber}`);
  return response.data;
};

export const getComplaintTimeline = async (complaintNumber) => {
  const response = await api.get(`/tracking/${complaintNumber}/timeline`);
  return response.data;
};

export const askAssistantQuestion = async (question) => {
  const response = await api.post("/assistant/ask", { question });
  return response.data;
};

export const getCitizenDashboard = async () => {
  const response = await api.get("/dashboard/citizen");
  return response.data;
};

export const getVolunteerTasks = async () => {
  const response = await api.get("/volunteer/tasks");
  return response.data;
};

export const assignVolunteerTask = async (complaintNumber) => {
  const response = await api.post(`/volunteer/tasks/${complaintNumber}/assign`);
  return response.data;
};

export const updateVolunteerTaskStatus = async (complaintNumber, status, remarks) => {
  const response = await api.put(`/volunteer/tasks/${complaintNumber}/status`, {
    status,
    remarks,
  });
  return response.data;
};

export const uploadVolunteerEvidence = async (complaintNumber, files) => {
  if (!files || files.length === 0) return null;
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post(
    `/volunteer/tasks/${complaintNumber}/evidence`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// Admin Endpoints
export const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

export const getAdminComplaints = async (filters = {}) => {
  const response = await api.get("/admin/complaints", { params: filters });
  return response.data;
};

export const getAdminVolunteers = async () => {
  const response = await api.get("/admin/volunteers");
  return response.data;
};

export const assignComplaintToVolunteer = async (complaintNumber, volunteerId, remarks = "") => {
  const response = await api.post(`/admin/complaints/${complaintNumber}/assign`, {
    volunteer_id: volunteerId,
    remarks,
  });
  return response.data;
};

export const updateAdminComplaintStatus = async (complaintNumber, status, remarks = "") => {
  const response = await api.put(`/admin/complaints/${complaintNumber}/status`, {
    status,
    remarks,
  });
  return response.data;
};

export default api;
