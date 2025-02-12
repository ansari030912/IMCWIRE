/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import axios from 'axios';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  Grid,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import moment from 'moment';
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

// ... interfaces remain unchanged ...
interface ICountry {
  name: string;
  translation: boolean;
}

interface ICustomOrder {
  discountType: string;
  discountValue: any;
  discountAmount: any;
  orderId: string;
  client_id: string;
  perma: string;
  orderType: string;
  total_price: string;
  payment_status: string;
  payment_method: string;
  is_active: number;
  created_at: string;
  invoiceUrl: string;
  plan: {
    plan_id: number;
    planName: string;
    totalPlanPrice: string;
    priceSingle: string;
    planDescription: string;
    pdfLink: string;
    numberOfPR: number;
    activate_plan: number;
    type: string;
  };
  targetCountries: Array<{
    id: number;
    countryName: string;
    countryPrice: string;
    translationValue: string;
  }>;
  industryCategories: Array<{
    id: number;
    categoryName: string;
    categoryPrice: string;
  }>;
}

export function AddCustomPlanView() {
  // --------------------------
  // 1) User Authentication
  // --------------------------
  const cookieUser = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
  const isAuthenticated = Boolean(cookieUser && cookieUser.token && cookieUser.isActive);
  const [loggedInUser] = useState<any>(cookieUser || null);

  // --------------------------
  // 2) Snackbar for Messages
  // --------------------------
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'error' | 'success' | 'info' | 'warning'
  >('success');
  const showSnackbar = (
    message: string,
    severity: 'error' | 'success' | 'info' | 'warning' = 'success'
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // --------------------------
  // 3) Fetch Custom Orders (List View)
  // --------------------------
  const [customOrders, setCustomOrders] = useState<ICustomOrder[]>([]);
  const token = loggedInUser?.token || '';
  const fetchCustomOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/v1/pr/all-custom-order`, {
        headers: { 'X-API-Key': X_API_KEY, Authorization: `Bearer ${token}` },
      });
      const sortedOrders = response.data.sort(
        (a: ICustomOrder, b: ICustomOrder) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setCustomOrders(sortedOrders || []);
    } catch (error) {
      console.error('Error fetching custom orders:', error);
      setCustomOrders([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomOrders();
    }
  }, [isAuthenticated, token]);

  // --------------------------
  // 4) Toggle Between List View and Wizard
  // --------------------------
  const [showForm, setShowForm] = useState(false);

  // --------------------------
  // 5) Multi-Step Wizard State
  // --------------------------
  // Steps: 1: Plan Details, 2: Distribution, 3: PR Option (with discount)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // -- Step 1: Plan Details --
  const [planDetails, setPlanDetails] = useState({
    planName: '',
    perma: '',
    planDescription: '',
    pdfLink: '',
    numberOfPR: '',
    priceSingle: '',
  });
  const totalPlanPrice = Number(planDetails.numberOfPR) * Number(planDetails.priceSingle) || 0;

  // -- Step 2: Distribution (Category & Country Selection) --
  const allCategories = [
    'General',
    'Technology',
    'Health',
    'Finance',
    'Artificial Intelligence',
    'Business & Entrepreneurship',
    'Science & Innovation',
    'Arts & Entertainment',
    'Education & Learning',
    'Environment & Sustainability',
    'Travel & Adventure',
    'Food & Nutrition',
    'Lifestyle & Fashion',
    'Sports & Fitness',
    'Politics & Current Affairs',
    'Literature & Writing',
    'History & Culture',
    'Gaming & Esports',
    'Home & Garden',
    'Parenting & Family',
    'Relationships & Dating',
    'Spirituality & Religion',
  ];
  const allCountries = [
    { name: 'global' },
    { name: 'Brazil' },
    { name: 'Italy' },
    { name: 'Spain' },
    { name: 'United States' },
    { name: 'France' },
    { name: 'Germany' },
    { name: 'Netherlands' },
    { name: 'Saudi Arabia' },
    { name: 'Poland' },
    { name: 'Vietnam' },
    { name: 'India' },
    { name: 'Pakistan' },
    { name: 'South Africa' },
    { name: 'Singapore' },
    { name: 'Japan' },
    { name: 'Philippines' },
    { name: 'Indonesia' },
    { name: 'Hong Kong' },
    { name: 'South Korea' },
    { name: 'Morocco' },
    { name: 'Romania' },
    { name: 'Thailand' },
    { name: 'Taiwan' },
    { name: 'Ukraine' },
    { name: 'Peru' },
    { name: 'Ireland' },
    { name: 'Russia' },
    { name: 'Sweden' },
    { name: 'Azerbaijan' },
    { name: 'Bangladesh' },
    { name: 'Greece' },
    { name: 'Sri Lanka' },
    { name: 'Kenya' },
  ];

  const [categoryToAdd, setCategoryToAdd] = useState('');
  const [countryToAdd, setCountryToAdd] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<ICountry[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleAddCategory = () => {
    if (categoryToAdd && !selectedCategories.includes(categoryToAdd)) {
      setSelectedCategories([...selectedCategories, categoryToAdd]);
      setCategoryToAdd('');
    }
  };
  const handleRemoveCategory = (cat: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== cat));
  };
  const handleAddCountry = () => {
    if (countryToAdd && !selectedCountries.some((c) => c.name === countryToAdd)) {
      setSelectedCountries([...selectedCountries, { name: countryToAdd, translation: false }]);
      setCountryToAdd('');
    }
  };
  const handleRemoveCountry = (name: string) => {
    setSelectedCountries(selectedCountries.filter((c) => c.name !== name));
  };
  const toggleCountryTranslation = (name: string) => {
    setSelectedCountries(
      selectedCountries.map((c) => (c.name === name ? { ...c, translation: !c.translation } : c))
    );
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const additionalCategoriesCost =
    selectedCategories.length > 1 ? (selectedCategories.length - 1) * 40 : 0;
  const additionalCountriesCost =
    selectedCountries.length > 1 ? (selectedCountries.length - 1) * 40 : 0;
  const translationCost = 20;
  const translationsSelected = selectedCountries.filter((c) => c.translation).length;
  const totalTranslationCost = translationsSelected * translationCost;
  const partialTotal =
    totalPlanPrice + additionalCategoriesCost + additionalCountriesCost + totalTranslationCost;

  // -- Step 3: PR Option --
  // "IMCWIRE (Write & Publication)" adds $120; "Self Written" adds $0.
  const [prOption, setPrOption] = useState<'IMCWire Written' | 'Self-Written' | ''>('');
  const imcwireCost = prOption === 'IMCWire Written' ? 120 : 0;
  const finalTotal = partialTotal + imcwireCost;

  // ============================
  // *** NEW DISCOUNT SECTION ***
  // ============================
  // New state for discount:
  const [discountType, setDiscountType] = useState<'' | 'percentage' | 'dollar'>('');
  // Initialize discountValue as an empty string instead of 0.
  const [discountValue, setDiscountValue] = useState<string>('');
  // Convert the discountValue string to a number for calculations.
  const numericDiscountValue = parseFloat(discountValue) || 0;
  const discountAmount =
    discountType === 'percentage'
      ? finalTotal * (numericDiscountValue / 100)
      : discountType === 'dollar'
        ? numericDiscountValue
        : 0;
  const finalTotalAfterDiscount = Math.max(finalTotal - discountAmount, 0);

  // --------------------------
  // 6) Navigation Handlers
  // --------------------------
  const handleNext = () => {
    if (currentStep === 1) {
      if (
        !planDetails.planName.trim() ||
        !planDetails.perma.trim() ||
        !planDetails.planDescription.trim() ||
        !planDetails.numberOfPR.trim() ||
        !planDetails.priceSingle.trim()
      ) {
        showSnackbar('Please fill out all plan details fields.', 'error');
        return;
      }
    } else if (currentStep === 2) {
      if (selectedCategories.length === 0 || selectedCountries.length === 0) {
        showSnackbar('Please select at least one category and one country.', 'error');
        return;
      }
    } else if (currentStep === 3) {
      if (!prOption) {
        showSnackbar('Please choose a PR option.', 'error');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };
  const handleBack = () => {
    if (currentStep === 1) {
      // Exit the wizard
      setShowForm(false);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // --------------------------
  // 7) Submit Custom Plan Data to API
  // --------------------------
  const handleSubmitCustomPlan = async () => {
    const payload = {
      planName: planDetails.planName,
      perma: planDetails.perma,
      totalPlanPrice: Number(totalPlanPrice.toFixed(2)),
      priceSingle: Number(planDetails.priceSingle),
      planDescription: planDetails.planDescription,
      pdfLink: planDetails.pdfLink,
      numberOfPR: Number(planDetails.numberOfPR),
      activate_plan: 1,
      type: 'custom-plan',
      prType: prOption,
      orderType: 'Custom',
      targetCountries: selectedCountries.map((c, idx) => ({
        name: c.name.trim(),
        price: idx === 0 ? 0 : 40,
        translationRequired: c.translation ? 'Yes' : 'No',
        translationPrice: c.translation ? translationCost : 0,
      })),
      industryCategories: selectedCategories.map((cat, idx) => ({
        name: cat,
        price: idx === 0 ? 0 : 40,
      })),
      // *** Include discount info in the payload ***
      discountType,
      // Send the numeric value for discountValue
      discountValue: numericDiscountValue,
      discountAmount: Number(discountAmount.toFixed(2)),
      total_price: Number(finalTotalAfterDiscount.toFixed(2)),
      payment_status: 'unpaid',
      payment_method: 'Stripe',
      is_active: 1,
    };
    try {
      const resp = await axios.post(`${BASE_URL}/v1/pr/submit-custom-order`, payload, {
        headers: { 'X-API-Key': X_API_KEY, Authorization: `Bearer ${token}` },
      });

      showSnackbar('Custom plan submitted successfully!', 'success');
      // If the API returns an invoice URL, copy it to the clipboard.
      if (resp.data.invoiceUrl) {
        navigator.clipboard.writeText(resp.data.invoiceUrl);
        showSnackbar('Invoice URL copied to clipboard!', 'success');
      }
      // Reset wizard state
      setPlanDetails({
        planName: '',
        perma: '',
        planDescription: '',
        pdfLink: '',
        numberOfPR: '',
        priceSingle: '',
      });
      setSelectedCategories([]);
      setSelectedCountries([]);
      setPrOption('');
      // Also reset discount fields
      setDiscountType('');
      setDiscountValue('');
      setCurrentStep(1);
      setShowForm(false);
      fetchCustomOrders();
    } catch (error) {
      // console.error('Submit error:', error);
      showSnackbar('All fields are required!', 'error');
    }
  };

  // --------------------------
  // 8) Timeline & Step Renderers
  // --------------------------
  const timelineSteps = [
    { id: 1, name: 'Plan Details' },
    { id: 2, name: 'Distribution' },
    { id: 3, name: 'PR Option & Discount' },
  ];
  const renderTimeline = () => (
    <Box>
      {/* <Typography variant="h6" className="mb-2">
        Your Campaign
      </Typography> */}
      <div className="grid grid-cols-1 gap-8">
        {timelineSteps.map((step, index) => (
          <div key={step.id} className="flex items-start mb-8 relative">
            {index !== timelineSteps.length - 1 && (
              <div
                className={`absolute left-[11px] top-6 w-0.5 h-[calc(100%+16px)] transition-colors duration-300 ${
                  currentStep > step.id ? 'bg-purple-800' : 'bg-gray-200'
                }`}
              />
            )}
            <div className="flex items-center gap-3 relative z-10">
              <div
                className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                  step.id === currentStep
                    ? 'border-purple-600 bg-white'
                    : step.id < currentStep
                      ? 'border-purple-600 bg-purple-800'
                      : 'border-gray-300 bg-white'
                }`}
              >
                {step.id === currentStep && (
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-800" />
                )}
              </div>
              <span
                className={`text-xs font-medium transition-colors duration-300 ${
                  step.id === currentStep ? 'text-purple-600' : 'text-gray-500'
                }`}
              >
                {step.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Box>
  );

  // -- Step 1 Renderer: Plan Details ONLY --
  const renderStepOne = () => (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Optimize Your Press Release for Maximum Impact</h2>
      {/* Plan Details Fields */}
      <TextField
        label="Plan Name"
        name="planName"
        value={planDetails.planName}
        onChange={(e) => setPlanDetails({ ...planDetails, planName: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Plan Perma"
        name="perma"
        value={planDetails.perma}
        onChange={(e) => setPlanDetails({ ...planDetails, perma: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Plan Description"
        name="planDescription"
        value={planDetails.planDescription}
        onChange={(e) => setPlanDetails({ ...planDetails, planDescription: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="PDF Link"
        name="pdfLink"
        value={planDetails.pdfLink}
        onChange={(e) => setPlanDetails({ ...planDetails, pdfLink: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Number Of PR"
            name="numberOfPR"
            type="number"
            value={planDetails.numberOfPR}
            onChange={(e) => setPlanDetails({ ...planDetails, numberOfPR: e.target.value })}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="PR Single Price"
            name="priceSingle"
            type="number"
            value={planDetails.priceSingle}
            onChange={(e) => setPlanDetails({ ...planDetails, priceSingle: e.target.value })}
            fullWidth
          />
        </Grid>
      </Grid>
      <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
        Total Plan Price: ${totalPlanPrice.toFixed(2)}
      </Typography>
      <Box display="flex" justifyContent="space-between">
        <Button onClick={handleBack} variant="outlined" color="primary">
          Back
        </Button>
        <Button onClick={handleNext} variant="contained" color="primary">
          Next
        </Button>
      </Box>
    </div>
  );

  // -- Step 2 Renderer: Distribution (Category & Country Section) --
  const renderStepTwo = () => (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* (Categories and Countries selection UI remains unchanged) */}
      <Typography className="text-gray-800 font-bold mb-4">Industry Categories</Typography>
      <Typography className="text-sm text-gray-500 mb-6">
        IMCWIRE offers a hand-picked list of journalists for your initial industry category at no
        cost. You can add more categories for $40 each.
      </Typography>
      <div className="mb-4">
        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select a category
        </label>
        <div className="relative flex gap-2">
          <div className="relative w-full">
            <select
              id="category-select"
              value={categoryToAdd}
              onChange={(e) => setCategoryToAdd(e.target.value)}
              className="block w-full border border-gray-300 text-gray-700 py-2 px-3 pr-12 cursor-pointer rounded-lg focus:outline-none appearance-none"
            >
              <option value="">-- Choose Category --</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <g fill="none" fillRule="evenodd">
                  <path d="M24 0v24H0V0z" />
                  <path
                    d="M12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035q-.016-.005-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002-.185.093-.01.01-.003.011.018.43l.005.012l.008.007.201.093q.019.005.029-.008l.004-.014-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014-.034.614q.001.018.017.024l.015-.002.201-.093.01-.008.004-.011l.017-.43-.003-.012-.01-.01"
                    fill="currentColor"
                  />
                  <path
                    d="M12.707 15.707a1 1 0 0 1-1.414 0L5.636 10.05A1 1 0 1 1 7.05 8.636l4.95 4.95 4.95-4.95a1 1 0 0 1 1.414 1.414z"
                    fill="currentColor"
                  />
                </g>
              </svg>
            </div>
          </div>
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-purple-800 text-white rounded hover:bg-purple-700 cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>
      {selectedCategories.length > 0 && (
        <div className="mb-6">
          <Typography className="font-semibold mb-2">Selected Categories:</Typography>
          <ul className="space-y-2">
            {selectedCategories.map((cat) => (
              <li key={cat} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>{cat}</span>
                <button
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <hr className="text-gray-200" />
      <br />
      <Typography className="text-gray-800 font-bold mb-4">Countries</Typography>
      <Typography className="text-sm text-gray-500 mb-6">
        IMCWIRE offers a hand-picked list of journalists for your initial country at no cost.
        Additional countries are $40 each.
      </Typography>
      <div className="mb-4">
        <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select a country
        </label>
        <div className="relative flex gap-2">
          <div className="relative w-full">
            <select
              id="country-select"
              value={countryToAdd}
              onChange={(e) => setCountryToAdd(e.target.value)}
              className="block w-full border border-gray-300 text-gray-700 py-2 px-3 pr-12 cursor-pointer rounded-lg focus:outline-none appearance-none"
            >
              <option value="">-- Choose Country --</option>
              {allCountries.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <g fill="none" fillRule="evenodd">
                  <path d="M24 0v24H0V0z" />
                  <path
                    d="M12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035q-.016-.005-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002-.185.093-.01.01-.003.011.018.43l.005.012l.008.007.201.093q.019.005.029-.008l.004-.014-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014-.034.614q.001.018.017.024l.015-.002.201-.093.01-.008.004-.011l.017-.43-.003-.012-.01-.01"
                    fill="currentColor"
                  />
                  <path
                    d="M12.707 15.707a1 1 0 0 1-1.414 0L5.636 10.05A1 1 0 1 1 7.05 8.636l4.95 4.95 4.95-4.95a1 1 0 0 1 1.414 1.414z"
                    fill="currentColor"
                  />
                </g>
              </svg>
            </div>
          </div>
          <button
            onClick={handleAddCountry}
            className="px-4 py-2 bg-purple-800 text-white rounded hover:bg-purple-700 cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>
      {selectedCountries.length > 0 && (
        <div className="mb-6">
          <Typography className="font-semibold mb-2">Selected Countries:</Typography>
          <ul className="space-y-2">
            {selectedCountries.map((c) => (
              <li key={c.name} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <span>{c.name}</span>
                  <label className="flex items-center cursor-pointer text-sm text-gray-500">
                    <input
                      type="checkbox"
                      checked={c.translation}
                      onChange={() => toggleCountryTranslation(c.name)}
                      className="mr-1 cursor-pointer"
                    />
                    Translation?
                  </label>
                </div>
                <button
                  onClick={() => handleRemoveCountry(c.name)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Box display="flex" justifyContent="space-between" mt={8}>
        <Button onClick={handleBack} variant="outlined" color="primary">
          Back
        </Button>
        <Button onClick={handleNext} variant="contained" color="primary">
          Next
        </Button>
      </Box>
    </div>
  );

  // -- Step 3 Renderer: PR Option & Discount Section --
  const renderStepThree = () => (
    <Card className="p-6 w-full">
      <Typography className="mb-4 font-semibold">Your Press Distribution</Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Note: We appreciate your high-quality Press Release. Share professionally written content.
        Upload now to reach a wider audience.
      </Typography>
      {/* Write & Publication = $120 */}
      <div
        onClick={() => setPrOption('IMCWire Written')}
        className={`cursor-pointer mb-4 p-4 rounded shadow-sm ${
          prOption === 'IMCWire Written' ? 'bg-purple-800 text-white' : 'bg-gray-100 text-gray-800'
        }`}
        style={{ transition: '0.2s' }}
      >
        <Typography variant="h6">Write & Publication – $120</Typography>
        <Typography variant="body2">
          Our professional journalists will research and write your release
        </Typography>
      </div>
      {/* Upload doc */}
      <div
        onClick={() => setPrOption('Self-Written')}
        className={`cursor-pointer p-4 rounded shadow-sm ${
          prOption === 'Self-Written' ? 'bg-purple-800 text-white' : 'bg-white text-gray-800 border'
        }`}
        style={{ transition: '0.2s' }}
      >
        <Typography variant="h6">Upload Your PR in doc file</Typography>
        <Typography variant="body2">
          Upload your high-quality PR written in .doc or .docx
        </Typography>
      </div>

      {/* **** NEW DISCOUNT UI **** */}
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        Apply Discount
      </Typography>
      <TextField
        select
        label="Discount Type"
        value={discountType}
        onChange={(e) => setDiscountType(e.target.value as '' | 'percentage' | 'dollar')}
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="">None</MenuItem>
        <MenuItem value="percentage">Percentage (%)</MenuItem>
        <MenuItem value="dollar">Dollar ($)</MenuItem>
      </TextField>
      {discountType && (
        <TextField
          label={`Discount Value (${discountType === 'percentage' ? '%' : '$'})`}
          type="number"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
      )}

      <Typography variant="h6" sx={{ mt: 2, mb: 3 }}>
        Final Total: ${finalTotalAfterDiscount.toFixed(2)}
      </Typography>
      <Box display="flex" justifyContent="space-between">
        <Button onClick={handleBack} variant="outlined" color="primary">
          Back
        </Button>
        <Button onClick={handleSubmitCustomPlan} variant="contained" color="primary">
          Generate Custom Plan
        </Button>
      </Box>
    </Card>
  );

  // --------------------------
  // 9) Main Render
  // --------------------------
  return (
    <DashboardContent>
      <h1 className="font-bold text-5xl text-purple-800 mb-6">IMCWIRE Custom Plans</h1>
      <p className="text-gray-700">Manage custom plan for the platform.</p>
      <Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Box display="flex" justifyContent="end" mb={2}>
          <Button variant="contained" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Back to Plans' : 'Add New Custom Plan'}
          </Button>
        </Box>
        {showForm ? (
          ''
        ) : (
          <Box>
            <Card>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Plan Name</TableCell>
                      <TableCell>Plan Description</TableCell>
                      <TableCell align="center">Disount Price</TableCell>
                      <TableCell align="center">Total Price</TableCell>
                      <TableCell align="center">Price per PR</TableCell>
                      <TableCell align="center">Number of PRs</TableCell>
                      <TableCell align="center">Invoice URL</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customOrders
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((order) => (
                        <TableRow key={order.orderId}>
                          <TableCell>
                            <b>{order.plan.planName}</b>
                            <br />
                            <span className="text-gray-500">
                              {moment(order.created_at).format('DD MMM YYYY')}
                            </span>
                          </TableCell>
                          <TableCell title={order.plan.planDescription}>
                            {order.plan.planDescription.length > 30
                              ? `${order.plan.planDescription.substring(0, 30)}...`
                              : order.plan.planDescription}
                          </TableCell>
                          <TableCell align="center">
                            {order.discountAmount > 0 ? (
                              order.discountType === 'percentage' ? (
                                <div>
                                  %{order.discountValue}
                                  <br />
                                  <span className="text-green-500">
                                    {' '}
                                    ${parseFloat(order.discountAmount)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-green-500">
                                  ${parseFloat(order.discountAmount)}
                                </span>
                              )
                            ) : (
                              'No Discount'
                            )}
                          </TableCell>

                          <TableCell align="center">
                            ${parseFloat(order.plan.totalPlanPrice)}
                          </TableCell>

                          <TableCell align="center">
                            ${parseFloat(order.plan.priceSingle)}
                          </TableCell>
                          <TableCell align="center">{order.plan.numberOfPR}</TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              onClick={() => {
                                navigator.clipboard.writeText(order.invoiceUrl);
                              }}
                            >
                              Copy Invoice URL
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={customOrders.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                rowsPerPageOptions={[5, 10, 25]}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Card>
          </Box>
        )}
        <Grid container spacing={2}>
          {/* Left Column: Timeline (only in wizard mode) */}
          {showForm && (
            <Grid item xs={12} md={4} lg={3}>
              <Box p={6}>
                <Typography variant="h5" className="mb-8 font-bold">
                  Your campaign starts here
                </Typography>
                <br />
                {renderTimeline()}
              </Box>
            </Grid>
          )}
          {/* Center Column: Main Content */}
          {showForm && (
            <Grid item xs={12} md={showForm ? 8 : 12} lg={showForm ? 6 : 8}>
              <Grid container spacing={2}>
                {/* In Wizard mode, render the wizard steps */}
                <Grid item xs={12}>
                  {currentStep === 1 && renderStepOne()}
                  {currentStep === 2 && renderStepTwo()}
                  {currentStep === 3 && renderStepThree()}
                </Grid>
              </Grid>
            </Grid>
          )}
          {/* Right Column: Order Summary (only in wizard mode) */}
          {showForm && (
            <Grid item xs={12} md={4} lg={3}>
              <Card className="p-6 w-full">
                <Typography className="mb-4 font-semibold">Order Summary</Typography>
                <div className="border-t pt-4 mt-4 text-sm space-y-2">
                  <div className="bg-gray-100 p-2 flex justify-between">
                    <span className="text-gray-500 font-bold">Base Plan:</span>
                    <span className="text-gray-700 font-bold">${totalPlanPrice.toFixed(2)}</span>
                  </div>
                  <div className="bg-white p-2 flex justify-between">
                    <span className="text-gray-700 font-bold">Additional Categories:</span>
                    <span
                      className={`font-bold ${additionalCategoriesCost === 0 ? 'text-green-500' : 'text-red-500'}`}
                    >
                      +${additionalCategoriesCost}
                    </span>
                  </div>
                  <div className="bg-gray-100 p-2 flex justify-between">
                    <span className="text-gray-500 font-bold">Additional Countries:</span>
                    <span
                      className={`font-bold ${additionalCountriesCost === 0 ? 'text-green-500' : 'text-red-500'}`}
                    >
                      +${additionalCountriesCost}
                    </span>
                  </div>
                  <div className="bg-white p-2 flex justify-between">
                    <span className="text-gray-700 font-bold">Translations:</span>
                    <span
                      className={`font-bold ${totalTranslationCost === 0 ? 'text-green-500' : 'text-red-500'}`}
                    >
                      +${totalTranslationCost}
                    </span>
                  </div>
                  <div className="bg-gray-100 p-2 flex justify-between">
                    <span className="text-gray-500 font-bold">Write & Publication:</span>
                    <span
                      className={`font-bold ${imcwireCost > 0 ? 'text-red-500' : 'text-green-500'}`}
                    >
                      +${imcwireCost}
                    </span>
                  </div>
                  {/* **** Discount line item (if any) **** */}
                  {discountType && numericDiscountValue > 0 && (
                    <div className="bg-white p-2 flex justify-between">
                      <span className="text-gray-500 font-bold">
                        Discount (
                        {discountType === 'percentage'
                          ? `${numericDiscountValue}%`
                          : `$${numericDiscountValue}`}
                        ):
                      </span>
                      <span className="font-bold text-green-500">
                        - ${discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="bg-purple-900 p-2 flex justify-between font-bold">
                    <span className="text-white text-xl font-bold">Total:</span>
                    <span className="text-white text-xl font-bold">
                      ${finalTotalAfterDiscount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </DashboardContent>
  );
}
