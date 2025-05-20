import './ActivityList.css';
import Sidebar from './ResPersonSidebar';

import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { Box } from '@mui/material';

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusCounts, setStatusCounts] = useState({});
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const statusOptions = [
    'Pending', 'Approved', 'Rejected', 'Not Started', 
    'On-Going', 'Completed', 'Cancelled'
  ];

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.get('http://localhost:4000/api/activity/get_all_id', {
          headers: { token }
        });
        
        if (response.data.success) {
          setActivities(response.data.data);
          setFilteredActivities(response.data.data);
          
          // Calculate status counts
          const counts = {};
          response.data.data.forEach(activity => {
            counts[activity.status] = (counts[activity.status] || 0) + 1;
          });
          setStatusCounts(counts);
        } else {
          setError(response.data.message || 'Failed to fetch activities');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [statusFilter, startDate, endDate, activities]);
  
  const applyFilters = () => {
    let filtered = [...activities];
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(activity => activity.status === statusFilter);
    }
    
    // Apply date filters
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(activity => new Date(activity.created_at) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59); // Set to end of day
      filtered = filtered.filter(activity => new Date(activity.created_at) <= end);
    }
    
    setFilteredActivities(filtered);
  };
  
  const clearFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
  };
  
  // Handle status counter click
  const handleStatusCounterClick = (status) => {
    setStatusFilter(statusFilter === status ? '' : status);
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <div className="loading-spinner"></div>
        <p>Loading activities...</p>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <div className="error-icon">⚠️</div>
        <p>Error: {error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', width: '100vw', overflowX: 'hidden' }}>
      <Sidebar />
      <Box sx={{ flex: 1, minWidth: 0, overflowX: 'hidden', p: 0, m: 0 }}>
        <div className="activity-list-container" style={{ marginLeft: 0 }}>
          <div className="activity-list-header">
            <h2>All Activities</h2>
            <p className="activity-count">
              Showing {filteredActivities.length} of {activities.length} activities
            </p>
          </div>
          
          <div className="status-summary">
            {statusOptions.map(status => (
              <div 
                key={status} 
                className={`status-counter ${status.toLowerCase().replace(/\s+/g, '-')} ${statusFilter === status ? 'active' : ''}`}
                onClick={() => handleStatusCounterClick(status)}
              >
                <span className="status-counter-number">{statusCounts[status] || 0}</span>
                <span className="status-counter-label">{status}</span>
              </div>
            ))}
          </div>
          
          <div className="filters-container">
            <div className="filter-group">
              <label htmlFor="status-filter">Status:</label>
              <select 
                id="status-filter" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="start-date">From:</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="end-date">To:</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
              />
            </div>
            
            <button 
              className="clear-filters-btn" 
              onClick={clearFilters}
              disabled={!statusFilter && !startDate && !endDate}
            >
              Clear Filters
            </button>
          </div>
          
          {filteredActivities.length === 0 ? (
            <div className="no-results">
              <p>No activities found matching your filters</p>
              {(statusFilter || startDate || endDate) && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="activities-grid">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="activity-card" style={{ borderLeft: '6px solid #1b5e20' }}>
                  <div className="activity-header">
                    <h3>Activity #{activity.id}</h3>
                    <span className={`status-badge ${activity.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {activity.status}
                    </span>
                  </div>
                  
                  <div className="activity-details">
                    <p><strong>Description:</strong> {activity.description}</p>
                    <p><strong>Location:</strong> {activity.zone}, {activity.district}, {activity.province}</p>
                    <p><strong>Created:</strong> {new Date(activity.created_at).toLocaleString()}</p>
                  </div>
                  
                  {activity.images && activity.images.length > 0 && (
                    <div className="activity-images">
                      <h4>Images ({activity.images.length}):</h4>
                      <div className="image-grid">
                        {activity.images.map((image, index) => (
                          <div key={index} className="image-item">
                            <div className="image-wrapper">
                              <img
                                src={`http://localhost:4000/images/${image.name}`}
                                alt={`Activity ${activity.id} image ${index + 1}`}
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                                }}
                              />
                            </div>
                            <p className="image-name">{image.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Box>
    </Box>
  );
};

export default ActivityList;