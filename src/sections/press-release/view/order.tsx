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
  ListItemText,
  ListItem,
  List,
  Grid,
  styled,
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import moment from 'moment';
import { Scrollbar } from 'src/components/scrollbar'; // Assuming you have a custom Scrollbar component
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';
import SinglePrDetailsForm from '../SinglePrDetailForm';
// Define allowed colors as a specific type for MUI Chip
interface DetailItemProps {
  label: string;
  value: string;
}
// Manually define the allowed colors for the Chip component
type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
// Define a helper function to get the color and label for the payment status
const getPrStatusChipProps = (status: string): { label: string; color: ChipColor } => {
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
// Function to determine the badge color based on payment status

// Define a function to get properties for payment status chip
const getPaymentStatusChipProps = (status: string): { label: string; color: ChipColor } => {
  switch (status.toLowerCase()) {
    case 'paid':
      return { label: 'Paid', color: 'success' }; // Green color for paid
    case 'unpaid':
      return { label: 'Unpaid', color: 'error' }; // Red color for unpaid
    case 'refund':
      return { label: 'Refund', color: 'warning' }; // Yellow color for refund
    default:
      return { label: status, color: 'default' }; // Grey color for undefined statuses
  }
};

interface TargetCountry {
  id: number;
  countryName: string;
  countryPrice: string;
  translation: string;
  translationPrice: string;
}

// Define TypeScript interface for component props

interface IndustryCategory {
  id: number;
  categoryName: string;
  categoryPrice: string;
}

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
  email: string;
  planName: string;
  totalPlanPrice: string;
  priceSingle: string;
  planDescription: string;
  pdfLink: string;
  numberOfPR: number;
  perma: string;
  targetCountries: TargetCountry[];
  industryCategories: IndustryCategory[];
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
  },
}));

const OrdersView = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
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
  const toggleRowExpansion = (orderId: number) => {
    setExpandedRows(
      expandedRows.includes(orderId)
        ? expandedRows.filter((id) => id !== orderId)
        : [...expandedRows, orderId]
    );
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
                <TableCell>Total Price</TableCell>
                <TableCell>Order Status</TableCell>
                <TableCell>Payment Status</TableCell>
                {/* <TableCell>Created At</TableCell> */}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                <>
                  <TableRow
                    key={order.id}
                    hover
                    // onClick={() => handleOpenDialog(order)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell>{order.id}</TableCell>
                    {/* <TableCell>{order.client_id}</TableCell>
                  <TableCell>{order.user_id}</TableCell> */}
                    <TableCell>{order.prType}</TableCell>
                    {/* <TableCell>{order.pr_status}</TableCell> */}
                    <TableCell>${order.total_price}</TableCell>
                    {/* <TableCell>{order.payment_status}</TableCell> */}
                    <TableCell>
                      <Chip
                        label={getPrStatusChipProps(order.pr_status).label}
                        color={getPrStatusChipProps(order.pr_status).color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Chip
                        label={getPaymentStatusChipProps(order.payment_status).label}
                        color={getPaymentStatusChipProps(order.payment_status).color}
                        // className={`${getPaymentStatusChipProps(order.payment_status)} font-medium`}
                        size="small"
                      />
                    </TableCell>
                    {/* <TableCell>{moment(order.created_at).format('DD MMM YYYY')}</TableCell> */}
                    <TableCell>
                      <Button onClick={() => handleOpenDialog(order)}>Details</Button>
                      <Button onClick={() => toggleRowExpansion(order.id)}>
                        {expandedRows.includes(order.id) ? 'Close' : 'Add Single Pr'}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRows.includes(order.id) && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <SinglePrDetailsForm orderId={order.id} />
                      </TableCell>
                    </TableRow>
                  )}
                </>
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

      {/* {selectedOrder && (
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
      )} */}
      {selectedOrder && (
        <StyledDialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          className="rounded-lg"
        >
          <DialogTitle className="bg-primary text-white py-4 text-xl font-bold">
            Order Details
          </DialogTitle>
          <DialogContent className="divide-y divide-gray-200">
            <Grid container spacing={4} className="py-4">
              <Grid item xs={12} md={6}>
                <Paper elevation={0} className="p-4 bg-gray-50 rounded-lg">
                  <Typography variant="h6" className="mb-3 text-primary font-semibold">
                    Basic Information
                  </Typography>
                  {/* <DetailItem label="Order ID" value={selectedOrder.id} /> */}
                  <DetailItem label="Order ID" value={selectedOrder.client_id} />
                  {/* <DetailItem label="User ID" value={selectedOrder.user_id} /> */}
                  <DetailItem label="Email" value={selectedOrder.email} />
                  <DetailItem label="PR Type" value={selectedOrder.prType} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} className="p-4 bg-gray-50 rounded-lg">
                  <Typography variant="h6" className="mb-3 text-primary font-semibold">
                    Payment Details
                  </Typography>
                  <DetailItem label="Payment Method" value={selectedOrder.payment_method} />
                  <DetailItem label="Payment Status" value={selectedOrder.payment_status} />
                  <DetailItem label="Total Price" value={`$${selectedOrder.total_price}`} />
                  <DetailItem label="IP Address" value={selectedOrder.ip_address} />
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={4} className="py-4">
              <Grid item xs={12}>
                <Paper elevation={0} className="p-4 bg-gray-50 rounded-lg">
                  <Typography variant="h6" className="mb-3 text-primary font-semibold">
                    Plan Information
                  </Typography>
                  <DetailItem label="Plan Name" value={selectedOrder.planName} />
                  <DetailItem label="Total Plan Price" value={`$${selectedOrder.totalPlanPrice}`} />
                  <DetailItem label="Price Single" value={`$${selectedOrder.priceSingle}`} />
                  <DetailItem label="Plan Description" value={selectedOrder.planDescription} />
                  <DetailItem label="PDF Link" value={selectedOrder.pdfLink} />
                  {/* <DetailItem label="Number of PR" value={selectedOrder.numberOfPR} /> */}
                  {/* <DetailItem label="Perma" value={selectedOrder.perma} /> */}
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={4} className="py-4">
              <Grid item xs={12} md={6}>
                <Paper elevation={0} className="p-4 bg-gray-50 rounded-lg">
                  <Typography variant="h6" className="mb-3 text-primary font-semibold">
                    Target Countries
                  </Typography>
                  <List dense>
                    {selectedOrder.targetCountries.map((country) => (
                      <ListItem key={country.id} className="px-0">
                        <ListItemText
                          primary={country.countryName}
                          secondary={`$${country.countryPrice}, Translation: ${country.translation} ($${country.translationPrice})`}
                          className="text-sm"
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} className="p-4 bg-gray-50 rounded-lg">
                  <Typography variant="h6" className="mb-3 text-primary font-semibold">
                    Industry Categories
                  </Typography>
                  <List dense>
                    {selectedOrder.industryCategories.map((category) => (
                      <ListItem key={category.id} className="px-0">
                        <ListItemText
                          primary={category.categoryName}
                          secondary={`$${category.categoryPrice}`}
                          className="text-sm"
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions className="bg-gray-100">
            <Button
              onClick={handleCloseDialog}
              variant="contained"
              color="primary"
              className="px-6 py-2"
            >
              Close
            </Button>
          </DialogActions>
        </StyledDialog>
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

// Helper component for consistent info item display
const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <Grid container spacing={2} className="py-1">
    <Grid item xs={5}>
      <Typography variant="subtitle2" className="font-semibold text-gray-600">
        {label}:
      </Typography>
    </Grid>
    <Grid item xs={7}>
      <Typography variant="body2" className="text-gray-800">
        {value}
      </Typography>
    </Grid>
  </Grid>
);

export default OrdersView;
