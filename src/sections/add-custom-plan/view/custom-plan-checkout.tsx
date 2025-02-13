/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card,
  Grid,
  Alert,
  Button,
  Snackbar,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

interface ICustomOrder {
  orderId: string;
  client_id: string;
  perma: string;
  orderType: string;
  total_price: string;
  payment_status: string;
  payment_method: string;
  prType: string;
  is_active: number;
  created_at: string;
  invoiceUrl: string;
  discountType: string;
  discountValue: string;
  discountAmount: string;
  planData: {
    plan_id: number;
    planName: string;
    totalPlanPrice: string;
    priceSingle: string;
    planDescription: string;
    pdfLink: string;
    numberOfPR: number;
    activate_plan: number;
    type: string;
  };
  targetCountries: Array<{
    id: number;
    countryName: string;
    countryPrice: string;
    translationValue: string;
  }>;
  industryCategories: Array<{
    id: number;
    categoryName: string;
    categoryPrice: string;
  }>;
}

interface IProps {
  id: string | undefined;
}

export function CustomPlanCheckOutView({ id }: IProps) {
  // --------------------------
  // 1) User Authentication (via cookies)
  // --------------------------
  const cookieUser = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
  const isAuthenticated = Boolean(
    cookieUser &&
      cookieUser.token &&
      cookieUser.message === 'Login successful' &&
      cookieUser.isActive
  );
  const [loggedInUser, setLoggedInUser] = useState<any>(cookieUser || null);

  // --------------------------
  // 2) Snackbar for Messages
  // --------------------------
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error');
  const showSnackbar = (message: string, severity: 'error' | 'success' = 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // --------------------------
  // 3) Fetch Custom Order Data (Invoice Data)
  // --------------------------
  const [customOrder, setCustomOrder] = useState<ICustomOrder | null>(null);
  const fetchCustomOrder = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/v1/pr/custom-order/${id}`, {
        headers: { 'x-api-key': X_API_KEY },
      });
      if (response.status === 200) {
        setCustomOrder(response.data);
      }
    } catch (error) {
      console.error('Error fetching custom order:', error);
      showSnackbar('Error fetching custom order data', 'error');
    }
  };
  useEffect(() => {
    if (id) fetchCustomOrder();
  }, [id]);

  // --------------------------
  // 4) Wizard Flow State
  // --------------------------
  // Flow:
  // Step 1: Show custom order summary (read-only)
  // Step 2: If not logged in, show login/register; if logged in, skip to Step 3.
  // Step 3: Final Checkout.
  const [currentStep, setCurrentStep] = useState<number>(1);

  // --------------------------
  // 5) Login / Register State (if needed)
  // --------------------------
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isAgency, setIsAgency] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/v1/ip/get-ip`, {
          headers: {
            'x-api-key': X_API_KEY,
            'Content-Type': 'application/json',
          },
        });
        setIpAddress(response.data.ip);
      } catch (error) {
        console.error('Error fetching IP:', error);
      }
    };

    fetchIp();
  }, [id]);

  const handleSignIn = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const loginResponse = await axios.post(
        `${BASE_URL}/v1/account/login`,
        { email, password, ipAddress },
        { headers: { 'x-api-key': X_API_KEY, 'Content-Type': 'application/json' } }
      );
      if (
        loginResponse.status === 200 &&
        loginResponse.data.message === 'Login successful' &&
        loginResponse.data.token &&
        loginResponse.data.isActive
      ) {
        Cookies.set('user', JSON.stringify(loginResponse.data), { expires: 1 });
        setLoggedInUser(loginResponse.data);
        showSnackbar('Login successful!', 'success');
        setCurrentStep(3);
      } else {
        setErrorMessage('Invalid credentials or inactive account');
      }
    } catch (error) {
      setErrorMessage('Login failed. Please try again.');
      console.error('Error during login:', error);
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  async function handleRegister() {
    if (!email || !name || !password) {
      showSnackbar('Please fill all fields (email, name, password).', 'error');
      return;
    }
    try {
      const payload = { username: name, email, password, isAgency };
      const resp = await axios.post(`${BASE_URL}/v1/account/register`, payload, {
        headers: { 'x-api-key': X_API_KEY },
      });
      if (resp.data && resp.data.token) {
        Cookies.set('user', JSON.stringify(resp.data), { expires: 1 });
        setLoggedInUser(resp.data);
        showSnackbar('Registration successful!', 'success');
        setCurrentStep(3);
      } else {
        showSnackbar('Registration failed, please verify your details.', 'error');
      }
    } catch (err) {
      console.error(err);
      showSnackbar('Registration failed, please check your details.', 'error');
    }
  }

  // --------------------------
  // 6) Final Checkout
  // --------------------------
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleCheckout = async () => {
    if (!agreeToTerms) {
      showSnackbar('Please agree to the Terms and Conditions before checkout.', 'error');
      return;
    }
    try {
      // Build payload from custom order data
      const payload = {
        plan_id: customOrder?.planData?.plan_id,
        prType: customOrder?.prType,
        pr_status: 'Pending',
        payment_method: 'Stripe', // as provided
        ip_address: ipAddress, // Replace with real IP if needed
        targetCountries: customOrder?.targetCountries.map((tc) => ({
          name: tc?.countryName,
          price: Number(tc?.countryPrice),
          translationRequired: tc?.translationValue,
          translationPrice: tc?.translationValue === 'Yes' ? 70.0 : 0.0,
        })),
        industryCategories: customOrder?.industryCategories.map((ic) => ({
          name: ic?.categoryName,
          price: Number(ic?.categoryPrice),
        })),
        total_price: Number(customOrder?.total_price),
        payment_status: 'unpaid',
      };
      const resp = await axios.post(`${BASE_URL}/v1/pr/submit-order`, payload, {
        headers: { 'x-api-key': X_API_KEY, Authorization: `Bearer ${loggedInUser?.token || ''}` },
      });

      showSnackbar('PR submitted successfully! Redirecting...', 'success');
      const { paymentUrl } = resp.data;
      setTimeout(() => {
        window.location.href = paymentUrl;
      }, 3000);
    } catch (error) {
      console.error(error);
      showSnackbar('Checkout failed. Please try again.', 'error');
    }
  };

  // --------------------------
  // 7) Step Navigation
  // --------------------------
  // Flow:
  // Step 1: Show custom order summary.
  // Step 2: If not logged in, show login/register; if logged in, skip to Step 3.
  // Step 3: Final Checkout.
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!isAuthenticated) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
    }
  };

  const handleBackStep = () => {
    if (isAuthenticated && currentStep === 3) {
      setCurrentStep(1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // --------------------------
  // 8) Renderers
  // --------------------------
  // Step 1: Custom Order Summary – display all details with an alternating two‑color layout.
  const renderStepOne = () => (
    <Card className="p-6 w-full">
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>
        Custom Order Summary
      </Typography>
      {customOrder ? (
        <>
          {/* Plan Data Section */}
          <Box className="flex justify-between" bgcolor="#f0f0f0" p={2} mb={2} borderRadius="4px">
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Plan Name:
            </Typography>
            <Typography variant="body1">
              <b>{customOrder.planData.planName}</b>
            </Typography>
          </Box>
          <Box className="flex justify-between" bgcolor="#ffffff" p={2} mb={2} borderRadius="4px">
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Description:
            </Typography>
            <Typography variant="body1">{customOrder.planData.planDescription}</Typography>
          </Box>
          <Box className="flex justify-between" bgcolor="#f0f0f0" p={2} mb={2} borderRadius="4px">
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              PR Type:
            </Typography>
            <Typography className="text-purple-700 font-bold">
              <b> {customOrder.prType}</b>
            </Typography>
          </Box>
          <Box className="flex justify-between" bgcolor="#ffffff" p={2} mb={2} borderRadius="4px">
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              PR Single Price:
            </Typography>
            <Typography className="text-purple-700 font-bold">
              <b> ${customOrder.planData.priceSingle}</b>
            </Typography>
          </Box>
          <Box className="flex justify-between" bgcolor="#f0f0f0" p={2} mb={2} borderRadius="4px">
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Number Of PR:
            </Typography>
            <Typography className="text-purple-700 font-bold">
              <b> {customOrder.planData.numberOfPR}</b>
            </Typography>
          </Box>
          {customOrder.planData.type === 'custom-plan' && (
            <Box className="flex justify-between" bgcolor="#ffffff" p={2} mb={2} borderRadius="4px">
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Plan Type:
              </Typography>
              <Typography className="text-purple-700 font-bold">
                <b> {customOrder.planData.type === 'custom-plan' && 'Custom Plan Invoice'}</b>
              </Typography>
            </Box>
          )}
          {/* Target Countries */}
          <Box className="flex justify-between" bgcolor="#f0f0f0" p={2} mb={2} borderRadius="4px">
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Target Countries:
            </Typography>
            <div>
              {customOrder.targetCountries.map((tc) => (
                <Box key={tc?.id} pl={2} mb={0.5}>
                  <Typography variant="body2" className="text-right">
                    <span className="text-purple-700 font-bold">{tc?.countryName}</span> <br />(
                    <b>Translation :</b> {tc?.translationValue} / <b>Additional Charges :</b> $
                    {tc?.countryPrice} )
                  </Typography>
                </Box>
              ))}
            </div>
          </Box>
          {/* Industry Categories */}
          <Box className="flex justify-between" bgcolor="#ffffff" p={2} mb={2} borderRadius="4px">
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Industry Categories:
            </Typography>
            <div>
              {customOrder.industryCategories.map((ic) => (
                <Box key={ic?.id} pl={2} mb={0.5}>
                  <Typography variant="body2" className="text-right">
                    <span className="text-purple-700 font-bold">{ic?.categoryName}</span> <br />(
                    <b>Additional Charges :</b> ${ic?.categoryPrice} )
                  </Typography>
                </Box>
              ))}
            </div>
          </Box>
          <Box className="flex justify-between" bgcolor="#f0f0f0" p={2} mb={2} borderRadius="4px">
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Discount Type:
            </Typography>
            <Typography className="text-purple-700 font-bold">
              <b>
                {' '}
                {customOrder.discountType === 'percentage'
                  ? `%${customOrder?.discountValue}`
                  : `$${customOrder?.discountValue}`}
              </b>
            </Typography>
          </Box>
          {/* Industry Categories */}
          <Box className="flex justify-between" bgcolor="#ffffff" p={2} mb={2} borderRadius="4px">
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Disount Amount:
            </Typography>
            <Typography className="text-green-600 font-bold">
              <b> ${customOrder.discountAmount}</b>
            </Typography>
          </Box>
          <Box className="flex justify-between" bgcolor="#f0f0f0" p={2} mb={2} borderRadius="4px">
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Status
            </Typography>
            <Typography className="text-red-700 font-bold">
              <b> {customOrder.payment_status === 'unpaid' && 'Unpaid'}</b>
            </Typography>
          </Box>
          <Box className="flex justify-between" bgcolor="#ffffff" p={2} mb={2} borderRadius="4px">
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Total Plan Price:
            </Typography>
            <Typography className="text-red-600 text-2xl font-bold">
              <b> ${customOrder.planData.totalPlanPrice}</b>
            </Typography>
          </Box>
          {/* Invoice URL */}
          <Box className="flex justify-between" bgcolor="#4A316F" p={2} mb={2} borderRadius="4px">
            <p className="text-xl text-white font-bold">Total Amount:</p>
            <p className="text-2xl text-white font-bold">${customOrder.total_price}</p>
          </Box>
          {customOrder.payment_status === 'unpaid' && (
            <Box className="flex justify-end" mt={2}>
              <Button variant="contained" color="success" onClick={handleNextStep}>
                Next
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Alert severity="info">Loading custom order data...</Alert>
      )}
    </Card>
  );

  // Step 2: Login / Register (if user not logged in)
  const renderLoginRegister = () => (
    <Card className="p-6 w-full">
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>
        {showLogin ? 'Login' : 'Register'}
      </Typography>
      <Box display="flex" mb={4}>
        <Button
          variant={!showLogin ? 'contained' : 'outlined'}
          onClick={() => {
            setShowLogin(false);
            setErrorMessage('');
          }}
          sx={{ mr: 2 }}
        >
          Register
        </Button>
        <Button
          variant={showLogin ? 'contained' : 'outlined'}
          onClick={() => {
            setShowLogin(true);
            setErrorMessage('');
          }}
        >
          Login
        </Button>
      </Box>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      {!showLogin ? (
        <>
          <TextField
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isAgency}
                onChange={(e) => setIsAgency(e.target.checked)}
                color="primary"
              />
            }
            label="Are you an agency?"
          />
        </>
      ) : (
        <>
          <TextField
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
        </>
      )}
      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button onClick={handleBackStep} variant="outlined" color="primary">
          Back
        </Button>
        <Button
          onClick={showLogin ? handleSignIn : handleRegister}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {showLogin ? (loading ? 'Logging in...' : 'Login') : 'Register'}
        </Button>
      </Box>
    </Card>
  );

  // Step 3: Final Checkout – review with Terms & Conditions.
  const renderCheckout = () => (
    <Card className="p-6 w-full">
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>
        Final Checkout
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Please review your order. By clicking &quot;Checkout&quot;, you agree to the Terms and
        Conditions. We ensure that your custom plan is processed with the utmost priority and our
        dedicated team will follow up with further details.
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            color="primary"
          />
        }
        label="I agree to the Terms and Conditions"
      />
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button onClick={handleBackStep} variant="outlined" color="primary">
          Back
        </Button>
        <Button onClick={handleCheckout} variant="contained" color="primary">
          Checkout
        </Button>
      </Box>
    </Card>
  );

  // --------------------------
  // 9) Main Render
  // --------------------------
  return (
    <DashboardContent>
      <Box p={4}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Custom Invoice
        </Typography>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Grid container spacing={2}>
          {currentStep === 1 && (
            <Grid item xs={12}>
              {renderStepOne()}
            </Grid>
          )}
          {currentStep === 2 && (
            <Grid item xs={12}>
              {renderLoginRegister()}
            </Grid>
          )}
          {currentStep === 3 && (
            <Grid item xs={12}>
              {renderCheckout()}
            </Grid>
          )}
        </Grid>
      </Box>
    </DashboardContent>
  );
}
