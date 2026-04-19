import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchProblems = async () => {
  const response = await api.get('/problems');
  return response.data;
};

export const fetchProblem = async (id) => {
  const response = await api.get(`/problems/${id}`);
  return response.data;
};

export const startSession = async (problemId) => {
  const response = await api.post(`/session/start?problem_id=${problemId}`);
  return response.data;
};

export const sendChatMessage = async (data) => {
  const response = await api.post('/chat', data);
  return response.data;
};

export const evaluateInterview = async (data) => {
  const response = await api.post('/evaluate', data);
  return response.data;
};

export const fetchReport = async (sessionId) => {
  const response = await api.get(`/report/${sessionId}`);
  return response.data;
};

export const fetchAdminDashboard = async (userId) => {
  const response = await api.get(`/admin/dashboard?user_id=${userId}`);
  return response.data;
};

export const addProblem = async (data) => {
  const response = await api.post('/admin/problems', data);
  return response.data;
};

export const addUser = async (adminId, email, password) => {
  const response = await api.post('/admin/users', { user_id: adminId, email, password });
  return response.data;
};

export const deleteUser = async (adminId, targetId) => {
  const response = await api.delete(`/admin/users/${targetId}?user_id=${adminId}`);
  return response.data;
};

export const addAdmin = async (adminId, targetId) => {
  const response = await api.post('/admin/admins', { user_id: adminId, target_id: targetId });
  return response.data;
};

export const removeAdmin = async (adminId, targetId) => {
  const response = await api.delete(`/admin/admins/${targetId}?user_id=${adminId}`);
  return response.data;
};

export const addRecruiter = async (adminId, targetId) => {
  const response = await api.post('/admin/recruiters', { user_id: adminId, target_id: targetId });
  return response.data;
};

export const removeRecruiter = async (adminId, targetId) => {
  const response = await api.delete(`/admin/recruiters/${targetId}?user_id=${adminId}`);
  return response.data;
};
