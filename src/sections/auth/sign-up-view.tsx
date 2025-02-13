/* eslint-disable @typescript-eslint/no-shadow */
import axios from 'axios';
/* eslint-disable import/no-extraneous-dependencies */
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import CustomReCAPTCHA from 'src/components/recaptcha/CustomReCAPTCHA';
import { BASE_URL, RECAPTCHA_SITEKEY, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

// ----------------------------------------------------------------------

export function SignUpView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success', // Default to 'success'
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSignUp = useCallback(async () => {
    // Validate required fields
    if (!fullName || !email || !password) {
      setSnackbar({ open: true, message: 'All fields are required.', severity: 'error' });
      return;
    }
    // Validate email format
    if (!validateEmail(email)) {
      setSnackbar({ open: true, message: 'Invalid email format.', severity: 'error' });
      return;
    }
    // Validate password complexity
    if (!validatePassword(password)) {
      setSnackbar({
        open: true,
        message:
          'Password must have at least 8 characters, one uppercase, one lowercase, one number, and one special character.',
        severity: 'error',
      });
      return;
    }
    // Validate reCAPTCHA completion
    if (!recaptchaToken) {
      setSnackbar({ open: true, message: 'Please complete the reCAPTCHA challenge.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/v1/account/register`,
        {
          username: fullName,
          email,
          password,
          isAgency: false,
          recaptchaToken, // Send the reCAPTCHA token to the backend for verification
        },
        {
          headers: {
            'x-api-key': X_API_KEY,
          },
        }
      );

      if (response.status === 201) {
        setSnackbar({ open: true, message: 'Registration successful!', severity: 'success' });
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Registration failed.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [router, fullName, email, password, recaptchaToken]);

  return (
    <>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Register Account</Typography>
        <Typography variant="body2" color="text.secondary">
          Already have an account?
          <Link to="/login" style={{ marginLeft: '4px', textDecoration: 'none', color: 'blue' }}>
            Login
          </Link>
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" alignItems="flex-end">
        <TextField
          fullWidth
          name="full_name"
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />
        <TextField
          fullWidth
          name="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />
        <TextField
          fullWidth
          name="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputLabelProps={{ shrink: true }}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {/* Custom reCAPTCHA Component */}
        <Box sx={{ mb: 3, alignSelf: 'center' }}>
          <CustomReCAPTCHA
            siteKey={RECAPTCHA_SITEKEY}
            onChange={(token: string | null) => setRecaptchaToken(token)}
            onExpired={() => setRecaptchaToken(null)}
          />
        </Box>

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          color="inherit"
          variant="contained"
          onClick={handleSignUp}
          loading={loading}
        >
          Register
        </LoadingButton>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
