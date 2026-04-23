import axios from 'axios';
import { supabase } from './supabase';

const PRODUCTION_API_URL = 'https://hackstorm-ai.onrender.com';
const LOCAL_API_URL = 'http://localhost:8000';

const normalizeApiUrl = (url) => {
  const fallback = process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : LOCAL_API_URL;
  const trimmed = (url || fallback).trim().replace(/\/+$/, '');

  if (trimmed === 'https://hackstorm-ai.onrender.com' || trimmed === 'http://hackstorm-ai.onrender.com') {
    return PRODUCTION_API_URL;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
};

export const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);

export const api = axios.create({
  baseURL: API_URL,
});

// Add auth header to every request if session exists
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
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

export const streamChatMessage = async (data) => {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...data, stream: true }),
  });
  return response;
};

export const evaluateInterview = async (data) => {
  const response = await api.post('/evaluate', data);
  return response.data;
};

export const evaluateAssessmentInterview = async (assessmentId, data) => {
  const response = await api.post(`/assessment/${assessmentId}/evaluate`, data);
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

export const updateProblem = async (adminId, problemId, data) => {
  const response = await api.put(`/admin/problems/${problemId}`, { ...data, user_id: adminId });
  return response.data;
};

export const deleteProblem = async (adminId, problemId) => {
  const response = await api.delete(`/admin/problems/${problemId}?user_id=${adminId}`);
  return response.data;
};

export const toggleProblemVisibility = async (adminId, problemId, isPublic) => {
  const response = await api.patch(`/admin/problems/${problemId}/visibility`, { user_id: adminId, is_public: isPublic });
  return response.data;
};

export const sendAdminOTP = async (userId) => {
  const response = await api.post('/admin/otp/send', { user_id: userId });
  return response.data;
};

export const verifyAdminOTP = async (userId, otpCode) => {
  const response = await api.post('/admin/otp/verify', { user_id: userId, otp_code: otpCode });
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

export const transcribeAudio = async (audioBlob, onProgress) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  
  const response = await api.post('/transcribe', formData, {
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    }
  });
  return response.data;
};

export const fetchCandidateReports = async () => {
  const response = await api.get('/candidate/reports');
  return response.data;
};

export const fetchCandidateReport = async (reportId) => {
  const response = await api.get(`/candidate/reports/${reportId}`);
  return response.data;
};

export const setTargetCompany = async (data) => {
  const response = await api.post('/candidate/target-company', data);
  return response.data;
};

export const fetchTargetCompany = async () => {
  const response = await api.get('/candidate/target-company');
  return response.data;
};

export const fetchCandidateProgress = async () => {
  const response = await api.get('/candidate/progress');
  return response.data;
};

export const fetchBenchmarks = async () => {
  const response = await api.get('/candidate/benchmarks');
  return response.data;
};

export const checkRecruiter = async () => {
  const response = await api.get('/recruiter/check');
  return response.data;
};

export const fetchRecruiterAssessments = async () => {
  const response = await api.get('/recruiter/assessments');
  return response.data;
};

export const createAssessment = async (data) => {
  const response = await api.post('/assessment', data);
  return response.data;
};
