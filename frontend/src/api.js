import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: BASE });

export const registerUser = (username, password) =>
  api.post('/api/auth/register', { username, password }).then(r => r.data);

export const loginUser = (username, password) =>
  api.post('/api/auth/login', { username, password }).then(r => r.data);

export const fetchStats        = ()           => api.get('/api/stats').then(r => r.data);
export const fetchAreas        = ()           => api.get('/api/areas').then(r => r.data);
export const fetchWeatherImpact= (area = '')  => api.get('/api/weather-impact', { params: { area } }).then(r => r.data);
export const fetchTimeAnalysis    = (area = '')  => api.get('/api/time-analysis',    { params: { area } }).then(r => r.data);
export const fetchTrafficAnalysis = (area = '')  => api.get('/api/traffic-analysis', { params: { area } }).then(r => r.data);
export const fetchDeliveries   = (params = {}) => api.get('/api/deliveries', { params }).then(r => r.data);
