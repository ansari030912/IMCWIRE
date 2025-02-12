import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useState, useEffect, useCallback } from 'react';

import { styled } from '@mui/material/styles';
// MUI
import {
  Box,
  Card,
  Chip,
  Grid,
  Alert,
  Table,
  Button,
  Dialog,
  Select,
  Divider,
  MenuItem,
  Snackbar,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Accordion,
  IconButton,
  InputLabel,
  Typography,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
  TableContainer,
  TablePagination,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

import { emptyRows } from '../utils';
import { TableNoData } from '../table-no-data';
import { TableEmptyRows } from '../table-empty-rows';

/* -------------------------------------------
   1) useTable() Hook: sorting & pagination
-------------------------------------------- */
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
-------------------------------------------- */
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
-------------------------------------------- */
const StyledTableCell = styled(TableCell)(() => ({
  fontWeight: 500,
}));

const StyledTableHeadCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
  backgroundColor: '#f4f6f8',
}));

/* -------------------------------------------
   4) Table Head for the main orders list
-------------------------------------------- */
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
-------------------------------------------- */
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
-------------------------------------------- */
type FilterStatus = 'all' | 'paid' | 'unpaid' | 'refund' | 'self-paid' | 'failed';

export function AllOrdersView() {
  const table = useTable();

  const [filterName, setFilterName] = useState('');
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
-------------------------------------------- */
function EditableIndustryList({
  industries,
  setIndustries,
}: {
  industries: any[];
  setIndustries: (newIndustries: any[]) => void;
}) {
  const handleChange = (index: number, field: string, value: any) => {
    const newIndustries = [...industries];
    newIndustries[index] = { ...newIndustries[index], [field]: value };
    setIndustries(newIndustries);
  };

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <StyledTableHeadCell>Category</StyledTableHeadCell>
          <StyledTableHeadCell>Price</StyledTableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {industries.map((cat: any, idx: number) => (
          <TableRow key={idx}>
            <TableCell>
              <TextField
                value={cat.categoryName || ''}
                onChange={(e) => handleChange(idx, 'categoryName', e.target.value)}
                variant="standard"
              />
            </TableCell>
            <TableCell>
              <TextField
                type="number"
                value={cat.categoryPrice !== undefined ? cat.categoryPrice : 0}
                onChange={(e) => handleChange(idx, 'categoryPrice', parseFloat(e.target.value))}
                variant="standard"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EditableCountryList({
  countries,
  setCountries,
}: {
  countries: any[];
  setCountries: (newCountries: any[]) => void;
}) {
  const handleChange = (index: number, field: string, value: any) => {
    const newCountries = [...countries];
    newCountries[index] = { ...newCountries[index], [field]: value };
    setCountries(newCountries);
  };

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
        {countries.map((tc: any, idx: number) => (
          <TableRow key={idx}>
            <TableCell>
              <TextField
                value={tc.countryName || ''}
                onChange={(e) => handleChange(idx, 'countryName', e.target.value)}
                variant="standard"
              />
            </TableCell>
            <TableCell>
              <TextField
                type="number"
                value={tc.countryPrice !== undefined ? tc.countryPrice : 0}
                onChange={(e) => handleChange(idx, 'countryPrice', parseFloat(e.target.value))}
                variant="standard"
              />
            </TableCell>
            <TableCell>
              <FormControl variant="standard" fullWidth>
                {/* <InputLabel>translationRequired</InputLabel> */}
                <Select
                  label=""
                  value={tc.translationRequired || ''}
                  onChange={(e) => handleChange(idx, 'translationRequired', e.target.value)}
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </TableCell>
            <TableCell>
              <TextField
                type="number"
                value={tc.translationPrice !== undefined ? tc.translationPrice : 0}
                onChange={(e) => handleChange(idx, 'translationPrice', parseFloat(e.target.value))}
                variant="standard"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

type OrderDetailDialogProps = {
  open: boolean;
  onClose: () => void;
  order: any | null;
  onSinglePRUpdate: (prId: number, newStatus: string) => void;
  onOrderStatusUpdate: (orderId: number, newPrStatus: string, newPaymentStatus: string) => void;
};

interface AddSinglePRAccordionProps {
  order: any; // Replace 'any' with your proper type if available
  onSubmissionSuccess?: (data: any) => void; // Optional callback after a successful submission
}

const AddSinglePRAccordion: React.FC<AddSinglePRAccordionProps> = ({
  order,
  onSubmissionSuccess,
}) => {
  // ----- Common Fields -----
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');
  const [country, setCountry] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // ----- IMCWire Written Specific Fields -----
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');

  // ----- Self-Written Specific Field -----
  const [pdf, setPdf] = useState<File | null>(null);

  // ----- UI and Feedback State -----
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'info' | 'warning'
  >('success');
  const router = useRouter();
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // ----- Form Submission Handler -----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitUrl = `${BASE_URL}/v1/pr/superadmin/submit-single-pr`;
      const userCookie = Cookies.get('user');
      if (!userCookie) throw new Error('User not authenticated');
      const { token } = JSON.parse(decodeURIComponent(userCookie));

      if (order.prType === 'IMCWire Written') {
        // Build the JSON payload
        const payload = {
          pr_id: order.id, // Adjust if you use another field as the identifier
          url,
          tags: tags
            .split(',')
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag !== ''),
          companyName,
          email,
          address1,
          address2,
          city,
          state: stateField,
          country,
          websiteUrl,
        };

        await axios.post(submitUrl, payload, {
          headers: {
            'x-api-key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        });
      } else if (order.prType === 'Self-Written') {
        // Build the FormData payload (omit url and tags, include pdf)
        const formData = new FormData();
        formData.append('pr_id', order.id);
        formData.append('companyName', companyName);
        formData.append('email', email);
        formData.append('address1', address1);
        formData.append('address2', address2);
        formData.append('city', city);
        formData.append('state', stateField);
        formData.append('country', country);
        formData.append('websiteUrl', websiteUrl);
        if (pdf) {
          formData.append('pdf', pdf);
        }

        await axios.post(submitUrl, formData, {
          headers: {
            'x-api-key': X_API_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setSnackbarMessage('Single PR submitted successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      // Optionally, clear the form fields:
      setCompanyName('');
      setEmail('');
      setAddress1('');
      setAddress2('');
      setCity('');
      setStateField('');
      setCountry('');
      setWebsiteUrl('');
      setUrl('');
      setTags('');
      setPdf(null);
      
      // Notify parent if needed
      if (onSubmissionSuccess){ 
                onSubmissionSuccess(null)
                router.refresh()
              }
    } catch (error) {
      console.error('Error submitting single PR:', error);
      setSnackbarMessage('Failed to submit single PR.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Accordion>
        {/* <AccordionSummary expandIcon={<Iconify icon="material-symbols:expand-more" width={24} />}>
          <Typography>Add Single PR</Typography>
        </AccordionSummary> */}
        <AccordionDetails>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Common Fields */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address 1"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address 2"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="State"
                  value={stateField}
                  onChange={(e) => setStateField(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Website URL"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  fullWidth
                />
              </Grid>

              {/* Conditional Fields based on PR type */}
              {order.prType === 'IMCWire Written' ? (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="URL"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Tags (comma separated)"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </>
              ) : order.prType === 'Self-Written' ? (
                <Grid item xs={12}>
                  <Button variant="outlined" component="label">
                    Upload PDF
                    <input
                      type="file"
                      hidden
                      accept="application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPdf(e.target.files[0]);
                        }
                      }}
                    />
                  </Button>
                  {pdf && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {pdf.name}
                    </Typography>
                  )}
                </Grid>
              ) : null}
            </Grid>
            <Box mt={2}>
              <Button type="submit" variant="contained" disabled={loading} fullWidth>
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </Box>
          </form>
        </AccordionDetails>
      </Accordion>
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
};

function OrderDetailDialog({
  open,
  onClose,
  order,
  onSinglePRUpdate,
  onOrderStatusUpdate,
}: OrderDetailDialogProps) {
  // Always call hooks first (even if order is null)
  const [editingIndustry, setEditingIndustry] = useState(false);
  const [editingCountries, setEditingCountries] = useState(false);
  const [localIndustryCategories, setLocalIndustryCategories] = useState<any[]>(
    order ? order.industryCategories || [] : []
  );
  const [localTargetCountries, setLocalTargetCountries] = useState<any[]>(
    order ? order.targetCountries || [] : []
  );
  const [showSinglePRForm, setShowSinglePRForm] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'info' | 'warning'
  >('success');

  // Sync local states when order changes
  useEffect(() => {
    if (order) {
      setLocalIndustryCategories(order.industryCategories || []);
      setLocalTargetCountries(order.targetCountries || []);
    }
  }, [order]);

  if (!order) return null;

  const planRecord =
    order.planRecords && order.planRecords.length > 0 ? order.planRecords[0] : null;
  const totalPrs = planRecord?.total_prs || order.numberOfPR || 0;
  const usedPrs = planRecord?.used_prs || 0;
  const leftPrs = totalPrs - usedPrs;

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // Handler to update Industry Categories via API call
  const handleUpdateIndustry = async () => {
    try {
      // Inside OrderDetailDialog (in both update handlers)
      const payload = {
        industryCategories: localIndustryCategories.map((item) => ({
          categoryName: item.categoryName, // send as "name"
          categoryPrice: item.categoryPrice,
        })),
        targetCountries: localTargetCountries.map((item) => ({
          countryName: item.countryName, // send as "name"
          countryPrice: item.countryPrice,
          translationRequired: item.translationRequired, // key renamed
          translationPrice: item.translationPrice,
        })),
      };

      const userCookie = Cookies.get('user');
      if (!userCookie) return;
      const { token } = JSON.parse(decodeURIComponent(userCookie));
      await axios.put(`${BASE_URL}/v1/pr/superadmin/update-order/${order.id}`, payload, {
        headers: {
          'x-api-key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      setEditingIndustry(false);
      setSnackbarMessage('Industry Categories updated successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error updating industry categories:', err);
      setSnackbarMessage('Failed to update Industry Categories.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handler to update Target Countries via API call
  const handleUpdateCountries = async () => {
    try {
      // Inside OrderDetailDialog (in both update handlers)
      const payload = {
        industryCategories: localIndustryCategories.map((item) => ({
          categoryName: item.categoryName, // send as "name"
          categoryPrice: item.categoryPrice,
        })),
        targetCountries: localTargetCountries.map((item) => ({
          countryName: item.countryName, // send as "name"
          countryPrice: item.countryPrice,
          translationRequired: item.translationRequired, // key renamed
          translationPrice: item.translationPrice,
        })),
      };

      const userCookie = Cookies.get('user');
      if (!userCookie) return;
      const { token } = JSON.parse(decodeURIComponent(userCookie));
      await axios.put(`${BASE_URL}/v1/pr/superadmin/update-order/${order.id}`, payload, {
        headers: {
          'x-api-key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      setEditingCountries(false);
      setSnackbarMessage('Target Countries updated successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error updating target countries:', err);
      setSnackbarMessage('Failed to update Target Countries.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  // Add a new state for controlling the Add Single PR form visibility
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 'bold' }}>Order Details</DialogTitle>
      <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
        {/* Your SVG close icon */}
      </IconButton>
      <DialogContent dividers>
        <PlanInfoTable order={order} />

        <Box mt={2}>
          <UpdateEntireOrderStatus order={order} onOrderStatusUpdate={onOrderStatusUpdate} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Editable Industry Categories Section */}
        {order.industryCategories && order.industryCategories.length > 0 && (
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Industry Categories
              </Typography>
              <Box>
                <IconButton
                  onClick={() => {
                    if (editingIndustry) {
                      handleUpdateIndustry();
                    } else {
                      setEditingIndustry(true);
                    }
                  }}
                >
                  {editingIndustry ? (
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#39a200"
                          d="M18 10a1 1 0 0 0-1-1H5.41l2.3-2.29a1 1 0 0 0-1.42-1.42l-4 4a1 1 0 0 0-.21 1.09A1 1 0 0 0 3 11h14a1 1 0 0 0 1-1m3.92 3.62A1 1 0 0 0 21 13H7a1 1 0 0 0 0 2h11.59l-2.3 2.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l4-4a1 1 0 0 0 .21-1.09"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g
                          fill="none"
                          stroke="gray"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        >
                          <path strokeDasharray="20" strokeDashoffset="20" d="M3 21h18">
                            <animate
                              fill="freeze"
                              attributeName="stroke-dashoffset"
                              dur="0.2s"
                              values="20;0"
                            />
                          </path>
                          <path
                            strokeDasharray="48"
                            strokeDashoffset="48"
                            d="M7 17v-4l10 -10l4 4l-10 10h-4"
                          >
                            <animate
                              fill="freeze"
                              attributeName="stroke-dashoffset"
                              begin="0.2s"
                              dur="0.6s"
                              values="48;0"
                            />
                          </path>
                          <path strokeDasharray="8" strokeDashoffset="8" d="M14 6l4 4">
                            <animate
                              fill="freeze"
                              attributeName="stroke-dashoffset"
                              begin="0.8s"
                              dur="0.2s"
                              values="8;0"
                            />
                          </path>
                        </g>
                        <path fill="#39a200" fillOpacity="0" d="M14 6l4 4L21 7L17 3Z">
                          <animate
                            fill="freeze"
                            attributeName="fill-opacity"
                            begin="1.1s"
                            dur="0.15s"
                            values="0;0.3"
                          />
                        </path>
                      </svg>
                    </span>
                  )}
                </IconButton>
                {editingIndustry && (
                  <IconButton
                    onClick={() => {
                      // Cancel editing and revert changes
                      setLocalIndustryCategories(order.industryCategories || []);
                      setEditingIndustry(false);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#f81818"
                        fillRule="evenodd"
                        d="m12 10.586l6.293-6.293l1.414 1.414L13.414 12l6.293 6.293l-1.414 1.414L12 13.414l-6.293 6.293l-1.414-1.414L10.586 12L4.293 5.707l1.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </IconButton>
                )}
              </Box>
            </Box>
            {editingIndustry ? (
              <EditableIndustryList
                industries={localIndustryCategories}
                setIndustries={setLocalIndustryCategories}
              />
            ) : (
              <IndustryList industries={localIndustryCategories} />
            )}
          </Box>
        )}

        {/* Editable Target Countries Section */}
        {order.targetCountries && order.targetCountries.length > 0 && (
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Target Countries
              </Typography>
              <Box>
                <IconButton
                  onClick={() => {
                    if (editingCountries) {
                      handleUpdateCountries();
                    } else {
                      setEditingCountries(true);
                    }
                  }}
                >
                  {editingCountries ? (
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#39a200"
                          d="M18 10a1 1 0 0 0-1-1H5.41l2.3-2.29a1 1 0 0 0-1.42-1.42l-4 4a1 1 0 0 0-.21 1.09A1 1 0 0 0 3 11h14a1 1 0 0 0 1-1m3.92 3.62A1 1 0 0 0 21 13H7a1 1 0 0 0 0 2h11.59l-2.3 2.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l4-4a1 1 0 0 0 .21-1.09"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g
                          fill="none"
                          stroke="gray"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        >
                          <path strokeDasharray="20" strokeDashoffset="20" d="M3 21h18">
                            <animate
                              fill="freeze"
                              attributeName="stroke-dashoffset"
                              dur="0.2s"
                              values="20;0"
                            />
                          </path>
                          <path
                            strokeDasharray="48"
                            strokeDashoffset="48"
                            d="M7 17v-4l10 -10l4 4l-10 10h-4"
                          >
                            <animate
                              fill="freeze"
                              attributeName="stroke-dashoffset"
                              begin="0.2s"
                              dur="0.6s"
                              values="48;0"
                            />
                          </path>
                          <path strokeDasharray="8" strokeDashoffset="8" d="M14 6l4 4">
                            <animate
                              fill="freeze"
                              attributeName="stroke-dashoffset"
                              begin="0.8s"
                              dur="0.2s"
                              values="8;0"
                            />
                          </path>
                        </g>
                        <path fill="#39a200" fillOpacity="0" d="M14 6l4 4L21 7L17 3Z">
                          <animate
                            fill="freeze"
                            attributeName="fill-opacity"
                            begin="1.1s"
                            dur="0.15s"
                            values="0;0.3"
                          />
                        </path>
                      </svg>
                    </span>
                  )}
                </IconButton>
                {editingCountries && (
                  <IconButton
                    onClick={() => {
                      // Cancel editing and revert changes
                      setLocalTargetCountries(order.targetCountries || []);
                      setEditingCountries(false);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#f81818"
                        fillRule="evenodd"
                        d="m12 10.586l6.293-6.293l1.414 1.414L13.414 12l6.293 6.293l-1.414 1.414L12 13.414l-6.293 6.293l-1.414-1.414L10.586 12L4.293 5.707l1.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </IconButton>
                )}
              </Box>
            </Box>
            {editingCountries ? (
              <EditableCountryList
                countries={localTargetCountries}
                setCountries={setLocalTargetCountries}
              />
            ) : (
              <CountryList countries={localTargetCountries} />
            )}
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

        <div className="flex justify-between">
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Single PR Details
          </Typography>
          <Button
            variant="text"
            sx={{ fontWeight: 'bold' }}
            onClick={() => setShowSinglePRForm((prev) => !prev)}
          >
            {showSinglePRForm ? 'Hide Form' : '+ Add Single PR'}
          </Button>
        </div>
        {showSinglePRForm && (
          <AddSinglePRAccordion
            order={order}
            onSubmissionSuccess={(data) => {
              console.log('Submitted:', data);
              // Optionally hide the form after a successful submission:
              setShowSinglePRForm(false);
            }}
          />
        )}
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
    </Dialog>
  );
}

/* -------------------------------------------
   8) PlanInfoTable with alternating row color
-------------------------------------------- */
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
   ------------------------------------------- */
type UpdateEntireOrderStatusProps = {
  order: any;
  onOrderStatusUpdate: (orderId: number, newPrStatus: string, newPaymentStatus: string) => void;
};

export function UpdateEntireOrderStatus({
  order,
  onOrderStatusUpdate,
}: UpdateEntireOrderStatusProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPrStatus, setSelectedPrStatus] = useState(order.pr_status || 'Pending');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(
    order.payment_status || 'unpaid'
  );

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'info' | 'warning'
  >('success');

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const newStatus = selectedPrStatus || order.pr_status;
      const newPaymentStatus = selectedPaymentStatus || order.payment_status;

      const userCookie = Cookies.get('user');
      if (!userCookie) return;
      const { token } = JSON.parse(decodeURIComponent(userCookie));
      if (!token) return;

      await axios.put(
        `${BASE_URL}/v1/pr/superadmin/update-order-status/${order.id}`,
        { newStatus, newPaymentStatus },
        {
          headers: {
            'x-api-key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSnackbarMessage(
        `Order Updated Successfully PR:"${newStatus}", Payment:"${newPaymentStatus}"`
      );
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
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
        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>PR Status</InputLabel>
          <Select
            label="PR Status"
            value={selectedPrStatus}
            onChange={(e) => setSelectedPrStatus(e.target.value as string)}
            disabled={loading}
          >
            {['Pending', 'Approved', 'Rejected'].map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>Payment Status</InputLabel>
          <Select
            label="Payment Status"
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value as string)}
            disabled={loading}
          >
            {['paid', 'unpaid', 'refund', 'self-paid', 'failed'].map((ps) => (
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
-------------------------------------------- */
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
-------------------------------------------- */
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
            <StyledTableCell>{tc.translationRequired}</StyledTableCell>
            <StyledTableCell>${tc.translationPrice}</StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/* -------------------------------------------
   12) Single PR Table
-------------------------------------------- */
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
   13) Single PR Row with Report Upload/Mapping
   PUT /v1/pr/update-single-pr/{id} (for status update)
-------------------------------------------- */

interface ISinglePRRowProps {
  detail: any;
  onSinglePRUpdate: (prId: number, newStatus: string) => void;
}

export function SinglePRRow({ detail, onSinglePRUpdate }: ISinglePRRowProps) {
  // States for PR status update
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [serverStatus, setServerStatus] = useState(detail?.status);
  const [selectedStatus, setSelectedStatus] = useState(detail?.status);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'warning' | 'info'
  >('success');

  // ------------------------------------------------------------------
  // For Report Upload & Mapping – local report state
  // ------------------------------------------------------------------
  const [localReports, setLocalReports] = useState<any[]>(detail.singlePRDetails || []);
  useEffect(() => {
    setLocalReports(detail.singlePRDetails || []);
  }, [detail.singlePRDetails]);

  // Toggle for showing the Add Report form
  const [showAddReportForm, setShowAddReportForm] = useState(false);

  // Fields for the Add Report form
  const [reportTitle, setReportTitle] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Helper: Allowed statuses for PR update
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

  // Determine chip color
  let chipColor: 'default' | 'warning' | 'success' | 'error' = 'default';
  if (serverStatus === 'Not Started' || serverStatus === 'Pending') chipColor = 'warning';
  else if (serverStatus === 'Approved' || serverStatus === 'Published') chipColor = 'success';
  else if (serverStatus === 'Rejected') chipColor = 'error';

  const createdAt = detail?.created_at ? new Date(detail.created_at).toLocaleString() : '--';

  // ------------------------------------------------------------------
  // Update PR status handler
  // ------------------------------------------------------------------
  const handleUpdate = async () => {
    try {
      setLoading(true);
      const userCookie = Cookies.get('user');
      if (!userCookie) return;
      const parsedUser = JSON.parse(decodeURIComponent(userCookie));
      const { token } = parsedUser;
      if (!token) return;
      await axios.put(
        `${BASE_URL}/v1/pr/superAdmin/update-single-pr/${detail.id}`,
        { pr_id: detail.pr_id, status: selectedStatus },
        {
          headers: {
            'x-api-key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setServerStatus(selectedStatus);
      onSinglePRUpdate(detail.id, selectedStatus);
      setSnackbarMessage(`Single PR #${detail.id} updated to "${selectedStatus}"`);
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

  // ------------------------------------------------------------------
  // File change handlers for report upload
  // ------------------------------------------------------------------
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setExcelFile(e.target.files[0]);
    }
  };

  // ------------------------------------------------------------------
  // Report submission handler (wrapped in a form)
  // ------------------------------------------------------------------
  const handleReportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reportTitle || !pdfFile || !excelFile) {
      setSnackbarMessage('All fields (Title, PDF, and Excel) are required.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      setUploadLoading(true);
      const userCookie = Cookies.get('user');
      if (!userCookie) return;
      const parsedUser = JSON.parse(decodeURIComponent(userCookie));
      const { token } = parsedUser;
      if (!token) return;
      const formData = new FormData();
      formData.append('pr_id', detail.pr_id);
      formData.append('single_pr_id', detail.id);
      formData.append('user_id', detail.user_id || '');
      formData.append('title', reportTitle);
      formData.append('pdf', pdfFile);
      formData.append('excel', excelFile);

      const response = await axios.post(`${BASE_URL}/v1/reports/createFullReport`, formData, {
        headers: {
          'x-api-key': X_API_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const newReport = response.data;
      setLocalReports((prev) => [...prev, newReport]);
      setSnackbarMessage('Report submitted successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      // Clear form fields and hide form.
      setReportTitle('');
      setPdfFile(null);
      setExcelFile(null);
      setShowAddReportForm(false);
      window.location.reload();
    } catch (err) {
      console.error('Error submitting report:', err);
      setSnackbarMessage('Failed to submit report.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // ------------------------------------------------------------------
  // Render current mapping details section.
  // For IMCWire Written: show tags; for Self-Written: show PDF file details.
  // ------------------------------------------------------------------
  const renderCurrentMapping = () => (
    <>
      <Typography variant="h6" className="font-bold mb-2">
        {detail.pr_type === 'IMCWire Written' ? 'Tags' : 'PDF Files'}
      </Typography>
      <Box className="bg-white">
        {detail.pr_type === 'IMCWire Written' ? (
          // Show Tags if IMCWire Written
          detail.tagsUrls && detail.tagsUrls.length > 0 ? (
            <Table className="w-full bg-white">
              <TableHead>
                <TableRow>
                  <TableCell className="font-bold">Tag Name</TableCell>
                  <TableCell className="font-bold">URL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="bg-white">
                {detail.tagsUrls.map((tag: any) => (
                  <TableRow key={tag.id}>
                    <TableCell>{tag.name}</TableCell>
                    <TableCell>
                      <a
                        href={tag.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {tag.url}
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2">No tags available.</Typography>
          )
        ) : detail.pr_type === 'Self-Written' ? (
          // Show PDF Files if Self-Written
          detail.pdfFile && detail.pdfFile.length > 0 ? (
            <Table className="w-full">
              <TableHead>
                <TableRow>
                  <TableCell className="font-bold">File Name</TableCell>
                  <TableCell className="font-bold">Download</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detail.pdfFile.map((file: any) => (
                  <TableRow key={file.id}>
                    <TableCell>{file.pdf_file}</TableCell>
                    <TableCell>
                      <a
                        href={`https://files.imcwire.com/${file.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Download
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2">No PDF files available.</Typography>
          )
        ) : (
          <Typography variant="body2">No mapping available.</Typography>
        )}
      </Box>
    </>
  );

  // ------------------------------------------------------------------
  // Render Reports section.
  // If reports exist, map them; otherwise, if PR status is Approved, show the add report UI.
  // ------------------------------------------------------------------

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
            <IconButton onClick={() => setExpanded(!expanded)}>
              {expanded ? (
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

      {expanded && (
        <>
          {/* Company Details Section */}
          {detail?.company?.length > 0 && (
            <TableRow>
              <TableCell colSpan={5} sx={{ backgroundColor: '#f8f9fa' }}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Company Details
                  </Typography>
                  {detail.company.map((c: any, compIdx: number) => {
                    const dataRows = [
                      { label: 'Company Name', value: c.companyName },
                      { label: 'Email', value: c.email },
                      { label: 'Phone', value: c.phone },
                      { label: 'Address1', value: c.address1 },
                      { label: 'Address2', value: c.address2 },
                      { label: 'Location', value: `${c.city}, ${c.state}, ${c.country}` },
                      {
                        label: 'Website',
                        value: (
                          <a href={c.websiteUrl} target="_blank" rel="noopener noreferrer">
                            {c.websiteUrl}
                          </a>
                        ),
                      },
                    ];
                    return (
                      <Table
                        key={c.id || compIdx}
                        size="small"
                        sx={{ border: '1px solid #ddd', width: '100%' }}
                      >
                        <TableBody>
                          {dataRows.map((row, rowIdx) => (
                            <TableRow
                              key={row.label}
                              sx={{ backgroundColor: rowIdx % 2 === 0 ? '#fafafa' : '#fff' }}
                            >
                              <StyledTableCell sx={{ width: 170, fontWeight: 'bold' }}>
                                {row.label}
                              </StyledTableCell>
                              <StyledTableCell>{row.value}</StyledTableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    );
                  })}
                </Box>
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell colSpan={5} sx={{ backgroundColor: '#f8f9fa' }}>
              <Box sx={{ p: 2 }}>{renderCurrentMapping()}</Box>
            </TableCell>
          </TableRow>

          {/* Reports Section */}
          <TableRow>
            <TableCell colSpan={5} sx={{ backgroundColor: '#f8f9fa' }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" className="font-bold mb-2">
                  Reports
                </Typography>

                {/* Check if reports exist */}
                {detail.reports ? (
                  <Table className="w-full">
                    <TableHead>
                      <TableRow>
                        <TableCell className="font-bold">Report Title</TableCell>
                        <TableCell className="font-bold">PDF File</TableCell>
                        <TableCell className="font-bold">Excel File</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{detail.reports.title || '-'}</TableCell>
                        <TableCell>
                          {detail.reports.pdfFile ? (
                            <a
                              href={detail.reports.pdfFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {detail.reports.pdfFile.name}
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {detail.reports.excelFile ? (
                            <a
                              href={detail.reports.excelFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {detail.reports.excelFile.name}
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <>
                    {!showAddReportForm ? (
                      <>
                        <Button variant="contained" onClick={() => setShowAddReportForm(true)}>
                          Add Report
                        </Button>
                        <br />
                        <br />
                      </>
                    ) : (
                      <Box className="my-4">
                        <div className="flex justify-end">
                          <Button
                            variant="outlined"
                            onClick={() => setShowAddReportForm(false)}
                            className="mb-4"
                          >
                            Close Report Form
                          </Button>
                        </div>
                        <br />
                        <form onSubmit={handleReportSubmit}>
                          <TextField
                            label="Report Title"
                            value={reportTitle}
                            onChange={(e) => setReportTitle(e.target.value)}
                            required
                            fullWidth
                            className="mb-4"
                          />
                          <br />
                          <br />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* PDF Upload Card */}
                            <Card className="border-2 border-dashed border-gray-300 p-4">
                              <Typography variant="subtitle1" className="mb-2 font-bold">
                                Upload PDF
                              </Typography>
                              <Button
                                variant="outlined"
                                component="label"
                                className="w-full flex justify-center items-center"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-5 h-5 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16V4m0 0l-3 3m3-3l3 3"
                                  />
                                </svg>
                                Choose File
                                <input
                                  type="file"
                                  hidden
                                  accept="application/pdf"
                                  onChange={handlePdfFileChange}
                                />
                              </Button>
                              {pdfFile && (
                                <Typography variant="body2" className="mt-2">
                                  {pdfFile.name}
                                </Typography>
                              )}
                            </Card>

                            {/* Excel Upload Card */}
                            <Card className="border-2 border-dashed border-gray-300 p-4">
                              <Typography variant="subtitle1" className="mb-2 font-bold">
                                Upload Excel
                              </Typography>
                              <Button
                                variant="outlined"
                                component="label"
                                className="w-full flex justify-center items-center"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-5 h-5 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16V4m0 0l-3 3m3-3l3 3"
                                  />
                                </svg>
                                Choose File
                                <input
                                  type="file"
                                  hidden
                                  accept=".xls,.xlsx"
                                  onChange={handleExcelFileChange}
                                />
                              </Button>
                              {excelFile && (
                                <Typography variant="body2" className="mt-2">
                                  {excelFile.name}
                                </Typography>
                              )}
                            </Card>
                          </div>

                          <Box mt={4}>
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={uploadLoading}
                              fullWidth
                            >
                              {uploadLoading ? 'Submitting...' : 'Submit Report'}
                            </Button>
                          </Box>
                        </form>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </TableCell>
          </TableRow>
        </>
      )}

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
