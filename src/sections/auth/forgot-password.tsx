/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable import/no-extraneous-dependencies */
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import axios from 'axios';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { useRouter } from 'src/routes/hooks';
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

// ----------------------------------------------------------------------

export function ForgotPasswordView() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = useCallback(async () => {
    if (!email) {
      setSnackbar({ open: true, message: 'Email is required.', severity: 'error' });
      return;
    }

    if (!validateEmail(email)) {
      setSnackbar({ open: true, message: 'Invalid email format.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/v1/account/forgot-password`,
        { email },
        {
          headers: {
            'x-api-key': X_API_KEY,
          },
        }
      );

      if (response.status === 200) {
        setSnackbar({ open: true, message: 'Password reset email sent successfully. Please check your inbox.', severity: 'success' });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to send password reset email.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Forgot Password</Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your email to receive password reset instructions.
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" alignItems="flex-end">
        <TextField
          fullWidth
          name="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          color="inherit"
          variant="contained"
          onClick={handleForgotPassword}
          loading={loading}
        >
          Reset Password
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
