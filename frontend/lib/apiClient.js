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
