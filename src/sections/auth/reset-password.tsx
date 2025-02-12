/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable import/no-extraneous-dependencies */
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

// ----------------------------------------------------------------------

export function ResetPasswordView() {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');
  const token = queryParams.get('token');

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setSnackbar({ open: false, message: '', severity: 'error' });
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setSnackbar({ open: false, message: '', severity: 'error' });
    setPasswordMatch(e.target.value === password);
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setSnackbar({ open: true, message: 'All fields are required.', severity: 'error' });
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

    if (password !== confirmPassword) {
      setSnackbar({ open: true, message: 'Passwords do not match.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/v1/account/reset-password`,
        {
          email,
          token,
          newPassword: password,
        },
        {
          headers: {
            'x-api-key': X_API_KEY,
          },
        }
      );

      if (response.status === 200) {
        setSnackbar({ open: true, message: 'Password reset successfully!', severity: 'success' });
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to reset password.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Reset Password</Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your new password below.
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" alignItems="flex-end">
        <TextField
          fullWidth
          name="password"
          label="New Password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />
        <TextField
          fullWidth
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />
        {passwordMatch && confirmPassword && <Typography color="green">Passwords match</Typography>}
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          color="inherit"
          variant="contained"
          onClick={handleResetPassword}
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
