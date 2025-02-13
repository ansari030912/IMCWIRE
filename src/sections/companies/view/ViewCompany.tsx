/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';

import {
  Box,
  Alert,
  Paper,
  Table,
  Snackbar,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
  TablePagination,
  CircularProgress,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

interface Company {
  id: number;
  companyName: string;
  address1: string;
  address2: string;
  contactName: string;
  phone: string;
  email: string;
  user_email: string;
  country: string;
  city: string;
  state: string;
  websiteUrl: string;
  created_at: string;
  updated_at: string;
}

const ViewCompany = () => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Get the user token from cookies
  useEffect(() => {
    const userTokenString = Cookies.get('user');
    if (userTokenString) {
      try {
        const userToken = JSON.parse(userTokenString);
        setToken(userToken.token);
      } catch (error) {
        console.error('Error parsing user token:', error);
      }
    }
  }, []);

  // Fetch companies once token is available
  useEffect(() => {
    if (token) {
      fetchCompanies();
    }
  }, [token]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/v1/company/superadmin/all`, {
        headers: {
          'X-API-Key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch companies.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Manage Companies
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View company details below.
        </Typography>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading Indicator */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          <CircularProgress size={60} />
        </Box>
      ) : companies.length === 0 ? (
        // No Companies Found Message
        <Box
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify
            icon="material-symbols:inventory-2-outline"
            width={64}
            height={64}
            color="#ccc"
          />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            No Companies Found
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }} align="center">
            It looks like there are no companies to display.
          </Typography>
        </Box>
      ) : (
        // Companies Table with Pagination
        <Paper elevation={2} sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Scrollbar>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>User Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Company Info</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="left">
                      Contact Info
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="left">
                      Contact Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="left">
                      Address
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companies
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((company, index) => (
                      <TableRow
                        key={company.id}
                        sx={{
                          backgroundColor: index % 2 === 0 ? 'white' : '#F6F7F8',
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {company.id}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {company.user_email}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600, color: 'primary.main' }}
                            >
                              {company.companyName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {company.websiteUrl}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="left">
                          <Typography variant="body2">{company.email}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {company.phone}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography variant="body2">{company.contactName}</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Box sx={{ pl: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {`${company.address1}, ${company.address2}`}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {`${company.city}, ${company.state}, ${company.country}`}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={companies.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Box>
  );
};

export default ViewCompany;
