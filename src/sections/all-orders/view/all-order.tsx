import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useEffect, useCallback } from 'react';

// MUI
import {
  Box,
  Card,
  Chip,
  Button,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  TableHead,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

import { TableEmptyRows } from '../table-empty-rows';
import { TableNoData } from '../table-no-data';
import { emptyRows } from '../utils';

/* -------------------------------------------
   1) useTable() Hook: sorting & pagination
   ------------------------------------------- */
function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('email');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [orderBy, order]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
    } else {
      setSelected([]);
    }
  }, []);

  const onSelectRow = useCallback(
    (idValue: string) => {
      const newSelected = selected.includes(idValue)
        ? selected.filter((value) => value !== idValue)
        : [...selected, idValue];
      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(e.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    orderBy,
    rowsPerPage,
    selected,
    onSort,
    onSelectRow,
    onSelectAllRows,
    onResetPage,
    onChangePage,
    onChangeRowsPerPage,
  };
}

/* -------------------------------------------
   2) compareRow() for sorting
   ------------------------------------------- */
function compareRow(a: any, b: any, orderBy: string, order: 'asc' | 'desc') {
  const valA = getFieldValue(a, orderBy);
  const valB = getFieldValue(b, orderBy);

  if (valA < valB) return order === 'asc' ? -1 : 1;
  if (valA > valB) return order === 'asc' ? 1 : -1;
  return 0;
}

function getFieldValue(row: any, orderBy: string): string | number {
  if (orderBy === 'email') return (row.email || '').toLowerCase();
  if (orderBy === 'planName') return (row.planName || '').toLowerCase();
  if (orderBy === 'type') return (row.type || '').toLowerCase();
  if (orderBy === 'payment_status') return (row.payment_status || '').toLowerCase();
  if (orderBy === 'pr_status') return (row.pr_status || '').toLowerCase();
  if (orderBy === 'total_price') return parseFloat(row.total_price || '0');
  return '';
}

/* -------------------------------------------
   3) Styled table cells
   ------------------------------------------- */
const StyledTableCell = styled(TableCell)(() => ({
  fontWeight: 500,
}));

const StyledTableHeadCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
  backgroundColor: '#f4f6f8',
}));

/* -------------------------------------------
   4) Table Head for the main orders list
   ------------------------------------------- */
type OrderTableHeadProps = {
  order: 'asc' | 'desc';
  orderBy: string;
  onSort: (id: string) => void;
  headLabel: Array<{ id: string; label: string; align?: 'left' | 'right' | 'center' }>;
};

