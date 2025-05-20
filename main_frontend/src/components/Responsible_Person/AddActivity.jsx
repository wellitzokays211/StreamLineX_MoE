import './AddActivity.css';

import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';

// Icons
const ImageIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M21,19V5c0-1.1-0.9-2-2-2H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14C20.1,21,21,20.1,21,19z M8.5,13.5l2.5,3.01L14.5,12l4.5,6H5L8.5,13.5z"/>
  </svg>
);

const AddIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M19,13h-6v6h-2v-6H5v-2h6V5h2v6h6V13z"/>
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M6,19c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2V7H6V19z M19,4h-3.5l-1-1h-5l-1,1H5v2h14V4z"/>
  </svg>
);

// Location data with only Central Province and 5 districts
const locationData = {
  "Central": { 
  "Kandy": [
    "Kandy",
    "Yatinuwara",
    "Medadumbara",
    "Udunuwara",
    "Doluwa",
    "Pathadumbara",
    "Minipe"
  ],
  "Matale": [
    "Matale",
    "Ukuwela",
    "Rattota",
    "Dambulla",
    "Naula",
    "Wilgamuwa",
    "Ambanganga Korale"
  ],
  "Nuwara Eliya": [
    "Nuwara Eliya",
    "Walapane",
    "Hanguranketha",
    "Kotmale",
    "Lindula (Talawakele)",
    "Hatton - Dickoya"
  ]
}
};

const AddActivity = () => {
  const [activityData, setActivityData] = useState({
    description: '',
    province: '',
    district: '',
    zone: '',
    status: 'Pending' // Always set to Pending
  });
  
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    if (field === 'province') {
      setActivityData({
        ...activityData,
        [field]: value,
        district: '',
        zone: ''
      });
      return;
    }
    
    if (field === 'district') {
      setActivityData({
        ...activityData,
        [field]: value,
        zone: ''
      });
      return;
    }
    
    setActivityData({
      ...activityData,
      [field]: value
    });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  
  const handleImageChange = (e) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages([...images, ...newImages]);
    }
  };
  
  const handleRemoveImage = (index) => {
    const updatedImages = [...images];
    URL.revokeObjectURL(updatedImages[index].preview);
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!activityData.description || !activityData.province || 
        !activityData.district || !activityData.zone) {
      setError('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('description', activityData.description);
      formData.append('province', activityData.province);
      formData.append('district', activityData.district);
      formData.append('zone', activityData.zone);
      formData.append('status', 'Pending');

      images.forEach(image => {
        formData.append('images', image.file);
      });

      const response = await axios.post(
        'http://localhost:4000/api/activity/add',
        formData,
        {
          headers: {
            token: localStorage.getItem('token'),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        alert('Activity added successfully!');
        
        // ✅ Reset all fields
        setActivityData({
          description: '',
          province: '',
          district: '',
          zone: '',
          status: 'Pending'
        });
        // ✅ Clear image previews and files
        images.forEach(image => URL.revokeObjectURL(image.preview)); // Cleanup memory
        setImages([]);
        navigate('/list-activity'); // Navigate after successful add
      } else {
        setError(response.data.message || 'Failed to add activity');
      }
    } catch (err) {
      console.error('Error submitting activity:', err);
      setError(err.response?.data?.message || 'Failed to add activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/list-activity');
  };

  const getAvailableDistricts = () => {
    if (!activityData.province) return [];
    return Object.keys(locationData[activityData.province] || {});
  };

  const getAvailableZones = () => {
    if (!activityData.province || !activityData.district) return [];
    return locationData[activityData.province]?.[activityData.district] || [];
  };

  return (
    <div className="content">
      {/* Removed the back button as requested */}
      <h1>Add New Activity</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="activity-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-row">
            <label>Briefly Describe the Activity:</label>
            <textarea 
              value={activityData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="e.g., Roof renovation of ABC College"
              required
            />
          </div>
          
          <div className="form-row">
            <label>Province:</label>
            <select 
              value={activityData.province}
              onChange={(e) => handleInputChange('province', e.target.value)}
              required
            >
              <option value="">Select Province</option>
              {Object.keys(locationData).map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <label>District:</label>
            <select 
              value={activityData.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
              disabled={!activityData.province}
              required
            >
              <option value="">Select District</option>
              {getAvailableDistricts().map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <label>Zone:</label>
            <select 
              value={activityData.zone}
              onChange={(e) => handleInputChange('zone', e.target.value)}
              disabled={!activityData.district}
              required
            >
              <option value="">Select Zone</option>
              {getAvailableZones().map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
          
          {/* Status field is hidden since it's always Pending */}
          <input type="hidden" name="status" value="Pending" />
          
          <div className="form-row">
            <label>Add Images (Optional):</label>
            <div className="image-uploader">
              {images.length > 0 ? (
                <div className="image-grid">
                  {images.map((image, index) => (
                    <div key={index} className="image-thumbnail-container">
                      <div className="image-thumbnail">
                        <img 
                          src={image.preview} 
                          alt={`Preview ${index}`} 
                          className="thumbnail-img" 
                        />
                        <button 
                          type="button" 
                          className="remove-image-button"
                          onClick={() => handleRemoveImage(index)}
                          aria-label="Remove image"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div 
                    className="add-more-images"
                    onClick={handleImageClick}
                  >
                    <AddIcon />
                  </div>
                </div>
              ) : (
                <div className="image-upload-box" onClick={handleImageClick}>
                  <ImageIcon />
                  <AddIcon />
                  <span>(Click to add images)</span>
                </div>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="add-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Add Activity'}
          </button>
          <button 
            type="button" 
            className="cancel-button" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddActivity;