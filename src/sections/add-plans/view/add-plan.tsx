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
  pdfLink: string;
  numberOfPR: number;
  created_at: string;
  updated_at: string;
  activate_plan: number;
  type: string;
}

const AddPlanView = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const [newCoupon, setNewCoupon] = useState({
    couponCode: '',
    discountPercentage: '',
    plan_id: '',
    usageLimit: '',
    expirationDate: '',
  });

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
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching Plans:', error);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchPlans();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (['discountPercentage', 'plan_id', 'usageLimit'].includes(name) && Number(value) > 100) {
      return;
    }
    setNewCoupon({ ...newCoupon, [name]: value });
  };

  return (
    <div className="container mx-auto px-4">
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
            label="Coupon Code"
            name="couponCode"
            value={newCoupon.couponCode}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <TextField
            className="bg-white rounded-lg"
            fullWidth
            label="Discount %"
            name="discountPercentage"
            type="number"
            value={newCoupon.discountPercentage}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <TextField
            className="bg-white rounded-lg"
            select
            fullWidth
            label="Select Plan"
            name="plan_id"
            value={newCoupon.plan_id}
            onChange={(e) => setNewCoupon({ ...newCoupon, plan_id: e.target.value })}
          >
            {plans.map((plan) => (
              <MenuItem key={plan.id} value={plan.id}>
                {plan.planName}
              </MenuItem>
            ))}
          </TextField>
          <br />
          <br />
          <TextField
            className="bg-white rounded-lg"
            fullWidth
            label="Usage Limit"
            name="usageLimit"
            type="number"
            value={newCoupon.usageLimit}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <TextField
            className="bg-white rounded-lg"
            fullWidth
            name="expirationDate"
            type="datetime-local"
            value={newCoupon.expirationDate}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: false }}
          />

          <br />
          <br />
          <Button variant="contained" color="primary" sx={{ mt: 2 }}>
            Add Coupon
          </Button>
        </div>
      )}
      {plans.length <= 0 ? (
        <Alert severity="info" sx={{ width: '100%', mt: 2 }}>
          No Plans Available
        </Alert>
      ) : (
        <>
          <hr className="text-gray-100 border-2" />
          <section className="pt-10">
            <Grid container spacing={4} justifyContent="start">
              {plans
                .filter((plan) => plan.type === 'product' || plan.type === 'products')
                .map((plan, index) => (
                  <Grid key={index} item lg={4} md={6} sm={12} className="p-4">
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
                        style={{ backgroundColor: '#F1EAFF' }}
                        className="w-full p-6 rounded-t-lg"
                      >
                        <h2 className="font-black text-center text-3xl">{plan.planName}</h2>
                        <h2 className="font-heading text-center pt-5 text-4xl font-black text-purple-800">
                          ${plan.totalPlanPrice}
                        </h2>
                        <div className="flex justify-center mt-4">
                          <div className="bg-red-500 text-white rounded-lg px-3 py-2 text-sm  font-bold inline-block">
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
                              <span className="text-purple-800 font-bold">{plan.priceSingle}$</span>
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
                      <div className="w-full p-6">
                        <a
                          className="px-6 py-3 block text-center w-full bg-gray-800 text-white text-sm font-bold hover:bg-gray-600 transition duration-200 rounded-md"
                          href="#"
                        >
                          Buy Now
                        </a>
                      </div>
                    </div>
                  </Grid>
                ))}
            </Grid>
          </section>
          <hr className="text-gray-100 border-2" />
          <section className="pt-10">
            <Grid container spacing={4} justifyContent="start">
              {plans
                .filter((plan) => plan.type === 'packages' || plan.type === 'package')
                .map((plan, index) => (
                  <Grid key={index} item lg={4} md={6} sm={12} className="p-4">
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
                        style={{ backgroundColor: '#F1EAFF' }}
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
                              <span className="text-purple-800 font-bold">{plan.priceSingle}$</span>
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
                      <div className="w-full p-6">
                        <a
                          className="px-6 py-3 block text-center w-full bg-gray-800 text-white text-sm font-bold hover:bg-gray-600 transition duration-200 rounded-md"
                          href="#"
                        >
                          Buy Now
                        </a>
                      </div>
                    </div>
                  </Grid>
                ))}
            </Grid>
          </section>
        </>
      )}
    </div>
  );
};
export default AddPlanView;
