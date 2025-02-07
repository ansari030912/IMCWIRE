'use client';

import type { SelectChangeEvent } from '@mui/material';

import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';

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
// You can adjust these imports to match your project structure
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

import AddCompanyForm from './view/AddCompanyForm';

/* ------------------------------------------------------------------
   1) Types & Interfaces
   ------------------------------------------------------------------ */

interface SinglePrDetailsFormProps {
  orderId: number;
  // The PR Type determines if we upload an existing PDF or use IMCWire's writing
  prType: 'IMCWire Written' | 'Self-Written';
  onSuccess?: () => void;
}

// Consolidated Company interface with all fields
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

/* ------------------------------------------------------------------
   2) Main Component
   ------------------------------------------------------------------ */

const SinglePrDetailsForm: React.FC<SinglePrDetailsFormProps> = ({
  orderId,
  prType,
  onSuccess,
}) => {
  // Authentication & Data
  const [token, setToken] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  // Form Fields
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');

  // For file uploads (Self-Written)
  const [file, setFile] = useState<File | null>(null);

  // Dialog / Feedback states
  const [openAddCompanyDialog, setOpenAddCompanyDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  /* ----------------------------------------------------------------
     2.1) useEffect: Retrieve token from Cookies
     ---------------------------------------------------------------- */
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

  /* ----------------------------------------------------------------
     2.2) useEffect: Fetch companies from API
     ---------------------------------------------------------------- */
  useEffect(() => {
    const fetchCompanies = async () => {
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
    };

    fetchCompanies();
  }, [token]);

  /* ----------------------------------------------------------------
     3) Handlers
     ---------------------------------------------------------------- */

  // 3.1) Tag Handlers
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };
  const handleDeleteTag = (tagToDelete: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToDelete));
  };

  // 3.2) Company selection
  const handleSelectCompany = (event: SelectChangeEvent<string>) => {
    setSelectedCompany(event.target.value);
  };

  // 3.3) File selection for Self-Written PR
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setFile(selectedFile);
  };

  // 3.4) Submit final Single PR data
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
        // JSON body (IMCWire will create the PR from URL + tags)
        const data = {
          pr_id: orderId,
          company_id: Number(selectedCompany), // Convert to number
          url,
          tags,
        };
        await axios.post(apiUrl, data, { headers });
      } else {
        // FormData if the user is uploading a PDF
        const formData = new FormData();
        formData.append('pr_id', orderId.toString());
        formData.append('company_id', selectedCompany);
        if (file) {
          formData.append('pdf', file);
        }
        await axios.post(apiUrl, formData, { headers });
      }

      showSnackbar('PR details submitted successfully!', 'success');
      if (onSuccess) {
        onSuccess();
      }
      // (Optional) Clear fields after success
      resetForm();
    } catch (error) {
      console.error('Error submitting PR details:', error);
      showSnackbar('Error submitting PR details!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3.5) Dialog for "Add Company"
  const handleOpenAddCompanyDialog = () => setOpenAddCompanyDialog(true);
  const handleCloseAddCompanyDialog = () => setOpenAddCompanyDialog(false);

  /* ----------------------------------------------------------------
     4) Add new Company from AddCompanyForm
     ---------------------------------------------------------------- */
  const handleAddCompany = async (
    newCompanyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!token) return;
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/v1/company/add-company`, newCompanyData, {
        headers: {
          'x-api-key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      const addedCompany: Company = response.data;

      setCompanies((prev) => [...prev, addedCompany]);
      setSelectedCompany(addedCompany.id.toString());
      handleCloseAddCompanyDialog();

      showSnackbar('Company added successfully!', 'success');
    } catch (error) {
      console.error('Failed to add company', error);
      showSnackbar('Failed to add new company!', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------------------
     5) Utility: Show snackbar & reset form
     ---------------------------------------------------------------- */
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
    // (Optionally) do not reset the selectedCompany if user might want to reuse
    // setSelectedCompany("");
  };

  /* ----------------------------------------------------------------
     6) Render
     ---------------------------------------------------------------- */
  return (
    <Box sx={{ position: 'relative' }}>
      {/* Loading overlay (optional) */}
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
        {/* If it is IMCWire Written, we ask for URL & tags */}
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
                      <Button type="button" onClick={handleAddTag} variant="contained" size="small">
                        Add
                      </Button>
                    </InputAdornment>
                  ),
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              {/* Tag chips */}
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
          /* If it is Self-Written, we ask for a PDF upload */
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

        {/* Company Selection */}
        <Box sx={{ mt: 3, display: "flex", alignContent: "start", gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="company-select-label">Company</InputLabel>
            <Select
              labelId="company-select-label"
              id="company-select"
              value={selectedCompany}
              label="Company"
              onChange={handleSelectCompany}
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

          <Button variant="outlined" sx={{textWrap: "nowrap", px: 5}} onClick={handleOpenAddCompanyDialog}>
            Add New Company
          </Button>
        </Box>

        {/* Submit */}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
          Save PR Details
        </Button>
      </form>

      {/* Dialog: Add New Company */}
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
          {/* 
            AddCompanyForm is your custom form to add a new Company.
            It should accept an `onAddCompany` callback that returns
            the new company data, e.g.:
                onAddCompany={(newCompanyData) => handleAddCompany(newCompanyData)}
          */}
          <AddCompanyForm
            onAddCompany={handleAddCompany}
            onCloseDialog={handleCloseAddCompanyDialog}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddCompanyDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for success/error feedback */}
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
