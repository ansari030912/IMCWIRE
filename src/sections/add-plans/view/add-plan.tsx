/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';

import { Box, Grid, Alert, Button, MenuItem, Snackbar, TextField } from '@mui/material';

import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

interface Plan {
  id: number;
  planName: string;
  totalPlanPrice: string;
  priceSingle: string;
  planDescription: string;
  perma: string;
  pdfLink: string;
  numberOfPR: number;
  created_at: string;
  updated_at: string;
  activate_plan: number;
  type: string;
}

interface CopyUrlButtonProps {
  url: string;
}

export const CopyUrlButton: React.FC<CopyUrlButtonProps> = ({ url }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to copy!', error);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={handleCopy}
        sx={{
          px: 2,
          py: 1,
          width: '100%',
          fontWeight: 'bold',
        }}
      >
        Copy URL
      </Button>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          URL copied!
        </Alert>
      </Snackbar>
    </>
  );
};

const AddPlanView = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  // Track whether the Perma field was manually edited.
  const [isPermaEdited, setIsPermaEdited] = useState(false);

  const [newPlan, setNewPlan] = useState({
    planName: '',
    totalPlanPrice: '',
    priceSingle: '',
    planDescription: '',
    perma: '',
    pdfLink: '',
    numberOfPR: '',
    activate_plan: true,
    type: '',
  });

  const types = [
    { id: 1, planName: 'package' },
    { id: 2, planName: 'product' },
  ];

  useEffect(() => {
    const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
    if (user?.token) {
      setToken(user.token);
    }
    if (user?.role === 'super_admin') {
      setIsSuperAdmin(true);
    }
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/v1/plan/list`, {
        headers: {
          'X-API-Key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        setPlans(response.data);
      } else {
        console.error('Error: API response is not an array', response.data);
        setPlans([]);
      }
    } catch (error) {
      console.error('Error fetching Plans:', error);
      setPlans([]);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchPlans();
  }, [token]);

  const validateForm = () => {
    if (!newPlan.planName.trim() || newPlan.planName.length > 50) {
      setSnackbar({
        open: true,
        message: 'Plan Name is required (Max: 50 chars)',
        severity: 'error',
      });
      return false;
    }
    if (!newPlan.planDescription.trim() || newPlan.planDescription.length > 100) {
      setSnackbar({
        open: true,
        message: 'Description is required (Max: 100 chars)',
        severity: 'error',
      });
      return false;
    }
    if (!newPlan.perma.trim() || newPlan.perma.length > 300) {
      setSnackbar({
        open: true,
        message: 'Perma is required (Max: 300 chars)',
        severity: 'error',
      });
      return false;
    }
    if (
      !newPlan.numberOfPR.trim() ||
      Number(newPlan.numberOfPR) <= 0 ||
      Number(newPlan.numberOfPR) > 1000
    ) {
      setSnackbar({
        open: true,
        message: 'Number of PR must be between 1 and 1000',
        severity: 'error',
      });
      return false;
    }
    if (
      !newPlan.priceSingle.trim() ||
      Number(newPlan.priceSingle) <= 0 ||
      Number(newPlan.priceSingle) > 100000
    ) {
      setSnackbar({
        open: true,
        message: 'PR Single Price must be between 1 and 100000',
        severity: 'error',
      });
      return false;
    }
    if (!newPlan.type.trim()) {
      setSnackbar({ open: true, message: 'Plan Type is required', severity: 'error' });
      return false;
    }
    return true;
  };

  const handleAddPlan = async () => {
    if (!validateForm()) return;

    // Check if the plan already exists.
    const planExists = plans.some(
      (plan) =>
        plan.planName.toLowerCase() === newPlan.planName.toLowerCase() &&
        plan.type.toLowerCase() === newPlan.type.toLowerCase()
    );

    if (planExists) {
      setSnackbar({
        open: true,
        message: `A plan with the name "${newPlan.planName}" and type "${newPlan.type}" already exists!`,
        severity: 'error',
      });
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/v1/plan/add`,
        { ...newPlan, totalPlanPrice: Number(newPlan.numberOfPR) * Number(newPlan.priceSingle) },
        {
          headers: {
            'X-API-Key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewPlan({
        planName: '',
        totalPlanPrice: '',
        priceSingle: '',
        planDescription: '',
        perma: '',
        pdfLink: '',
        numberOfPR: '',
        activate_plan: true,
        type: '',
      });
      setIsPermaEdited(false);
      setSnackbar({ open: true, message: 'Plan added successfully!', severity: 'success' });
      fetchPlans();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding Plan:', error);
      setSnackbar({ open: true, message: 'Failed to add plan', severity: 'error' });
    }
  };

  // Helper function to convert text to a URL-friendly slug.
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\\-]/g, '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // If clearing the input.
    if (value === '') {
      setNewPlan((prev) => ({
        ...prev,
        [name]: '',
        totalPlanPrice:
          name === 'numberOfPR' || name === 'priceSingle'
            ? String(Number(prev.numberOfPR || 0) * Number(prev.priceSingle || 0))
            : prev.totalPlanPrice,
      }));
      if (name === 'perma') {
        setIsPermaEdited(false);
      }
      return;
    }

    // For number fields.
    if (name === 'numberOfPR' || name === 'priceSingle') {
      const numValue = Number(value);
      if (name === 'numberOfPR' && (numValue > 1000 || numValue < 1)) return;
      if (name === 'priceSingle' && (numValue > 100000 || numValue < 1)) return;
    }

    // Auto-update the Perma field if the Plan Name changes and the Perma hasn’t been manually edited.
    if (name === 'planName') {
      setNewPlan((prev) => {
        const updatedPlan = { ...prev, planName: value };
        if (!isPermaEdited) {
          updatedPlan.perma = slugify(value);
        }
        updatedPlan.totalPlanPrice = String(
          Number(updatedPlan.numberOfPR || 0) * Number(updatedPlan.priceSingle || 0)
        );
        return updatedPlan;
      });
      return;
    }

    // When Perma is edited manually.
    if (name === 'perma') {
      setIsPermaEdited(true);
    }

    // Generic update.
    setNewPlan((prev) => {
      const updatedPlan = { ...prev, [name]: value };
      updatedPlan.totalPlanPrice = String(
        Number(updatedPlan.numberOfPR || 0) * Number(updatedPlan.priceSingle || 0)
      );
      return updatedPlan;
    });
  };

  const handleDeletePlan = async (id: number) => {
    try {
      const response = await axios.delete(`${BASE_URL}/v1/plan/delete?id=${id}`, {
        headers: {
          'X-API-Key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setSnackbar({ open: true, message: 'Plan deleted successfully!', severity: 'success' });
        fetchPlans();
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete plan', severity: 'error' });
    }
  };

  const handleUpdatePlan = async (perma: string) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/v1/plan/update/${perma}`,
        { activate_plan: 0 },
        {
          headers: {
            'X-API-Key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSnackbar({ open: true, message: 'Plan deactivated successfully!', severity: 'success' });
        fetchPlans();
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to deactivate plan', severity: 'error' });
    }
  };

  return (
    <div className="container mx-auto px-4">
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      <div className="text-left mb-12 pl-2">
        <h1 className="font-bold text-5xl text-purple-800 mb-6">IMCWIRE All Plans</h1>
        <p className="text-gray-700">Manage plans for the platform.</p>
      </div>

      <Box display="flex" alignItems="end" justifyContent="end" mb={5}>
        <Button
          variant="contained"
          color={showForm ? 'error' : 'inherit'}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Close' : 'Add New Plan'}
        </Button>
      </Box>

      {showForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-100">
          <TextField
            className="bg-white rounded-lg"
            fullWidth
            label="Plan Name"
            name="planName"
            value={newPlan.planName}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <TextField
            fullWidth
            className="bg-white rounded-lg"
            label="Plan Description"
            name="planDescription"
            value={newPlan.planDescription}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <TextField
            fullWidth
            className="bg-white rounded-lg"
            label="Plan Perma"
            name="perma"
            value={newPlan.perma}
            onChange={handleInputChange}
            helperText="Auto-generated from Plan Name but editable"
          />
          <br />
          <br />
          <TextField
            fullWidth
            className="bg-white rounded-lg"
            label="PDF Link"
            name="pdfLink"
            value={newPlan.pdfLink}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <TextField
            select
            className="bg-white rounded-lg"
            fullWidth
            label="Plan Type"
            name="type"
            value={newPlan.type}
            onChange={(e) => setNewPlan({ ...newPlan, type: e.target.value })}
          >
            {types.map((type) => (
              <MenuItem key={type.id} value={type.planName}>
                {type.planName}
              </MenuItem>
            ))}
          </TextField>
          <br />
          <br />
          <TextField
            fullWidth
            className="bg-white rounded-lg"
            label="Number Of PR"
            name="numberOfPR"
            type="number"
            value={newPlan.numberOfPR}
            onChange={handleInputChange}
            inputProps={{ min: 1, max: 1000 }}
          />
          <br />
          <br />
          <TextField
            fullWidth
            className="bg-white rounded-lg"
            label="PR Single Price"
            name="priceSingle"
            type="number"
            value={newPlan.priceSingle}
            onChange={handleInputChange}
            inputProps={{ min: 1, max: 100000 }}
          />
          <br />
          <br />
          <TextField
            fullWidth
            className="bg-white rounded-lg"
            label="Total Plan Price"
            name="totalPlanPrice"
            type="number"
            value={newPlan.totalPlanPrice}
            disabled
          />
          <br />
          <Button onClick={handleAddPlan} variant="contained" color="primary" sx={{ mt: 2 }}>
            Add Plan
          </Button>
        </div>
      )}

      {plans.length > 0 ? (
        <>
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center my-4">
              {/* Heading with left and right lines */}
              <div className="flex items-center w-full ">
                <div className="flex-grow border-t border-gray-300" />
                <h1 className="mx-4 text-3xl font-bold text-purple-800">Packages</h1>
                <div className="flex-grow border-t border-gray-300" />
              </div>
            </div>
          </div>
          {/* Section for Package Plans */}
          <section className="pt-10">
            <Grid container spacing={4} justifyContent="start">
              {plans
                .filter((plan) => plan.type === 'package')
                .map((plan, index) =>
                  plan.activate_plan >= 1 ? (
                    <Grid key={index} item lg={4} md={6} sm={12} className="w-full">
                      <div
                        className="bg-white rounded-lg overflow-hidden"
                        style={{
                          boxShadow:
                            '4px 4px 10px rgba(0, 0, 0, 0.05), -4px 4px 10px rgba(0, 0, 0, 0.05), 0px -4px 10px rgba(0, 0, 0, 0.05), 0px 4px 10px rgba(0, 0, 0, 0.05)',
                          borderRadius: '10px',
                          marginBottom: '20px',
                        }}
                      >
                        <div
                          style={{
                            backgroundImage: `url('/package.jpg')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                          className="w-full p-6 rounded-t-lg"
                        >
                          <h2 className="font-black text-center text-3xl">{plan.planName}</h2>
                          <h2 className="font-heading text-center pt-5 text-4xl font-black text-purple-800">
                            ${plan.totalPlanPrice}
                          </h2>
                          <div className="flex justify-center mt-4">
                            <div className="bg-yellow-500 text-white rounded-lg px-3 py-2 text-sm font-bold inline-block">
                              {plan.type}
                            </div>
                          </div>
                        </div>

                        <div className="w-full p-6 bg-white rounded-b-lg">
                          <ul className="space-y-3">
                            <li className="flex gap-2 items-center">
                              ✅ <p className="text-gray-500">{plan.planDescription}</p>
                            </li>
                            <li className="flex gap-2 items-center">
                              ✅{' '}
                              <p className="text-gray-500">
                                Single PR{' '}
                                <span className="text-purple-800 font-bold">
                                  {plan.priceSingle}$
                                </span>
                              </p>
                            </li>
                            <li className="flex gap-2 items-center">
                              ✅ <p className="text-gray-500">{plan.numberOfPR} PR Articles</p>
                            </li>
                            <li className="flex gap-2 items-center">
                              ✅{' '}
                              <p className="text-gray-500">
                                Sample link:{' '}
                                <a
                                  href={plan.pdfLink}
                                  target="_blank"
                                  className="text-blue-600 underline"
                                  rel="noreferrer"
                                >
                                  View
                                </a>
                              </p>
                            </li>
                          </ul>
                        </div>

                        <div className="w-full px-6 py-1 pb-2">
                          <button
                            className="px-6 py-3 block cursor-pointer text-center w-full bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition duration-200 rounded-md"
                            type="button"
                            onClick={() => handleUpdatePlan(plan.perma)}
                          >
                            Deactivate
                          </button>
                        </div>
                        <div className="w-full px-6 py-1 pb-6">
                          <button
                            className="px-6 py-3 block cursor-pointer text-center w-full bg-red-500 text-white text-sm font-bold hover:bg-red-700 transition duration-200 rounded-md"
                            type="button"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            Delete
                          </button>
                        </div>
                        {isSuperAdmin && (
                          <Box sx={{ px: 3, pb: 2 }}>
                            <CopyUrlButton
                              url={`https://dashboard.imcwire.com/dashboard/purchase/${plan.perma}`}
                            />
                          </Box>
                        )}
                      </div>
                    </Grid>
                  ) : null
                )}
            </Grid>
          </section>

          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center my-4">
              {/* Heading with left and right lines */}
              <div className="flex items-center w-full ">
                <div className="flex-grow border-t border-gray-300" />
                <h1 className="mx-4 text-3xl font-bold text-purple-800">Single Publications</h1>
                <div className="flex-grow border-t border-gray-300" />
              </div>
            </div>
          </div>
          {/* Section for Product Plans */}
          <section className="pt-10">
            <Grid container spacing={4} justifyContent="start">
              {plans
                .filter((plan) => plan.type === 'product')
                .map((plan, index) =>
                  plan.activate_plan >= 1 ? (
                    <Grid key={index} item lg={4} md={6} sm={12} className="w-full">
                      <div
                        className="bg-white rounded-lg overflow-hidden"
                        style={{
                          boxShadow:
                            '4px 4px 10px rgba(0, 0, 0, 0.05), -4px 4px 10px rgba(0, 0, 0, 0.05), 0px -4px 10px rgba(0, 0, 0, 0.05), 0px 4px 10px rgba(0, 0, 0, 0.05)',
                          borderRadius: '10px',
                          marginBottom: '20px',
                        }}
                      >
                        <div
                          style={{
                            backgroundImage: `url('/package.jpg')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                          className="w-full p-6 rounded-t-lg"
                        >
                          <h2 className="font-black text-center text-3xl">{plan.planName}</h2>
                          <h2 className="font-heading text-center pt-5 text-4xl font-black text-purple-800">
                            ${plan.totalPlanPrice}
                          </h2>
                          <div className="flex justify-center mt-4">
                            <div className="bg-green-500 text-white rounded-lg px-3 py-2 text-sm font-bold inline-block">
                              {plan.type === 'product' ? 'Single Publication' : plan.type}
                            </div>
                          </div>
                        </div>

                        <div className="w-full p-6 bg-white rounded-b-lg">
                          <ul className="space-y-3">
                            <li className="flex gap-2 items-center">
                              ✅ <p className="text-gray-500">{plan.planDescription}</p>
                            </li>
                            <li className="flex gap-2 items-center">
                              ✅{' '}
                              <p className="text-gray-500">
                                Single PR{' '}
                                <span className="text-purple-800 font-bold">
                                  {plan.priceSingle}$
                                </span>
                              </p>
                            </li>
                            <li className="flex gap-2 items-center">
                              ✅ <p className="text-gray-500">{plan.numberOfPR} PR Articles</p>
                            </li>
                            <li className="flex gap-2 items-center">
                              ✅{' '}
                              <p className="text-gray-500">
                                Sample link:{' '}
                                <a
                                  href={plan.pdfLink}
                                  target="_blank"
                                  className="text-blue-600 underline"
                                  rel="noreferrer"
                                >
                                  View
                                </a>
                              </p>
                            </li>
                          </ul>
                        </div>

                        <div className="w-full px-6 py-1 pb-2">
                          <button
                            className="px-6 py-3 block cursor-pointer text-center w-full bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition duration-200 rounded-md"
                            type="button"
                            onClick={() => handleUpdatePlan(plan.perma)}
                          >
                            Deactivate
                          </button>
                        </div>
                        <div className="w-full px-6 py-1 pb-4">
                          <button
                            className="px-6 py-3 block cursor-pointer text-center w-full bg-red-500 text-white text-sm font-bold hover:bg-red-700 transition duration-200 rounded-md"
                            type="button"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            Delete
                          </button>
                        </div>
                        {isSuperAdmin && (
                          <Box sx={{ px: 3, pb: 2 }}>
                            <CopyUrlButton
                              url={`https://dashboard.imcwire.com/dashboard/purchase/${plan.perma}`}
                            />
                          </Box>
                        )}
                      </div>
                    </Grid>
                  ) : null
                )}
            </Grid>
          </section>
        </>
      ) : (
        <Alert severity="info" sx={{ width: '100%', mt: 2 }}>
          No Plans Available
        </Alert>
      )}
    </div>
  );
};

export default AddPlanView;
