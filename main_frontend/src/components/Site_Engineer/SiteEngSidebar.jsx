import './SiteEngSidebar.css';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EditIcon from '@mui/icons-material/Edit';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';

const mainColor = '#5a0a73';

const Sidebar3 = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(true);
  const [engineer, setEngineer] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    engineer_name: '',
    email: '',
    tel_num: '',
    specialization: '',
  });

  useEffect(() => {
    fetchEngineer();
  }, []);

  const fetchEngineer = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:4000/api/get', {
        headers: { token },
      });

      if (res.data.success) {
        setEngineer(res.data.engineer);
        setForm({
          engineer_name: res.data.engineer.engineer_name,
          email: res.data.engineer.email,
          tel_num: res.data.engineer.tel_num,
          specialization: res.data.engineer.specialization,
        });
      }
    } catch (error) {
      console.error('Failed to fetch engineer', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDrawer = () => setOpen(!open);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        'http://localhost:4000/api/update',
        { engineer_id: engineer.engineer_id, ...form },
        { headers: { token } }
      );

      if (res.data.success) {
        setEngineer({ ...engineer, ...form });
      } else {
        alert('Update failed');
      }
    } catch (error) {
      console.error('Failed to update engineer', error);
      alert('Error updating');
    }
  };

  const menuItems = [
    { text: 'Assigned Activities', icon: <AddCircleIcon />, path: '/list-e' },
    { text: 'My Activity', icon: <FormatListBulletedIcon />, path: '/e-activity' },
  ];

  return (
    <Box>
      {isMobile && (
        <AppBar position="sticky" sx={{ backgroundColor: mainColor }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={toggleDrawer}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Site Engineer</Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        className="sidebar3"
        sx={{
          width: 250,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
            backgroundColor: mainColor,
            color: '#fff',
            overflowX: 'hidden',
          },
        }}
        variant={isMobile ? 'temporary' : 'permanent'}
        anchor="left"
        open={isMobile ? open : true}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
      >
        <Box
          className="sidebar3-header"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 10px',
            overflowX: 'hidden',
          }}
        >
          <Avatar sx={{ width: 70, height: 70, mb: 1, bgcolor: '#7c43bd' }}>
            <BusinessCenterIcon sx={{ fontSize: 40 }} />
          </Avatar>

          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
            Site Engineer
          </Typography>

          <Chip
            className="sidebar3-chip"
            label={loading ? 'Loading...' : engineer?.engineer_name}
            variant="outlined"
            size="small"
            onClick={() => setProfileDialogOpen(true)}
            icon={<EditIcon sx={{ color: '#fff !important', fontSize: 14 }} />}
            sx={{
              color: '#fff',
              mt: 1,
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderColor: '#fff',
              '& .MuiChip-label': { fontWeight: 500 },
              '& .MuiChip-icon': { color: '#fff !important', fontSize: 14 },
              overflowX: 'hidden',
              background: 'rgba(255,255,255,0.08)',
              '&:hover': { background: 'rgba(255,255,255,0.18)' },
            }}
          />
        </Box>

        <Box
          className="sidebar3-content-container"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 'calc(100% - 170px)',
            overflowX: 'hidden',
          }}
        >
          <Box className="sidebar3-menu-container" sx={{ overflow: 'auto', mt: 2, overflowX: 'hidden' }}>
            <List>
              {menuItems.map((item, index) => (
                <React.Fragment key={item.text}>
                  <ListItem button component={Link} to={item.path} sx={{ mx: 1 }}>
                    <ListItemIcon sx={{ color: 'rgba(255, 255, 255, 0.8)', minWidth: '40px' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText sx={{ color: 'rgba(255,255,255,0.8)', minWidth: '40px' }} primary={item.text} />
                  </ListItem>
                  {index < menuItems.length - 1 && (
                    <Divider className="sidebar3-divider" sx={{ my: 0.5, mx: 2, borderColor: 'rgba(255,255,255,0.15)' }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>

          <Box className="sidebar3-footer" sx={{ mb: 2, overflowX: 'hidden' }}>
            <Divider className="sidebar3-divider" sx={{ my: 1, mx: 2, borderColor: 'rgba(255,255,255,0.15)' }} />
            <ListItem button onClick={handleLogout} sx={{ mx: 1 }}>
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Log Out" />
            </ListItem>
          </Box>
        </Box>
      </Drawer>

      {/* Main content placeholder */}
      <Box sx={{ marginLeft: isMobile ? 0 : 250, overflow: 'hidden' }} />

      {/* Edit Profile Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>Update Engineer Details</DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#fafafa' }}>
          <TextField
            fullWidth
            label="Name"
            name="engineer_name"
            value={form.engineer_name}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Tel Number"
            name="tel_num"
            value={form.tel_num}
            onChange={handleInputChange}
            margin="normal"
          />
      
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setForm({
                engineer_name: engineer.engineer_name,
                email: engineer.email,
                tel_num: engineer.tel_num
              });
              setProfileDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleUpdate();
              setProfileDialogOpen(false);
            }}
            sx={{ backgroundColor: mainColor, color: '#fff', '&:hover': { backgroundColor: '#7c43bd' } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sidebar3;