function OrderTableHead({ order, orderBy, onSort, headLabel }: OrderTableHeadProps) {
  return (
    <TableHead>
      <TableRow>
        {headLabel.map((cell) => {
          const isSorted = orderBy === cell.id;
          return (
            <StyledTableHeadCell
              key={cell.id}
              align={cell.align || 'left'}
              sx={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              onClick={() => onSort(cell.id)}
            >
              {cell.label}
              {isSorted ? (order === 'asc' ? ' 🔼' : ' 🔽') : ''}
            </StyledTableHeadCell>
          );
        })}
        <StyledTableHeadCell align="center">Actions</StyledTableHeadCell>
      </TableRow>
    </TableHead>
  );
}

/* -------------------------------------------
   5) Map plan type to user-friendly text
   ------------------------------------------- */
function mapPlanType(type?: string) {
  if (type === 'package') return 'Package';
  if (type === 'product') return 'Product';
  if (type === 'custom-plan') return 'Custom Invoice Plan';
  if (type === 'IMCWire Written') return 'IMCWire Written';
  if (type === 'Self-Written') return 'Self Written';
  return type || '--';
}

/* -------------------------------------------
   6) The main "AllOrdersView" component
   ------------------------------------------- */

type FilterStatus = 'all' | 'paid' | 'unpaid' | 'refund' | 'self-paid' | 'failed';

export function AllOrdersView() {
  const table = useTable();

  const [filterName, setFilterName] = useState('');
  // Payment filter => 'paid','unpaid','refund','self-paid','failed'
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [orders, setOrders] = useState<any[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Fetch orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userCookie = Cookies.get('user');
        if (!userCookie) return;

        const parsedUser = JSON.parse(decodeURIComponent(userCookie));
        const { token } = parsedUser;
        if (!token) return;

        const res = await axios.get(`${BASE_URL}/v1/pr/superAdmin-list`, {
          headers: {
            'x-api-key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };
    fetchOrders();
  }, []);

  // (A) Callback: Update a single PR’s status in local "orders"
  const handleSinglePRUpdate = (prId: number, newStatus: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (!ord.singlePRDetails) return ord;
        const updatedDetails = ord.singlePRDetails.map((pr: any) =>
          pr.id === prId ? { ...pr, status: newStatus } : pr
        );
        return { ...ord, singlePRDetails: updatedDetails };
      })
    );
  };

  // (B) Callback: Update entire order's pr_status + payment_status in local "orders"
  const handleOrderStatusUpdate = (
    orderId: number,
    newPrStatus: string,
    newPaymentStatus: string
  ) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              pr_status: newPrStatus,
              payment_status: newPaymentStatus,
            }
          : ord
      )
    );
  };

  // Filter logic
  const dataFiltered = orders.filter((item) => {
    const search = filterName.toLowerCase();
    const passText =
      item.email?.toLowerCase().includes(search) ||
      item.planName?.toLowerCase().includes(search) ||
      item.prType?.toLowerCase().includes(search);

    let passStatus = true;
    if (filterStatus === 'paid') passStatus = item.payment_status === 'paid';
    else if (filterStatus === 'unpaid') passStatus = item.payment_status === 'unpaid';
    else if (filterStatus === 'refund') passStatus = item.payment_status === 'refund';
    else if (filterStatus === 'self-paid') passStatus = item.payment_status === 'self-paid';
    else if (filterStatus === 'failed') passStatus = item.payment_status === 'failed';

    return passText && passStatus;
  });

  // Sort & paginate
  const dataSorted = [...dataFiltered].sort((a, b) => compareRow(a, b, table.orderBy, table.order));
  const dataPage = dataSorted.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = dataSorted.length === 0 && filterName.trim() !== '';

  const handleView = (row: any) => {
    setSelectedOrder(row);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedOrder(null);
    setDialogOpen(false);
  };

  return (
    <DashboardContent>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          All Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Filter, search, and manage all purchased plans.
        </Typography>
      </Box>

      {/* Filter Card */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Box display="flex" flexWrap="wrap" gap={3}>
          <Box>
            <Typography variant="subtitle2">Search:</Typography>
            <input
              style={{ border: '1px solid #ccc', borderRadius: 4, padding: '6px' }}
              placeholder="Search by email / plan / prType"
              value={filterName}
              onChange={(e) => {
                setFilterName(e.target.value);
                table.onResetPage();
              }}
            />
          </Box>

          {/* Payment Status Filter */}
          <Box>
            <Typography variant="subtitle2">Payment Status Filter:</Typography>
            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
              <Button
                variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                onClick={() => {
                  setFilterStatus('all');
                  table.onResetPage();
                }}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'paid' ? 'contained' : 'outlined'}
                onClick={() => {
                  setFilterStatus('paid');
                  table.onResetPage();
                }}
              >
                Paid
              </Button>
              <Button
                variant={filterStatus === 'unpaid' ? 'contained' : 'outlined'}
                onClick={() => {
                  setFilterStatus('unpaid');
                  table.onResetPage();
                }}
              >
                Unpaid
              </Button>
              <Button
                variant={filterStatus === 'refund' ? 'contained' : 'outlined'}
                onClick={() => {
                  setFilterStatus('refund');
                  table.onResetPage();
                }}
              >
                Refunded
              </Button>
              <Button
                variant={filterStatus === 'self-paid' ? 'contained' : 'outlined'}
                onClick={() => {
                  setFilterStatus('self-paid');
                  table.onResetPage();
                }}
              >
                Self Paid
              </Button>
              <Button
                variant={filterStatus === 'failed' ? 'contained' : 'outlined'}
                onClick={() => {
                  setFilterStatus('failed');
                  table.onResetPage();
                }}
              >
                Failed
              </Button>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Main Table */}
      <Card>
        <Scrollbar>
          <TableContainer>
            <Table sx={{ minWidth: 1000 }}>
              <OrderTableHead
                order={table.order}
                orderBy={table.orderBy}
                onSort={table.onSort}
                headLabel={[
                  { id: 'email', label: 'Email' },
                  { id: 'planName', label: 'Plan Name' },
                  { id: 'type', label: 'Plan Type' },
                  { id: 'payment_status', label: 'Payment Status' },
                  { id: 'pr_status', label: 'PR Status' },
                  { id: 'total_price', label: 'Total Price', align: 'right' },
                ]}
              />

              <TableBody>
                {dataPage.map((row) => {
                  // Payment Status => color-coded
                  let payLabel = row.payment_status || '--';
                  let payColor: 'success' | 'warning' | 'error' = 'warning';
                  if (row.payment_status === 'paid') {
                    payLabel = 'Paid';
                    payColor = 'success';
                  } else if (row.payment_status === 'refund') {
                    payLabel = 'Refunded';
                    payColor = 'error';
                  } else if (row.payment_status === 'unpaid') {
                    payLabel = 'Unpaid';
                    payColor = 'warning';
                  } else if (row.payment_status === 'self-paid') {
                    payLabel = 'Self-Paid';
                    payColor = 'success';
                  } else if (row.payment_status === 'failed') {
                    payLabel = 'Failed';
                    payColor = 'error';
                  }

                  // PR Status => color-coded
                  let prColor: 'default' | 'warning' | 'success' | 'error' = 'default';
                  if (row.pr_status === 'Pending') prColor = 'warning';
                  else if (row.pr_status === 'Approved') prColor = 'success';
                  else if (row.pr_status === 'Rejected') prColor = 'error';

                  const isSelected = table.selected.includes(row.id);

                  return (
                    <TableRow hover key={row.id} selected={isSelected}>
                      <StyledTableCell>{row.email}</StyledTableCell>
                      <StyledTableCell>{row.planName}</StyledTableCell>
                      <StyledTableCell>{mapPlanType(row.prType)}</StyledTableCell>

                      <StyledTableCell>
                        <Chip label={payLabel} color={payColor} variant="outlined" />
                      </StyledTableCell>

                      <StyledTableCell>
                        <Chip label={row.pr_status || '--'} color={prColor} variant="outlined" />
                      </StyledTableCell>

                      <StyledTableCell align="right">${row.total_price}</StyledTableCell>

                      <StyledTableCell align="center">
                        <Button variant="outlined" size="small" onClick={() => handleView(row)}>
                          View
                        </Button>
                      </StyledTableCell>
                    </TableRow>
                  );
                })}

                <TableEmptyRows
                  height={60}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataSorted.length)}
                />
                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={dataSorted.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          sx={{ mt: 1 }}
        />
      </Card>

      {/* Dialog for order details */}
      <OrderDetailDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        order={selectedOrder}
        onSinglePRUpdate={handleSinglePRUpdate}
        onOrderStatusUpdate={handleOrderStatusUpdate}
      />
    </DashboardContent>
  );
}

