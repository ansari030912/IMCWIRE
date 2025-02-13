import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { BASE_URL, RECAPTCHA_SITEKEY, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

// Extend the Window interface to include reCAPTCHA types
declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoadCallback: () => void;
  }
}

export function SignInView() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // reCAPTCHA widget element ref and widget ID ref
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  // Render the reCAPTCHA widget only once
  const renderRecaptcha = () => {
    if (widgetIdRef.current !== null) return; // Already rendered
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

  // Dynamically load the reCAPTCHA script if not already loaded
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

  const getIpAddress = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/v1/ip/get-ip`, {
        headers: { 'x-api-key': X_API_KEY },
      });
      return response.data.ip;
    } catch (error) {
      console.error('Error fetching IP address:', error);
      return null;
    }
  };

  const handleSignIn = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    // Check if the user has completed the captcha
    if (!recaptchaToken) {
      setErrorMessage('Please verify that you are not a robot.');
      setLoading(false);
      return;
    }

    try {
      const ipAddress = await getIpAddress();
      if (!ipAddress) {
        setErrorMessage('Session Timeout. Please login again.');
        setLoading(false);
        return;
      }

      const loginResponse = await axios.post(
        `${BASE_URL}/v1/account/login`,
        {
          email,
          password,
          ipAddress,
          recaptchaToken, // send the reCAPTCHA token to your backend for verification
        },
        {
          headers: {
            'x-api-key': X_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      if (
        loginResponse.status === 200 &&
        loginResponse.data.message === 'Login successful' &&
        loginResponse.data.token &&
        loginResponse.data.isActive
      ) {
        Cookies.set('user', JSON.stringify(loginResponse.data), { expires: 1 });
        window.location.reload();
      } else {
        setErrorMessage('Invalid credentials or inactive account');
        if (window.grecaptcha && widgetIdRef.current !== null) {
          window.grecaptcha.reset(widgetIdRef.current);
          setRecaptchaToken(null);
        }
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 'An error occurred during login'
      );
      console.error('Error during login:', error);
      if (window.grecaptcha && widgetIdRef.current !== null) {
        window.grecaptcha.reset(widgetIdRef.current);
        setRecaptchaToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, recaptchaToken]);

  return (
    <>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Login</Typography>
        <Typography variant="body2" color="text.secondary">
          Don’t have an account?
          <Link to="/register" style={{ marginLeft: '4px', textDecoration: 'none', color: 'blue' }}>
            Get started
          </Link>
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" alignItems="flex-end">
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
        <Box sx={{ mb: 3, alignSelf: 'right', width: '100%' }}>
          <div ref={recaptchaRef} />
        </Box>

        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}

        <Link to="/forgot-password" style={{ marginBottom: '6px', textDecoration: 'none', color: 'blue' }}>
          Forgot password?
        </Link>

        <LoadingButton
          fullWidth
          size="large"
          color="inherit"
          variant="contained"
          onClick={handleSignIn}
          loading={loading}
        >
          Log in
        </LoadingButton>
      </Box>
    </>
  );
}
