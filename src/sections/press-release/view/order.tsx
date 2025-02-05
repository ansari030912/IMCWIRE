import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import moment from 'moment';
import { Scrollbar } from 'src/components/scrollbar'; // Assuming you have a custom Scrollbar component
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';
// Define allowed colors as a specific type for MUI Chip
// Manually define the allowed colors for the Chip component
type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
// Define a helper function to get the color and label for the payment status
const getPaymentStatusChipProps = (status: string): { label: string; color: ChipColor } => {
  switch (status.toLowerCase()) {
    case 'pending':
      return { label: 'Pending', color: 'warning' };
    case 'rejected':
      return { label: 'Rejected', color: 'error' };
    case 'approved':
      return { label: 'Approved', color: 'success' };
    case 'published':
      return { label: 'Published', color: 'primary' };
    default:
      return { label: status, color: 'default' };
  }
};
interface Order {
  id: number;
  client_id: string;
  user_id: number;
  plan_id: number;
  prType: string;
  pr_status: string;
  payment_method: string;
  payment_status: string;
  total_price: string;
  created_at: string;
  ip_address: string;
  targetCountries: {
    id: number;
    countryName: string;
    countryPrice: string;
    translation: string;
    translationPrice: string;
  }[];
  industryCategories: {
    id: number;
    categoryName: string;
    categoryPrice: string;
  }[];
}

const OrdersView = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/v1/pr/user-order-list`, {
          headers: {
            'x-api-key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        setSnackbar({ open: true, message: 'Failed to fetch orders.', severity: 'error' });
      }
    };

    fetchOrders();
  }, [token]);

  const handleOpenDialog = (order: Order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <TableContainer component={Paper}>
        <Scrollbar>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                {/* <TableCell>Client ID</TableCell>
                <TableCell>User ID</TableCell> */}
                <TableCell>PR Type</TableCell>
                <TableCell>PR Status</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Payment Status</TableCell>
                {/* <TableCell>Created At</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  onClick={() => handleOpenDialog(order)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{order.id}</TableCell>
                  {/* <TableCell>{order.client_id}</TableCell>
                  <TableCell>{order.user_id}</TableCell> */}
                  <TableCell>{order.prType}</TableCell>
                  {/* <TableCell>{order.pr_status}</TableCell> */}
                  <TableCell>
                    <Chip
                      label={getPaymentStatusChipProps(order.pr_status).label}
                      color={getPaymentStatusChipProps(order.pr_status).color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>${order.total_price}</TableCell>
                  <TableCell>{order.payment_status}</TableCell>
                  {/* <TableCell>{moment(order.created_at).format('DD MMM YYYY')}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={orders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {selectedOrder && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>Order Details</DialogTitle>
          <DialogContent>
            <Typography>IP Address: {selectedOrder.ip_address}</Typography>
            <Typography>Payment Method: {selectedOrder.payment_method}</Typography>
            <Typography>Target Countries:</Typography>
            {selectedOrder.targetCountries.map((country) => (
              <Typography
                key={country.id}
              >{`${country.countryName}: $${country.countryPrice}, Translation Required: ${country.translation}`}</Typography>
            ))}
            <Typography>Industry Categories:</Typography>
            {selectedOrder.industryCategories.map((category) => (
              <Typography
                key={category.id}
              >{`${category.categoryName}: $${category.categoryPrice}`}</Typography>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersView;
