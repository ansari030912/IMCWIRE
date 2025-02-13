import axios from 'axios';
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';
import { BASE_URL, X_API_KEY, RECAPTCHA_SITEKEY } from 'src/components/Urls/BaseApiUrls';

// Extend the Window interface to include recaptcha types
declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoadCallback: () => void;
  }
}

export function SignUpView() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAgency, setIsAgency] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Snackbar states for displaying messages
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error');

  // reCAPTCHA widget ref and widget ID ref
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  // Function to render the reCAPTCHA widget only once
  const renderRecaptcha = () => {
    if (widgetIdRef.current !== null) {
      // Widget already rendered; do nothing.
      return;
    }
    if (recaptchaRef.current && window.grecaptcha) {
      const id = window.grecaptcha.render(recaptchaRef.current, {
        sitekey: RECAPTCHA_SITEKEY,
        callback: (token: string) => {
          setRecaptchaToken(token);
        },
        'expired-callback': () => {
          setRecaptchaToken(null);
        },
        'error-callback': () => {
          setRecaptchaToken(null);
        },
      });
      widgetIdRef.current = id;
    }
  };

  // Dynamically load the Google reCAPTCHA script if not already loaded
  useEffect(() => {
    if (!window.grecaptcha) {
      const script = document.createElement('script');
      script.src =
        'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoadCallback&render=explicit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      window.onRecaptchaLoadCallback = renderRecaptcha;
    } else {
      renderRecaptcha();
    }
  }, []);

  // Handle closing the snackbar
  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Password validation function: must have one lowercase, one uppercase, one number and one special character.
  const isPasswordValid = (pwd: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-]).+$/;
    return passwordRegex.test(pwd);
  };

  const handleSignUp = useCallback(async () => {
    setLoading(true);

    // Validate required fields
    if (!fullName || !email || !password) {
      setSnackbarMessage('All fields are required.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    // Validate password format
    if (!isPasswordValid(password)) {
      setSnackbarMessage(
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.'
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    // Check if the user has completed the captcha
    if (!recaptchaToken) {
      setSnackbarMessage('Please verify that you are not a robot.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/v1/account/register`,
        {
          username: fullName,
          email,
          password,
          isAgency, // Added agency flag to the request body
        },
        {
          headers: {
            'x-api-key': X_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        Cookies.set('user', JSON.stringify(response.data), { expires: 1 });
        // Optionally, you can show a success message before navigating.
        setSnackbarMessage('Registration successful! Redirecting to login...');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setSnackbarMessage('Registration failed.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        if (window.grecaptcha && widgetIdRef.current !== null) {
          window.grecaptcha.reset(widgetIdRef.current);
          setRecaptchaToken(null);
        }
      }
    } catch (error: any) {
      setSnackbarMessage(
        error.response?.data?.message ||
          'An error occurred during registration.'
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error('Error during registration:', error);
      if (window.grecaptcha && widgetIdRef.current !== null) {
        window.grecaptcha.reset(widgetIdRef.current);
        setRecaptchaToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [fullName, email, password, isAgency, recaptchaToken, navigate]);

  return (
    <>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Register</Typography>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link to="/login" style={{ marginLeft: '4px', textDecoration: 'none', color: 'blue' }}>
            Login
          </Link>
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" alignItems="flex-end">
        <TextField
          fullWidth
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          sx={{ mb: 3 }}
        />
        <TextField
          fullWidth
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 3 }}
        />
        <TextField
          fullWidth
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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

        <FormControlLabel
          control={
            <Checkbox
              checked={isAgency}
              onChange={(e) => setIsAgency(e.target.checked)}
              color="primary"
            />
          }
          label="Sign up as Agency"
          sx={{ alignSelf: 'flex-start', mb: 3 }}
        />

        <Box sx={{ mb: 3, alignSelf: 'right', width: '100%' }}>
          <div ref={recaptchaRef} />
        </Box>

        <LoadingButton
          fullWidth
          size="large"
          color="inherit"
          variant="contained"
          onClick={handleSignUp}
          loading={loading}
        >
          Register
        </LoadingButton>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}