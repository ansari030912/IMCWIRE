/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
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
  country: string;
  city: string;
  state: string;
  websiteUrl: string;
  created_at: string;
  updated_at: string;
}

const CompaniesView = () => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [newCompany, setNewCompany] = useState({
    companyName: '',
    address1: '',
    address2: '',
    contactName: '',
    phone: '',
    email: '',
    country: '',
    city: '',
    state: '',
    websiteUrl: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  useEffect(() => {
    const userTokenString = Cookies.get('user');
    console.log('User Token String:', userTokenString); // Debugging line
    if (userTokenString) {
      try {
        const userToken = JSON.parse(userTokenString);
        setToken(userToken.token);
      } catch (error) {
        console.error('Error parsing user token:', error);
      }
    }
  }, []);
  // Type the event correctly
  useEffect(() => {
    if (token) {
      fetchCompanies();
    }
  }, [token]);
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null, // MouseEvent for buttons in MUI pagination
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement> // Correct type for the input event
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/v1/company/list`, {
        headers: {
          'X-API-Key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setSnackbar({ open: true, message: 'Failed to fetch companies.', severity: 'error' });
    }
  };

  const handleAddCompany = async () => {
    try {
      await axios.post(
        `${BASE_URL}/v1/company/add`,
        { ...newCompany },
        {
          headers: {
            'X-API-Key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackbar({
        open: true,
        message: 'Company added successfully!',
        severity: 'success',
      });
      setNewCompany({
        companyName: '',
        address1: '',
        address2: '',
        contactName: '',
        phone: '',
        email: '',
        country: '',
        city: '',
        state: '',
        websiteUrl: '',
      });
      setShowForm(false);
      fetchCompanies();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to add company',
        severity: 'error',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCompany({ ...newCompany, [name]: value });
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-left mb-12 pl-2">
        <h1 className="font-bold text-5xl text-purple-800 mb-6">Manage Companies</h1>
        <p className="text-gray-700">Add or view company details.</p>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      <Box display="flex" alignItems="end" justifyContent="end" mb={5}>
        <Button
          variant="contained"
          color={showForm ? 'error' : 'inherit'}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Close Form' : 'Add New Company'}
        </Button>
      </Box>

      {showForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-100">
          <TextField
            className="bg-white rounded-lg"
            fullWidth
            label="Company Name"
            name="companyName"
            value={newCompany.companyName}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <TextField
            className="bg-white rounded-lg"
            fullWidth
            label="Address 1"
            name="address1"
            value={newCompany.address1}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <TextField
            className="bg-white rounded-lg"
            fullWidth
            label="Address 2"
            name="address2"
            value={newCompany.address2}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <TextField
            className="bg-white rounded-lg"
            fullWidth
            label="Contact Name"
            name="contactName"
            value={newCompany.contactName}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <TextField
            className="bg-white rounded-lg"
            fullWidth
            label="Phone"
            name="phone"
            value={newCompany.phone}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <TextField
            className="bg-white rounded-lg"
            fullWidth
            label="Email"
            name="email"
            value={newCompany.email}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <TextField
            className="bg-white rounded-lg"
            fullWidth
            label="Country"
            name="country"
            value={newCompany.country}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <TextField
            className="bg-white rounded-lg"
            fullWidth
            label="City"
            name="city"
            value={newCompany.city}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <TextField
            className="bg-white rounded-lg"
            fullWidth
            label="State"
            name="state"
            value={newCompany.state}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <TextField
            className="bg-white rounded-lg"
            fullWidth
            label="Website URL"
            name="websiteUrl"
            value={newCompany.websiteUrl}
            onChange={handleInputChange}
          />
          <br />
          <br />
          <Button variant="contained" color="primary" onClick={handleAddCompany} sx={{ mt: 2 }}>
            Add Company
          </Button>
        </div>
      )}
      {companies.length <= 0 ? (
        <Alert severity="info" sx={{ width: '100%', mt: 2 }}>
          No companies available
        </Alert>
      ) : (
        <TableContainer sx={{ overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Company Info</TableCell>
                  <TableCell align="left">Contact Info</TableCell>
                  <TableCell align="left">Contact Email</TableCell>
                  <TableCell align="left">Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map((company) => (
                  <TableRow
                    key={company.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Box
                        display="flex"
                        flexDirection="column"
                        sx={{ paddingLeft: 2, textWrap: 'nowrap' }}
                      >
                        <div className="text-purple-900 font-bold">{company.companyName}</div>
                        <p className="text-blue-500 font-semibold text-xs">{company.websiteUrl}</p>
                      </Box>
                    </TableCell>
                    <TableCell align="left" sx={{ textWrap: 'nowrap' }}>
                      <div>{company.contactName}</div>
                      <div className="text-xs">{company.phone}</div>
                    </TableCell>
                    <TableCell align="left">{company.email}</TableCell>
                    <TableCell align="left">
                      <Box display="flex" flexDirection="column" sx={{ paddingLeft: 2 }}>
                        <div className="text-purple-900 font-bold">
                          {`${company.address1}, ${company.address2}`}
                        </div>
                        <p className="text-blue-500 font-semibold text-xs">
                          {`${company.city}, ${company.state}, ${company.country}`}
                        </p>
                      </Box>
                    </TableCell>
                    {/* <TableCell align="left">
                    
                  </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={companies.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}
    </div>
  );
};
export default CompaniesView;
