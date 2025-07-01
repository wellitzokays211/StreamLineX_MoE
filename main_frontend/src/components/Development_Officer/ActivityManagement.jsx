// Material-UI component imports for building the user interface
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
// Material-UI icon imports for visual indicators
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

// React core imports and date utility
import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';

// Additional Material-UI icons for various status indicators and categories
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClassIcon from '@mui/icons-material/Class';
import DescriptionIcon from '@mui/icons-material/Description';
import EngineeringIcon from '@mui/icons-material/Engineering';
import EventNoteIcon from '@mui/icons-material/EventNote';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

// HTTP client for API requests
import axios from 'axios';
import './ActivityManagement.css';

/**
 * Component data structure defining education system components and their subcomponents
 * This data is used for categorizing activities within the education management system
 */
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
  ],
};

/**
 * ActivityManagement Component
 * 
 * Main component for managing educational activities by Development Officers.
 * Features include:
 * - Viewing all activities in a card-based layout
 * - Filtering activities by status
 * - Updating activity status (approve/reject)
 * - Assigning engineers to approved activities
 * - Viewing activity images in a modal
 * - Reassigning rejected activities to different engineers
 */
const ActivityManagement = () => {
  const theme = useTheme();
  
  // State management for activities and engineers data
  const [activities, setActivities] = useState([]);
  const [engineers, setEngineers] = useState([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states for activity updates
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // Dialog and UI states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');
  const [selectedSubcomponent, setSelectedSubcomponent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Configuration arrays for dropdowns and filters
  const statusOptions = ['DO Accepted', 'Rejected'];
  const filterOptions = ['All', 'Pending', 'Approved', 'Rejected', 'PDApproved'];

  // Color mapping for different activity statuses
  const statusColors = {
    Pending: 'warning',
    Approved: 'success',
    Rejected: 'error',
    'Not Started': 'info',
    'On-Going': 'secondary',
    Completed: 'primary',
    Accepted: 'success'
  };

  // Icon mapping for different activity statuses
  const statusIcons = {
    Pending: <AccessTimeIcon fontSize="small" />,
    Approved: <CheckCircleIcon fontSize="small" />,
    Rejected: <CancelIcon fontSize="small" />,
    'Not Started': <EventNoteIcon fontSize="small" />,
    'On-Going': <PriorityHighIcon fontSize="small" />,
    Completed: <CheckCircleIcon fontSize="small" />,
    Accepted: <CheckCircleIcon fontSize="small" />
  };

  // Color mapping for priority levels (currently unused but available for future use)
  const priorityColors = {
    High: 'error',
    Medium: 'warning',
    Low: 'success'
  };

  // Effect hook to fetch initial data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Fetches activities and engineers data from the backend API
   * Sets loading states and handles errors appropriately
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both activities and engineers data simultaneously
      const [activitiesRes, engineersRes] = await Promise.all([
        axios.get('http://localhost:4000/api/activity/get'),
        axios.get('http://localhost:4000/api/engineers')
      ]);

      // Check if both API calls were successful
      if (activitiesRes.data.success && engineersRes.data.success) {
        setActivities(activitiesRes.data.activities);
        setEngineers(engineersRes.data.engineers);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      // Handle any network or server errors
      setError(err.response?.data?.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Opens the status update dialog and initializes form data
   * @param {Object} activity - The activity object to be updated
   */
  const handleStatusChange = (activity) => {
    setSelectedActivity(activity);
    setSelectedStatus('');
    setSelectedEngineer(activity.assignedEngineer?.id || '');
    setSelectedComponent(activity.component || '');
    setSelectedSubcomponent(activity.subcomponent || '');
    setRejectionReason(activity.rejection_reason || '');
    setEditedDescription(activity.description || '');
    setDialogOpen(true);
  };
  
  /**
   * Closes the dialog and resets all form states
   */
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedActivity(null);
    setSelectedStatus('');
    setSelectedEngineer('');
    setSelectedComponent('');
    setSelectedSubcomponent('');
    setRejectionReason('');
    setEditedDescription('');
    setSelectedImageIndex(0);
  };

 /**
  * Handles the status update process for an activity
  * Converts frontend status to backend status and sends update request
  */
 const handleStatusUpdate = async () => {
  if (!selectedActivity || !selectedStatus) return;

  try {
    // Convert 'DO Accepted' to 'Approved' for the backend API
    const statusForBackend = selectedStatus === 'DO Accepted' ? 'Approved' : selectedStatus;
    
    // Prepare the payload for the API request
    const payload = {
      id: selectedActivity.id,
      status: statusForBackend,
      assigned_engineer_id: selectedStatus === 'DO Accepted' ? selectedEngineer : null,
      rejectionReason: selectedStatus === 'Rejected' ? rejectionReason : null, // Changed to match backend
      component: selectedComponent || null,
      subcomponent: selectedSubcomponent || null,
      description: editedDescription || null
    };

    const response = await axios.put('http://localhost:4000/api/activity/update', payload);

    if (response.data.success) {
      fetchData(); // Refresh the activities list
      handleDialogClose(); // Close the dialog
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Update failed');
  }
};

  /**
   * Formats engineer information for display
   * @param {Object} engineer - Engineer object with name and specialization
   * @returns {string} Formatted engineer name with specialization
   */
  const getEngineerName = (engineer) => {
    if (!engineer) return 'Not assigned';
    return `${engineer.name} (${engineer.specialization})`;
  };
  
  /**
   * Returns appropriate status message based on activity status
   * @param {string} status - Current activity status
   * @returns {string} User-friendly status message
   */
  const getStatusMessage = (status) => {
    switch(status) {
      case 'Approved':
      case 'DO Accepted':
        return 'Already Approved';
      case 'Rejected':
        return 'Already Rejected';
      case 'Not Started':
        return 'Not Started';
      case 'On-Going':
        return 'Currently On-Going';
      case 'Completed':
        return 'Already Completed';
      case 'Accepted':
        return 'Accepted';
      default:
        return '';
    }
  };

  /**
   * Handles component selection and resets subcomponent
   * @param {string} value - Selected component value
   */
  const handleComponentChange = (value) => {
    setSelectedComponent(value);
    setSelectedSubcomponent(''); // Reset subcomponent when component changes
  };

  /**
   * Returns available subcomponents for the selected component
   * @returns {Array} Array of subcomponent strings
   */
  const getAvailableSubcomponents = () => {
    if (!selectedComponent) return [];
    return componentData[selectedComponent] || [];
  };

  /**
   * Filters activities based on selected filter status
   * @returns {Array} Filtered activities array
   */
  const getFilteredActivities = () => {
    if (!filterStatus || filterStatus === 'All') return activities;
    return activities.filter(activity => activity.status === filterStatus);
  };

  /**
   * Generates initials from engineer name for avatar display
   * @param {Object} engineer - Engineer object with name property
   * @returns {string} Uppercase initials
   */
  const getInitials = (engineer) => {
    if (!engineer || !engineer.name) return 'NA';
    return engineer.name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  /**
   * Gets the appropriate border color for activity cards based on status
   * @param {string} status - Activity status
   * @returns {string} Color value from theme
   */
  const getCardBorderColor = (status) => {
    const statusColor = statusColors[status] || 'default';
    return theme.palette[statusColor]?.main || theme.palette.grey[300];
  };

  // Loading state - show spinner while data is being fetched
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  // Error state - show error message with retry option
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center', maxWidth: 500 }}>
          <CancelIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Error
          </Typography>
          <Typography color="textSecondary">{error}</Typography>
          <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={fetchData}>
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  // Main component render
  return (
    <div className="activity-management-container">
      {/* Header section with title and filter controls */}
      <div className="activity-management-header">
        <h1>Activity List</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ color: '#555', fontWeight: 500 }}>Total Activities: {activities.length}</span>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Filter by Status"
              size="small"
            >
              {filterOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
      
      {/* Activities grid layout */}
      <Grid container spacing={3}>
        {getFilteredActivities().map((activity) => (
          <Grid item xs={12} sm={6} md={4} key={activity.id}>
            {/* Individual activity card */}
            <Card className="activity-card"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: `5px solid ${getCardBorderColor(activity.status)}`,
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              {/* Card header with avatar and basic activity info */}
              <CardHeader
                avatar={
                  <Avatar 
                    sx={{ 
                      bgcolor: activity.assignedEngineer ? theme.palette.primary.main : theme.palette.grey[400]
                    }}
                  >
                    {activity.assignedEngineer ? getInitials(activity.assignedEngineer) : <EngineeringIcon />}
                  </Avatar>
                }
                title={
                  <Typography variant="h6" component="div">
                    Activity #{activity.id}
                  </Typography>
                }
                subheader={
                  <Chip 
                    icon={statusIcons[activity.status]}
                    label={activity.status} 
                    color={statusColors[activity.status]} 
                    size="small"
                    sx={{ fontWeight: 'medium' }}
                  />
                }
              />
              
              {/* Card content with activity details */}
                <CardContent sx={{ pt: 0, flexGrow: 1 }}>
                {/* Activity description */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 2,
                    color: theme.palette.text.primary,
                    fontWeight: 'medium'
                  }}
                >
                  <DescriptionIcon 
                    fontSize="small" 
                    sx={{ 
                      verticalAlign: 'middle', 
                      mr: 1,
                      color: theme.palette.secondary.main
                    }} 
                  />
                  {activity.description}
                </Typography>
                
                {/* Activity image display - shows first image with indicator for multiple images */}
                {activity.images && activity.images.length > 0 && (
                  <Box 
                    sx={{ 
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      borderRadius: 1,
                      boxShadow: '0 0 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <img 
                      src={`http://localhost:4000/images/${activity.images[0]}`}
                      alt="Activity"
                      style={{ 
                        width: '100%',
                        height: 140,
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedActivity(activity);
                        setDialogOpen('image');
                      }}
                    />
                    {/* Multiple images indicator */}
                    {activity.images.length > 1 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '0.75rem',
                        }}
                      >
                        +{activity.images.length - 1}
                      </Box>
                    )}
                  </Box>
                )}
                
                <Divider sx={{ my: 1.5 }} />
                
                {/* Activity metadata section */}
                
                {/* Component information */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <CategoryIcon 
                    fontSize="small" 
                    sx={{ 
                      mr: 1,
                      color: theme.palette.info.main
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 0.5 }}>
                    Component:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {activity.component || 'Not specified'}
                  </Typography>
                </Box>
                
                {/* Subcomponent information */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <ClassIcon 
                    fontSize="small" 
                    sx={{ 
                      mr: 1,
                      color: theme.palette.info.main
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 0.5 }}>
                    Subcomponent:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {activity.subcomponent || 'Not specified'}
                  </Typography>
                </Box>
                
                {/* Location information */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <LocationOnIcon 
                    fontSize="small" 
                    sx={{ 
                      mr: 1,
                      color: theme.palette.error.main
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 0.5 }}>
                    Location:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {activity.zone}, {activity.district}, {activity.province}
                  </Typography>
                </Box>
                
                {/* Assigned engineer information */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <EngineeringIcon 
                    fontSize="small" 
                    sx={{ 
                      mr: 1,
                      color: theme.palette.warning.main
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 0.5 }}>
                    Engineer:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {getEngineerName(activity.assignedEngineer)}
                  </Typography>
                </Box>
                
                {/* Creation timestamp */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <AccessTimeIcon 
                    fontSize="small" 
                    sx={{ 
                      mr: 1,
                      color: theme.palette.success.main
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 0.5 }}>
                    Created:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {activity.createdAt ? format(parseISO(activity.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                  </Typography>
                </Box>
                
                {/* Rejection reason display (only shown if activity was rejected) */}
                {activity.rejection_reason && (
                  <Box 
                    sx={{ 
                      mt: 1.5, 
                      p: 1.5, 
                      bgcolor: theme.palette.error.light,
                      borderRadius: 1,
                      borderLeft: `3px solid ${theme.palette.error.main}`
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme.palette.error.dark }}>
                      Rejection Reason:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {activity.rejection_reason.length > 80 
                        ? `${activity.rejection_reason.substring(0, 80)}...` 
                        : activity.rejection_reason
                      }
                    </Typography>
                  </Box>
                )}
              </CardContent>
              
              {/* Card actions - different buttons based on activity status */}
              <CardActions 
                sx={{ 
                  justifyContent: 'flex-end', 
                  p: 2,
                  pt: 0,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}
              >
                {/* Show update button for pending activities */}
                {activity.status === 'Pending' ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleStatusChange(activity)}
                    sx={{ 
                      borderRadius: 4,
                      boxShadow: 2,
                      bgcolor: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark
                      }
                    }}
                  >
                    Update Status
                  </Button>
                ) : activity.status === 'Rejected' && activity.assignedEngineer ? (
                  <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    onClick={() => {
                      setSelectedActivity(activity);
                      setSelectedEngineer('');
                      setDialogOpen('reassign');
                    }}
                    sx={{ borderRadius: 4, boxShadow: 2 }}
                  >
                    Reassign
                  </Button>
                ) : (
                  <Chip
                    label={getStatusMessage(activity.status)}
                    variant="outlined"
                    size="small"
                    color={statusColors[activity.status] || 'default'}
                  />
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Status Update Dialog - Main dialog for updating activity status, assigning engineers, etc. */}
      <Dialog 
        open={dialogOpen === true} 
        onClose={handleDialogClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
          <Typography variant="h6">
            Update Activity #{selectedActivity?.id}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {/* Activity description field */}
          <TextField
            fullWidth
            margin="normal"
            label="Activity Description"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            multiline
            rows={2}
            required
            InputProps={{ sx: { borderRadius: 1 } }}
          />
          
          {/* Status selection dropdown */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Status"
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {status === 'DO Accepted' ? 
                      <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: theme.palette.success.main }} /> : 
                      <CancelIcon fontSize="small" sx={{ mr: 1, color: theme.palette.error.main }} />
                    }
                    {status}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          

          {/* Component selection dropdown */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Component</InputLabel>
            <Select
              value={selectedComponent}
              onChange={(e) => handleComponentChange(e.target.value)}
              label="Component"
            >
              <MenuItem value="">Select Component</MenuItem>
              {Object.keys(componentData).map((component) => (
                <MenuItem key={component} value={component}>
                  {component}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Subcomponent selection dropdown - depends on selected component */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Subcomponent</InputLabel>
            <Select
              value={selectedSubcomponent}
              onChange={(e) => setSelectedSubcomponent(e.target.value)}
              label="Subcomponent"
              disabled={!selectedComponent}
            >
              <MenuItem value="">Select Subcomponent</MenuItem>
              {getAvailableSubcomponents().map((subcomponent) => (
                <MenuItem key={subcomponent} value={subcomponent}>
                  {subcomponent}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Engineer assignment dropdown - only shown when status is 'Approved' */}
          {selectedStatus === 'Approved' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Assign Engineer</InputLabel>
              <Select
                value={selectedEngineer}
                onChange={(e) => setSelectedEngineer(e.target.value)}
                label="Assign Engineer"
                required
              >
                <MenuItem value="">Select Engineer</MenuItem>
                {engineers.map((engineer) => (
                  <MenuItem key={engineer.engineer_id} value={engineer.engineer_id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          mr: 1,
                          bgcolor: theme.palette.primary.main,
                          fontSize: '0.75rem' 
                        }}
                      >
                        {engineer.engineer_name.split(' ').map(name => name[0]).join('').toUpperCase()}
                      </Avatar>
                      {engineer.engineer_name} ({engineer.specialization})
                    </Box>
                  </MenuItem>
                ))}            </Select>
          </FormControl>
          )}

          {/* Rejection reason field - only shown when status is 'Rejected' */}
          {selectedStatus === 'Rejected' && (
            <TextField
              fullWidth
              margin="normal"
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              multiline
              rows={3}
              required
              error={selectedStatus === 'Rejected' && !rejectionReason}
              helperText={selectedStatus === 'Rejected' && !rejectionReason ? "Rejection reason is required" : ""}
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: theme.palette.grey[50] }}>
          {/* Cancel button */}
          <Button 
            onClick={handleDialogClose}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 4 }}
          >
            Cancel
          </Button>
          {/* Update button - disabled if required fields are missing */}
          <Button 
            onClick={handleStatusUpdate} 
            color="primary" 
            variant="contained"
            disabled={
              !selectedStatus || 
              (selectedStatus === 'DO Accepted' && !selectedEngineer) ||
              (selectedStatus === 'Rejected' && !rejectionReason)
            }
            sx={{ 
              borderRadius: 4,
              boxShadow: 2
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Image Gallery Dialog - Shows activity images in a modal with navigation */}
      <Dialog
        open={dialogOpen === 'image'}
        onClose={handleDialogClose}
        maxWidth="md"
        PaperProps={{ elevation: 5, sx: { borderRadius: 2, overflow: 'hidden' } }}
      >
        {selectedActivity && selectedActivity.images && selectedActivity.images.length > 0 && (
          <>
            {/* Dialog header with image counter */}
            <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Activity #{selectedActivity.id} Images ({selectedImageIndex + 1}/{selectedActivity.images.length})
              </Typography>
              <IconButton size="small" onClick={handleDialogClose} sx={{ color: 'white' }}>
                <CancelIcon />
              </IconButton>
            </DialogTitle>
            
            {/* Main image display area with navigation arrows */}
            <Box sx={{ position: 'relative', width: '100%', maxHeight: '70vh', display: 'flex', justifyContent: 'center', bgcolor: '#000' }}>
              <img 
                src={`http://localhost:4000/images/${selectedActivity.images[selectedImageIndex]}`}
                alt={`Activity ${selectedActivity.id} - Image ${selectedImageIndex + 1}`}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }} 
              />
              {/* Navigation arrows for multiple images */}
              {selectedActivity.images.length > 1 && (
                <>
                  {/* Previous image button */}
                  <IconButton 
                    sx={{ 
                      position: 'absolute', 
                      left: 8, 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.3)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' }
                    }}
                    onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : selectedActivity.images.length - 1))}
                  >
                    <Typography variant="h4">‹</Typography>
                  </IconButton>
                  {/* Next image button */}
                  <IconButton 
                    sx={{ 
                      position: 'absolute', 
                      right: 8, 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.3)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' }
                    }}
                    onClick={() => setSelectedImageIndex((prev) => (prev < selectedActivity.images.length - 1 ? prev + 1 : 0))}
                  >
                    <Typography variant="h4">›</Typography>
                  </IconButton>
                </>
              )}
            </Box>
            {/* Image thumbnails row for multiple images */}
            {selectedActivity.images.length > 1 && (
              <Box sx={{ display: 'flex', overflowX: 'auto', p: 1, bgcolor: '#f5f5f5' }}>
                {selectedActivity.images.map((image, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      flexShrink: 0,
                      m: 0.5, 
                      borderRadius: 1,
                      border: index === selectedImageIndex ? `2px solid ${theme.palette.primary.main}` : 'none',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={`http://localhost:4000/images/${image}`}
                      alt={`Thumbnail ${index + 1}`}
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }} 
                    />
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </Dialog>
      
      {/* Engineer Reassignment Dialog - Used for reassigning rejected activities */}
      <Dialog
        open={dialogOpen === 'reassign'}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ elevation: 5, sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.secondary.main, color: 'white' }}>
          <Typography variant="h6">
            Reassign Activity #{selectedActivity?.id}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {/* Engineer selection for reassignment */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Assign Engineer</InputLabel>
            <Select
              value={selectedEngineer}
              onChange={(e) => setSelectedEngineer(e.target.value)}
              label="Assign Engineer"
              required
            >
              <MenuItem value="">Select Engineer</MenuItem>
              {engineers.map((engineer) => (
                <MenuItem key={engineer.engineer_id} value={engineer.engineer_id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        mr: 1,
                        bgcolor: theme.palette.primary.main,
                        fontSize: '0.75rem' 
                      }}
                    >
                      {engineer.engineer_name.split(' ').map(name => name[0]).join('').toUpperCase()}
                    </Avatar>
                    {engineer.engineer_name} ({engineer.specialization})
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: theme.palette.grey[50] }}>
          {/* Cancel reassignment */}
          <Button 
            onClick={handleDialogClose}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 4 }}
          >
            Cancel
          </Button>
          {/* Confirm reassignment */}
          <Button 
            onClick={async () => {
              if (!selectedActivity || !selectedEngineer) return;
              try {
                const payload = {
                  id: selectedActivity.id,
                  status: 'Approved',
                  assigned_engineer_id: selectedEngineer,
                };
                const response = await axios.put('http://localhost:4000/api/activity/update', payload);
                if (response.data.success) {
                  fetchData();
                  handleDialogClose();
                }
              } catch (err) {
                setError(err.response?.data?.message || 'Reassign failed');
              }
            }}
            color="secondary"
            variant="contained"
            disabled={!selectedEngineer}
            sx={{ borderRadius: 4, boxShadow: 2 }}
          >
            Confirm Reassign
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ActivityManagement;