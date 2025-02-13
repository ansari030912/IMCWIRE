'use client';

import type { SelectChangeEvent } from '@mui/material';

import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Chip,
  Grid,
  Alert,
  Button,
  Select,
  Dialog,
  MenuItem,
  Snackbar,
  TextField,
  InputLabel,
  IconButton,
  FormControl,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

import AddCompanyForm from './view/AddCompanyForm';

interface SinglePrDetailsFormProps {
  orderId: number;
  prType: 'IMCWire Written' | 'Self-Written';
  onSuccess?: () => void;
}

interface Company {
  id: number;
  companyName: string;
  address1: string;
  address2: string;
  contactName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  state: string;
  websiteUrl: string;
  created_at: string;
  updated_at: string;
}

const SinglePrDetailsForm: React.FC<SinglePrDetailsFormProps> = ({
  orderId,
  prType,
  onSuccess,
}) => {
  // State variables
  const [token, setToken] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [openAddCompanyDialog, setOpenAddCompanyDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [submitting, setSubmitting] = useState(false);

  // Retrieve token from Cookies
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

  // Fetch companies from the API
  const fetchCompanies = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get<Company[]>(`${BASE_URL}/v1/company/company-list`, {
        headers: {
          'x-api-key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      setCompanies(response.data);
    } catch (error) {
      console.error('Failed to fetch companies', error);
      showSnackbar('Failed to load companies!', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load of companies
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Tag Handlers
  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;
    if (tags.includes(trimmedTag)) return;
    if (tags.length >= 4) {
      showSnackbar('Maximum of 4 tags are allowed.', 'error');
      return;
    }
    setTags((prev) => [...prev, trimmedTag]);
    setNewTag('');
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToDelete));
  };

  // Company selection
  const handleSelectCompany = (event: SelectChangeEvent<string>) => {
    setSelectedCompany(event.target.value);
  };

  // File selection for Self-Written PR
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setFile(selectedFile);
  };

  // Submit PR details
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    const apiUrl = `${BASE_URL}/v1/pr/submit-single-pr`;
    const headers = {
      'x-api-key': X_API_KEY,
      Authorization: `Bearer ${token}`,
    };

    try {
      if (prType === 'IMCWire Written') {
        const data = {
          pr_id: orderId,
          company_id: Number(selectedCompany),
          url,
          tags,
        };
        await axios.post(apiUrl, data, { headers });
      } else {
        const formData = new FormData();
        formData.append('pr_id', orderId.toString());
        formData.append('company_id', selectedCompany);
        if (file) {
          formData.append('pdf', file);
        }
        await axios.post(apiUrl, formData, { headers });
      }
      showSnackbar('PR details submitted successfully!', 'success');
      if (onSuccess) onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error submitting PR details:', error);
      showSnackbar('Error submitting PR details!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open/Close "Add Company" Dialog
  const handleOpenAddCompanyDialog = () => setOpenAddCompanyDialog(true);
  const handleCloseAddCompanyDialog = () => setOpenAddCompanyDialog(false);

  // Add new company and update local state immediately
  const handleAddCompany = async (
    newCompanyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>
  ) => {
    console.log('Submitting company data:', newCompanyData);
    if (!newCompanyData.companyName || newCompanyData.companyName.trim() === '') {
      console.warn('Company name is empty. Aborting submission.');
      return;
    }
    if (!token) return;
    if (submitting) return;
    setLoading(true);
    setSubmitting(true);
    try {
      const response = await axios.post(`${BASE_URL}/v1/company/add`, newCompanyData, {
        headers: {
          'x-api-key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      const addedCompany: Company = response.data;
      // Update local state with the new company immediately
      setCompanies((prevCompanies) => [...prevCompanies, addedCompany]);
      setSelectedCompany(addedCompany.id.toString());
      handleCloseAddCompanyDialog();
      showSnackbar('Company added successfully!', 'success');
    } catch (error) {
      console.error('Failed to add company', error);
      showSnackbar('Failed to add new company!', 'error');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Utility functions
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const resetForm = () => {
    setUrl('');
    setTags([]);
    setNewTag('');
    setFile(null);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(255,255,255,0.5)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <form onSubmit={handleSubmit}>
        {prType === 'IMCWire Written' ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter the article URL"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Add Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Press Enter or click 'Add'"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        variant="contained"
                        size="small"
                        disabled={tags.length >= 4}
                      >
                        Add
                      </Button>
                    </InputAdornment>
                  ),
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type="file"
              label="Upload PDF"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              onChange={handleFileChange}
            />
          </Box>
        )}
        <Box sx={{ mt: 3, display: 'flex', alignContent: 'start', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="company-select-label">Company</InputLabel>
            <Select
              labelId="company-select-label"
              id="company-select"
              value={selectedCompany}
              label="Company"
              onChange={handleSelectCompany}
              // Refresh the companies list each time the dropdown is opened
              onOpen={fetchCompanies}
            >
              <MenuItem value="" disabled>
                Select a company
              </MenuItem>
              {companies.length > 0 ? (
                companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.companyName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No companies available</MenuItem>
              )}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            sx={{ textWrap: 'nowrap', px: 5 }}
            onClick={handleOpenAddCompanyDialog}
          >
            Add New Company
          </Button>
        </Box>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
          Save PR Details
        </Button>
      </form>
      <Dialog
        open={openAddCompanyDialog}
        onClose={handleCloseAddCompanyDialog}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Add New Company</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleCloseAddCompanyDialog}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'gray' }}
        >
          <Iconify icon="eva:close-fill" width={24} height={24} />
        </IconButton>
        <DialogContent>
          <AddCompanyForm
            onAddCompany={handleAddCompany}
            onCloseDialog={handleCloseAddCompanyDialog}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddCompanyDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SinglePrDetailsForm;
