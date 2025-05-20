import './ProvDirectorSidebar.css';

import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import axios from 'axios';

const Sidebar4 = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));  
  const [open, setOpen] = useState(!isMobile);  
  const navigate = useNavigate();  
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  // Common styles that can be reused
  const styles = {
    sidebarGradient: {
      background: 'linear-gradient(to bottom, #ff8f00, #ffb74d)', // Dark orange to light orange gradient
      color: 'white',
    },
    menuItem: {
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
      },
      borderRadius: '4px',
      mx: 1,
      mb: 0.5
    },
    listItemIcon: {
      color: 'rgba(255,255,255,0.8)',
      minWidth: '40px'
    },
    divider: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      my: 0.5,
      mx: 2
    }
  };

  useEffect(() => {
    // Simulate loading user data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const menuItems = [
    { text: 'Budget', icon: <AddCircleIcon />, path: '/list-all' },
     { text: 'Annual Plan', icon: <AddCircleIcon />, path: '/final' },
  ];

   return (
    <Box>
      {isMobile && (
        <AppBar position="sticky" className="sidebar4-appbar">
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Provincial Director</Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        className="sidebar4"
        sx={{
          width: 250,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
          },
        }}
        variant={isMobile ? 'temporary' : 'permanent'}
        anchor="left"
        open={isMobile ? open : true}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true,  
        }}
      >
        <Box className="sidebar4-header">
          <Avatar 
            className="sidebar4-avatar"
            sx={{ 
              width: 70, 
              height: 70, 
              mb: 1,
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}
          >
            <BusinessCenterIcon sx={{ fontSize: 40 }} />
          </Avatar>
          
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
            Provincial Director
          </Typography>
          
          <Chip 
            className="sidebar4-chip"
            label={loading ? "Loading..." : "Provincial Director"} 
            variant="outlined" 
            size="small"
            sx={{ 
              color: '#fff', 
              mt: 1,
              fontSize: '0.85rem',
              '& .MuiChip-label': {
                fontWeight: 500
              }
            }} 
          />
        </Box>

        <Box className="sidebar4-content-container">
          <Box className="sidebar4-menu-container">
            <List>
              {menuItems.map((item, index) => (
                <React.Fragment key={item.text}>
                  <ListItem 
                    className="sidebar4-menu-item"
                    button 
                    component={Link} 
                    to={item.path}
                    sx={{
                      borderRadius: '4px',
                      mx: 1,
                      mb: 0.5
                    }}
                  >
                    <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} sx={{ color: '#fff' }} />
                  </ListItem>
                  {index < menuItems.length - 1 && (
                    <Divider className="sidebar4-divider" sx={{ my: 0.5, mx: 2 }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>
          
          <Box className="sidebar4-footer">
            <Divider className="sidebar4-divider" sx={{ my: 1, mx: 2 }} />
            <ListItem 
              className="sidebar4-menu-item"
              button 
              onClick={handleLogout}
              sx={{
                borderRadius: '4px',
                mx: 1,
                mb: 0.5
              }}
            >
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Log Out" sx={{ color: '#fff' }} />
            </ListItem>
          </Box>
        </Box>
      </Drawer>


    </Box>
  );
};

export default Sidebar4;