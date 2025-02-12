/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import axios from 'axios';
import Cookies from 'js-cookie';
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState, useEffect } from 'react';

import { Alert, Box, Button, Grid, IconButton, MenuItem, Snackbar, TextField } from '@mui/material';

import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';
import { Iconify } from 'src/components/iconify';
import { CustomClock, CustomGift, CustomSparkles, CustomTag } from '../CustomIcons';

interface Coupon {
  id: number;
  couponCode: string;
  discountPercentage: string;
  plan_id: number;
  usageLimit: number;
  timesUsed: number;
  expirationDate: string;
  status: string;
  created_at: string;
  updated_at: string;
}

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

const AddCupponView = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    couponCode: '',
    discountPercentage: '',
    plan_id: '',
    usageLimit: '',
    expirationDate: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  useEffect(() => {
    const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
    user?.token && setToken(user.token);
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/v1/coupon/admin-list`, {
        headers: {
          'X-API-Key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      setCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

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
      console.error('Error fetching coupons:', error);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchPlans();
    fetchCoupons();
  }, [token]);

  const handleAddCoupon = async () => {
    try {
      await axios.post(
        `${BASE_URL}/v1/coupon/add`,
        {
          ...newCoupon,
          discountPercentage: Number(newCoupon.discountPercentage),
          plan_id: Number(newCoupon.plan_id),
          usageLimit: Number(newCoupon.usageLimit),
        },
        {
          headers: {
            'X-API-Key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackbar({
        open: true,
        message: 'Coupon added successfully!',
        severity: 'success',
      });
      setNewCoupon({
        couponCode: '',
        discountPercentage: '',
        plan_id: '',
        usageLimit: '',
        expirationDate: '',
      });
      setShowForm(false);
      fetchCoupons();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to add coupon',
        severity: 'error',
      });
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    try {
      await axios.delete(`${BASE_URL}/v1/coupon/delete?id=${id}`, {
        headers: {
          'X-API-Key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      //   setCoupons(coupons.filter((coupon) => coupon.id !== id));
      setSnackbar({ open: true, message: 'Coupon deleted successfully!', severity: 'success' });
      fetchCoupons();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete coupon.', severity: 'error' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let sanitizedValue = value;

    // ✅ Prevent spaces in couponCode field
    if (name === 'couponCode') {
      sanitizedValue = value.replace(/\s+/g, ''); // Removes all spaces
    }

    // ✅ Prevent numbers above 100 for specific fields
    if (
      ['discountPercentage', 'plan_id', 'usageLimit'].includes(name) &&
      Number(sanitizedValue) > 100
    ) {
      return;
    }

    setNewCoupon({ ...newCoupon, [name]: sanitizedValue });
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-left mb-12 pl-2">
        <h1 className="font-bold text-5xl text-purple-800 mb-6">IMCWIRE All Coupons</h1>
        <p className="text-gray-700">Manage coupons for the platform.</p>
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
            inputProps={{ maxLength: 20, pattern: '^[^\\s]+$' }} // ✅ Prevents spaces in input
            onKeyDown={(e) => {
              if (e.key === ' ') e.preventDefault(); // ✅ Prevents space key from working
            }}
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
          {/* <br />
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
          </TextField> */}
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
          <Button variant="contained" color="primary" onClick={handleAddCoupon} sx={{ mt: 2 }}>
            Add Coupon
          </Button>
        </div>
      )}
      {coupons.length <= 0 ? (
        <Alert severity="info" sx={{ width: '100%', mt: 2 }}>
          No Coupons Available
        </Alert>
      ) : (
        <Grid container spacing={2} className="">
          {coupons.map((coupon) => (
            <Grid item md={6} xl={4} className="w-full" key={coupon.id}>
              <div
                style={{
                  // position: 'absolute',
                  inset: '0',
                  opacity: '0.5',
                  borderRadius: '16px',
                }}
              />

              <div
                style={{
                  position: 'relative',
                  background: '#ffffff',
                  margin: '1px',
                  borderRadius: '15px',
                  padding: '20px',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'center',
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div
                  style={{
                    minWidth: '70px',
                    height: '70px',
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      opacity: '0.5',
                    }}
                  >
                    <CustomSparkles />
                  </div>
                  <span style={{ fontSize: '24px', fontWeight: '600', lineHeight: '1' }}>
                    {Number(coupon.discountPercentage)}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>% OFF</span>
                </div>

                <div style={{ flex: '1', color: '#333333' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    }}
                  >
                    <CustomTag />
                    <span style={{ fontSize: '24px', fontWeight: '600', letterSpacing: '0.5px' }}>
                      {coupon.couponCode}
                    </span>
                    <IconButton
                      style={{ position: 'absolute', top: '10px', right: '10px', color: 'red' }}
                      onClick={() => handleDeleteCoupon(coupon.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#f21010"
                          fillRule="evenodd"
                          d="M9.774 5L3.758 3.94l.174-.986a.5.5 0 0 1 .58-.405L18.411 5h.088h-.087l1.855.327a.5.5 0 0 1 .406.58l-.174.984l-2.09-.368l-.8 13.594A2 2 0 0 1 15.615 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5h12.69zH5.5zM9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9zm-2.646-7.871l3.94.694a.5.5 0 0 1 .405.58l-.174.984l-4.924-.868l.174-.985a.5.5 0 0 1 .58-.405z"
                        />
                      </svg>
                    </IconButton>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', color: '#666666', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CustomClock />
                      <span>Expires: {new Date(coupon.expirationDate).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CustomGift />
                      <span>
                        Used: {coupon.timesUsed}/{coupon.usageLimit}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '15px',
                      height: '4px',
                      background: '#e5e7eb',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${(coupon.timesUsed / coupon.usageLimit) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};
export default AddCupponView;
