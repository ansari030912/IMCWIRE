/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import moment from 'moment';
import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';
// Import Iconify for icons
import { Icon as Iconify } from '@iconify/react';

import {
  Box,
  Grid,
  Paper,
  Alert,
  Button,
  Snackbar,
  MenuItem,
  Container,
  TextField,
  Typography,
} from '@mui/material';

import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

interface ProfileData {
  full_name: string;
  street_address: string;
  city: string;
  country: string;
  zip_code: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
}

const ProfilePage = () => {
  // State to hold the user token
  const [token, setToken] = useState<string>('');
  // State for the profile form data (used for creating/updating)
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    street_address: '',
    city: '',
    country: '',
    zip_code: '',
    phone_number: '',
    gender: '',
    date_of_birth: '',
  });
  // State to store the fetched profile from the API (if it exists)
  const [existingProfile, setExistingProfile] = useState<ProfileData | null>(null);
  // State for controlling edit mode
  const [editMode, setEditMode] = useState<boolean>(false);
  // State for displaying notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState<boolean>(false);

  // Retrieve the user token from cookies once the component mounts
  useEffect(() => {
    const userTokenString = Cookies.get('user');
    if (userTokenString) {
      try {
        const userData = JSON.parse(userTokenString);
        setToken(userData.token);
      } catch (error) {
        console.error('Error parsing user token:', error);
      }
    }
  }, []);

  // Function to fetch the existing profile from the API and map only the "profile" field
  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/v1/account/profile/get`, {
        headers: {
          'X-API-Key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      // Map the profile data from the response (i.e. response.data.profile)
      const { profile } = response.data;
      // Check if the profile object has any keys
      if (profile && Object.keys(profile).length > 0) {
        setExistingProfile(profile);
        const formattedProfile = {
          ...profile,
          date_of_birth: profile.date_of_birth
            ? moment(profile.date_of_birth).format('YYYY-MM-DD')
            : '',
        };
        setProfileData(formattedProfile);
      } else {
        setExistingProfile(null);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // Optionally, display an error message via snackbar here.
    }
  };

  // Fetch profile details when the token is available.
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  // Handle changes in the form fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit the profile form to create the profile (only available if no profile exists)
  const handleSubmitProfile = async () => {
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/v1/account/profile/add`, profileData, {
        headers: {
          'X-API-Key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbar({
        open: true,
        message: 'Profile created successfully!',
        severity: 'success',
      });
      // Refresh the profile details from the API
      fetchProfile();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create profile',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update profile function for editing an existing profile
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await axios.put(`${BASE_URL}/v1/account/update`, profileData, {
        headers: {
          'X-API-Key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success',
      });
      setEditMode(false);
      // Refresh the profile details from the API
      fetchProfile();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update profile',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing and revert to the existing profile details
  const handleCancelEdit = () => {
    if (existingProfile) {
      setProfileData(existingProfile);
    }
    setEditMode(false);
  };

  // Render the form used for both creating and updating the profile
  const renderForm = () => (
    <Paper
      elevation={6}
      sx={{
        width: '100%',
        maxWidth: 700,
        p: { xs: 3, md: 4 },
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: 'background.paper',
        mb: 4,
      }}
    >
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
        {existingProfile ? 'Edit Your Profile' : 'Create Your Profile'}
      </Typography>
      <Typography variant="body1" align="center" sx={{ mb: 3 }}>
        {existingProfile
          ? 'Update your profile details below'
          : 'Please fill in your profile details below'}
      </Typography>
      <Box component="form" noValidate autoComplete="off" className="grid md:grid-cols-2 gap-5">
        <TextField
          label="Full Name"
          name="full_name"
          value={profileData.full_name}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
        />
        <TextField
          label="Street Address"
          name="street_address"
          value={profileData.street_address}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
        />
        <TextField
          label="City"
          name="city"
          value={profileData.city}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
        />
        <TextField
          label="Country"
          name="country"
          value={profileData.country}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
        />
        <TextField
          label="Zip Code"
          name="zip_code"
          value={profileData.zip_code}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
        />
        <TextField
          label="Phone Number"
          name="phone_number"
          value={profileData.phone_number}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
        />
        <TextField
          select
          label="Gender"
          name="gender"
          value={profileData.gender}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>
        <TextField
          label="Date of Birth"
          name="date_of_birth"
          type="date"
          value={profileData.date_of_birth}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={existingProfile ? handleUpdateProfile : handleSubmitProfile}
          disabled={loading}
          fullWidth
          sx={{
            py: 1.5,
            fontSize: '1rem',
            textTransform: 'none',
          }}
        >
          {loading
            ? existingProfile
              ? 'Updating...'
              : 'Submitting...'
            : existingProfile
              ? 'Update Profile'
              : 'Create Profile'}
        </Button>
        {existingProfile && editMode && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCancelEdit}
            disabled={loading}
            fullWidth
            sx={{
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
        )}
      </Box>
    </Paper>
  );

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 2,
      }}
    >
      {/* If no profile exists or edit mode is active, show the form */}
      {(!existingProfile || editMode) && renderForm()}

      {/* If a profile exists and we're not editing, display the profile details */}
      {existingProfile && !editMode && (
        <Paper
          elevation={6}
          sx={{
            width: '100%',
            maxWidth: 700,
            p: { xs: 3, md: 4 },
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: 'background.paper',
            mb: 4,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" gutterBottom>
              Your Profile Details
            </Typography>
            <Button variant="outlined" onClick={() => setEditMode(true)}>
              Edit Profile
            </Button>
          </Box>
          <Grid container spacing={2}>
            {/* Row 1: Full Name & Phone Number */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'grey.100',
                p: 1,
              }}
            >
              <Iconify icon="mdi:account" width={30} color="#55427A" />
              <Box ml={1}>
                <Typography variant="subtitle2">Full Name</Typography>
                <Typography variant="body2">{existingProfile.full_name || 'N/A'}</Typography>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'grey.100',
                p: 1,
              }}
            >
              <Iconify icon="mdi:phone" width={30} color="#55427A" />
              <Box ml={1}>
                <Typography variant="subtitle2">Phone Number</Typography>
                <Typography variant="body2">{existingProfile.phone_number || 'N/A'}</Typography>
              </Box>
            </Grid>

            {/* Row 2: Street Address & City */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'white',
                p: 1,
              }}
            >
              <Iconify icon="mdi:home-outline" width={30} color="#55427A" />
              <Box ml={1}>
                <Typography variant="subtitle2">Street Address</Typography>
                <Typography variant="body2">{existingProfile.street_address || 'N/A'}</Typography>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'white',
                p: 1,
              }}
            >
              <Iconify icon="mdi:city" width={30} color="#55427A" />
              <Box ml={1}>
                <Typography variant="subtitle2">City</Typography>
                <Typography variant="body2">{existingProfile.city || 'N/A'}</Typography>
              </Box>
            </Grid>

            {/* Row 3: Country & Zip Code */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'grey.100',
                p: 1,
              }}
            >
              <Iconify icon="mdi:earth" width={30} color="#55427A" />
              <Box ml={1}>
                <Typography variant="subtitle2">Country</Typography>
                <Typography variant="body2">{existingProfile.country || 'N/A'}</Typography>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'grey.100',
                p: 1,
              }}
            >
              <Iconify icon="mdi:mailbox-open-up-outline" width={30} color="#55427A" />
              <Box ml={1}>
                <Typography variant="subtitle2">Zip Code</Typography>
                <Typography variant="body2">{existingProfile.zip_code || 'N/A'}</Typography>
              </Box>
            </Grid>

            {/* Row 4: Gender & Date of Birth */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'white',
                p: 1,
              }}
            >
              <Iconify icon="mdi:gender-male-female" width={30} color="#55427A" />
              <Box ml={1}>
                <Typography variant="subtitle2">Gender</Typography>
                <Typography variant="body2">{existingProfile.gender || 'N/A'}</Typography>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'white',
                p: 1,
              }}
            >
              <Iconify icon="mdi:calendar-outline" width={30} color="#55427A" />
              <Box ml={1}>
                <Typography variant="subtitle2">Date of Birth</Typography>
                <Typography variant="body2">
                  {existingProfile.date_of_birth
                    ? moment(existingProfile.date_of_birth).format('DD MMM YYYY')
                    : 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Snackbar for global notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
