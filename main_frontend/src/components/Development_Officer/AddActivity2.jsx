import './AddActivity2.css';

import React, { useEffect, useRef, useState } from 'react';
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

// Component and subcomponent data
const componentData = {
  "Strengthen Equity in Education: Equitable Learning Opportunities for All Children": [
    "Implementation of 13 years mandatory education policy",
    "Improving access to and participation for primary and secondary education",
    "Ensuring free-education policy",
    "Ensuring safe and attractive learning environment in schools",
    "Improving student's health and nutrition status",
    "Implementation of systematic career guidance and counseling programs"
  ],
  "Improve Quality of General Education": [
    "Development of science, technology, mathematics, and sports education for improving skilled health capital",
    "Broader approach to education focusing on transversal skills, socio-emotional skills, value education, and ethics",
    "Teacher development, teacher education and management",
    "Improving assessments and evaluation systems",
    "Improving attractive teaching and learning environments, promoting digital-based teaching and learning",
    "Improving learning outcomes of students and international linkages in the general education system"
  ],
  "Strengthen Stewardship and Service Delivery of General Education": [
    "Strengthening the empowerment of schools through implementation of SBM / EPSI",
    "Improving the quality and standards of primary and secondary education through establishing school indicators",
    "Strengthening education administration at provincial, zonal, and divisional levels",
    "Implementation of long-term professional development programs"
  ],
  "Enhance Education Policy, Planning, Research and Results-Based Monitoring and Evaluation": [
    "Strengthening education policy and planning, research and results-based monitoring and evaluation",
    "Creation of public awareness programs on education achievements"
  ]
};

const AddActivity2 = ({ onBack }) => {
  const navigate = useNavigate();
  const [activityData, setActivityData] = useState({
    description: '',
    province: '',
    district: '',
    zone: '',
    component: '',
    subcomponent: '',
    status: 'Pending',
    assigned_engineer_id: ''
  });
  
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [engineers, setEngineers] = useState([]);
  const [loadingEngineers, setLoadingEngineers] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/engineers');
        if (response.data.success) {
          setEngineers(response.data.engineers);
        }
      } catch (err) {
        console.error('Error fetching engineers:', err);
        setError('Failed to load engineers. Please try again.');
      } finally {
        setLoadingEngineers(false);
      }
    };
    fetchEngineers();
  }, []);

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

    if (field === 'component') {
      setActivityData({
        ...activityData,
        [field]: value,
        subcomponent: ''
      });
      return;
    }

    if (field === 'status' && value !== 'Approved') {
      setActivityData({
        ...activityData,
        [field]: value,
        assigned_engineer_id: ''
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

    if (activityData.status === 'Approved' && !activityData.assigned_engineer_id) {
      setError('Please assign an engineer for approved activities');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('description', activityData.description);
      formData.append('province', activityData.province);
      formData.append('district', activityData.district);
      formData.append('zone', activityData.zone);
      formData.append('component', activityData.component);
      formData.append('subcomponent', activityData.subcomponent);
      formData.append('status', activityData.status);
      
      if (activityData.status === 'Approved') {
        formData.append('assigned_engineer_id', activityData.assigned_engineer_id);
      }

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
        
        // Reset all fields
        setActivityData({
          description: '',
          province: '',
          district: '',
          zone: '',
          component: '',
          subcomponent: '',
          status: 'Pending',
          assigned_engineer_id: ''
        });
        // Clear image previews and files
        images.forEach(image => URL.revokeObjectURL(image.preview));
        setImages([]);
        navigate('/priority-list');
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

  const getAvailableDistricts = () => {
    if (!activityData.province) return [];
    return Object.keys(locationData[activityData.province] || {});
  };

  const getAvailableZones = () => {
    if (!activityData.province || !activityData.district) return [];
    return locationData[activityData.province]?.[activityData.district] || [];
  };

  const getAvailableSubcomponents = () => {
    if (!activityData.component) return [];
    return componentData[activityData.component] || [];
  };

  return (
    <div className="content">
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
            <label>Component:</label>
            <select 
              value={activityData.component}
              onChange={(e) => handleInputChange('component', e.target.value)}
            >
              <option value="">Select Component (Optional)</option>
              {Object.keys(componentData).map((component) => (
                <option key={component} value={component}>
                  {component}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <label>Subcomponent:</label>
            <select 
              value={activityData.subcomponent}
              onChange={(e) => handleInputChange('subcomponent', e.target.value)}
              disabled={!activityData.component}
            >
              <option value="">Select Subcomponent (Optional)</option>
              {getAvailableSubcomponents().map((subcomponent) => (
                <option key={subcomponent} value={subcomponent}>
                  {subcomponent}
                </option>
              ))}
            </select>
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

          <div className="form-row">
            <label>Status:</label>
            <select 
              value={activityData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              required
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {activityData.status === 'Approved' && (
            <div className="form-row">
              <label>Assign Engineer:</label>
              {loadingEngineers ? (
                <p>Loading engineers...</p>
              ) : (
                <select
                  value={activityData.assigned_engineer_id}
                  onChange={(e) => handleInputChange('assigned_engineer_id', e.target.value)}
                  required
                >
                  <option value="">Select Engineer</option>
                  {engineers.map((engineer) => (
                    <option key={engineer.engineer_id} value={engineer.engineer_id}>
                      {engineer.engineer_name} ({engineer.specialization})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          
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
            onClick={() => navigate('/priority-list')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddActivity2;