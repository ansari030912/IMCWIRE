/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';

import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  FormLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Snackbar,
  TextField,
  Alert,
  Typography,
} from '@mui/material';

import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';
import { DashboardContent } from 'src/layouts/dashboard';

// ========================================================================
// TYPES & INTERFACES
// ========================================================================

interface ICountry {
  name: string;
  translation: boolean;
}

interface ICustomOrder {
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

// ========================================================================
// CUSTOM PLAN PAGE COMPONENT
// ========================================================================

export function AddCustomPlanView() {
  // ----------------------------------------------------------
  // 1. Manage user authentication (for demonstration)
  // ----------------------------------------------------------
  const cookieUser = Cookies.get('user')
    ? JSON.parse(Cookies.get('user') || '{}')
    : null;
  const isAuthenticated = Boolean(cookieUser && cookieUser.token && cookieUser.isActive);
  const [loggedInUser] = useState<any>(cookieUser || null);

  // ----------------------------------------------------------
  // 2. Snackbar for global messages
  // ----------------------------------------------------------
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success' | 'info' | 'warning'>('success');

  const showSnackbar = (
    message: string,
    severity: 'error' | 'success' | 'info' | 'warning' = 'success'
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // ----------------------------------------------------------
  // 3. List of existing custom orders (fetched from API)
  // ----------------------------------------------------------
  const [customOrders, setCustomOrders] = useState<ICustomOrder[]>([]);
  const token = loggedInUser?.token || '';

  const fetchCustomOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/v1/pr/all-custom-order`, {
        headers: {
          'X-API-Key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      if (Array.isArray(response.data)) {
        setCustomOrders(response.data);
      } else {
        console.error('Unexpected response', response.data);
        setCustomOrders([]);
      }
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

  // ----------------------------------------------------------
  // 4. Toggle between list view and add new custom plan form
  // ----------------------------------------------------------
  const [showForm, setShowForm] = useState(false);

  // ----------------------------------------------------------
  // 5. Multi-Step Wizard state management
  // ----------------------------------------------------------
  // Overall step (1: Plan Details, 2: Distribution, 3: PR Option)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // ---------- Step 1: Plan Details ----------
  const [planDetails, setPlanDetails] = useState({
    planName: '',
    perma: '',
    planDescription: '',
    pdfLink: '',
    numberOfPR: '', // as string for controlled input
    priceSingle: '', // as string for controlled input
  });
  const totalPlanPrice = Number(planDetails.numberOfPR) * Number(planDetails.priceSingle) || 0;

  // ---------- Step 2: Distribution Selection ----------
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

  // For adding categories/countries
  const [categoryToAdd, setCategoryToAdd] = useState('');
  const [countryToAdd, setCountryToAdd] = useState('');

  // Selected items
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<ICountry[]>([]);

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
      selectedCountries.map((c) =>
        c.name === name ? { ...c, translation: !c.translation } : c
      )
    );
  };

  // Pricing calculations
  const additionalCategoriesCost =
    selectedCategories.length > 1 ? (selectedCategories.length - 1) * 40 : 0;
  const additionalCountriesCost =
    selectedCountries.length > 1 ? (selectedCountries.length - 1) * 40 : 0;
  const translationCost = 20;
  const translationsSelected = selectedCountries.filter((c) => c.translation).length;
  const totalTranslationCost = translationsSelected * translationCost;
  const partialTotal = totalPlanPrice + additionalCategoriesCost + additionalCountriesCost + totalTranslationCost;

  // ---------- Step 3: PR Option ----------
  // Instead of showing payment method, we simply let the user choose between:
  // "IMCWIRE (Write & Publication)" which adds $120, or "Self Written" (0)
  const [prOption, setPrOption] = useState<'imcwire' | 'self' | ''>('');
  const imcwireCost = prOption === 'imcwire' ? 120 : 0;
  const finalTotal = partialTotal + imcwireCost;

  // (Payment method will always be sent as "Stripe" by default from the backend)

  // ----------------------------------------------------------
  // 6. Navigation handlers for the wizard
  // ----------------------------------------------------------
  const handleNext = () => {
    // Validate current step fields
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
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // ----------------------------------------------------------
  // 7. Submit custom plan data to API (/v1/pr/submit-custom-order)
  // ----------------------------------------------------------
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
      total_price: Number(finalTotal.toFixed(2)),
      payment_status: 'unpaid',
      // Payment method is not shown in the UI; default "Stripe" is sent by the backend.
      payment_method: 'Stripe',
      is_active: 1,
    };

    try {
      const resp = await axios.post(`${BASE_URL}/v1/pr/submit-custom-order`, payload, {
        headers: {
          'X-API-Key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      if (resp.data.message === 'PR submitted successfully') {
        showSnackbar('Custom plan submitted successfully!', 'success');
        fetchCustomOrders();
        setShowForm(false);
        setCurrentStep(1);
        // Optionally reset all wizard state here
      } else {
        showSnackbar('Submission failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showSnackbar('Submission error. Please try again later.', 'error');
    }
  };

  // ----------------------------------------------------------
  // 8. Renderers for each step of the wizard with timeline
  // ----------------------------------------------------------
  // Timeline (shown in left column)
  const timelineSteps = [
    { id: 1, name: 'Plan Details' },
    { id: 2, name: 'Distribution' },
    { id: 3, name: 'PR Option' },
  ];

  const renderTimeline = () => (
    <Box>
      <Typography variant="h6" className="mb-2">
        Your Campaign
      </Typography>
      {timelineSteps.map((step) => (
        <Box key={step.id} display="flex" alignItems="center" mb={2}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: step.id === currentStep ? 'primary.main' : 'grey.400',
              backgroundColor: step.id < currentStep ? 'primary.main' : 'white',
              mr: 2,
            }}
          />
          <Typography
            sx={{
              color: step.id === currentStep ? 'primary.main' : 'grey.600',
              fontWeight: step.id === currentStep ? 'bold' : 'normal',
            }}
          >
            {step.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  // Render step pages
  const renderStepOne = () => (
    <Card sx={{ p: 3 }}>
      <Typography variant="h5" className="mb-3">
        Step 1: Plan Details
      </Typography>
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
      <Typography variant="body1" sx={{ mt: 2 }}>
        Total Plan Price: ${totalPlanPrice.toFixed(2)}
      </Typography>
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button onClick={() => setShowForm(false)}>Cancel</Button>
        <Button variant="contained" onClick={handleNext}>
          Next
        </Button>
      </Box>
    </Card>
  );

  const renderStepTwo = () => (
    <Card sx={{ p: 3 }}>
      <Typography variant="h5" className="mb-3">
        Step 2: Distribution
      </Typography>
      {/* Industry Categories */}
      <Typography variant="subtitle1" className="mb-1">
        Industry Categories
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          select
          label="Select Category"
          value={categoryToAdd}
          onChange={(e) => setCategoryToAdd(e.target.value)}
          sx={{ flex: 1 }}
        >
          <MenuItem value="">-- Choose Category --</MenuItem>
          {allCategories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={handleAddCategory}>
          Add
        </Button>
      </Box>
      {selectedCategories.length > 0 && (
        <Box mb={2}>
          {selectedCategories.map((cat) => (
            <Box
              key={cat}
              display="flex"
              justifyContent="space-between"
              bgcolor="#f5f5f5"
              p={1}
              mb={1}
            >
              <Typography>{cat}</Typography>
              <Button onClick={() => handleRemoveCategory(cat)} color="error">
                Remove
              </Button>
            </Box>
          ))}
        </Box>
      )}
      {/* Target Countries */}
      <Typography variant="subtitle1" className="mb-1">
        Target Countries
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          select
          label="Select Country"
          value={countryToAdd}
          onChange={(e) => setCountryToAdd(e.target.value)}
          sx={{ flex: 1 }}
        >
          <MenuItem value="">-- Choose Country --</MenuItem>
          {allCountries.map((c) => (
            <MenuItem key={c.name} value={c.name}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={handleAddCountry}>
          Add
        </Button>
      </Box>
      {selectedCountries.length > 0 && (
        <Box mb={2}>
          {selectedCountries.map((c) => (
            <Box
              key={c.name}
              display="flex"
              justifyContent="space-between"
              bgcolor="#f5f5f5"
              p={1}
              mb={1}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography>{c.name}</Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={c.translation}
                      onChange={() => toggleCountryTranslation(c.name)}
                    />
                  }
                  label="Translation?"
                />
              </Box>
              <Button onClick={() => handleRemoveCountry(c.name)} color="error">
                Remove
              </Button>
            </Box>
          ))}
        </Box>
      )}
      <Typography variant="body1" className="mt-1">
        Additional Categories Cost: ${additionalCategoriesCost}
      </Typography>
      <Typography variant="body1">
        Additional Countries Cost: ${additionalCountriesCost}
      </Typography>
      <Typography variant="body1">
        Translation Cost: ${totalTranslationCost}
      </Typography>
      <Typography variant="body1" sx={{ mt: 1 }}>
        Partial Total: ${partialTotal.toFixed(2)}
      </Typography>
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button onClick={handleBack}>Back</Button>
        <Button variant="contained" onClick={handleNext}>
          Next
        </Button>
      </Box>
    </Card>
  );

  const renderStepThree = () => (
    <Card sx={{ p: 3 }}>
      <Typography variant="h5" className="mb-3">
        Step 3: PR Option
      </Typography>
      <Typography variant="subtitle1" className="mb-1">
        Choose your PR Option:
      </Typography>
      <Box mb={2}>
        <Box
          onClick={() => setPrOption('imcwire')}
          sx={{
            p: 2,
            mb: 1,
            borderRadius: 1,
            cursor: 'pointer',
            bgcolor: prOption === 'imcwire' ? 'primary.main' : 'background.paper',
            color: prOption === 'imcwire' ? 'white' : 'text.primary',
          }}
        >
          <Typography>IMCWIRE (Write & Publication) – $120</Typography>
          <Typography variant="body2">
            Our team writes your release.
          </Typography>
        </Box>
        <Box
          onClick={() => setPrOption('self')}
          sx={{
            p: 2,
            borderRadius: 1,
            cursor: 'pointer',
            bgcolor: prOption === 'self' ? 'primary.main' : 'background.paper',
            color: prOption === 'self' ? 'white' : 'text.primary',
          }}
        >
          <Typography>Self Written</Typography>
          <Typography variant="body2">
            You will provide your own PR document.
          </Typography>
        </Box>
      </Box>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Final Total: ${finalTotal.toFixed(2)}
      </Typography>
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button onClick={handleBack}>Back</Button>
        <Button variant="contained" onClick={handleSubmitCustomPlan}>
          Submit Custom Plan
        </Button>
      </Box>
    </Card>
  );

  // ----------------------------------------------------------
  // 9. Main render: either list view or the multi-step wizard with timeline
  // ----------------------------------------------------------
  return (
    <DashboardContent>
      <Box p={4}>
        <Typography variant="h4" className="mb-4">
          Custom Plans
        </Typography>
        {/* Snackbar */}
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

        {!showForm ? (
          <>
            <Box display="flex" justifyContent="end" mb={2}>
              <Button variant="contained" onClick={() => setShowForm(true)}>
                Add New Custom Plan
              </Button>
            </Box>
            {customOrders && customOrders.length > 0 ? (
              <Grid container spacing={4}>
                {customOrders.map((order) => (
                  <Grid key={order.orderId} item xs={12} sm={6} md={4}>
                    <Card sx={{ p: 2 }}>
                      <Box
                        sx={{
                          backgroundImage: `url('/package.jpg')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          height: 150,
                          borderRadius: 1,
                        }}
                      />
                      <Box p={2}>
                        <Typography variant="h6" gutterBottom>
                          {order.plan.planName}
                        </Typography>
                        <Typography variant="subtitle1">
                          ${order.total_price}
                        </Typography>
                        <Typography variant="body2">
                          {order.plan.planDescription}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Invoice: <a href={order.invoiceUrl} target="_blank" rel="noreferrer">View</a>
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">No custom plans available.</Alert>
            )}
          </>
        ) : (
          <Grid container spacing={2}>
            {/* Timeline on the left (Grid item xs=4) */}
            <Grid item xs={12} md={4}>
              {renderTimeline()}
            </Grid>
            {/* Wizard content on the right (Grid item xs=8) */}
            <Grid item xs={12} md={8}>
              {currentStep === 1 && renderStepOne()}
              {currentStep === 2 && renderStepTwo()}
              {currentStep === 3 && renderStepThree()}
              <Box mt={2}>
                <Button variant="outlined" onClick={() => setShowForm(false)}>
                  Back to List
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    </DashboardContent>
  );
}
