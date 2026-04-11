import axios from 'axios';

// Defaults to localhost if docker bridges are not active
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log errors that aren't expected offline/unauth scenarios
    if (error.response && error.response.status !== 401 && error.response.status !== 403) {
      console.error('API Error:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

// Authentication
export const login = (data: any) => {
  const params = new URLSearchParams();
  params.append('username', data.email);
  params.append('password', data.password);
  // Default OAuth2 expects form-urlencoded
  return api.post('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const register = (data: any) => api.post('/auth/register', data);
export const getProfile = () => api.get('/auth/profile');

// Listings & AI
export const analyzeWaste = (listing_id: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/analysis/upload-image?listing_id=${listing_id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const createListing = (data: any) => api.post('/listings/create', data);
export const getListings = () => api.get('/listings/');
export const getListingsWithDistance = (lat: number, lng: number) => api.get(`/listings/?recycler_lat=${lat}&recycler_lng=${lng}`);
export const getListingDetail = (id: string) => api.get(`/listings/${id}`);

// Transactions & Orders
export const purchaseListing = (listing_id: string, amount: number) => api.post('/transactions/purchase', { listing_id, amount });

// Recyclers & Logistics & Impact
export const getNearbyRecyclers = (lat: number, lng: number) => 
  api.get(`/recyclers/nearby?latitude=${lat}&longitude=${lng}`);
export const updateRecyclerProfile = (data: any) => api.put('/recyclers/profile', data);

export const requestLogistics = (data: any) => api.post('/logistics/request-pickup', data);
export const getAvailableJobs = () => api.get('/logistics/jobs?status=AVAILABLE');
export const getActiveJobs = () => api.get('/logistics/jobs?status=ACCEPTED');
export const getJobById = (id: string) => api.get(`/logistics/jobs/${id}`);
export const acceptJob = (id: string) => api.post(`/logistics/jobs/${id}/accept`);
export const startJob = (id: string) => api.post(`/logistics/jobs/${id}/start`);
export const completeJob = (id: string) => api.post(`/logistics/jobs/${id}/complete`);

export const getImpactSummary = () => api.get('/impact/summary');
export const getMaterialBreakdown = () => api.get('/impact/material-breakdown');
export const getProjectImpact = (id: string) => api.get(`/impact/project/${id}`);
