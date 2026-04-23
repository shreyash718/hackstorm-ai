import { api, API_URL } from '@/lib/apiClient';

export const fetchProblem = async (id) => {
  const response = await api.get(`/problems/${id}`);
  return response.data;
};

export const startSession = async (problemId) => {
  const response = await api.post(`/session/start?problem_id=${problemId}`);
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

export const fetchReport = async (sessionId) => {
  const response = await api.get(`/report/${sessionId}`);
  return response.data;
};
