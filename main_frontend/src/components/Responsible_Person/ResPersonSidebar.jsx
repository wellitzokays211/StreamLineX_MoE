import './ResPersonSidebar.css';
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
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dialog open state
  const [editOpen, setEditOpen] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedTel, setEditedTel] = useState('');

  const toggleDrawer = () => setOpen(!open);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('http://localhost:4000/api/user/get_user', {
          headers: { token },
        });
        if (res.data.success) {
          setUser(res.data.user);
          setEditedName(res.data.user.responsible_persons_name);
          setEditedTel(res.data.user.tel_num);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleEditOpen = () => {
    setEditedName(user?.responsible_persons_name || '');
    setEditedTel(user?.tel_num || '');
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.put(
        'http://localhost:4000/api/user/update',
        {
          responsible_persons_name: editedName,
          tel_num: editedTel,
        },
        {
          headers: { token },
        }
      );

      if (res.data.success) {
        setUser((prev) => ({
          ...prev,
          responsible_persons_name: editedName,
          tel_num: editedTel,
        }));
        setEditOpen(false);
      } else {
        alert('Failed to update user info');
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('Error updating user info');
    }
  };

  const menuItems = [
    { text: 'Add Activity', icon: <AddCircleIcon />, path: '/add-activity' },
    { text: 'List Activity', icon: <FormatListBulletedIcon />, path: '/list-activity' },
  ];

  return (
    <Box>
      {isMobile && (
        <AppBar position="sticky" sx={{ backgroundColor: '#2e7d32' }}>
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
            <Typography variant="h6" sx={{ color: '#fff' }}>
              Responsible Person
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        sx={{
          width: 250,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
            backgroundColor: '#2e7d32',
            color: '#fff',
          },
        }}
        variant={isMobile ? 'temporary' : 'permanent'}
        anchor="left"
        open={isMobile ? open : true}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 10px',
            backgroundColor: 'rgba(0,0,0,0)',
          }}
        >
          <Avatar
            sx={{
              width: 70,
              height: 70,
              mb: 1,
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              bgcolor: '#388e3c',
              color: '#fff',
            }}
          >
            <BusinessCenterIcon sx={{ fontSize: 40, color: '#fff' }} />
          </Avatar>

          {loading ? (
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem', color: '#fff' }}>
              Loading...
            </Typography>
          ) : (
            <>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                Responsible Person
              </Typography>
              <Chip
                label={user?.responsible_persons_name || 'Responsible Person'}
                variant="outlined"
                size="small"
                onClick={handleEditOpen}
                icon={<svg width="16" height="16" fill="#fff" style={{marginRight: 4}} viewBox="0 0 24 24"><path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>}
                sx={{
                  color: '#fff',
                  borderColor: '#a5d6a7',
                  mt: 1,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  '& .MuiChip-label': { fontWeight: 500 },
                }}
              />
            </>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 'calc(100% - 230px)',
            overflowX: 'hidden',
          }}
        >
          <Box sx={{ overflow: 'auto', overflowX: 'hidden', mt: 2 }}>
            <List>
              {menuItems.map((item, index) => (
                <React.Fragment key={item.text}>
                  <ListItem
                    button
                    component={Link}
                    to={item.path}
                    sx={{
                      borderRadius: '4px',
                      mx: 1,
                      mb: 0.5,
                      color: '#fff',
                      '&:hover': { backgroundColor: '#388e3c' },
                    }}
                  >
                    <ListItemIcon sx={{ color: '#a5d6a7', minWidth: '40px' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                  {index < menuItems.length - 1 && (
                    <Divider sx={{ my: 0.5, mx: 2, borderColor: 'rgba(165,214,167,0.4)' }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>

          <Box sx={{ mt: 'auto', mb: 2 }}>
            <Divider sx={{ my: 1, mx: 2, borderColor: 'rgba(165,214,167,0.4)' }} />
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                borderRadius: '4px',
                mx: 1,
                mb: 0.5,
                color: '#fff',
                '&:hover': { backgroundColor: '#388e3c' },
              }}
            >
              <ListItemIcon sx={{ color: '#a5d6a7', minWidth: '40px' }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Log Out" />
            </ListItem>
          </Box>
        </Box>
      </Drawer>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} PaperProps={{
        sx: {
          backgroundColor: '#fff',
          color: '#222',
          borderRadius: 3,
          boxShadow: 8,
          minWidth: 400,
          p: 0,
        }
      }}>
        <DialogTitle sx={{
          fontWeight: 700,
          fontSize: '1.25rem',
          pb: 1.5,
          color: '#222',
        }}>
          Update Profile
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 0 }}>
          <TextField
            margin="normal"
            label="Name"
            fullWidth
            variant="outlined"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            InputLabelProps={{ style: { color: '#388e3c', fontWeight: 500 } }}
            sx={{
              input: { color: '#222', fontWeight: 500 },
              mb: 2,
              bgcolor: '#f5f7fa',
              borderRadius: 2,
            }}
          />
          <TextField
            margin="normal"
            label="Telephone Number"
            fullWidth
            variant="outlined"
            value={editedTel}
            onChange={(e) => setEditedTel(e.target.value)}
            InputLabelProps={{ style: { color: '#388e3c', fontWeight: 500 } }}
            sx={{
              input: { color: '#222', fontWeight: 500 },
              bgcolor: '#f5f7fa',
              borderRadius: 2,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#f5f7fa', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, p: 2 }}>
          <Button onClick={handleEditClose} sx={{ color: '#388e3c', fontWeight: 600, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#388e3c', color: '#fff', fontWeight: 600, textTransform: 'none', borderRadius: 2, boxShadow: 2, '&:hover': { backgroundColor: '#2e7d32' } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sidebar;
