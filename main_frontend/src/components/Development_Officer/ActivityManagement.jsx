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
import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';

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
import axios from 'axios';
import './ActivityManagement.css';

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

const ActivityManagement = () => {
  const theme = useTheme();
  const [activities, setActivities] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');
  const [selectedSubcomponent, setSelectedSubcomponent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const statusOptions = ['Approved', 'Rejected'];
  const filterOptions = ['All', 'Pending', 'Approved', 'Rejected', 'Not Started', 'On-Going', 'Completed', 'Accepted'];

  const statusColors = {
    Pending: 'warning',
    Approved: 'success',
    Rejected: 'error',
    'Not Started': 'info',
    'On-Going': 'secondary',
    Completed: 'primary',
    Accepted: 'success'
  };

  const statusIcons = {
    Pending: <AccessTimeIcon fontSize="small" />,
    Approved: <CheckCircleIcon fontSize="small" />,
    Rejected: <CancelIcon fontSize="small" />,
    'Not Started': <EventNoteIcon fontSize="small" />,
    'On-Going': <PriorityHighIcon fontSize="small" />,
    Completed: <CheckCircleIcon fontSize="small" />,
    Accepted: <CheckCircleIcon fontSize="small" />
  };

  const priorityColors = {
    High: 'error',
    Medium: 'warning',
    Low: 'success'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [activitiesRes, engineersRes] = await Promise.all([
        axios.get('http://localhost:4000/api/activity/get'),
        axios.get('http://localhost:4000/api/engineers')
      ]);

      if (activitiesRes.data.success && engineersRes.data.success) {
        setActivities(activitiesRes.data.activities);
        setEngineers(engineersRes.data.engineers);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

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

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedActivity(null);
    setSelectedStatus('');
    setSelectedEngineer('');
    setSelectedComponent('');
    setSelectedSubcomponent('');
    setRejectionReason('');
    setEditedDescription('');
  };

 const handleStatusUpdate = async () => {
  if (!selectedActivity || !selectedStatus) return;

  try {
    const payload = {
      id: selectedActivity.id,
      status: selectedStatus,
      assigned_engineer_id: selectedStatus === 'Approved' ? selectedEngineer : null,
      rejectionReason: selectedStatus === 'Rejected' ? rejectionReason : null, // Changed to match backend
      component: selectedComponent || null,
      subcomponent: selectedSubcomponent || null,
      description: editedDescription || null
    };

    const response = await axios.put('http://localhost:4000/api/activity/update', payload);

    if (response.data.success) {
      fetchData();
      handleDialogClose();
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Update failed');
  }
};

  const getEngineerName = (engineer) => {
    if (!engineer) return 'Not assigned';
    return `${engineer.name} (${engineer.specialization})`;
  };

  const getStatusMessage = (status) => {
    switch(status) {
      case 'Approved':
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

  const handleComponentChange = (value) => {
    setSelectedComponent(value);
    setSelectedSubcomponent('');
  };

  const getAvailableSubcomponents = () => {
    if (!selectedComponent) return [];
    return componentData[selectedComponent] || [];
  };

  const getFilteredActivities = () => {
    if (!filterStatus || filterStatus === 'All') return activities;
    return activities.filter(activity => activity.status === filterStatus);
  };

  const getInitials = (engineer) => {
    if (!engineer || !engineer.name) return 'NA';
    return engineer.name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const getCardBorderColor = (status) => {
    const statusColor = statusColors[status] || 'default';
    return theme.palette[statusColor]?.main || theme.palette.grey[300];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

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

  return (
    <div className="activity-management-container">
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
      <Grid container spacing={3}>
        {getFilteredActivities().map((activity) => (
          <Grid item xs={12} sm={6} md={4} key={activity.id}>
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
              
              <CardContent sx={{ pt: 0, flexGrow: 1 }}>
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
                
                <Divider sx={{ my: 1.5 }} />
                
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
              
              <CardActions 
                sx={{ 
                  justifyContent: 'flex-end', 
                  p: 2,
                  pt: 0,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}
              >
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
                ) : activity.status === 'Rejected' ? (
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

      {/* Status Update Dialog */}
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
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Status"
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {status === 'Approved' ? 
                      <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: theme.palette.success.main }} /> : 
                      <CancelIcon fontSize="small" sx={{ mr: 1, color: theme.palette.error.main }} />
                    }
                    {status}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          

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
                ))}
              </Select>
            </FormControl>
          )}

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
          <Button 
            onClick={handleDialogClose}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 4 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleStatusUpdate} 
            color="primary" 
            variant="contained"
            disabled={
              !selectedStatus || 
              (selectedStatus === 'Approved' && !selectedEngineer) ||
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

      {/* Reassign Dialog */}
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
          <Button 
            onClick={handleDialogClose}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 4 }}
          >
            Cancel
          </Button>
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