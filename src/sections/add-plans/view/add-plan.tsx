/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import axios from 'axios';
import Cookies from 'js-cookie';
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState, useEffect } from 'react';

import { Alert, Box, Button, Grid, IconButton, MenuItem, Snackbar, TextField } from '@mui/material';

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

const AddPlanView = () => {
  const [plans, setPlans] = useState<Plan[]>(() => []);
  const [token, setToken] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
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
    user?.token && setToken(user.token);
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/v1/plan/list`, {
        headers: {
          'X-API-Key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      // Ensure response.data is an array before setting it
      if (Array.isArray(response.data)) {
        setPlans(response.data);
      } else {
        console.error('Error: API response is not an array', response.data);
        setPlans([]); // Default to an empty array
      }
    } catch (error) {
      console.error('Error fetching Plans:', error);
      setPlans([]); // Default to an empty array if API fails
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
      Number(newPlan.numberOfPR) > 20
    ) {
      setSnackbar({
        open: true,
        message: 'Number of PR must be between 1 and 20',
        severity: 'error',
      });
      return false;
    }
    if (
      !newPlan.priceSingle.trim() ||
      Number(newPlan.priceSingle) <= 0 ||
      Number(newPlan.priceSingle) > 1000
    ) {
      setSnackbar({
        open: true,
        message: 'PR Single Price must be between 1 and 1000',
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

    // Check if the plan already exists
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

      setSnackbar({ open: true, message: 'Plan added successfully!', severity: 'success' });
      fetchPlans(); // Refresh plan list
      setShowForm(false);
    } catch (error) {
      console.error('Error adding Plan:', error);
      setSnackbar({ open: true, message: 'Failed to add plan', severity: 'error' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Allow users to fully delete input before retyping
    if (value === '') {
      setNewPlan((prev) => ({
        ...prev,
        [name]: '',
        totalPlanPrice:
          name === 'numberOfPR' || name === 'priceSingle'
            ? String(Number(prev.numberOfPR || 0) * Number(prev.priceSingle || 0))
            : prev.totalPlanPrice,
      }));
      return;
    }

    // Convert input to a number
    const numValue = Number(value);

    // Restrict invalid values (negative numbers, out-of-range)
    if (name === 'numberOfPR' && (numValue > 20 || numValue < 1)) return;
    if (name === 'priceSingle' && (numValue > 1000 || numValue < 1)) return;

    // Update state and calculate total price dynamically
    setNewPlan((prev) => {
      const updatedPlan = {
        ...prev,
        [name]: value, // Keep the input as a string for controlled behavior
      };

      // Live update total price based on new values
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
        {
          activate_plan: 0, // Fixed syntax error
        },
        {
          headers: {
            'X-API-Key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSnackbar({ open: true, message: 'Plan Deactivated successfully!', severity: 'success' });
        fetchPlans();
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to deactivate plan', severity: 'error' });
    }
  };

  return (
    <div className="container mx-auto px-4">
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      <Box display="flex" alignItems="end" justifyContent="end" mb={5}>
        <Button
          variant="contained"
          color={showForm ? 'error' : 'inherit'}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Close' : 'Add New Coupon'}
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
            inputProps={{ min: 1, max: 20 }} // Restrict max input to 20
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
            inputProps={{ min: 1, max: 1000 }} // Restrict max input to 1000
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
            disabled // Auto-calculated field
          />
          <br />
          {/* <br /> */}
          <Button onClick={handleAddPlan} variant="contained" color="primary" sx={{ mt: 2 }}>
            Add Plan
          </Button>
        </div>
      )}
      {Array.isArray(plans) && plans.length > 0 ? (
        <>
          <hr className="text-gray-100 border-2" />
          <section className="pt-10">
            <Grid container spacing={4} justifyContent="start">
              {plans
                ?.filter((plan) => plan.type === 'product')
                ?.map(
                  (plan, index) =>
                    plan.activate_plan >= 1 && (
                      <Grid key={index} item lg={4} md={6} sm={12} className="w-full ">
                        {/* Wrapped card inside div for spacing & shadow */}
                        <div
                          className="bg-white rounded-lg overflow-hidden"
                          style={{
                            boxShadow:
                              '4px 4px 10px rgba(0, 0, 0, 0.05), -4px 4px 10px rgba(0, 0, 0, 0.05), 0px -4px 10px rgba(0, 0, 0, 0.05), 0px 4px 10px rgba(0, 0, 0, 0.05)',
                            borderRadius: '10px',
                            marginBottom: '20px',
                          }}
                        >
                          {/* Plan Header */}
                          <div
                            style={{
                              backgroundImage: `url('/package.jpg')`, // No need for ./ or ../
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              // backgroundAttachment: 'fixed',
                            }}
                            className="w-full p-6 rounded-t-lg"
                          >
                            <h2 className="font-black text-center text-3xl">{plan.planName}</h2>
                            <h2 className="font-heading text-center pt-5 text-4xl font-black text-purple-800">
                              ${plan.totalPlanPrice}
                            </h2>
                            <div className="flex justify-center mt-4">
                              <div className="bg-green-500 text-white rounded-lg px-3 py-2 text-sm  font-bold inline-block">
                                {plan.type}
                              </div>
                            </div>
                          </div>

                          {/* Plan Features */}
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
                                  Download PDF:{' '}
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

                          {/* Buy Now Button */}
                          {/* <div className="w-full px-6 py-1">
                        <a
                          className="px-6 py-3 block text-center w-full bg-gray-800 text-white text-sm font-bold hover:bg-gray-600 transition duration-200 rounded-md"
                          href="#"
                        >
                          Buy Now
                        </a>
                      </div> */}
                          {plan.activate_plan <= 0 ? (
                            ''
                          ) : (
                            <div className="w-full px-6 py-1 pb-2">
                              <button
                                className="px-6 py-3 block cursor-pointer text-center w-full bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition duration-200 rounded-md"
                                type="button"
                                onClick={() => handleUpdatePlan(plan.perma)}
                              >
                                De Activate
                              </button>
                            </div>
                          )}
                          <div className="w-full px-6 py-1 pb-6">
                            <button
                              className="px-6 py-3 block cursor-pointer text-center w-full bg-red-500 text-white text-sm font-bold hover:bg-red-700 transition duration-200 rounded-md"
                              type="button"
                              onClick={() => handleDeletePlan(plan.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </Grid>
                    )
                )}
            </Grid>
          </section>
          <hr className="text-gray-100 border-2" />
          <section className="pt-10">
            <Grid container spacing={4} justifyContent="start">
              {plans
                ?.filter((plan) => plan.type === 'package')
                ?.map(
                  (plan, index) =>
                    plan.activate_plan >= 1 && (
                      <Grid key={index} item lg={4} md={6} sm={12} className="w-full ">
                        {/* Wrapped card inside div for spacing & shadow */}
                        <div
                          className="bg-white rounded-lg overflow-hidden"
                          style={{
                            boxShadow:
                              '4px 4px 10px rgba(0, 0, 0, 0.05), -4px 4px 10px rgba(0, 0, 0, 0.05), 0px -4px 10px rgba(0, 0, 0, 0.05), 0px 4px 10px rgba(0, 0, 0, 0.05)',
                            borderRadius: '10px',
                            marginBottom: '20px',
                          }}
                        >
                          {/* Plan Header */}
                          <div
                            style={{
                              backgroundImage: `url('/package.jpg')`, // No need for ./ or ../
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              // backgroundAttachment: 'fixed',
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

                          {/* Plan Features */}
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
                                  Download PDF:{' '}
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

                          {/* Buy Now Button */}
                          {/* <div className="w-full px-6 py-1">
                        <a
                          className="px-6 py-3 block text-center w-full bg-gray-800 text-white text-sm font-bold hover:bg-gray-600 transition duration-200 rounded-md"
                          href="#"
                        >
                          Buy Now
                        </a>
                      </div> */}
                          {plan.activate_plan <= 0 ? (
                            ''
                          ) : (
                            <div className="w-full px-6 py-1 pb-2">
                              <button
                                className="px-6 py-3 block cursor-pointer text-center w-full bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition duration-200 rounded-md"
                                type="button"
                                onClick={() => handleUpdatePlan(plan.perma)}
                              >
                                De Activate
                              </button>
                            </div>
                          )}
                          <div className="w-full px-6 py-1 pb-6">
                            <button
                              className="px-6 py-3 block cursor-pointer text-center w-full bg-red-500 text-white text-sm font-bold hover:bg-red-700 transition duration-200 rounded-md"
                              type="button"
                              onClick={() => handleDeletePlan(plan.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </Grid>
                    )
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
