// src/api/apiService.js
import apiClient from './apiClient';

// SKU endpoints (from ViewSet)
export const skuService = {
  getAll: () => apiClient.get('/skus'),
  getById: (id) => apiClient.get(`/skus/${id}/`),
  create: (data) => apiClient.post('/skus/', data),
  update: (id, data) => apiClient.put(`/skus/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/skus/${id}/`, data),
  delete: (id) => apiClient.delete(`/skus/${id}/`),
};

// PriceData endpoints (from ViewSet)
export const priceDataService = {
  getAll: () => apiClient.get('/pricedata/'),
  getSorted: () => apiClient.get('/pricedata/best_prices/'),
  getById: (id) => apiClient.get(`/pricedata/${id}/`),
  create: (data) => apiClient.post('/pricedata/', data),
  update: (id, data) => apiClient.put(`/pricedata/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/pricedata/${id}/`, data),
  delete: (id) => apiClient.delete(`/pricedata/${id}/`),
};

// Flow endpoints
export const flowService = {
  createConfig: (configData) => apiClient.post('/flows/create-config/', configData),
  getFlow: (params) => apiClient.get('/flows/get/', { params }),
  getFlowByName: (id) => apiClient.get(`/flows/get/${id}/`),
  getAllFlows: () => apiClient.get('/flows/'),
  partialUpdateFlow: (flowId, updateData) => apiClient.patch(`/flows/update/${flowId}/`, updateData),
  deleteFlow: (id) => apiClient.delete(`/flows/delete/${id}/`),
};

// Execution endpoint
export const executionService = {
  executeScraping: (payload) => apiClient.post('/scrape/', payload),
  getJob: (id) => apiClient.get(`job-result/${id}/`),

};

export const usersService = {
  applyUpgrade: () => apiClient.post('/apply-upgrade/'),
  applyDowngrade: () => apiClient.post('/apply-downgrade/')

}

// Combined export for easier imports
const apiServices = {
  sku: skuService,
  priceData: priceDataService,
  flow: flowService,
  execution: executionService,
  users: usersService,
};
export default apiServices;