// api/services.js
// All API calls in one place — import these in pages/components

import api from './axios'

// ─── AUTH ───────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  profile:  ()     => api.get('/auth/profile'),
}

// ─── RESTAURANTS ────────────────────────────────────────
export const restaurantAPI = {
  getAll:    ()          => api.get('/restaurants'),
  getById:   (id)        => api.get(`/restaurants/${id}`),
  add:       (data)      => api.post('/restaurants', data),
  update:    (id, data)  => api.put(`/restaurants/${id}`, data),
  delete:    (id)        => api.delete(`/restaurants/${id}`),
}

// ─── MENU ───────────────────────────────────────────────
export const menuAPI = {
  getByRestaurant: (restaurantId)        => api.get(`/menu/restaurant/${restaurantId}`),
  addItem:         (restaurantId, data)  => api.post(`/menu/restaurant/${restaurantId}`, data),
  updateItem:      (id, data)            => api.put(`/menu/${id}`, data),
  deleteItem:      (id)                  => api.delete(`/menu/${id}`),
}

// ─── CART ────────────────────────────────────────────────
export const cartAPI = {
  getCart:    ()              => api.get('/cart'),
  addItem:    (data)          => api.post('/cart', data),
  updateItem: (id, quantity)  => api.put(`/cart/${id}?quantity=${quantity}`),
  removeItem: (id)            => api.delete(`/cart/${id}`),
  clearCart:  ()              => api.delete('/cart/clear'),
}

// ─── ORDERS ──────────────────────────────────────────────
export const orderAPI = {
  placeOrder:  (data) => api.post('/orders', data),
  getHistory:  ()     => api.get('/orders'),
  getById:     (id)   => api.get(`/orders/${id}`),
}

// ─── SELLER ─────────────────────────────────────────────
export const sellerAPI = {
  getRestaurants: ()          => api.get('/seller/restaurants'),
  getOrders:      ()          => api.get('/seller/orders'),
  getMenu:        (restaurantId) => api.get(`/seller/restaurants/${restaurantId}/menu`),
  updateStatus:   (id, status) => api.put(`/seller/orders/${id}/status`, { status }),
}

// ─── NOTIFICATIONS ───────────────────────────────────────────
export const notificationAPI = {
  getAll:        ()     => api.get('/notifications'),
  getUnreadCount:()     => api.get('/notifications/unread-count'),
  markRead:      (id)   => api.put(`/notifications/${id}/read`),
  markAllRead:   ()     => api.put('/notifications/read-all'),
}
