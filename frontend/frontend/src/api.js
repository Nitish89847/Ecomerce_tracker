import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const searchProducts = (query, page = 1) => API.get(`/search/?q=${encodeURIComponent(query)}&page=${page}`);
export const getProductDetails = (asin) => API.get(`/product/${asin}/`);
export const getProductOffers = (asin) => API.get(`/product/${asin}/offers/`);
export const getPriceHistory = (asin) => API.get(`/product/${asin}/history/`);
export const getProductAlerts = (asin) => API.get(`/product/${asin}/alerts/`);
export const createAlert = (asin, data) => API.post(`/product/${asin}/alerts/`, data);
export const deleteAlert = (alertId) => API.delete(`/alerts/${alertId}/delete/`);
export const getTrackedProducts = () => API.get('/tracked/');
export const trackProduct = (asin) => API.post('/track/', { asin });
export const untrackProduct = (asin) => API.delete(`/untrack/${asin}/`);
export const refreshProduct = (asin) => API.post(`/product/${asin}/refresh/`);
export const getAllAlerts = () => API.get('/alerts/');
