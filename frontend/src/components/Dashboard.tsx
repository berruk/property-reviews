import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Review } from '../types';
import { api } from '../api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    property: '',
    rating: '',
    sort: 'date'
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await api.getReviews();
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = reviews;

    if (filters.property) {
      filtered = filtered.filter(review =>
        review.propertyName.toLowerCase().includes(filters.property.toLowerCase())
      );
    }

    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(review => review.rating >= minRating);
    }

    if (filters.sort === 'rating') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (filters.sort === 'date') {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    setFilteredReviews(filtered);
  }, [reviews, filters]);

  useEffect(() => {
    applyFilters();
  }, [reviews, filters, applyFilters]);

  const handleApprovalToggle = async (reviewId: string, currentApproval: boolean) => {
    try {
      await api.approveReview(reviewId, !currentApproval);
      setReviews(reviews.map(review =>
        review.id === reviewId
          ? { ...review, isApproved: !currentApproval }
          : review
      ));
    } catch (error) {
      console.error('Failed to update review approval:', error);
    }
  };

  const getPropertyStats = () => {
    const propertyStats: { [key: string]: { count: number; avgRating: number; approved: number } } = {};
    
    reviews.forEach(review => {
      if (!propertyStats[review.propertyName]) {
        propertyStats[review.propertyName] = { count: 0, avgRating: 0, approved: 0 };
      }
      propertyStats[review.propertyName].count++;
      propertyStats[review.propertyName].avgRating += review.rating;
      if (review.isApproved) {
        propertyStats[review.propertyName].approved++;
      }
    });

    Object.keys(propertyStats).forEach(property => {
      propertyStats[property].avgRating /= propertyStats[property].count;
    });

    return propertyStats;
  };

  const getTrendsAnalysis = () => {
    const categoryStats: { [key: string]: { total: number; average: number; count: number; poor: number } } = {};
    
    reviews.forEach(review => {
      Object.entries(review.categories).forEach(([category, rating]) => {
        if (!categoryStats[category]) {
          categoryStats[category] = { total: 0, average: 0, count: 0, poor: 0 };
        }
        categoryStats[category].total += rating;
        categoryStats[category].count++;
        if (rating <= 6) categoryStats[category].poor++;
      });
    });

    Object.keys(categoryStats).forEach(category => {
      categoryStats[category].average = categoryStats[category].total / categoryStats[category].count;
    });

    const recurringIssues = Object.entries(categoryStats)
      .filter(([_, stats]) => stats.average <= 7 && stats.poor >= 2)
      .sort(([_, a], [__, b]) => a.average - b.average);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentReviews = reviews.filter(review => new Date(review.date) > thirtyDaysAgo);
    const recentAvgRating = recentReviews.reduce((sum, review) => sum + review.rating, 0) / recentReviews.length || 0;
    const overallAvgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length || 0;

    return {
      categoryStats,
      recurringIssues,
      recentTrend: {
        recentAvg: recentAvgRating,
        overallAvg: overallAvgRating,
        direction: recentAvgRating > overallAvgRating ? 'improving' : recentAvgRating < overallAvgRating ? 'declining' : 'stable'
      }
    };
  };

  if (loading) {
    return <div className="loading">Loading reviews...</div>;
  }

  const propertyStats = getPropertyStats();
  const trendsAnalysis = getTrendsAnalysis();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>FlexLiving Reviews Dashboard</h1>
        <p>Manage property reviews and select which ones to display publicly</p>
      </header>

      <div className="stats-section">
        <h2>Property Overview</h2>
        <div className="property-cards">
          {Object.entries(propertyStats).map(([property, stats]) => (
            <Link 
              key={property} 
              to={`/property/${encodeURIComponent(property)}`}
              className="property-card-link"
            >
              <div className="property-card">
                <h3>{property}</h3>
                <div className="stats">
                  <span>Reviews <strong>{stats.count}</strong></span>
                  <span>Avg Rating <strong>{stats.avgRating.toFixed(1)} ⭐</strong></span>
                  <span>Approved <strong>{stats.approved}</strong></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="trends-section">
        <h2>Trends & Issues Analysis</h2>
        
        <div className="trends-grid">
          <div className="trend-card">
            <h3>Recent Performance</h3>
            <div className={`trend-indicator ${trendsAnalysis.recentTrend.direction}`}>
              <span className="trend-arrow">
                {trendsAnalysis.recentTrend.direction === 'improving' ? '↗' : 
                 trendsAnalysis.recentTrend.direction === 'declining' ? '↘' : '→'}
              </span>
              <div className="trend-text">
                <span>Recent Avg: {trendsAnalysis.recentTrend.recentAvg.toFixed(1)} ⭐</span>
                <span>Overall Avg: {trendsAnalysis.recentTrend.overallAvg.toFixed(1)} ⭐</span>
                <span className="trend-status">{trendsAnalysis.recentTrend.direction}</span>
              </div>
            </div>
          </div>

          <div className="trend-card">
            <h3>Category Performance</h3>
            <div className="category-performance">
              {Object.entries(trendsAnalysis.categoryStats)
                .sort(([_, a], [__, b]) => a.average - b.average)
                .map(([category, stats]) => (
                  <div key={category} className={`category-stat ${stats.average <= 7 ? 'poor' : stats.average <= 8.5 ? 'fair' : 'good'}`}>
                    <span className="category-name">{category.replace('_', ' ')}</span>
                    <span className="category-score">{stats.average.toFixed(1)}/10</span>
                    {stats.poor > 0 && <span className="poor-count">({stats.poor} low ratings)</span>}
                  </div>
                ))}
            </div>
          </div>

          <div className="trend-card">
            <h3>Recurring Issues</h3>
            {trendsAnalysis.recurringIssues.length > 0 ? (
              <div className="recurring-issues">
                {trendsAnalysis.recurringIssues.map(([category, stats]) => (
                  <div key={category} className="issue-item">
                    <span className="issue-name">{category.replace('_', ' ')}</span>
                    <div className="issue-details">
                      <span>Avg: {stats.average.toFixed(1)}/10</span>
                      <span className="issue-count">{stats.poor} complaints</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-issues">
                <p>✅ No recurring issues detected</p>
                <p>All categories are performing well!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="filters-section">
        <h2>Filter Reviews</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Search by property name"
            value={filters.property}
            onChange={(e) => setFilters({ ...filters, property: e.target.value })}
          />
          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
          >
            <option value="">All ratings</option>
            <option value="8">8+ stars</option>
            <option value="6">6+ stars</option>
            <option value="4">4+ stars</option>
          </select>
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          >
            <option value="date">Sort by date</option>
            <option value="rating">Sort by rating</option>
          </select>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Reviews ({filteredReviews.length})</h2>
        <div className="reviews-list">
          {filteredReviews.map(review => (
            <div key={review.id} className={`review-card ${review.isApproved ? 'approved' : ''}`}>
              <div className="review-header">
                <div className="property-info">
                  <h4>{review.propertyName}</h4>
                  <span className="guest-name">{review.guestName}</span>
                </div>
                <div className="review-meta">
                  <span className="rating">{review.rating.toFixed(1)} ⭐</span>
                  <span className="date">{new Date(review.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <p className="review-text">{review.review}</p>
              
              <div className="categories">
                {Object.entries(review.categories).map(([category, rating]) => (
                  <span key={category} className="category">
                    {category}: {rating}/10
                  </span>
                ))}
              </div>

              <div className="review-actions">
                <button
                  className={`approval-btn ${review.isApproved ? 'approved' : 'pending'}`}
                  onClick={() => handleApprovalToggle(review.id, review.isApproved)}
                >
                  {review.isApproved ? '✅ Approved' : '⏳ Approve'}
                </button>
                <span className="channel">{review.channel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;