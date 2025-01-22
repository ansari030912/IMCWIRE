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

export function SignUpView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = useCallback(() => {
    // Simulated new user data (Set user as active but not logged in)
    const newUserData = {
      fullName,
      email,
      password,
      role: 'admin', // Static role
      user: 'active', // The user is active in the system
      isLogin: false, // The user is not logged in initially
    };

    // Get existing users from cookies or initialize an empty array
    const existingUsers = Cookies.get('users')
      ? JSON.parse(Cookies.get('users') || '[]')
      : [];

    // Add the new user to the array
    existingUsers.push(newUserData);

    // Store updated user list in cookies (expires in 7 days)
    Cookies.set('users', JSON.stringify(existingUsers), { expires: 7 });

    // Redirect to login page after registration
    router.push('/login');
  }, [router, fullName, email, password]);

  const renderForm = (
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
      >
        Register
      </LoadingButton>
    </Box>
  );

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

      {renderForm}
    </>
  );
}
