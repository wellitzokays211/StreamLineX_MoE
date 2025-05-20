import { Box, Button, CircularProgress, Container, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Responsible_Person_Auth = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    tel_num: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:4000/api/user/responsible_person/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Authentication failed');
      localStorage.setItem('token', data.token);
      navigate('/List-Activity');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };  const handleRegister = async (e) => {
    e.preventDefault();
      // Validate name
    if (!registerData.name) {
      setError('Name is required');
      return;
    } else if (registerData.name.length > 50) {
      setError('Name cannot exceed 50 characters');
      return;
    } else if (!/^[A-Za-z][A-Za-z\s'\-\.]*[A-Za-z]$/.test(registerData.name)) {
      setError('Name should start and end with a letter and contain only letters, spaces, hyphens, apostrophes, or periods');
      return;
    } else if (/[\s'\-\.]{2,}/.test(registerData.name)) {
      setError('Name should not contain consecutive spaces or symbols');
      return;
    }
    
    // Validate phone number
    if (!registerData.tel_num || !registerData.tel_num.match(/^0\d{9}$/)) {
      setError('Phone number must be 10 digits and start with 0');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:4000/api/user/responsible_person/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      localStorage.setItem('token', data.token);
      navigate('/List-Activity');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
        </Box>
        {activeTab === 0 ? (
          <Box sx={{ mt: 3 }}>
            <Typography component="h1" variant="h5" align="center">
              Responsible Person Login
            </Typography>
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                autoComplete="email"
                autoFocus
                value={loginData.email}
                onChange={e => setLoginData({ ...loginData, email: e.target.value })}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                autoComplete="current-password"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
              />
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ mt: 3 }}>
            <Typography component="h1" variant="h5" align="center">
              Responsible Person Registration
            </Typography>
            <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>              <TextField
                margin="normal"
                required
                fullWidth
                label="Full Name"
                autoComplete="name"
                value={registerData.name}                onChange={e => {
                  const value = e.target.value;
                  // Only allow 50 characters max
                  if (value.length <= 50) {
                    // Allow only letters, spaces, hyphens, apostrophes, and periods
                    if (!value || /^[A-Za-z]?[A-Za-z\s'\-\.]*[A-Za-z]?$/.test(value)) {
                      // Prevent consecutive spaces or symbols
                      if (!/[\s'\-\.]{2,}/.test(value)) {
                        setRegisterData({ ...registerData, name: value });
                      }
                    }
                  }
                }}                error={registerData.name && (
                  registerData.name.length > 50 || 
                  !/^[A-Za-z][A-Za-z\s'\-\.]*[A-Za-z]$/.test(registerData.name) ||
                  /[\s'\-\.]{2,}/.test(registerData.name)
                )}
                helperText={
                  registerData.name && (
                    registerData.name.length > 50 ? "Name cannot exceed 50 characters" : 
                    !/^[A-Za-z][A-Za-z\s'\-\.]*[A-Za-z]$/.test(registerData.name) ? "Name should start and end with a letter" :
                    /[\s'\-\.]{2,}/.test(registerData.name) ? "No consecutive spaces or symbols allowed" : ""
                  )
                }
                inputProps={{ maxLength: 50 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                autoComplete="email"
                value={registerData.email}
                onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                autoComplete="new-password"
                value={registerData.password}
                onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
              />              <TextField
                margin="normal"
                required
                fullWidth
                label="Phone Number"
                autoComplete="tel"
                value={registerData.tel_num}
                onChange={e => {
                  // Only allow digits and limit to 10 characters
                  const value = e.target.value.replace(/[^\d]/g, '');
                  if (value.length <= 10) {
                    setRegisterData({ ...registerData, tel_num: value });
                  }
                }}
                error={registerData.tel_num && !registerData.tel_num.match(/^0\d{9}$/)}
                helperText={registerData.tel_num && !registerData.tel_num.match(/^0\d{9}$/) 
                  ? "Phone number must be 10 digits and start with 0" : ""}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              />
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Responsible_Person_Auth;