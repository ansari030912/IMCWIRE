import type { SelectChangeEvent } from '@mui/material';

import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card,
  Chip,
  Grid,
  Alert,
  Paper,
  Table,
  Button,
  Dialog,
  Select,
  styled,
  Divider,
  MenuItem,
  Snackbar,
  TableRow,
  Accordion,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  IconButton,
  InputLabel,
  Typography,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
  InputAdornment,
  TableContainer,
  TablePagination,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

import SinglePrDetailsForm from '../SinglePrDetailForm';

// ------------------ Type Definitions ------------------ //

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

interface Company {
  id: number;
  user_id: number;
  companyName: string;
  address1: string;
  address2?: string;
  contactName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  state: string;
  websiteUrl?: string;
  created_at: string;
  updated_at: string;
}

interface PdfFile {
  id: number;
  single_pr_id: number;
  unique_id: string;
  pdf_file: string;
  url: string;
  created_at: string;
}

export interface SinglePRDetail {
  id: number;
  pr_id: number;
  user_id: number;
  company_id: number;
  pr_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  pdf_id?: number;
  url_tags_id?: number | null;
  report_id?: number | null;
  report_title?: string | null;
  excel_name?: string | null;
  excel_url?: string | null;
  pdf_name?: string | null;
  pdf_url?: string | null;
  company?: Company[];
  pdfFile?: PdfFile[];
  tagsUrls?: { name: string; url: string }[]; // adjust as needed
  reports?: any; // This can be an object or array – see updated display below
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
  perma: string | null;
  targetCountries: TargetCountry[];
  industryCategories: IndustryCategory[];
  planRecords?: PlanRecord[];
  singlePRDetails?: SinglePRDetail[];
}

// ------------------ Helpers ------------------ //

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

function getSinglePrStatusChipProps(status: string): { label: string; color: ChipColor } {
  switch (status.toLowerCase()) {
    case 'not started':
      return { label: 'Not Started', color: 'default' };
    case 'pending':
      return { label: 'Pending', color: 'warning' };
    case 'approved':
      return { label: 'Approved', color: 'success' };
    case 'published':
      return { label: 'Published', color: 'primary' };
    case 'rejected':
      return { label: 'Rejected', color: 'error' };
    default:
      return { label: status, color: 'default' };
  }
}

function getPaymentStatusChipProps(status: string): { label: string; color: ChipColor } {
  switch (status.toLowerCase()) {
    case 'paid':
      return { label: 'Paid', color: 'success' };
    case 'self-paid':
      return { label: 'Self Paid', color: 'success' };
    case 'unpaid':
      return { label: 'Unpaid', color: 'error' };
    case 'refund':
      return { label: 'Refund', color: 'warning' };
    default:
      return { label: status, color: 'default' };
  }
}

// ------------------ Styled Components ------------------ //

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
  },
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 'bold',
  backgroundColor: '#f5f5f5',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: 14,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// ------------------ Sub-Components ------------------ //

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
            <StyledTableHeadCell>${tc.translationPrice}</StyledTableHeadCell>
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
            <StyledTableHeadCell sx={{ width: 200 }}>{r.label}</StyledTableHeadCell>
            <StyledTableCell>{r.value}</StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * Modified Single PR Details list.
 * Each accordion now has an "Edit" button that calls the passed onEdit callback.
 */
