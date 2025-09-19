import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'default', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'balance':
        return (
          <div className="skeleton-balance">
            <div className="skeleton-line skeleton-label"></div>
            <div className="skeleton-line skeleton-value"></div>
          </div>
        );
      
      case 'price':
        return (
          <div className="skeleton-price">
            <div className="skeleton-line skeleton-price-value"></div>
          </div>
        );
      
      case 'input':
        return (
          <div className="skeleton-input">
            <div className="skeleton-box skeleton-input-field"></div>
          </div>
        );
      
      case 'button':
        return (
          <div className="skeleton-button">
            <div className="skeleton-box skeleton-button-content"></div>
          </div>
        );
      
      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-subtitle"></div>
            <div className="skeleton-box skeleton-content"></div>
          </div>
        );
      
      default:
        return (
          <div className="skeleton-default">
            <div className="skeleton-line"></div>
          </div>
        );
    }
  };

  return (
    <div className="skeleton-container">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-item">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
