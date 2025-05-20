import './DevOfficerSidebar.css';
import {
  AddCircle as AddCircleIcon,
  BusinessCenter as BusinessCenterIcon,
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  ExitToApp as ExitToAppIcon,
  FormatListBulleted as FormatListBulletedIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Modal,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import axios from 'axios';

const Sidebar2 = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal control
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    officer_name: '',
    email: '',
    tel_num: '',
    nic: '',
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOfficer();
  }, []);

  const fetchOfficer = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/dev_office/get', {
        headers: { token },
      });
      if (res.data.success) {
        setOfficer(res.data.officer);
        setForm({
          officer_name: res.data.officer.officer_name,
          email: res.data.officer.email,
          tel_num: res.data.officer.tel_num,
          nic: res.data.officer.nic,
        });
      }
    } catch (err) {
      console.error('Failed to fetch officer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleEditClick = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        'http://localhost:4000/api/dev_office/update',
        form,
        {
          headers: {  token},
        }
      );
      if (res.data.success) {
        fetchOfficer();
        setModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to update officer:', err);
    }
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
    { text: 'Add Activity', icon: <AddCircleIcon />, path: '/Add' },
    { text: 'Activity List', icon: <FormatListBulletedIcon />, path: '/Activity' },
    { text: 'View Priority List', icon: <FormatListBulletedIcon />, path: '/priority-list' },
    { text: 'Pending Annual Budget Plan', icon: <FormatListBulletedIcon />, path: '/budget-list' },
  ];

  return (
    <Box>
      {isMobile && (
        <AppBar position="sticky">
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={toggleDrawer}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Development Officer</Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        className="sidebar2"
        sx={{
          width: 250,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
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
          className="sidebar2-header"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 10px',
            
            overflowX: 'hidden',
          }}
        >
          <Avatar sx={{ width: 70, height: 70, mb: 1 }}>
            <BusinessCenterIcon sx={{ fontSize: 40 }} />
          </Avatar>

          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
            Development Officer
          </Typography>

          <Chip
            className="sidebar2-chip"
            label={loading ? 'Loading...' : officer?.officer_name || ''}
            variant="outlined"
            size="small"
            onClick={handleEditClick}
            icon={<EditIcon sx={{ color: '#fff' }} />}
            sx={{
              color: '#fff',
              mt: 1,
              fontSize: '0.85rem',
              cursor: 'pointer',
              '& .MuiChip-label': { fontWeight: 500 },
              overflowX: 'hidden',
            }}
          />
        </Box>

        <Box
          className="sidebar2-content-container"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 'calc(100% - 170px)',
            overflowX: 'hidden',
          }}
        >
          <Box className="sidebar2-menu-container" sx={{ overflow: 'auto', mt: 2,overflowX: 'hidden', }}>
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
                    <Divider className="sidebar2-divider" sx={{ my: 0.5, mx: 2 }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>

          <Box className="sidebar2-footer" sx={{ mb: 2, overflowX: 'hidden',}}>
            <Divider className="sidebar2-divider" sx={{ my: 1, mx: 2 }} />
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

      {/* Edit Modal */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Update Officer Details
          </Typography>
          <TextField
            fullWidth
            label="Name"
            name="officer_name"
            value={form.officer_name}
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
            label="Telephone"
            name="tel_num"
            value={form.tel_num}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="NIC"
            name="nic"
            value={form.nic}
            onChange={handleInputChange}
            margin="normal"
          />
          <Button variant="contained" color="primary" fullWidth onClick={handleUpdate} sx={{ mt: 2 }}>
            Update
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Sidebar2;
