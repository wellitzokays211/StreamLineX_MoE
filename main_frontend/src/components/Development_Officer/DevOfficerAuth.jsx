import { Box, Button, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DevOfficerAuth = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    tel_num: '',
    nic: '',
    secretKey: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setErrors({});
    setApiError('');
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };  const validateRegisterForm = () => {
    const newErrors = {};
      // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    } else if (!/^[A-Za-z][A-Za-z\s'\-\.]*[A-Za-z]$/.test(formData.name)) {
      newErrors.name = 'Name should start and end with a letter and contain only letters, spaces, hyphens, apostrophes, or periods';
    } else if (/[\s'\-\.]{2,}/.test(formData.name)) {
      newErrors.name = 'Name should not contain consecutive spaces or symbols';
    }
    
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.password || formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    // Phone number validation: Must be exactly 10 digits and start with 0
    if (!formData.tel_num) {
      newErrors.tel_num = 'Phone number is required';
    } else if (!formData.tel_num.match(/^0\d{9}$/)) {
      newErrors.tel_num = 'Phone number must be 10 digits and start with 0';
    }
    
    // NIC validation: Old (9 digits + V/v) or New (12 digits)
    if (!formData.nic) {
      newErrors.nic = 'NIC is required';
    } else if (!/^\d{9}[Vv]$/.test(formData.nic) && !/^\d{12}$/.test(formData.nic)) {
      newErrors.nic = 'Please enter a valid NIC number (e.g., 880123456V or 199012345678).';
    }
    if (!formData.secretKey || formData.secretKey !== '1234') newErrors.secretKey = 'Valid secret key is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLoginForm = () => {
    const newErrors = {};
    if (!loginData.email) newErrors.email = 'Email is required';
    if (!loginData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    try {
      const response = await axios.post('http://localhost:4000/api/dev_office/register', formData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        navigate('/priority-list'); // Adjust the redirect as needed
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    try {
      const response = await axios.post('http://localhost:4000/api/dev_office/login', loginData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        navigate('/priority-list'); 
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ width: 400, p: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Register" />
          <Tab label="Login" />
        </Tabs>

        {apiError && (
          <Typography color="error" align="center" sx={{ mt: 2 }}>
            {apiError}
          </Typography>
        )}

        {activeTab === 0 ? (
          // Register Form
          <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={(e) => {                const value = e.target.value;
                // Only allow 50 characters max
                if (value.length <= 50) {
                  // Allow only letters, spaces, hyphens, apostrophes, and periods
                  if (!value || /^[A-Za-z]?[A-Za-z\s'\-\.]*[A-Za-z]?$/.test(value)) {
                    // Prevent consecutive spaces or symbols
                    if (!/[\s'\-\.]{2,}/.test(value)) {
                      setFormData(prev => ({ ...prev, name: value }));
                    }
                  }
                }
              }}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
              inputProps={{ maxLength: 50 }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleRegisterChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleRegisterChange}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
            />            <TextField
              fullWidth
              label="Phone Number"
              name="tel_num"
              value={formData.tel_num}
              onChange={(e) => {
                // Allow only digits and limit to 10 characters
                const value = e.target.value.replace(/[^\d]/g, '');
                if (value.length <= 10) {
                  setFormData(prev => ({ ...prev, tel_num: value }));
                }
              }}
              error={!!errors.tel_num}
              helperText={errors.tel_num}
              margin="normal"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
            <TextField
              fullWidth
              label="NIC Number"
              name="nic"
              value={formData.nic}
              onChange={e => {
                // Allow only digits and V/v, and limit length to 12
                let val = e.target.value.replace(/[^\dVv]/g, '');
                if (val.length > 12) val = val.slice(0, 12);
                setFormData(prev => ({ ...prev, nic: val }));
              }}
              error={!!errors.nic}
              helperText={errors.nic}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Secret Key"
              name="secretKey"
              type="password"
              value={formData.secretKey}
              onChange={handleRegisterChange}
              error={!!errors.secretKey}
              helperText={errors.secretKey}
              margin="normal"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Register
            </Button>
          </Box>
        ) : (
          // Login Form
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={loginData.password}
              onChange={handleLoginChange}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Login
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DevOfficerAuth;