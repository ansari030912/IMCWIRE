/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import axios from 'axios';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

import {
  Box,
  Card,
  Grid,
  Alert,
  Button,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

interface ICountry {
  name: string;
  translation: boolean;
}

export function AddCustomOrderView() {
  // 1) User Authentication
  const cookieUser = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
  const isAuthenticated = Boolean(cookieUser && cookieUser.token && cookieUser.isActive);
  const [loggedInUser] = useState<any>(cookieUser || null);
  const token = loggedInUser?.token || '';

  // 2) Snackbar for Messages
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

  // 3) Always show the form (no orders table)
  const [showForm] = useState(true);

  // 4) Multi-Step Wizard State (4 steps)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // --- Step 1: Plan Details ---
  const [planDetails, setPlanDetails] = useState({
    planName: '',
    perma: '',
    planDescription: '',
    pdfLink: '',
    numberOfPR: '',
    priceSingle: '',
  });
  const totalPlanPrice = Number(planDetails.numberOfPR) * Number(planDetails.priceSingle) || 0;

  // --- Step 2: Distribution (Categories & Countries) ---
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
  const [ipAddress, setIpAddress] = useState('');
  console.log("🚀 ~ AddCustomOrderView ~ ipAddress:", ipAddress)

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/v1/ip/get-ip`, {
          headers: {
            'x-api-key': X_API_KEY,
            'Content-Type': 'application/json',
          },
        });
        setIpAddress(response?.data.ip);
      } catch (error) {
        console.error('Error fetching IP:', error);
      }
    };

    fetchIp();
  }, []);

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

  // For demonstration, translationCost is set to 10 (as in the sample payload for USA)
  const translationCost = 20;
  const additionalCategoriesCost =
    selectedCategories.length > 1 ? (selectedCategories.length - 1) * 40 : 0;
  const additionalCountriesCost =
    selectedCountries.length > 1 ? (selectedCountries.length - 1) * 40 : 0;
  const translationsSelected = selectedCountries.filter((c) => c.translation).length;
  const totalTranslationCost = translationsSelected * translationCost;
  const partialTotal =
    totalPlanPrice + additionalCategoriesCost + additionalCountriesCost + totalTranslationCost;

  // --- Step 3: PR Option ---
  const [prOption, setPrOption] = useState<'IMCWire Written' | 'Self-Written' | ''>('');
  const imcwireCost = prOption === 'IMCWire Written' ? 120 : 0;
  const finalTotal = partialTotal + imcwireCost;

  // --- Step 4: User & Payment Details ---
  // (No password field is included in the payload per sample)
  const [userCredentials, setUserCredentials] = useState({
    email: '',
    transactionId: '',
    amountPaid: '',
    receiptEmail: '',
    currency: 'USD',
  });

  // --- Timeline steps for the wizard ---
  const timelineSteps = [
    { id: 1, name: 'Plan Details' },
    { id: 2, name: 'Distribution' },
    { id: 3, name: 'PR Option' },
    { id: 4, name: 'User & Payment Details' },
  ];

  // --- Navigation Handlers ---
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
    } else if (currentStep === 4) {
      if (
        !userCredentials.email.trim() ||
        !userCredentials.transactionId.trim() ||
        !userCredentials.amountPaid.toString().trim() ||
        !userCredentials.receiptEmail.trim()
      ) {
        showSnackbar('Please fill out all user and payment details.', 'error');
        return;
      }
      // Submit the custom order
      handleSubmitCustomPlan();
      return;
    }
    setCurrentStep(currentStep + 1);
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // --- Submit Custom Order to API ---
  // The payload matches the sample JSON exactly (comments removed).
  const handleSubmitCustomPlan = async () => {
    // Generate a username from the email (using the part before the '@')
    const username = userCredentials.email.split('@')[0];
    const payload = {
      username,
      email: userCredentials.email,
      planName: planDetails.planName,
      perma: planDetails.perma,
      totalPlanPrice: Number(totalPlanPrice.toFixed(2)),
      priceSingle: Number(planDetails.priceSingle),
      planDescription: planDetails.planDescription,
      pdfLink: planDetails.pdfLink,
      numberOfPR: Number(planDetails.numberOfPR),
      activate_plan: 1,
      type: 'standard',

      // PR Order Details
      prType: prOption,
      pr_status: 'pending',
      total_price: Number(finalTotal.toFixed(2)),
      payment_status: 'paid',
      ip_address: ipAddress,

      // Updated targetCountries array
      targetCountries: selectedCountries.map((c, idx) => ({
        countryName: c.name.trim(),
        // Adjust your pricing logic here as needed. For demonstration, the first country is free and subsequent ones cost $40.
        countryPrice: idx === 0 ? 0 : 40,
        // Map the boolean to a string value as expected by the API:
        translationRequired: c.translation ? 'Yes' : 'No',
        translationPrice: c.translation ? translationCost : 0,
      })),

      // Updated industryCategories array
      industryCategories: selectedCategories.map((cat, idx) => ({
        categoryName: cat,
        // Similarly, adjust pricing as needed. For demonstration, the first category is free and additional ones cost $40.
        categoryPrice: idx === 0 ? 0 : 40,
      })),

      // Payment History Details
      transactionId: userCredentials.transactionId,
      amountPaid: Number(userCredentials.amountPaid),
      currency: userCredentials.currency,
      receiptEmail: userCredentials.receiptEmail,
    };

    try {
      await axios.post(`${BASE_URL}/v1/pr/add-custom-order`, payload, {
        headers: { 'X-API-Key': X_API_KEY, Authorization: `Bearer ${token}` },
      });
      showSnackbar('Custom order submitted successfully!', 'success');
      // Reset states
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
      setUserCredentials({
        email: '',
        transactionId: '',
        amountPaid: '',
        receiptEmail: '',
        currency: 'USD',
      });
      setCurrentStep(1);
    } catch (error) {
      console.error('Submit error:', error);
      showSnackbar('Submission failed. Please check all fields.', 'error');
    }
  };

  // --- Step Renderers ---

  // Timeline renderer
  const renderTimeline = () => (
    <Box>
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

  // Step 1: Plan Details
  const renderStepOne = () => (
    <div className="bg-white shadow-md rounded-lg p-6">
      <Typography variant="h6" className="mb-4">
        Optimize Your Press Release for Maximum Impact
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

  // Step 2: Distribution (Categories & Countries)
  const renderStepTwo = () => (
    <div className="bg-white shadow-md rounded-lg p-6">
      <Typography variant="h6" className="mb-4">
        Industry Categories
      </Typography>
      <Typography variant="body2" className="mb-4">
        Select a category and add more if needed. Additional categories cost $40 each.
      </Typography>
      <Box mb={2}>
        <TextField
          select
          label="Select a Category"
          value={categoryToAdd}
          onChange={(e) => setCategoryToAdd(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="">-- Choose Category --</MenuItem>
          {allCategories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>
        <Button onClick={handleAddCategory} variant="contained" color="primary">
          Add Category
        </Button>
      </Box>
      {selectedCategories.length > 0 && (
        <Box mb={4}>
          <Typography variant="subtitle1">Selected Categories:</Typography>
          {selectedCategories.map((cat) => (
            <Box
              key={cat}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={1}
              bgcolor="grey.100"
              my={1}
            >
              <Typography>{cat}</Typography>
              <Button onClick={() => handleRemoveCategory(cat)} color="error" variant="text">
                Remove
              </Button>
            </Box>
          ))}
        </Box>
      )}
      <Typography variant="h6" className="mb-4">
        Countries
      </Typography>
      <Typography variant="body2" className="mb-4">
        Select a country and add more if needed. Additional countries cost $40 each.
      </Typography>
      <Box mb={2}>
        <TextField
          select
          label="Select a Country"
          value={countryToAdd}
          onChange={(e) => setCountryToAdd(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="">-- Choose Country --</MenuItem>
          {allCountries.map((c) => (
            <MenuItem key={c.name} value={c.name}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <Button onClick={handleAddCountry} variant="contained" color="primary">
          Add Country
        </Button>
      </Box>
      {selectedCountries.length > 0 && (
        <Box mb={4}>
          <Typography variant="subtitle1">Selected Countries:</Typography>
          {selectedCountries.map((c) => (
            <Box
              key={c.name}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={1}
              bgcolor="grey.100"
              my={1}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Typography>{c.name}</Typography>
                <label>
                  <input
                    type="checkbox"
                    checked={c.translation}
                    onChange={() => toggleCountryTranslation(c.name)}
                  />{' '}
                  Translation?
                </label>
              </Box>
              <Button onClick={() => handleRemoveCountry(c.name)} color="error" variant="text">
                Remove
              </Button>
            </Box>
          ))}
        </Box>
      )}
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

  // Step 3: PR Option
  const renderStepThree = () => (
    <Card className="p-6 w-full">
      <Typography variant="h6" className="mb-4">
        Your Press Distribution
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Choose a PR option. &quot;IMCWire Written&quot; adds $120; &quot;Self-Written&quot; adds $0.
      </Typography>
      <Box
        onClick={() => setPrOption('IMCWire Written')}
        className={`cursor-pointer mb-4 p-4 rounded shadow-sm ${prOption === 'IMCWire Written' ? 'bg-purple-800 text-white' : 'bg-gray-100 text-gray-800'}`}
        sx={{ transition: '0.2s' }}
      >
        <Typography variant="h6">Write & Publication – $120</Typography>
        <Typography variant="body2">
          Our professional journalists will research and write your release
        </Typography>
      </Box>
      <Box
        onClick={() => setPrOption('Self-Written')}
        className={`cursor-pointer p-4 rounded shadow-sm ${prOption === 'Self-Written' ? 'bg-purple-800 text-white' : 'bg-white text-gray-800 border'}`}
        sx={{ transition: '0.2s' }}
      >
        <Typography variant="h6">Upload Your PR in doc file</Typography>
        <Typography variant="body2">
          Upload your high-quality PR written in .doc or .docx
        </Typography>
      </Box>
      <br />
      <Box display="flex" justifyContent="space-between">
        <Button onClick={handleBack} variant="outlined" color="primary">
          Back
        </Button>
        <Button onClick={handleNext} variant="contained" color="primary">
          Next
        </Button>
      </Box>
    </Card>
  );

  // Step 4: User & Payment Details
  const renderStepFour = () => (
    <Card className="p-6 w-full">
      <Typography variant="h6" className="mb-4">
        User & Payment Details
      </Typography>
      <TextField
        label="User Email"
        name="userEmail"
        value={userCredentials.email}
        onChange={(e) => setUserCredentials({ ...userCredentials, email: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Transaction ID"
        name="transactionId"
        value={userCredentials.transactionId}
        onChange={(e) => setUserCredentials({ ...userCredentials, transactionId: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Amount Paid"
        name="amountPaid"
        type="number"
        value={userCredentials.amountPaid}
        onChange={(e) => setUserCredentials({ ...userCredentials, amountPaid: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Receipt Email"
        name="receiptEmail"
        value={userCredentials.receiptEmail}
        onChange={(e) => setUserCredentials({ ...userCredentials, receiptEmail: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Currency"
        name="currency"
        value={userCredentials.currency}
        disabled
        fullWidth
        sx={{ mb: 2 }}
      />
      <Box display="flex" justifyContent="space-between">
        <Button onClick={handleBack} variant="outlined" color="primary">
          Back
        </Button>
        <Button onClick={handleNext} variant="contained" color="primary">
          Submit Order
        </Button>
      </Box>
    </Card>
  );

  return (
    <DashboardContent>
      <h1 className="font-bold text-5xl text-purple-800 mb-6">IMCWIRE Custom Orders</h1>
      <p className="text-gray-700">Manage custom orders for the platform.</p>
      <br />
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
        <Grid container spacing={2}>
          {/* Left Column: Timeline */}
          <Grid item xs={12} md={4} lg={3}>
            <Box p={6}>
              <Typography variant="h5" className="mb-8 font-bold">
                Your campaign starts here
              </Typography>
              {renderTimeline()}
            </Box>
          </Grid>
          {/* Center Column: Wizard */}
          <Grid item xs={12} md={8} lg={6}>
            {currentStep === 1 && renderStepOne()}
            {currentStep === 2 && renderStepTwo()}
            {currentStep === 3 && renderStepThree()}
            {currentStep === 4 && renderStepFour()}
          </Grid>
          {/* Right Column: Order Summary */}
          <Grid item xs={12} md={12} lg={3}>
            <Card className="p-6 w-full">
              <Typography variant="h6" className="mb-4">
                Order Summary
              </Typography>
              <Box className="border-t pt-4 mt-4 text-sm space-y-2">
                <Box className="bg-gray-100 p-2 flex justify-between">
                  <span className="text-gray-500 font-bold">Base Plan:</span>
                  <span className="text-gray-700 font-bold">${totalPlanPrice.toFixed(2)}</span>
                </Box>
                <Box className="bg-white p-2 flex justify-between">
                  <span className="text-gray-700 font-bold">Additional Categories:</span>
                  <span
                    className={`font-bold ${additionalCategoriesCost === 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    +${additionalCategoriesCost}
                  </span>
                </Box>
                <Box className="bg-gray-100 p-2 flex justify-between">
                  <span className="text-gray-500 font-bold">Additional Countries:</span>
                  <span
                    className={`font-bold ${additionalCountriesCost === 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    +${additionalCountriesCost}
                  </span>
                </Box>
                <Box className="bg-white p-2 flex justify-between">
                  <span className="text-gray-700 font-bold">Translations:</span>
                  <span
                    className={`font-bold ${totalTranslationCost === 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    +${totalTranslationCost}
                  </span>
                </Box>
                <Box className="bg-gray-100 p-2 flex justify-between">
                  <span className="text-gray-500 font-bold">Write & Publication:</span>
                  <span
                    className={`font-bold ${imcwireCost > 0 ? 'text-red-500' : 'text-green-500'}`}
                  >
                    +${imcwireCost}
                  </span>
                </Box>
                <Box className="bg-purple-900 p-2 flex justify-between font-bold">
                  <span className="text-white text-xl font-bold">Total:</span>
                  <span className="text-white text-xl font-bold">${finalTotal.toFixed(2)}</span>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardContent>
  );
}
