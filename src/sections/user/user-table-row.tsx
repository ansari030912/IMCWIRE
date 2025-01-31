/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import moment from 'moment';
import Cookies from 'js-cookie';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import { Grid, Alert, Snackbar } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

export type UserProps = {
  fullName: string;
  createdAccDate: string;
  username: string;
  email: string;
  id: string;
  name: string;
  role: string;
  status: string;
  company: string;
  avatarUrl: string;
  isVerified: boolean;
  streetAddress?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
  // : (user: UserProps) => void;
};

export function UserTableRow({ row, selected, onSelectRow }: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleOpenDialog = () => {
    // (row);
    setOpenDialog(true);
    handleClosePopover();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  // eslint-disable-next-line @typescript-eslint/no-shadow
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handleChangeStatus = async (row: UserProps, changes: Partial<UserProps>) => {
    console.log('hello');
    try {
      // Merge only the changed fields onto the existing row
      const updated = { ...row, ...changes };

      // Access token from cookies
      const userCookie = Cookies.get('user');
      if (!userCookie) return;
      const parsedUser = JSON.parse(decodeURIComponent(userCookie));
      const { token } = parsedUser;
      if (!token) return;

      const response = await axios.put(
        `${BASE_URL}/v1/account/superadmin-update`,
        {
          targetUserId: Number(updated.id),
          role: updated.role, // keep old role if not replaced
          status: updated.status,
        },
        {
          headers: {
            'x-api-key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // If request is successful (e.g. status 200)
      if (response.status === 200) {
        setSnackbarMessage(response.data?.message || 'User updated successfully!');
        setSnackbarSeverity('success'); // Green
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      // If request fails, show an error Snackbar
      console.error('Error updating user:', error);

      setSnackbarMessage(
        error?.response?.data?.message || 'Error updating user. Please try again later.'
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    // If needed, avoid closing or reloading on clickaway
    if (reason === 'clickaway') {
      return;
    }

    // Close the Snackbar
    setSnackbarOpen(false);

    // Reload the page right after Snackbar closes
    window.location.reload();
  };

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell component="th" scope="row">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar alt={row.username} src={row.avatarUrl} />

            {/* Column: Name on top, date below */}
            <Box display="flex" flexDirection="column">
              <div className="text-purple-900 font-bold">{row.username}</div>
              <p className="text-blue-500 font-semibold text-xs">{moment(row.createdAccDate).format('DD MMM YYYY')}</p>
            </Box>
          </Box>
        </TableCell>

        <TableCell>{row.email}</TableCell>
        <TableCell>
          {row.role === 'admin' ? 'Admin' : row.role === 'user' ? 'User' : 'Super Admin'}
        </TableCell>

        <TableCell align="center">
          {row.status === 'active' ? (
            <Iconify width={22} icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
          ) : (
            '-'
          )}
        </TableCell>

        <TableCell>
          <Label
            color={
              row.status === 'permanent_block'
                ? 'error'
                : row.status === 'temporary_block'
                  ? 'warning'
                  : 'success'
            }
          >
            {row.status === 'permanent_block'
              ? 'Permanent Blocked'
              : row.status === 'temporary_block'
                ? 'Temporary Blocked'
                : 'Active'}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClick={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 180,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          {/* Always show user info */}
          <MenuItem onClick={handleOpenDialog}>
            <Iconify icon="mdi:account" width={20} color="#55427A" /> User Info
          </MenuItem>

          {/* Show "Active User" only if the user is NOT already active */}
          {row.role !== 'super_admin' && row.status !== 'active' && (
            <MenuItem
              onClick={() => {
                handleClosePopover();
                handleChangeStatus(row, { status: 'active' });
              }}
              sx={{ color: '#32B411' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <g fill="none">
                  <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                  <path
                    fill="#32B411"
                    d="M12 2c1.091 0 2.117.292 3 .804a1 1 0 1 1-1 1.73A4 4 0 0 0 8 8l11 .001a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1a6 6 0 0 1 6-6m7 8H5v10h14zm-7 2a2 2 0 0 1 1.134 3.647l-.134.085V17a1 1 0 0 1-1.993.117L11 17v-1.268A2 2 0 0 1 12 12m7.918-6.979l.966.26a1 1 0 0 1-.518 1.93l-.965-.258a1 1 0 0 1 .517-1.932M18.633 2.09a1 1 0 0 1 .707 1.225l-.129.482a1 1 0 1 1-1.932-.517l.13-.483a1 1 0 0 1 1.224-.707"
                  />
                </g>
              </svg>
              Active User
            </MenuItem>
          )}

          {/* Show "Make User" only if current role is NOT "user" */}
          {row.role !== 'super_admin' && row.role !== 'user' && (
            <MenuItem
              onClick={() => {
                handleClosePopover();
                handleChangeStatus(row, { role: 'user' });
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#1c252e"
                  d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 7c2.67 0 8 1.33 8 4v3H4v-3c0-2.67 5.33-4 8-4m0 1.9c-2.97 0-6.1 1.46-6.1 2.1v1.1h12.2V17c0-.64-3.13-2.1-6.1-2.1"
                />
              </svg>
              Make User
            </MenuItem>
          )}

          {/* Show "Make Admin" only if current role is NOT "admin" */}
          {row.role !== 'super_admin' && row.role !== 'admin' && (
            <MenuItem
              onClick={() => {
                handleClosePopover();
                handleChangeStatus(row, { role: 'admin' });
              }}
              sx={{ color: '#6841a8' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#6841a8"
                  d="M17.06 13c-1.86 0-3.42 1.33-3.82 3.1c-.95-.41-1.82-.3-2.48-.01C10.35 14.31 8.79 13 6.94 13C4.77 13 3 14.79 3 17s1.77 4 3.94 4c2.06 0 3.74-1.62 3.9-3.68c.34-.24 1.23-.69 2.32.02c.18 2.05 1.84 3.66 3.9 3.66c2.17 0 3.94-1.79 3.94-4s-1.77-4-3.94-4M6.94 19.86c-1.56 0-2.81-1.28-2.81-2.86s1.26-2.86 2.81-2.86c1.56 0 2.81 1.28 2.81 2.86s-1.25 2.86-2.81 2.86m10.12 0c-1.56 0-2.81-1.28-2.81-2.86s1.25-2.86 2.81-2.86s2.82 1.28 2.82 2.86s-1.27 2.86-2.82 2.86M22 10.5H2V12h20zm-6.47-7.87c-.22-.49-.78-.75-1.31-.58L12 2.79l-2.23-.74l-.05-.01c-.53-.15-1.09.13-1.29.64L6 9h12l-2.44-6.32z"
                />
              </svg>
              Make Admin
            </MenuItem>
          )}

          {/* Show "Block Temporary" only if the user is NOT already temp-blocked */}
          {row.role !== 'super_admin' &&
            row.status !== 'temporary_block' &&
            row.status !== 'permanent_block' && (
              <MenuItem
                onClick={() => {
                  handleClosePopover();
                  handleChangeStatus(row, { status: 'temporary_block' });
                }}
                sx={{ color: '#ddcb00' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#ddcb00"
                    d="M10 4a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4a4 4 0 0 0-4-4m7.5 9C15 13 13 15 13 17.5s2 4.5 4.5 4.5s4.5-2 4.5-4.5s-2-4.5-4.5-4.5M10 14c-4.42 0-8 1.79-8 4v2h9.5a6.5 6.5 0 0 1-.5-2.5a6.5 6.5 0 0 1 .95-3.36c-.63-.08-1.27-.14-1.95-.14m7.5.5c1.66 0 3 1.34 3 3c0 .56-.15 1.08-.42 1.5L16 14.92c.42-.27.94-.42 1.5-.42M14.92 16L19 20.08c-.42.27-.94.42-1.5.42c-1.66 0-3-1.34-3-3c0-.56.15-1.08.42-1.5"
                  />
                </svg>
                Block Temporary
              </MenuItem>
            )}

          {/* Show "Block Permanent" only if the user is NOT already permanently blocked */}
          {row.role !== 'super_admin' && row.status !== 'permanent_block' && (
            <MenuItem
              onClick={() => {
                handleClosePopover();
                handleChangeStatus(row, { status: 'permanent_block' });
              }}
              sx={{ color: '#ff0d0d' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
                <path
                  fill="#ff0d0d"
                  d="M0 10a10 10 0 1 1 20 0a10 10 0 0 1-20 0m16.32-4.9L5.09 16.31A8 8 0 0 0 16.32 5.09zm-1.41-1.42A8 8 0 0 0 3.68 14.91z"
                />
              </svg>
              Block Permanent
            </MenuItem>
          )}
        </MenuList>
      </Popover>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: { width: 700, maxWidth: 700 }, // fixed width for large screens
        }}
      >
        <DialogTitle>User Information</DialogTitle>
        <DialogContent>
          {/* Row 1 (light gray) */}
          <Grid
            container
            sx={{
              backgroundColor: 'grey.100',
              px: 1,
              py: 1,
              mb: 1,
            }}
          >
            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <Box display="flex">
                <Box mr={1} display="flex" alignItems="center">
                  <Iconify icon="material-symbols:badge" width={30} color="#55427A" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Register Date</Typography>
                  <Typography variant="body2">
                    {moment(row.createdAccDate).format('DD MMM YYYY')}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <Box display="flex">
                <Box mr={1} display="flex" alignItems="center">
                  <Iconify icon="material-symbols:call" width={30} color="#55427A" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Phone</Typography>
                  <Typography variant="body2">{row.phoneNumber || 'N/A'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Row 2 (white) */}
          <Grid
            container
            sx={{
              backgroundColor: 'white',
              px: 1,
              py: 1,
              mb: 1,
            }}
          >
            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <Box display="flex">
                <Box mr={1} display="flex" alignItems="center">
                  <Iconify icon="material-symbols:account-circle" width={30} color="#55427A" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Name</Typography>
                  <Typography variant="body2">{row.username}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <Box display="flex">
                <Box mr={1} display="flex" alignItems="center">
                  <Iconify icon="material-symbols:business-center" width={30} color="#55427A" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Company</Typography>
                  <Typography variant="body2">{row.company || 'N/A'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Row 3 (light gray) */}
          <Grid
            container
            sx={{
              backgroundColor: 'grey.100',
              px: 1,
              py: 1,
              mb: 1,
            }}
          >
            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <Box display="flex">
                <Box mr={1} display="flex" alignItems="center">
                  <Iconify icon="mdi:email-outline" width={30} color="#55427A" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Email</Typography>
                  <Typography variant="body2">{row.email || 'N/A'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <Box display="flex">
                <Box mr={1} display="flex" alignItems="center">
                  <Iconify
                    icon="material-symbols:admin-panel-settings"
                    width={30}
                    color="#55427A"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Role</Typography>
                  <Typography variant="body2">{row.role || 'N/A'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Row 4 (white) */}
          <Grid
            container
            sx={{
              backgroundColor: 'white',
              px: 1,
              py: 1,
              mb: 1,
            }}
          >
            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <Box display="flex">
                <Box mr={1} display="flex" alignItems="center">
                  <Iconify icon="ic:baseline-manage-accounts" width={30} color="#55427A" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Status</Typography>
                  <Typography variant="body2">{row.status || 'N/A'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <Box display="flex">
                <Box mr={1} display="flex" alignItems="center">
                  <Iconify icon="mdi:city" width={30} color="#55427A" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">City</Typography>
                  <Typography variant="body2">{row.city || 'N/A'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Row 5 (light gray) */}
          <Grid
            container
            sx={{
              backgroundColor: 'grey.100',
              px: 1,
              py: 1,
              mb: 1,
            }}
          >
            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <Box display="flex">
                <Box mr={1} display="flex" alignItems="center">
                  <Iconify icon="ic:round-public" width={30} color="#55427A" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Country</Typography>
                  <Typography variant="body2">{row.country || 'N/A'}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <Box display="flex">
                <Box mr={1} display="flex" alignItems="center">
                  <Iconify icon="mdi:mailbox-open-up-outline" width={30} color="#55427A" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Zip</Typography>
                  <Typography variant="body2">{row.zipCode || 'N/A'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Row 6 (white) */}
          <Grid
            container
            sx={{
              backgroundColor: 'white',
              px: 1,
              py: 1,
              mb: 1,
            }}
          >
            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <Box display="flex">
                <Box mr={1} display="flex" alignItems="center">
                  <Iconify icon="mdi:map-marker-outline" width={30} color="#55427A" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Address</Typography>
                  <Typography variant="body2">{row.streetAddress || 'N/A'}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <Box display="flex">
                <Box mr={1} display="flex" alignItems="center">
                  <Iconify icon="mdi:gender-male-female" width={30} color="#55427A" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Gender</Typography>
                  <Typography variant="body2">{row.gender || 'N/A'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Row 7 (light gray) */}
          <Grid
            container
            sx={{
              backgroundColor: 'grey.100',
              px: 1,
              py: 1,
            }}
          >
            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <Box display="flex">
                <Box mr={1} display="flex" alignItems="center">
                  <Iconify icon="material-symbols:calendar-today" width={30} color="#55427A" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Date of Birth</Typography>
                  <Typography variant="body2">
                    {' '}
                    {row.dateOfBirth ? moment(row.dateOfBirth).format('DD MMM YYYY') : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <Box display="flex">
                <Box mr={1} display="flex" alignItems="center">
                  <Iconify icon="solar:check-circle-bold" width={30} color="#55427A" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Verified</Typography>
                  <Typography variant="body2">{row.status === 'active' ? 'Yes' : 'No'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
