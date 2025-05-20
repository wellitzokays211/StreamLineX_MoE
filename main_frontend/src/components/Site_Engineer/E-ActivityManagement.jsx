import {
  Avatar,
  Box,
  Button,
  Card,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClassIcon from '@mui/icons-material/Class';
import DescriptionIcon from '@mui/icons-material/Description';
import FilterListIcon from '@mui/icons-material/FilterList';
import ImageIcon from '@mui/icons-material/Image';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import { format } from 'date-fns';

const EActivityManagement = () => {
  const theme = useTheme();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  const statusOptions = ['Accepted', 'Rejected'];
  const statusColors = {
    Pending: 'default',
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
    'Not Started': <AccessTimeIcon fontSize="small" />,
    'On-Going': <AccessTimeIcon fontSize="small" />,
    Completed: <CheckCircleIcon fontSize="small" />,
    Accepted: <CheckCircleIcon fontSize="small" />
  };

  // Get token from localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/update_activity/get_id', {
        headers: {
          token
        }
      });
      
      if (response.data.success) {
        const manageableActivities = response.data.activities.filter(
          activity => activity.status === 'Approved'
        );
        setActivities(manageableActivities);
      } else {
        setError('Failed to fetch activities');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching activities');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (activity) => {
    setSelectedActivity(activity);
    setSelectedStatus('');
    setRejectionReason('');
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedActivity(null);
    setSelectedStatus('');
    setRejectionReason('');
  };

  const handleImageClick = (imagePath) => {
    setSelectedImage(`http://localhost:4000/images/${imagePath}`);
    setImageDialogOpen(true);
  };

  const handleImageDialogClose = () => {
    setImageDialogOpen(false);
    setSelectedImage('');
  };

  const handleStatusUpdate = async () => {
    if (!selectedActivity || !selectedStatus) return;

    try {
      const payload = {
        id: selectedActivity.id,
        status: selectedStatus,
        ...(selectedStatus === 'Rejected' && { rejectionReason })
      };

      const response = await axios.put(
        'http://localhost:4000/api/activity/update_id', 
        payload,
        {
          headers: {
            token
          }
        }
      );

      if (response.data.success) {
        fetchActivities();
        handleDialogClose();
      } else {
        setError('Failed to update activity status');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating activity status');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredActivities = activities.filter(activity => 
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (activity.component && activity.component.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (activity.subcomponent && activity.subcomponent.toLowerCase().includes(searchTerm.toLowerCase())) ||
    activity.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.province.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={fetchActivities}>
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      padding: 3,
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      ml: '250px',
      maxWidth: '1200px'
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              pb: 1
            }}
          >
            Pending Activities
          </Typography>
          
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchActivities}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: theme.palette.background.paper, 
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            p: '4px 8px',
            flex: 1,
            mr: 2
          }}>
            <SearchIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
            <TextField
              variant="standard"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              InputProps={{
                disableUnderline: true,
              }}
            />
          </Box>
          
          <Chip 
            icon={<FilterListIcon />} 
            label={`${filteredActivities.length} results`} 
            variant="outlined" 
            color="primary" 
          />
        </Box>
      </Paper>

      {filteredActivities.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
            No pending activities found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            All activities have been processed or no activities match your search criteria.
          </Typography>
        </Paper>
      ) : (
        <TableContainer 
          component={Paper} 
          elevation={2} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Component</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Subcomponent</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created At</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Images</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredActivities
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((activity) => (
                <TableRow 
                  key={activity.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: theme.palette.action.hover 
                    },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      #{activity.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DescriptionIcon 
                        fontSize="small" 
                        sx={{ 
                          mr: 1, 
                          color: theme.palette.secondary.main 
                        }} 
                      />
                      <Typography variant="body2">
                        {activity.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CategoryIcon 
                        fontSize="small" 
                        sx={{ 
                          mr: 1, 
                          color: theme.palette.info.main 
                        }} 
                      />
                      <Typography variant="body2">
                        {activity.component || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ClassIcon 
                        fontSize="small" 
                        sx={{ 
                          mr: 1, 
                          color: theme.palette.info.main 
                        }} 
                      />
                      <Typography variant="body2">
                        {activity.subcomponent || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOnIcon 
                        fontSize="small" 
                        sx={{ 
                          mr: 1, 
                          color: theme.palette.error.main 
                        }} 
                      />
                      <Typography variant="body2">
                        {activity.zone}, {activity.district}, {activity.province}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={statusIcons[activity.status]}
                      label={activity.status} 
                      color={statusColors[activity.status]} 
                      size="small"
                      sx={{ fontWeight: 'medium' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon 
                        fontSize="small" 
                        sx={{ 
                          mr: 1, 
                          color: theme.palette.success.main 
                        }} 
                      />
                      <Typography variant="body2">
                        {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {activity.images?.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {activity.images.slice(0, 3).map((img, idx) => (
                          <Box 
                            key={idx}
                            sx={{ 
                              position: 'relative',
                              '&:hover .image-overlay': {
                                opacity: 1
                              }
                            }}
                          >
                            <img
                              src={`http://localhost:4000/images/${img}`}
                              alt={`Activity ${activity.id}`}
                              style={{ 
                                width: 50, 
                                height: 50, 
                                objectFit: 'cover', 
                                borderRadius: '4px',
                                cursor: 'pointer',
                                border: `1px solid ${theme.palette.divider}`
                              }}
                              onClick={() => handleImageClick(img)}
                            />
                            <Box 
                              className="image-overlay"
                              sx={{ 
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                borderRadius: '4px'
                              }}
                            >
                              <VisibilityIcon sx={{ color: 'white' }} />
                            </Box>
                          </Box>
                        ))}
                        {activity.images.length > 3 && (
                          <Tooltip title="View all images">
                            <Chip 
                              size="small" 
                              label={`+${activity.images.length - 3}`} 
                              onClick={() => handleStatusChange(activity)} 
                              sx={{ height: 24, cursor: 'pointer' }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    ) : (
                      <Chip 
                        icon={<ImageIcon fontSize="small" />} 
                        label="No images" 
                        variant="outlined" 
                        size="small" 
                        color="default" 
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<VisibilityIcon />}
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
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredActivities.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}

      {/* Review Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: theme.palette.primary.main, 
            color: 'white',
            pb: 1
          }}
        >
          <Typography variant="h6">
            Review Activity #{selectedActivity?.id}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedActivity && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  <Typography variant="h6" color="primary" gutterBottom>
                    Activity Details
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <DescriptionIcon sx={{ color: theme.palette.secondary.main, mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {selectedActivity.description}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <CategoryIcon sx={{ color: theme.palette.info.main, mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Component
                      </Typography>
                      <Typography variant="body1">
                        {selectedActivity.component || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <ClassIcon sx={{ color: theme.palette.info.main, mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Subcomponent
                      </Typography>
                      <Typography variant="body1">
                        {selectedActivity.subcomponent || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <LocationOnIcon sx={{ color: theme.palette.error.main, mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {selectedActivity.zone}, {selectedActivity.district}, {selectedActivity.province}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <AccessTimeIcon sx={{ color: theme.palette.success.main, mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Created At
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(selectedActivity.createdAt), 'MMMM dd, yyyy HH:mm')}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h6" color="primary" gutterBottom>
                    Images
                  </Typography>
                  
                  {selectedActivity.images && selectedActivity.images.length > 0 ? (
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedActivity.images.map((img, idx) => (
                        <Box 
                          key={idx}
                          sx={{ 
                            position: 'relative',
                            width: 'calc(50% - 4px)',
                            '&:hover .image-overlay': {
                              opacity: 1
                            }
                          }}
                        >
                          <img
                            src={`http://localhost:4000/images/${img}`}
                            alt={`Activity ${selectedActivity.id}`}
                            style={{ 
                              width: '100%', 
                              height: 120, 
                              objectFit: 'cover', 
                              borderRadius: '4px',
                              cursor: 'pointer',
                              border: `1px solid ${theme.palette.divider}`
                            }}
                            onClick={() => handleImageClick(img)}
                          />
                          <Box 
                            className="image-overlay"
                            sx={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              borderRadius: '4px'
                            }}
                          >
                            <VisibilityIcon sx={{ color: 'white', fontSize: 32 }} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        mt: 2, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        height: 120,
                        bgcolor: theme.palette.action.hover,
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        No images available
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Decision
                    </Typography>
                    
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>Decision</InputLabel>
                      <Select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        label="Decision"
                      >
                        <MenuItem value="Accepted">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                            Accept
                          </Box>
                        </MenuItem>
                        <MenuItem value="Rejected">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CancelIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                            Reject
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>

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
                        helperText={selectedStatus === 'Rejected' && !rejectionReason ? "Please provide a reason for rejection" : ""}
                        sx={{ mt: 2 }}
                      />
                    )}
                  </Box>
                </Card>
              </Grid>
            </Grid>
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
            disabled={!selectedStatus || (selectedStatus === 'Rejected' && !rejectionReason)}
            sx={{ 
              borderRadius: 4,
              boxShadow: 2
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Dialog */}
      <Dialog 
        open={imageDialogOpen} 
        onClose={handleImageDialogClose} 
        maxWidth="md"
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
          <Typography variant="h6">
            Image Preview
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Activity"
              style={{ 
                width: '100%', 
                maxHeight: '80vh', 
                objectFit: 'contain',
                display: 'block'
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleImageDialogClose}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 4 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EActivityManagement;