function SinglePRDetailsList({
  singlePRDetails,
  onEdit,
}: {
  singlePRDetails: SinglePRDetail[];
  onEdit: (detail: SinglePRDetail) => void;
}) {
  return (
    <Box>
      {singlePRDetails.map((detail, index) => (
        <Accordion key={detail.id} defaultExpanded={false}>
          <AccordionSummary
            expandIcon={<Iconify icon="material-symbols:expand-more" width={24} />}
            aria-controls={`panel-${index}-content`}
            id={`panel-${index}-header`}
          >
            <Box
              display="flex"
              alignItems="center"
              width="95%"
              justifyContent="space-between"
              sx={{ marginTop: '1px', marginBottom: '1px' }}
            >
              <Typography variant="subtitle1">Single PR #{detail.id}</Typography>
              <Chip
                label={getSinglePrStatusChipProps(detail.status).label}
                color={getSinglePrStatusChipProps(detail.status).color}
                size="small"
              />
              {detail.status === 'Not Started' || detail.status === 'Pending' ? (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(detail);
                  }}
                  variant="outlined"
                  size="small"
                >
                  Edit
                </Button>
              ) : (
                <div style={{ opacity: 0 }}>Edit</div>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Table size="small" sx={{ mb: 2 }}>
              <TableBody>
                <TableRow>
                  <StyledTableHeadCell sx={{ width: 180 }}>PR Type</StyledTableHeadCell>
                  <StyledTableCell>{detail.pr_type}</StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Company Information
            </Typography>
            {detail.company && detail.company.length > 0 ? (
              detail.company.map((comp) => (
                <Table size="small" key={comp.id} sx={{ mb: 2 }}>
                  <TableBody>
                    <TableRow>
                      <StyledTableHeadCell sx={{ width: 180 }}>Company Name</StyledTableHeadCell>
                      <StyledTableCell>{comp.companyName}</StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableHeadCell>Contact Name</StyledTableHeadCell>
                      <StyledTableCell>{comp.contactName}</StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableHeadCell>Phone</StyledTableHeadCell>
                      <StyledTableCell>{comp.phone}</StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableHeadCell>Email</StyledTableHeadCell>
                      <StyledTableCell>{comp.email}</StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableHeadCell>Address</StyledTableHeadCell>
                      <StyledTableCell>
                        {comp.address1}
                        {comp.address2 ? `, ${comp.address2}` : ''}
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableHeadCell>City / State</StyledTableHeadCell>
                      <StyledTableCell>
                        {comp.city} / {comp.state}
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableHeadCell>Country</StyledTableHeadCell>
                      <StyledTableCell>{comp.country}</StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableHeadCell>Website</StyledTableHeadCell>
                      <StyledTableCell>
                        {comp.websiteUrl ? (
                          <a href={comp.websiteUrl} target="_blank" rel="noopener noreferrer">
                            {comp.websiteUrl}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </StyledTableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ))
            ) : (
              <Typography variant="body2">No Company Info</Typography>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              PDF File(s)
            </Typography>
            {detail.pdfFile && detail.pdfFile.length > 0 ? (
              detail.pdfFile.map((pdf) => (
                <Box key={pdf.id} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    <strong>File Name:</strong> {pdf.pdf_file}
                  </Typography>
                  {pdf.url && (
                    <Button
                      variant="contained"
                      sx={{ textWrap: 'nowrap' }}
                      size="small"
                      href={`https://files.imcwire.com${pdf.url}`}
                      target="_blank"
                      rel="noopener"
                    >
                      View PDF
                    </Button>
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body2">No PDF Files</Typography>
            )}
            {/* Only show Tags/URLs if there are no PDF files */}
            {!(detail.pdfFile && detail.pdfFile.length > 0) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Tags / URLs
                </Typography>
                {detail.tagsUrls && detail.tagsUrls.length > 0 ? (
                  <>
                    <Typography variant="h6"> Tags: </Typography>
                    <div className="flex gap-2">
                      {detail.tagsUrls.map((tag, tagIndex) => (
                        <Typography key={tagIndex} variant="body2">
                          {tag.name},
                        </Typography>
                      ))}
                    </div>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong> URL: </strong> {detail.tagsUrls[0].url}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2">No Tags/URLs</Typography>
                )}
              </>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Reports
            </Typography>
            {detail.reports ? (
              Array.isArray(detail.reports) ? (
                detail.reports.map((report: any) => (
                  <Box key={report.id} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Report Title: {report.title}</Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                        mt: 1,
                        justifyContent: 'center',
                      }}
                    >
                      {report.excelFile && (
                        <Button
                          variant="contained"
                          fullWidth
                          size="small"
                          href={`https://files.imcwire.com${report.excelFile.url}`}
                          target="_blank"
                          rel="noopener"
                        >
                          Download Excel ({report.excelFile.name})
                        </Button>
                      )}
                      {report.pdfFile && (
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          href={`https://files.imcwire.com${report.pdfFile.url}`}
                          target="_blank"
                          rel="noopener"
                        >
                          Download PDF ({report.pdfFile.name})
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))
              ) : (
                <Box>
                  <Typography variant="subtitle2">Report Title: {detail.reports.title}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                    {detail.reports.excelFile && (
                      <Button
                        variant="contained"
                        size="small"
                        href={`https://files.imcwire.com${detail.reports.excelFile.url}`}
                        target="_blank"
                        rel="noopener"
                      >
                        Download Excel ({detail.reports.excelFile.name})
                      </Button>
                    )}
                    {detail.reports.pdfFile && (
                      <Button
                        variant="contained"
                        size="small"
                        href={`https://files.imcwire.com${detail.reports.pdfFile.url}`}
                        target="_blank"
                        rel="noopener"
                      >
                        Download PDF ({detail.reports.pdfFile.name})
                      </Button>
                    )}
                  </Box>
                </Box>
              )
            ) : (
              <Typography variant="body2">No Reports</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

// ------------------ Update Form Component ------------------ //
/**
 * This component is similar to SinglePrDetailsForm but is used for updating
 * an existing Single PR detail. It pre-fills its fields from the provided prDetail.
 */
interface UpdateSinglePrDetailsFormProps {
  prDetail: SinglePRDetail;
  onSuccess?: () => void;
  onClose: () => void;
}

const UpdateSinglePrDetailsForm: React.FC<UpdateSinglePrDetailsFormProps> = ({
  prDetail,
  onSuccess,
  onClose,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  // Pre-select the first company if available from prDetail.company
  const [selectedCompany, setSelectedCompany] = useState<string>(
    prDetail.company && prDetail.company.length > 0 ? prDetail.company[0].id.toString() : ''
  );
  // For IMCWire Written type, prefill URL if available (adjust as needed)
  const [url, setUrl] = useState<string>(
    prDetail.tagsUrls && prDetail.tagsUrls.length > 0 ? prDetail.tagsUrls[0].url : ''
  );
  const [tags, setTags] = useState<string[]>(
    prDetail.tagsUrls ? prDetail.tagsUrls.map(tag => tag.name) : []
  );  
  const [newTag, setNewTag] = useState<string>('');
  // For Self-Written, allow PDF file update
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Get token from cookies
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

  // Fetch companies (same as in the add form)
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await axios.get<Company[]>(`${BASE_URL}/v1/company/company-list`, {
          headers: {
            'x-api-key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        });
        setCompanies(response.data);
      } catch (error) {
        console.error('Failed to fetch companies', error);
        showSnackbar('Failed to load companies!', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [token]);

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;
    if (tags.includes(trimmedTag)) return;
    if (tags.length >= 4) {
      showSnackbar('Maximum of 4 tags are allowed.', 'error');
      return;
    }
    setTags((prev) => [...prev, trimmedTag]);
    setNewTag('');
  };
  

  const handleDeleteTag = (tagToDelete: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToDelete));
  };

  const handleSelectCompany = (event: SelectChangeEvent<string>) => {
    setSelectedCompany(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);

    // Update endpoint (adjust as needed)
    const apiUrl = `${BASE_URL}/v1/pr/update-single-pr/${prDetail.id}`;
    const headers = {
      'x-api-key': X_API_KEY,
      Authorization: `Bearer ${token}`,
    };

    try {
      if (prDetail.pr_type === 'IMCWire Written') {
        // For IMCWire Written, send JSON with URL and tags.
        const data = {
          pr_id: prDetail.pr_id,
          single_pr_id: prDetail.id,
          company_id: Number(selectedCompany),
          url,
          tags,
        };
        await axios.put(apiUrl, data, { headers });
      } else {
        // For Self-Written, use FormData (PDF upload)
        const formData = new FormData();
        formData.append('pr_id', prDetail.pr_id.toString());
        formData.append('company_id', selectedCompany);
        if (file) {
          formData.append('pdf', file);
        }
        await axios.put(apiUrl, formData, { headers });
      }
      showSnackbar('PR details updated successfully!', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating PR details:', error);
      showSnackbar('Error updating PR details!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(255,255,255,0.5)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <form onSubmit={handleSubmit}>
        {prDetail.pr_type === 'IMCWire Written' ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter the article URL"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Add Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Press Enter or click 'Add'"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button type="button" onClick={handleAddTag} variant="contained" size="small">
                        Add
                      </Button>
                    </InputAdornment>
                  ),
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type="file"
              label="Upload PDF"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              onChange={handleFileChange}
            />
          </Box>
        )}

        {/* Company Selection */}
        <Box sx={{ mt: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="company-select-label">Company</InputLabel>
            <Select
              labelId="company-select-label"
              id="company-select"
              value={selectedCompany}
              label="Company"
              onChange={handleSelectCompany}
            >
              <MenuItem value="" disabled>
                Select a company
              </MenuItem>
              {companies.length > 0 ? (
                companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.companyName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No companies available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>

        {/* Submit */}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
          Update PR Details
        </Button>
      </form>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// ------------------ Main Component ------------------ //

const OrdersView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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
  // formKey forces SinglePrDetailsForm remount (for add new PR details)
  const [formKey, setFormKey] = useState(0);

  // New states for update functionality:
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedPrDetail, setSelectedPrDetail] = useState<SinglePRDetail | null>(null);

  // New state to handle loader for orders
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);

  // Reusable function to fetch orders
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoadingOrders(true);

    try {
      const userTokenString = Cookies.get('user');
      let userRole = '';

      if (userTokenString) {
        try {
          const userToken = JSON.parse(userTokenString);
          userRole = userToken.role; // Assuming the role is stored in the user token
        } catch (error) {
          console.error('Error parsing user token:', error);
        }
      }

      const endpoint =
        userRole === 'admin' || userRole === 'super_admin'
          ? `${BASE_URL}/v1/pr/superAdmin-list`
          : `${BASE_URL}/v1/pr/user-order-list`;

      const response = await axios.get<Order[]>(endpoint, {
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
    } finally {
      setLoadingOrders(false);
    }
  }, [token]);

  // Retrieve token on mount
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

  // Load orders once token is set
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // When orders update and the order details dialog is open, update selectedOrder from the fresh orders list
  useEffect(() => {
    if (openDialog && selectedOrder) {
      const freshOrder = orders.find((o) => o.id === selectedOrder.id);
      if (freshOrder) {
        setSelectedOrder(freshOrder);
      }
    }
  }, [orders, openDialog, selectedOrder]);

  // Callback after successful Single PR addition
  const handleSinglePrSuccess = () => {
    setFormKey((prev) => prev + 1); // force remount of add form
    fetchOrders();
    setSnackbar({ open: true, message: 'Single PR added successfully!', severity: 'success' });
  };

  // Open/close the order details dialog
  const handleOpenDialog = (order: Order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  // Open/close the update dialog for a Single PR detail
  const handleOpenUpdateDialog = (prDetail: SinglePRDetail) => {
    setSelectedPrDetail(prDetail);
    setUpdateDialogOpen(true);
  };
  const handleCloseUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setSelectedPrDetail(null);
  };

  // Pagination handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Press Release Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage all press release orders and view details.
        </Typography>
      </Box>

      {/* Conditionally render loader, no-data message, or table */}
      {loadingOrders ? (
        <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: '60vh' }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Box
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Iconify
            icon="material-symbols:inventory-2-outline"
            width={64}
            height={64}
            color="#ccc"
          />
          <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
            No Press Release Orders Found
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            It appears that you haven&apos;t purchased any Press Releases yet. To get started,
            please visit our{' '}
            <a href="/plans" className="text-blue-500 underline hover:text-blue-700">
              Plans page
            </a>{' '}
            to explore our offerings and place your order.
          </Typography>
        </Box>
      ) : (
        <Card sx={{ mb: 2 }}>
          <Scrollbar>
            <TableContainer component={Paper}>
              <Table aria-label="Orders Table">
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell className="text-nowrap">ID</StyledTableHeadCell>
                    <StyledTableHeadCell className="text-nowrap">PR Type</StyledTableHeadCell>
                    <StyledTableHeadCell className="text-nowrap">Total Price</StyledTableHeadCell>
                    <StyledTableHeadCell className="text-nowrap">Order Status</StyledTableHeadCell>
                    <StyledTableHeadCell className="text-nowrap">
                      Payment Status
                    </StyledTableHeadCell>
                    <StyledTableHeadCell className="text-nowrap">
                      Used / Total PRs
                    </StyledTableHeadCell>
                    <StyledTableHeadCell>Actions</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => {
                      let usedPRS = 0;
                      let totalPRS = 0;
                      if (order.planRecords && order.planRecords.length > 0) {
                        usedPRS = order.planRecords[0].used_prs;
                        totalPRS = order.planRecords[0].total_prs;
                      }
                      return (
                        <React.Fragment key={order.id}>
                          <StyledTableRow hover>
                            <StyledTableCell>{order.id}</StyledTableCell>
                            <StyledTableCell className="text-nowrap">
                              {order.prType}
                            </StyledTableCell>
                            <StyledTableCell>${order.total_price}</StyledTableCell>
                            <StyledTableCell>
                              <Chip
                                label={getPrStatusChipProps(order.pr_status).label}
                                color={getPrStatusChipProps(order.pr_status).color}
                                size="small"
                              />
                            </StyledTableCell>
                            <StyledTableCell>
                              <Chip
                                label={getPaymentStatusChipProps(order.payment_status).label}
                                color={getPaymentStatusChipProps(order.payment_status).color}
                                size="small"
                              />
                            </StyledTableCell>
                            <StyledTableCell>
                              {usedPRS} / {totalPRS}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleOpenDialog(order)}
                              >
                                Details
                              </Button>
                            </StyledTableCell>
                          </StyledTableRow>
                        </React.Fragment>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
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
        </Card>
      )}

      {/* Order Details Dialog */}
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
            <Iconify icon="material-symbols:close" width={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder &&
            (() => {
              const planRecord =
                selectedOrder.planRecords && selectedOrder.planRecords.length > 0
                  ? selectedOrder.planRecords[0]
                  : null;
              const usedPRS = planRecord ? planRecord.used_prs : 0;
              const totalPRS = planRecord ? planRecord.total_prs : 0;
              console.log(selectedOrder.payment_status);
              return (
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
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Single PR Details
                  </Typography>
                  {selectedOrder.singlePRDetails && selectedOrder.singlePRDetails.length > 0 ? (
                    <SinglePRDetailsList
                      singlePRDetails={selectedOrder.singlePRDetails}
                      onEdit={handleOpenUpdateDialog}
                    />
                  ) : (
                    <Typography>No Single PR Details</Typography>
                  )}
                  {(selectedOrder.payment_status?.toLowerCase().trim() === 'paid' ||
                    selectedOrder.payment_status?.toLowerCase().trim() === 'self-paid') &&
                    selectedOrder.pr_status?.toLowerCase().trim() === 'approved' &&
                    planRecord &&
                    usedPRS < totalPRS && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Add Single PR
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <SinglePrDetailsForm
                            key={formKey}
                            orderId={selectedOrder.id}
                            prType={selectedOrder.prType as 'IMCWire Written' | 'Self-Written'}
                            onSuccess={handleSinglePrSuccess}
                          />
                        </Box>
                      </>
                    )}
                </>
              );
            })()}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleCloseDialog}>
            Close
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* Update Single PR Dialog */}
      <StyledDialog
        open={updateDialogOpen}
        onClose={handleCloseUpdateDialog}
        maxWidth="md"
        fullWidth
        aria-labelledby="update-dialog-title"
      >
        <DialogTitle id="update-dialog-title" sx={{ fontWeight: 'bold', pr: 5 }}>
          Update Single PR Detail
          <IconButton
            aria-label="close"
            onClick={handleCloseUpdateDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Iconify icon="material-symbols:close" width={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPrDetail && (
            <UpdateSinglePrDetailsForm
              prDetail={selectedPrDetail}
              onSuccess={() => {
                fetchOrders();
                setSnackbar({
                  open: true,
                  message: 'Single PR updated successfully!',
                  severity: 'success',
                });
              }}
              onClose={handleCloseUpdateDialog}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleCloseUpdateDialog}>
            Close
          </Button>
        </DialogActions>
      </StyledDialog>

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
    </DashboardContent>
  );
};

export default OrdersView;
