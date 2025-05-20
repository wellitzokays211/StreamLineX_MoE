import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';

import axios from 'axios';

const MyActivity = () => {
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [budget, setBudget] = useState('');
  const [priority, setPriority] = useState('');

  const priorityOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // Only show activities with status exactly 'Accepted' (case-insensitive)
  const acceptedActivities = allActivities.filter(activity => (activity.status && activity.status.toLowerCase() === 'accepted'));
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
        const formattedActivities = response.data.activities.map(activity => ({
          ...activity,
          budget: activity.budget ? parseFloat(activity.budget) : null,
          priority: activity.priority ? parseInt(activity.priority) : null
        }));
        setAllActivities(formattedActivities);
      } else {
        setError('Failed to fetch activities');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching activities');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (activity) => {
    setSelectedActivity(activity);
    setBudget(activity.budget?.toString() || '');
    setPriority(activity.priority?.toString() || '');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedActivity(null);
    setBudget('');
    setPriority('');
  };

  const handleSaveDetails = async () => {
    if (!selectedActivity) return;

    try {
      const response = await axios.post(
        'http://localhost:4000/api/update_activity/details', 
        {
          activityId: selectedActivity.id,
          budget: parseFloat(budget),
          priority: parseInt(priority)
        },
        {
          headers: {
             token
          }
        }
      );

      if (response.data.success) {
        const updatedActivities = allActivities.map(activity => {
          if (activity.id === selectedActivity.id) {
            return { 
              ...activity, 
              budget: parseFloat(budget),
              priority: parseInt(priority)
            };
          }
          return activity;
        });
        setAllActivities(updatedActivities);
        handleCloseDialog();
      } else {
        setError('Failed to save activity details');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving activity details');
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, ml: '250px', maxWidth: '1200px' }}>
      <Typography variant="h4" gutterBottom>
        Accepted Activities
      </Typography>

      {acceptedActivities.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No accepted activities found.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {acceptedActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>{activity.id}</TableCell>
                  <TableCell>{activity.description}</TableCell>
                  <TableCell>
                    {activity.budget ? formatCurrency(activity.budget) : 'Not set'}
                  </TableCell>
                  <TableCell>{activity.priority ?? 'Not set'}</TableCell>
                  <TableCell>
                    {activity.zone}, {activity.district}, {activity.province}
                  </TableCell>
                  <TableCell>{activity.status}</TableCell>
                  <TableCell>
                    {format(parseISO(activity.createdAt), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenDialog(activity)}
                    >
                      {activity.budget ? 'Edit' : 'Add Details'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedActivity?.budget ? 'Edit Activity Details' : 'Add Activity Details'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
            inputProps={{ min: 0, step: "0.01" }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Priority (1-10)</InputLabel>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              label="Priority (1-10)"
              required
            >
              {priorityOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveDetails} 
            color="primary" 
            variant="contained"
            disabled={!budget || !priority}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyActivity;