import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

export function SignInView() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getIpAddress = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/v1/ip/get-ip`, {
        headers: {
          'x-api-key': X_API_KEY,
        },
      });
      return response.data.ip;
    } catch (error) {
      console.error('Error fetching IP address:', error);
      return null;
    }
  };

  const handleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      const ipAddress = await getIpAddress();
      if (!ipAddress) {
        setErrorMessage('Session Timeout Please Login Again');
        setLoading(false);
        return;
      }

      const loginResponse = await axios.post(
        `${BASE_URL}/v1/account/login`,
        {
          email,
          password,
          ipAddress,
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
      }
    } catch (error) {
      setErrorMessage(error.response.data.message);
      console.error('Error during login:', error);
    } finally {
      setLoading(false);
    }
  }, [email, password]);

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
          sx={{ mb: 1 }}
        />

        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}

        <Link
          to="/forgot-password"
          style={{ marginBottom: '6px', textDecoration: 'none', color: 'blue' }}
        >
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
