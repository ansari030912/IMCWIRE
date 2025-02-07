'use client';

import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';

import { Alert, Button, Snackbar, TextField } from '@mui/material';

import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

interface AddCompanyFormProps {
  onAddCompany: (newCompany: any) => Promise<void>;
  onCloseDialog: () => void;
}

const AddCompanyForm: React.FC<AddCompanyFormProps> = ({ onAddCompany, onCloseDialog }) => {
  const [token, setToken] = useState<string | null>(null);
  const [newCompany, setNewCompany] = useState({
    companyName: '',
    address1: '',
    address2: '',
    contactName: '',
    phone: '',
    email: '',
    country: '',
    city: '',
    state: '',
    websiteUrl: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const userTokenString = Cookies.get('user');
    if (userTokenString) {
      try {
        const userToken = JSON.parse(userTokenString);
        setToken(userToken.token);
      } catch (error) {
        console.error('Error parsing user token:', error);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCompany({ ...newCompany, [name]: value });
  };

  const handleAddCompany = async () => {
    if (!token) {
      setSnackbar({
        open: true,
        message: 'Authentication failed. Please log in.',
        severity: 'error',
      });
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/v1/company/add`,
        { ...newCompany },
        {
          headers: {
            'X-API-Key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSnackbar({ open: true, message: 'Company added successfully!', severity: 'success' });
      onAddCompany(response.data); // Call API to add company
      onCloseDialog();
      // Clear form
      setNewCompany({
        companyName: '',
        address1: '',
        address2: '',
        contactName: '',
        phone: '',
        email: '',
        country: '',
        city: '',
        state: '',
        websiteUrl: '',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to add company',
        severity: 'error',
      });
    }
  };

  return (
    <>
      <div className="mb-6 grid md:grid-cols-2 gap-5 p-4 border border-gray-200 rounded-lg bg-gray-100">
        <TextField
          fullWidth
          label="Company Name"
          name="companyName"
          value={newCompany.companyName}
          onChange={handleInputChange}
          className="bg-white rounded-lg mb-4"
        />
        <TextField
          fullWidth
          label="Address 1"
          name="address1"
          value={newCompany.address1}
          onChange={handleInputChange}
          className="bg-white rounded-lg mb-4"
        />
        <TextField
          fullWidth
          label="Address 2"
          name="address2"
          value={newCompany.address2}
          onChange={handleInputChange}
          className="bg-white rounded-lg mb-4"
        />
        <TextField
          fullWidth
          label="Contact Name"
          name="contactName"
          value={newCompany.contactName}
          onChange={handleInputChange}
          className="bg-white rounded-lg mb-4"
        />
        <TextField
          fullWidth
          label="Phone"
          name="phone"
          value={newCompany.phone}
          onChange={handleInputChange}
          className="bg-white rounded-lg mb-4"
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={newCompany.email}
          onChange={handleInputChange}
          className="bg-white rounded-lg mb-4"
        />
        <TextField
          fullWidth
          label="Country"
          name="country"
          value={newCompany.country}
          onChange={handleInputChange}
          className="bg-white rounded-lg mb-4"
        />
        <TextField
          fullWidth
          label="City"
          name="city"
          value={newCompany.city}
          onChange={handleInputChange}
          className="bg-white rounded-lg mb-4"
        />
        <TextField
          fullWidth
          label="State"
          name="state"
          value={newCompany.state}
          onChange={handleInputChange}
          className="bg-white rounded-lg mb-4"
        />
        <TextField
          fullWidth
          label="Website URL"
          name="websiteUrl"
          value={newCompany.websiteUrl}
          onChange={handleInputChange}
          className="bg-white rounded-lg mb-4"
        />
      </div>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleAddCompany}
        sx={{ mt: 2 }}
      >
        Add Company
      </Button>

      {/* Snackbar for success & error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity as 'success' | 'error'}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default AddCompanyForm;
