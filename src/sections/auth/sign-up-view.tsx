/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable import/no-extraneous-dependencies */
import Cookies from 'js-cookie';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import axios from 'axios';
=======
import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect, useCallback } from 'react';
>>>>>>> 967701a63e5f1d676ff51f404cf8a9a0bcc2d3e2

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
<<<<<<< HEAD
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
=======
import FormControlLabel from '@mui/material/FormControlLabel';
>>>>>>> 967701a63e5f1d676ff51f404cf8a9a0bcc2d3e2

import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
<<<<<<< HEAD
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';
=======
import { BASE_URL, X_API_KEY, RECAPTCHA_SITEKEY } from 'src/components/Urls/BaseApiUrls';
>>>>>>> 967701a63e5f1d676ff51f404cf8a9a0bcc2d3e2

// ----------------------------------------------------------------------

export function SignUpView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (!fullName || !email || !password) {
      setSnackbar({ open: true, message: 'All fields are required.', severity: 'error' });
      return;
    }

    if (!validateEmail(email)) {
      setSnackbar({ open: true, message: 'Invalid email format.', severity: 'error' });
      return;
    }

    if (!validatePassword(password)) {
      setSnackbar({
        open: true,
        message:
          'Password must have at least 8 characters, one uppercase, one lowercase, one number, and one special character.',
        severity: 'error',
      });
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
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Registration failed.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [router, fullName, email, password]);

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
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
