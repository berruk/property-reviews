import { Review, Property } from './types';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const api = {
  getReviews: async (params?: { property?: string; sort?: string; rating?: string }): Promise<Review[]> => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE}/reviews/hostaway?${query}`);
      const data = await response.json();
      return data.reviews || [];
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  approveReview: async (reviewId: string, isApproved: boolean): Promise<void> => {
    await fetch(`${API_BASE}/reviews/${reviewId}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved }),
    });
  },

  getProperties: async (): Promise<Property[]> => {
    const response = await fetch(`${API_BASE}/properties`);
    const data = await response.json();
    return data.properties;
  },
};