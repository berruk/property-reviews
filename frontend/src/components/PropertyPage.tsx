import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Property } from '../types';
import { api } from '../api';
import './PropertyPage.css';

const PropertyPage: React.FC = () => {
  const { propertyName } = useParams<{ propertyName: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPropertyData = useCallback(async () => {
    try {
      const properties = await api.getProperties();
      const decodedPropertyName = decodeURIComponent(propertyName || '');
      
      const foundProperty = properties.find(p => 
        p.name === decodedPropertyName
      );
      setProperty(foundProperty || null);
    } catch (error) {
      console.error('Failed to fetch property data:', error);
    } finally {
      setLoading(false);
    }
  }, [propertyName]);

  useEffect(() => {
    fetchPropertyData();
  }, [fetchPropertyData]);

  if (loading) {
    return <div className="loading">Loading property details...</div>;
  }

  if (!property) {
    return (
      <div className="property-page">
        <div className="property-not-found">
          <h2>Property not found</h2>
          <Link to="/dashboard">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="property-page">
      <div className="property-header">
        <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        <h1>{property.name}</h1>
        <div className="property-stats">
          <span className="rating">★ {property.averageRating.toFixed(1)}</span>
          <span className="review-count">({property.totalReviews} reviews)</span>
        </div>
      </div>

      <div className="property-content">
        <div className="property-info">
          <h2>Property Details</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>Location</h3>
              <p>Premium location in the heart of London</p>
            </div>
            <div className="info-card">
              <h3>Amenities</h3>
              <ul>
                <li>Free WiFi</li>
                <li>Kitchen facilities</li>
                <li>24/7 support</li>
                <li>Cleaning service</li>
              </ul>
            </div>
            <div className="info-card">
              <h3>Property Type</h3>
              <p>Modern apartment with premium furnishings</p>
            </div>
          </div>
        </div>

        {property.approvedReviews && property.approvedReviews.length > 0 && (
          <div className="reviews-section">
            <h2>Guest Reviews</h2>
            <p className="reviews-subtitle">
              {property.approvedReviews.length} approved review{property.approvedReviews.length !== 1 ? 's' : ''}
            </p>
            
            <div className="reviews-grid">
              {property.approvedReviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="guest-info">
                      <strong>{review.guestName}</strong>
                      <span className="review-date">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="review-rating">
                      ★ {review.rating.toFixed(1)}
                    </div>
                  </div>
                  
                  <p className="review-content">{review.review}</p>
                  
                  <div className="review-categories">
                    {Object.entries(review.categories).map(([category, rating]) => (
                      <div key={category} className="category-rating">
                        <span className="category-name">
                          {category.replace('_', ' ').charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                        <span className="category-score">{rating}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!property.approvedReviews || property.approvedReviews.length === 0) && (
          <div className="no-reviews">
            <h3>No approved reviews yet</h3>
            <p>Reviews will appear here once they are approved by management.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPage;