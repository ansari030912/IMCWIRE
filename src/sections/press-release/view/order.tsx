import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
  IconButton,
  styled,
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';

import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';
import SinglePrDetailsForm from '../SinglePrDetailForm';

// -------------- Type Definitions -------------- //

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

interface PlanRecord {
  id: number;
  user_id: number;
  plan_id: number;
  total_prs: number;
  used_prs: number;
  created_at: string;
  updated_at: string;
  pr_id: number;
}

interface TargetCountry {
  id: number;
  countryName: string;
  countryPrice: string;
  translation: string;
  translationPrice: string;
}

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
  planRecords?: PlanRecord[];
}

// -------------- Helpers -------------- //

function getPrStatusChipProps(status: string): { label: string; color: ChipColor } {
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
}

function getPaymentStatusChipProps(status: string): { label: string; color: ChipColor } {
  switch (status.toLowerCase()) {
    case 'paid':
      return { label: 'Paid', color: 'success' };
    case 'unpaid':
      return { label: 'Unpaid', color: 'error' };
    case 'refund':
      return { label: 'Refund', color: 'warning' };
    default:
      return { label: status, color: 'default' };
  }
}

// -------------- Styled Components -------------- //

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
  },
}));

const StyledTableCell = styled(TableCell)(() => ({
  fontSize: 14,
}));

const StyledTableHeadCell = styled(TableCell)(() => ({
  fontSize: 14,
  fontWeight: 'bold',
  backgroundColor: '#f5f5f5',
}));

// -------------- Sub-Components -------------- //

function IndustryList({ industries }: { industries: IndustryCategory[] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <StyledTableHeadCell>Category</StyledTableHeadCell>
          <StyledTableHeadCell>Price</StyledTableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {industries.map((cat) => (
          <TableRow key={cat.id}>
            <StyledTableCell>{cat.categoryName}</StyledTableCell>
            <StyledTableCell>${cat.categoryPrice}</StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CountryList({ countries }: { countries: TargetCountry[] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <StyledTableHeadCell>Country</StyledTableHeadCell>
          <StyledTableHeadCell>Price</StyledTableHeadCell>
          <StyledTableHeadCell>Translation</StyledTableHeadCell>
          <StyledTableHeadCell>Translation Price</StyledTableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {countries.map((tc) => (
          <TableRow key={tc.id}>
            <StyledTableCell>{tc.countryName}</StyledTableCell>
            <StyledTableCell>${tc.countryPrice}</StyledTableCell>
            <StyledTableCell>{tc.translation}</StyledTableCell>
            <StyledTableCell>${tc.translationPrice}</StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function PlanInfoTable({ order }: { order: Order }) {
  const rows = [
    { label: 'Plan Name', value: order.planName || '' },
    { label: 'PR Type', value: order.prType || '' },
    {
      label: 'Plan Price | Single Price',
      value: `$${order.totalPlanPrice || '0.00'} | $${order.priceSingle || '0.00'}`,
    },
    { label: 'Payment Method', value: order.payment_method || '' },
    { label: 'Order PR Status', value: order.pr_status || '' },
    {
      label: 'PDF Link',
      value:
        order.pdfLink && order.pdfLink.trim() !== '' ? (
          <Button
            variant="contained"
            size="small"
            href={order.pdfLink}
            target="_blank"
            rel="noopener"
          >
            Download PDF
          </Button>
        ) : (
          'No PDF'
        ),
    },
  ];

  return (
    <Table size="small">
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.label}>
            <StyledTableCell sx={{ width: 200, fontWeight: 'bold' }}>{r.label}</StyledTableCell>
            <StyledTableCell>{r.value}</StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// -------------- Main Component -------------- //

const OrdersView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [token, setToken] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // 1) Define a reusable fetch function
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get<Order[]>(`${BASE_URL}/v1/pr/user-order-list`, {
        headers: {
          'x-api-key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch orders.',
        severity: 'error',
      });
    }
  }, [token]);

  // 2) Retrieve token from cookies
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

  // 3) Load orders after token is set
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 4) Row expansion toggle
  const toggleRowExpansion = (orderId: number) => {
    setExpandedRows((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // 5) PR Submission success callback
  const handleSinglePrSuccess = () => {
    // Re-fetch orders to update the table
    fetchOrders();
    // Optionally show a success message
    setSnackbar({ open: true, message: 'Single PR added successfully!', severity: 'success' });
  };

  // 6) Dialog open/close
  const handleOpenDialog = (order: Order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  // 7) Pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 8) Render
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Orders
      </Typography>

      <TableContainer component={Paper}>
        <Table aria-label="Orders Table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>PR Type</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Order Status</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Used / Total PRs</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => {
              // Extract used/total from planRecords if available
              let usedPRS = 0;
              let totalPRS = 0;
              if (order.planRecords && order.planRecords.length > 0) {
                usedPRS = order.planRecords[0].used_prs;
                totalPRS = order.planRecords[0].total_prs;
              }

              return (
                <React.Fragment key={order.id}>
                  <TableRow hover>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.prType}</TableCell>
                    <TableCell>${order.total_price}</TableCell>
                    <TableCell>
                      <Chip
                        label={getPrStatusChipProps(order.pr_status).label}
                        color={getPrStatusChipProps(order.pr_status).color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPaymentStatusChipProps(order.payment_status).label}
                        color={getPaymentStatusChipProps(order.payment_status).color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {usedPRS} / {totalPRS}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenDialog(order)}
                      >
                        Details
                      </Button>

                      {order.payment_status.toLowerCase() === 'paid' &&
                        order.pr_status.toLowerCase() === 'approved' && (
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => toggleRowExpansion(order.id)}
                          >
                            {expandedRows.includes(order.id) ? 'Hide' : 'Add Single PR'}
                          </Button>
                        )}
                    </TableCell>
                  </TableRow>

                  {expandedRows.includes(order.id) && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <SinglePrDetailsForm
                          orderId={order.id}
                          prType={order.prType as 'IMCWire Written' | 'Self-Written'}
                          /** Pass callback to refresh data on success */
                          onSuccess={handleSinglePrSuccess}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <StyledDialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        aria-labelledby="order-dialog-title"
      >
        <DialogTitle id="order-dialog-title" sx={{ fontWeight: 'bold', pr: 5 }}>
          Order Details
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            {/* <CloseIcon /> */}
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedOrder && (
            <>
              <Typography variant="h6" gutterBottom>
                Plan Information
              </Typography>
              <PlanInfoTable order={selectedOrder} />

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Industry Categories
              </Typography>
              {selectedOrder.industryCategories?.length > 0 ? (
                <IndustryList industries={selectedOrder.industryCategories} />
              ) : (
                <Typography>No Industry Categories</Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Target Countries
              </Typography>
              {selectedOrder.targetCountries?.length > 0 ? (
                <CountryList countries={selectedOrder.targetCountries} />
              ) : (
                <Typography>No Target Countries</Typography>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="contained" onClick={handleCloseDialog}>
            Close
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersView;