/* -------------------------------------------
   7) The Detail Dialog
   ------------------------------------------- */
type OrderDetailDialogProps = {
  open: boolean;
  onClose: () => void;
  order: any | null;
  onSinglePRUpdate: (prId: number, newStatus: string) => void;
  onOrderStatusUpdate: (
    orderId: number,
    newPrStatus: string,
    newPaymentStatus: string
  ) => void;
};

function OrderDetailDialog({
  open,
  onClose,
  order,
  onSinglePRUpdate,
  onOrderStatusUpdate,
}: OrderDetailDialogProps) {
  if (!order) return null;

  const planRecord = order.planRecords && order.planRecords.length > 0 ? order.planRecords[0] : null;
  const totalPrs = planRecord?.total_prs || order.numberOfPR || 0;
  const usedPrs = planRecord?.used_prs || 0;
  const leftPrs = totalPrs - usedPrs;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 'bold' }}>Order Details</DialogTitle>
      <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
        ✕
      </IconButton>

      <DialogContent dividers>
        <PlanInfoTable order={order} />

        <Box mt={2}>
          <UpdateEntireOrderStatus order={order} onOrderStatusUpdate={onOrderStatusUpdate} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {order.industryCategories && order.industryCategories.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              Industry Categories
            </Typography>
            <IndustryList industries={order.industryCategories} />
          </Box>
        )}

        {order.targetCountries && order.targetCountries.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              Target Countries
            </Typography>
            <CountryList countries={order.targetCountries} />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box
          mb={2}
          display="flex"
          alignItems="center"
          sx={{ border: '1px solid #ccc', borderRadius: 1 }}
        >
          <Box flex={1} sx={{ p: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Total PRs: {totalPrs}
            </Typography>
          </Box>
          <Box flex={1} sx={{ p: 1, bgcolor: '#f0f0f0', textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Used: {usedPrs}
            </Typography>
          </Box>
          <Box flex={1} sx={{ p: 1, textAlign: 'right' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Left: {leftPrs}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Single PR Details
        </Typography>
        {order.singlePRDetails && order.singlePRDetails.length > 0 ? (
          <SinglePRTable
            singlePRDetails={order.singlePRDetails}
            onSinglePRUpdate={onSinglePRUpdate}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No single PR details
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="inherit" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* -------------------------------------------
   8) PlanInfoTable with alternating row color
   ------------------------------------------- */
function PlanInfoTable({ order }: { order: any }) {
  const rows = [
    { label: 'Plan Name', value: order.planName || '--' },
    { label: 'Plan Type', value: mapPlanType(order.prType) },
    { label: 'PR Type', value: order.prType || '--' },
    {
      label: 'Plan Price | Single Price',
      value: `$${order.totalPlanPrice || '0.00'} | $${order.priceSingle || '0.00'}`,
    },
    { label: 'Payment Method', value: order.payment_method || '--' },
    { label: 'Order PR Status', value: order.pr_status || '--' },
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
    <Table size="small" sx={{ mb: 2 }}>
      <TableBody>
        {rows.map((r, idx) => (
          <TableRow key={r.label} sx={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
            <StyledTableCell sx={{ width: 220, fontWeight: 'bold' }}>{r.label}</StyledTableCell>
            <StyledTableCell>{r.value}</StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/* -------------------------------------------
   9) Update entire order's PR & Payment status
   PUT /v1/pr/superadmin/update-order-status/{id}
   Body: { "newStatus": "...", "newPaymentStatus": "..." }
   ------------------------------------------- */
type UpdateEntireOrderStatusProps = {
  order: any;
  // (B) parent's callback: update pr_status + payment_status in parent state
  onOrderStatusUpdate: (orderId: number, newPrStatus: string, newPaymentStatus: string) => void;
};

export function UpdateEntireOrderStatus({ order, onOrderStatusUpdate }: UpdateEntireOrderStatusProps) {
  const [loading, setLoading] = useState(false);

  // If admin doesn't change them, we keep the old (current) values
  const [selectedPrStatus, setSelectedPrStatus] = useState(order.pr_status || 'Pending');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(order.payment_status || 'unpaid');

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  // PR statuses
  const prStatuses = ['Pending', 'Approved', 'Rejected'];
  // Payment statuses
  const paymentStatuses = ['paid', 'unpaid', 'refund', 'self-paid', 'failed'];

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      // If admin didn't change them, we keep the old values in the body
      const newStatus = selectedPrStatus || order.pr_status;
      const newPaymentStatus = selectedPaymentStatus || order.payment_status;

      const userCookie = Cookies.get('user');
      if (!userCookie) return;
      const { token } = JSON.parse(decodeURIComponent(userCookie));
      if (!token) return;

      // PUT request with both newStatus & newPaymentStatus
      await axios.put(
        `${BASE_URL}/v1/pr/superadmin/update-order-status/${order.id}`,
        {
          newStatus,          // either updated or old
          newPaymentStatus,   // either updated or old
        },
        {
          headers: {
            'x-api-key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show success
      setSnackbarMessage(`Order Updated Successfully PR:"${newStatus}", Payment:"${newPaymentStatus}"`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // locally update parent's state
      onOrderStatusUpdate(order.id, newStatus, newPaymentStatus);
    } catch (err) {
      console.error('Error updating entire order status:', err);
      setSnackbarMessage('Failed to update entire order. Check console.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
        Update Entire Order (PR & Payment) Status:
      </Typography>

      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        {/* PR Status */}
        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>PR Status</InputLabel>
          <Select
            label="PR Status"
            value={selectedPrStatus}
            onChange={(e) => setSelectedPrStatus(e.target.value as string)}
            disabled={loading}
          >
            {prStatuses.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Payment Status */}
        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>Payment Status</InputLabel>
          <Select
            label="Payment Status"
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value as string)}
            disabled={loading}
          >
            {paymentStatuses.map((ps) => (
              <MenuItem key={ps} value={ps}>
                {ps}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="outlined" disabled={loading} onClick={handleUpdate}>
          Update
        </Button>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

/* -------------------------------------------
   10) Industry Categories
   ------------------------------------------- */
function IndustryList({ industries }: { industries: any[] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <StyledTableHeadCell>Category</StyledTableHeadCell>
          <StyledTableHeadCell>Price</StyledTableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {industries.map((cat: any) => (
          <TableRow key={cat.id}>
            <StyledTableCell>{cat.categoryName}</StyledTableCell>
            <StyledTableCell>${cat.categoryPrice}</StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/* -------------------------------------------
   11) Target Countries
   ------------------------------------------- */
function CountryList({ countries }: { countries: any[] }) {
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
        {countries.map((tc: any) => (
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

/* -------------------------------------------
   12) Single PR Table
   ------------------------------------------- */
type SinglePRTableProps = {
  singlePRDetails: any[];
  onSinglePRUpdate: (prId: number, newStatus: string) => void;
};

function SinglePRTable({ singlePRDetails, onSinglePRUpdate }: SinglePRTableProps) {
  return (
    <Table size="small" sx={{ mt: 1 }}>
      <TableHead>
        <TableRow>
          <StyledTableHeadCell>PR ID</StyledTableHeadCell>
          <StyledTableHeadCell>PR Type</StyledTableHeadCell>
          <StyledTableHeadCell>Status</StyledTableHeadCell>
          <StyledTableHeadCell>Created At</StyledTableHeadCell>
          <StyledTableHeadCell>Actions</StyledTableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {singlePRDetails.map((detail: any) => (
          <SinglePRRow key={detail.id} detail={detail} onSinglePRUpdate={onSinglePRUpdate} />
        ))}
      </TableBody>
    </Table>
  );
}

/* -------------------------------------------
   13) Single PR Row
   PUT /v1/pr/update-single-pr/{id}
   Body: { pr_id, status }
   ------------------------------------------- */
type SinglePRRowProps = {
  detail: any;
  onSinglePRUpdate: (prId: number, newStatus: string) => void;
};

export function SinglePRRow({ detail, onSinglePRUpdate }: SinglePRRowProps) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [serverStatus, setServerStatus] = useState(detail?.status);
  const [selectedStatus, setSelectedStatus] = useState(detail?.status);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  // Step-by-step transitions
  function getAllowedStatuses(current: string): string[] {
    let nextOptions: string[] = [];
    switch (current) {
      case 'Not Started':
        nextOptions = ['Pending', 'Approved', 'Rejected'];
        break;
      case 'Pending':
        nextOptions = ['Approved', 'Rejected'];
        break;
      case 'Approved':
        nextOptions = ['Published', 'Rejected'];
        break;
      case 'Published':
        nextOptions = ['Rejected'];
        break;
      case 'Rejected':
        nextOptions = ['Rejected'];
        break;
      default:
        nextOptions = ['Not Started', 'Pending', 'Approved', 'Published', 'Rejected'];
    }
    if (!nextOptions.includes(current)) {
      nextOptions.unshift(current);
    }
    return nextOptions;
  }

  // Decide chip color
  let chipColor: 'default' | 'warning' | 'success' | 'error' = 'default';
  if (serverStatus === 'Not Started' || serverStatus === 'Pending') chipColor = 'warning';
  else if (serverStatus === 'Approved' || serverStatus === 'Published') chipColor = 'success';
  else if (serverStatus === 'Rejected') chipColor = 'error';

  const createdAt = detail?.created_at ? new Date(detail.created_at).toLocaleString() : '--';

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const userCookie = Cookies.get('user');
      if (!userCookie) return;

      const parsedUser = JSON.parse(decodeURIComponent(userCookie));
      const { token } = parsedUser;
      if (!token) return;

      // PUT /v1/pr/update-single-pr/{id}, body: { pr_id, status: selectedStatus }
      await axios.put(
        `${BASE_URL}/v1/pr/superAdmin/update-single-pr/${detail?.id}`,
        {
          pr_id: detail?.pr_id,
          status: selectedStatus,
        },
        {
          headers: {
            'x-api-key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // update local row state
      setServerStatus(selectedStatus);

      // update parent's singlePR array
      onSinglePRUpdate(detail?.id, selectedStatus);

      // success snackbar
      setSnackbarMessage(`Single PR #${detail?.id} updated to "${selectedStatus}"`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error updating single PR status:', err);
      setSnackbarMessage('Failed to update single PR status. Check console.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <>
      <TableRow>
        <StyledTableCell>{detail?.id}</StyledTableCell>
        <StyledTableCell>{detail?.pr_type || '--'}</StyledTableCell>
        <StyledTableCell>
          <Chip label={serverStatus} color={chipColor} variant="outlined" />
        </StyledTableCell>
        <StyledTableCell>{createdAt}</StyledTableCell>

        <StyledTableCell>
          <Box display="flex" alignItems="center" gap={1}>
            <FormControl size="small" sx={{ width: 140 }}>
              <InputLabel>PR Status</InputLabel>
              <Select
                label="PR Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as string)}
                disabled={loading || serverStatus === 'Rejected'}
              >
                {getAllowedStatuses(serverStatus).map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              disabled={loading || serverStatus === 'Rejected'}
              onClick={handleUpdate}
            >
              Update
            </Button>

            {/* Expand/Collapse Icon */}
            <IconButton onClick={() => setExpanded(!expanded)}>
              {expanded ? (
                // Up arrow
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="m8 14l4-4l4 4"
                  />
                </svg>
              ) : (
                // Down arrow
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="m8 10l4 4l4-4"
                  />
                </svg>
              )}
            </IconButton>
          </Box>
        </StyledTableCell>
      </TableRow>

      {/* Expand details row (Company, etc) if any */}
      {expanded && detail?.company?.length > 0 && (
        <TableRow>
          <TableCell colSpan={5} sx={{ backgroundColor: '#f8f9fa' }}>
            {/* Show company details here if needed */}
          </TableCell>
        </TableRow>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
