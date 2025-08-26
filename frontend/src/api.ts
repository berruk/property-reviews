import { Review, Property } from './types';

const API_BASE = 'https://property-reviews-production.up.railway.app/api';

export const api = {
  getReviews: async (params?: { property?: string; sort?: string; rating?: string }): Promise<Review[]> => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/reviews/hostaway?${query}`);
    const data = await response.json();
    return data.reviews;
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