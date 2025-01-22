/* eslint-disable import/no-extraneous-dependencies */
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = useCallback(() => {
    const users = Cookies.get('users') ? JSON.parse(Cookies.get('users') || '[]') : [];
  
    // Find user by email and password
    const userIndex = users.findIndex((user: { email: string; password: string; }) => user.email === email && user.password === password);
  
    if (userIndex !== -1) {
      users[userIndex].isLogin = true; // Set user as logged in
      Cookies.set('users', JSON.stringify(users), { expires: 7 });
  
      // Update userData for authentication
      Cookies.set('userData', JSON.stringify(users[userIndex]), { expires: 7 });
  
      router.push('/'); // Redirect to dashboard
    } else {
      alert('Invalid credentials!');
    }
  }, [router, email, password]);
  

  const renderForm = (
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
        sx={{ mb: 1 }}
      />

      {errorMessage && (
        <Typography color="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Typography>
      )}

      <Link
        to="/forgot-password"
        color="inherit"
        style={{ marginBottom: '6px', textDecoration: 'none', color: 'blue' }}
      >
        Forgot password?
      </Link>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleSignIn}
      >
        Log in
      </LoadingButton>
    </Box>
  );

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

      {renderForm}
    </>
  );
}
