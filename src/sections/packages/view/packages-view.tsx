/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/button-has-type */
import axios from 'axios';
import Cookies from 'js-cookie';
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useMemo, useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card,
  Grid,
  Alert,
  Radio,
  Button,
  Dialog,
  Divider,
  Checkbox,
  Snackbar,
  FormLabel,
  TextField,
  RadioGroup,
  Typography,
  FormControl,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

// ----------------------------
// Adjust these to your environment
// ----------------------------

interface ICountry {
  name: string;
  translation: boolean;
}

export function PackagesView({ id }: { id: string | undefined }) {
  // ------------------------------------------------------------------------------
  // 1) Check if User is Already Logged In (via cookies)
  // ------------------------------------------------------------------------------
  const cookieUser = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
  const isAuthenticated = Boolean(
    cookieUser &&
      cookieUser.token &&
      cookieUser.message === 'Login successful' &&
      cookieUser.isActive
  );

  // Keep track of user info in state (token, etc.)
  const [loggedInUser, setLoggedInUser] = useState<any>(cookieUser || null);

  // ------------------------------------------------------------------------------
  // 2) Steps:
  //    - If logged in: 3 steps total (step 3 = GO TO CHECKOUT)
  //    - If NOT logged in: 4 steps total (step 3 = REGISTER/LOGIN, step 4 = CHECKOUT)
  // ------------------------------------------------------------------------------
  const steps = isAuthenticated
    ? [
        { id: 1, name: 'CHOOSE YOUR DISTRIBUTION' },
        { id: 2, name: 'UPLOAD FILE' },
        { id: 3, name: 'GO TO CHECKOUT' },
      ]
    : [
        { id: 1, name: 'CHOOSE YOUR DISTRIBUTION' },
        { id: 2, name: 'UPLOAD FILE' },
        { id: 3, name: 'REGISTER or LOGIN' },
        { id: 4, name: 'GO TO CHECKOUT' },
      ];

  // Current step
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [openTermsDialog, setOpenTermsDialog] = useState(false);

  const handleOpenTermsDialog = () => setOpenTermsDialog(true);
  const handleCloseTermsDialog = () => setOpenTermsDialog(false);

  // ------------------------------------------------------------------------------
  // 3) Snackbar for Error/Success Messages
  // ------------------------------------------------------------------------------
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error');
  const [basePlanPrice, setBasePlanPrice] = useState(0);
  const [planType, setPlanType] = useState<string>(''); // Stores the plan type ("package" or "product")
  const [discount, setDiscount] = useState<number>(0); // Stores the discount amount
  const [planId, setPlanId] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/v1/plan/single/${id}`, {
          headers: {
            'x-api-key': X_API_KEY,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          const planData = response.data;
          setPlanType(planData.type); // ✅ Store plan type in state
          setBasePlanPrice(Number(planData.totalPlanPrice)); // Store base price
          setPlanId(planData.id);
        }
      } catch (error) {
        setErrorMessage('Not a valid plan. Please try again.');
        router.push('/plans');
        console.error('Error fetching plan:', error);
      }
    };

    fetchPlan();
  }, []);

  function showSnackbar(message: string, severity: 'error' | 'success' = 'error') {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }

  function handleCloseSnackbar() {
    setSnackbarOpen(false);
  }

  // ------------------------------------------------------------------------------
  // 4) Distribution / Pricing
  // ------------------------------------------------------------------------------

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
    { name: 'Brazil ' },
    { name: 'Italy' },
    { name: 'Spain' },
    { name: 'United States' },
    { name: 'France' },
    { name: 'Germany' },
    { name: 'Netherlands' },
    { name: 'Saudi Arabia' },
    { name: 'Poland' },
    { name: 'Vietnam ' },
    { name: 'India ' },
    { name: 'Pakistan' },
    { name: 'South Africa' },
    { name: 'Singapore' },
    { name: 'Japan' },
    { name: 'Philippines ' },
    { name: 'Indonesia' },
    { name: 'Hong Kong' },
    { name: 'South Korea' },
    { name: 'Morocco ' },
    { name: 'Romania' },
    { name: 'Thailand ' },
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

  // State for adding categories/countries
  const [categoryToAdd, setCategoryToAdd] = useState('');
  const [countryToAdd, setCountryToAdd] = useState('');

  // Selected items
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<ICountry[]>([]);

  // Add/remove categories
  function handleAddCategory() {
    if (categoryToAdd && !selectedCategories.includes(categoryToAdd)) {
      setSelectedCategories((prev) => [...prev, categoryToAdd]);
      setCategoryToAdd('');
    }
  }
  function handleRemoveCategory(name: string) {
    setSelectedCategories((prev) => prev.filter((cat) => cat !== name));
  }

  // Add/remove countries
  function handleAddCountry() {
    if (countryToAdd && !selectedCountries.some((c) => c.name === countryToAdd)) {
      setSelectedCountries((prev) => [...prev, { name: countryToAdd, translation: false }]);
      setCountryToAdd('');
    }
  }
  function handleRemoveCountry(name: string) {
    setSelectedCountries((prev) => prev.filter((c) => c.name !== name));
  }
  function toggleCountryTranslation(countryName: string) {
    setSelectedCountries((prev) =>
      prev.map((c) => (c.name === countryName ? { ...c, translation: !c.translation } : c))
    );
  }

  // Pricing logic
  const categoryCount = selectedCategories.length;
  const countryCount = selectedCountries.length;

  // The first category free, subsequent $40
  const additionalCategoriesCost = categoryCount > 1 ? (categoryCount - 1) * 40 : 0;
  // The first country free, subsequent $40
  const additionalCountriesCost = countryCount > 1 ? (countryCount - 1) * 40 : 0;

  // $20 per translation
  const translationCost = 20;
  const translationsSelected = selectedCountries.filter((c) => c.translation).length;
  const totalTranslationCost = translationsSelected * translationCost;

  // Partial total
  const partialTotal =
    basePlanPrice + additionalCategoriesCost + additionalCountriesCost + totalTranslationCost;

  // ------------------------------------------------------------------------------
  // 5) Step 2: “Write from us” => +$120 OR “Upload doc”
  // ------------------------------------------------------------------------------
  // '' = not chosen
  // 'write' => +120
  // 'upload' => 0
  const [uploadChoice, setUploadChoice] = useState<'write' | 'upload' | ''>('');
  const writeCost = uploadChoice === 'write' ? 120 : 0;
  const finalTotal = partialTotal + writeCost;

  // ------------------------------------------------------------------------------
  // 6) Step 3 (if not logged in): Register OR Login (toggle)
  // ------------------------------------------------------------------------------
  const [showLogin, setShowLogin] = useState(false);

  // Fields for both register & login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Additional for Register
  const [name, setName] = useState('');
  const [isAgency, setIsAgency] = useState(false);

  // ------------------------------------------------------------------------------
  // 6a) LOGIN user if “already have an account”
  // ------------------------------------------------------------------------------
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState('');

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
  }, [id]);

  const handleSignIn = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      // If needed, fetch IP address or remove if not needed

      if (!ipAddress) {
        setErrorMessage('Session Timeout. Please try again.');
        setLoading(false);
        return;
      }

      const loginResponse = await axios.post(
        `${BASE_URL}/v1/account/login`,
        {
          email,
          password,
          ipAddress,
        },
        {
          headers: {
            'x-api-key': X_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      if (
        loginResponse.status === 200 &&
        loginResponse.data.message === 'Login successful' &&
        loginResponse.data.token &&
        loginResponse.data.isActive
      ) {
        // Save user in cookies for 1 day
        Cookies.set('user', JSON.stringify(loginResponse.data), { expires: 1 });
        // Update local state
        setLoggedInUser(loginResponse.data);
        showSnackbar('Login successful!', 'success');
        // Move to next step
        handleNextActual();
      } else {
        setErrorMessage('Invalid credentials or inactive account');
      }
    } catch (error) {
      setErrorMessage('Login failed. Please try again.');
      console.error('Error during login:', error);
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  // ------------------------------------------------------------------------------
  // 6b) REGISTER user
  // ------------------------------------------------------------------------------
  async function handleRegister() {
    if (!email || !name || !password) {
      showSnackbar('Please fill all fields (email, name, password).');
      return;
    }

    try {
      const payload = {
        username: name,
        email,
        password,
        isAgency,
      };
      const resp = await axios.post(`${BASE_URL}/v1/account/register`, payload, {
        headers: {
          'x-api-key': X_API_KEY,
        },
      });

      if (resp.data && resp.data.token) {
        Cookies.set('user', JSON.stringify(resp.data), { expires: 1 });
        setLoggedInUser(resp.data);
        showSnackbar('Registration successful!', 'success');
        handleNextActual();
      } else {
        showSnackbar('Registration failed, please verify your details.', 'error');
      }
    } catch (err) {
      console.error(err);
      showSnackbar('Registration failed, please check your details.', 'error');
    }
  }

  // ------------------------------------------------------------------------------
  // 7) Final Step => Checkout
  // ------------------------------------------------------------------------------
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Stripe' | 'Paypro'>('Stripe');

  async function handleCheckout() {
    if (!agreeToTerms) {
      showSnackbar('Please agree to the Terms and Conditions before checkout.');
      return;
    }

    if (!planId || !loggedInUser) {
      showSnackbar('Error: Missing plan details. Please refresh and try again.', 'error');
      return;
    }

    try {
      const prType = uploadChoice === 'write' ? 'IMCWire Written' : 'Self-Written';
      const paymentStatus = 'unpaid';

      // ✅ Ensure discount applies **only** to "product" plans, NOT "package"
      const isProduct = planType === 'product';
      const totalPlanPrice =
        basePlanPrice +
        additionalCategoriesCost +
        additionalCountriesCost +
        totalTranslationCost +
        writeCost;
      // ✅ Shows the total plan price before applying any discount.

      const discountedBasePrice = Math.max(0, basePlanPrice - discount);
      // ✅ Applies discount only to base plan price (not additional costs).

      const total_price =
        discountedBasePrice +
        additionalCategoriesCost +
        additionalCountriesCost +
        totalTranslationCost +
        writeCost;
      // ✅ Final total after applying discount.

      const additionalCosts =
        additionalCategoriesCost + additionalCountriesCost + totalTranslationCost + writeCost;

      // const total_price = Math.max(0, discountedPlanPrice + additionalCosts);

      const payload = {
        plan_id: planId,
        prType,
        pr_status: 'Pending',
        payment_method: paymentMethod,
        targetCountries: selectedCountries.map((c, idx) => ({
          name: c.name.trim(),
          price: idx === 0 ? 0 : 40,
          translationRequired: c.translation ? 'Yes' : 'No',
          translationPrice: c.translation ? 20 : 0,
        })),
        industryCategories: selectedCategories.map((cat, idx) => ({
          name: cat,
          price: idx === 0 ? 0 : 40,
        })),
        totalPlanPrice,
        total_price,
        additionalCosts,
        payment_status: paymentStatus,
        ip_address: ipAddress,
      };

      // API call
      const token = loggedInUser?.token || '';
      const resp = await axios.post(`${BASE_URL}/v1/pr/submit-order`, payload, {
        headers: {
          'x-api-key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      showSnackbar('PR submitted successfully! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = resp.data.paymentUrl;
      }, 3000);
    } catch (error) {
      console.error(error);
      showSnackbar('Checkout failed. Please try again.', 'error');
    }
  }

  // ------------------------------------------------------------------------------
  // 8) Step Navigation
  // ------------------------------------------------------------------------------
  function handleNext() {
    // Step 1
    if (currentStep === 1) {
      if (selectedCategories.length === 0 || selectedCountries.length === 0) {
        showSnackbar('Please select at least one Category and one Country before proceeding.');
        return;
      }
    }
    // Step 2
    if (currentStep === 2) {
      if (uploadChoice === '') {
        showSnackbar('Please select "Write & Publication" or "Upload PR" before proceeding.');
        return;
      }
    }

    // If user is NOT logged in & we are on step 3 => Register/Login
    const lastStepId = steps[steps.length - 1].id; // 3 or 4
    if (!isAuthenticated && currentStep === 3) {
      if (showLogin) {
        // in "Login" mode
        handleSignIn();
        return;
      }
      // in "Register" mode
      handleRegister();
      return;
    }

    // Otherwise, move to next
    handleNextActual();
  }

  function handleNextActual() {
    // Move to next step if not the last
    const maxStepId = steps[steps.length - 1].id;
    if (currentStep < maxStepId) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  // ------------------------------------------------------------------------------
  // 9) Render Step 1
  // ------------------------------------------------------------------------------
  function renderStepOne() {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Optimize Your Press Release for Maximum Impact
        </h2>
        <p className="text-gray-800 font-bold mb-4">Industry Categories</p>
        <p className="text-sm text-gray-500 mb-6">
          IMCWIRE offers a hand-picked list of journalists for your initial industry category at no
          cost. You can add more categories for $40 each.
        </p>

        {/* Category Select */}
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
              {/* Custom Dropdown Arrow with Padding */}
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <g fill="none" fillRule="evenodd">
                    <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                    <path
                      fill="currentColor"
                      d="M12.707 15.707a1 1 0 0 1-1.414 0L5.636 10.05A1 1 0 1 1 7.05 8.636l4.95 4.95l4.95-4.95a1 1 0 0 1 1.414 1.414z"
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

        {/* Selected Categories */}
        {selectedCategories.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Selected Categories:</h3>
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
        <p className="text-gray-800 font-bold mb-4">Countries</p>
        <p className="text-sm text-gray-500 mb-6">
          IMCWIRE offers a hand-picked list of journalists for your initial country at no cost.
          Additional countries are $40 each.
        </p>

        {/* Country Select */}
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
              {/* Custom Dropdown Arrow */}
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <g fill="none" fillRule="evenodd">
                    <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                    <path
                      fill="currentColor"
                      d="M12.707 15.707a1 1 0 0 1-1.414 0L5.636 10.05A1 1 0 1 1 7.05 8.636l4.95 4.95l4.95-4.95a1 1 0 0 1 1.414 1.414z"
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

        {/* Selected Countries */}
        {selectedCountries.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Selected Countries:</h3>
            <ul className="space-y-2">
              {selectedCountries.map((c) => (
                <li
                  key={c.name}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
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

        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-purple-800 text-white rounded hover:bg-purple-700 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------------------
  // 10) Render Step 2
  // ------------------------------------------------------------------------------
  function renderStepTwo() {
    return (
      <Card className="p-6 w-full">
        <h2 className="text-xl font-semibold mb-4">Your Press Distribution</h2>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Note: We appreciate your high-quality Press Release. Share professionally written content.
          Upload now to reach a wider audience.
        </Typography>

        {/* Write & Publication = $120 */}
        <div
          onClick={() => setUploadChoice('write')}
          className={`cursor-pointer mb-4 p-4 rounded shadow-sm ${
            uploadChoice === 'write' ? 'bg-purple-800 text-white' : 'bg-gray-100 text-gray-800'
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
          onClick={() => setUploadChoice('upload')}
          className={`cursor-pointer p-4 rounded shadow-sm ${
            uploadChoice === 'upload' ? 'bg-purple-800 text-white' : 'bg-white text-gray-800 border'
          }`}
          style={{ transition: '0.2s' }}
        >
          <Typography variant="h6">Upload Your PR in doc file</Typography>
          <Typography variant="body2">
            Upload your high-quality PR written in .doc or .docx
          </Typography>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-purple-800 text-white rounded hover:bg-purple-700 cursor-pointer"
          >
            Next
          </button>
        </div>
      </Card>
    );
  }

  // ------------------------------------------------------------------------------
  // 11) Render Step 3 => Register or Login (if not logged in)
  //     If user is logged in, step 3 is actually the Checkout
  // ------------------------------------------------------------------------------
  function renderRegisterOrLogin() {
    return (
      <Card className="p-6 w-full">
        <h2 className="text-xl font-semibold mb-4">Register or Login</h2>

        {/* Toggle between Register or Login */}
        <div className="flex items-center mb-6">
          <Button
            variant={!showLogin ? 'contained' : 'outlined'}
            onClick={() => {
              setShowLogin(false);
              setErrorMessage('');
            }}
            sx={{ mr: 2 }}
          >
            Register
          </Button>
          <Button
            variant={showLogin ? 'contained' : 'outlined'}
            onClick={() => {
              setShowLogin(true);
              setErrorMessage('');
            }}
          >
            Login
          </Button>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Register Form */}
        {!showLogin && (
          <>
            <TextField
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAgency}
                  onChange={(e) => setIsAgency(e.target.checked)}
                  color="primary"
                />
              }
              label="Are you an agency?"
            />
          </>
        )}

        {/* Login Form */}
        {showLogin && (
          <>
            <TextField
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
          </>
        )}

        <div className="flex justify-between mt-4">
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-4 py-2 bg-purple-800 text-white rounded hover:bg-purple-700 cursor-pointer"
          >
            {showLogin ? (loading ? 'Logging in...' : 'Login') : 'Register'}
          </button>
        </div>
      </Card>
    );
  }

  // ------------------------------------------------------------------------------
  // 12) Render Final Checkout
  // ------------------------------------------------------------------------------
  function renderCheckout() {
    return (
      <Card className="p-6 w-full">
        <Typography variant="h5" sx={{ mb: 2 }}>
          Checkout
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Review your order. Agree to the Terms and Conditions to proceed with payment.
        </Typography>

        {/* Payment Method */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Select Payment Method:</FormLabel>
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as 'Stripe' | 'Paypro')}
          >
            <FormControlLabel
              value="Stripe"
              control={<Radio />}
              label={
                <>
                  Stripe <span className="text-red-500">Recommended</span>
                </>
              }
            />
            <FormControlLabel value="Paypro" control={<Radio />} label="PayPro" />
          </RadioGroup>
        </FormControl>
        <br />
        <FormControlLabel
          control={
            <Checkbox
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              color="primary"
            />
          }
          label={
            <span>
              I agree to the{' '}
              <span
                onClick={handleOpenTermsDialog}
                style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Terms and Conditions
              </span>
            </span>
          }
        />

        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded hover:bg-purple-50"
          >
            Back
          </button>
          <button
            onClick={handleCheckout}
            className="px-4 py-2 bg-purple-800 text-white rounded hover:bg-purple-700 cursor-pointer"
          >
            Checkout
          </button>
        </div>
      </Card>
    );
  }

  // ------------------------------------------------------------------------------
  // MAIN RENDER
  // ------------------------------------------------------------------------------
  return (
    <DashboardContent>
      {basePlanPrice === 0 ? (
        ''
      ) : (
        <>
          <Box display="flex" alignItems="center" mb={5}>
            <Typography variant="h4" flexGrow={1} sx={{ pl: 3 }}>
              Packages
            </Typography>
          </Box>
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
          <Box>
            <Grid container spacing={2}>
              {/* STEP TIMELINE */}
              <Grid item lg={6} xl={3}>
                <div className="container mx-auto p-6">
                  <h1 className="text-2xl font-bold mb-8">Your campaign starts here</h1>

                  <div className="grid grid-cols-1 gap-8">
                    <div>
                      <div className="relative">
                        {steps.map((step, index) => (
                          <div key={step.id} className="flex items-start mb-8 relative">
                            {/* Vertical Line */}
                            {index !== steps.length - 1 && (
                              <div
                                className={`absolute left-[11px] top-6 w-0.5 h-[calc(100%+16px)] transition-colors duration-300
                              ${currentStep > step.id ? 'bg-purple-800' : 'bg-gray-200'}`}
                              />
                            )}
                            {/* Circle + Text */}
                            <div className="flex items-center gap-3 relative z-10">
                              <div
                                className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-colors duration-300
                              ${
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
                                className={`text-xs font-medium transition-colors duration-300
                              ${step.id === currentStep ? 'text-purple-600' : 'text-gray-500'}`}
                              >
                                {step.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Grid>

              {/* MAIN CONTENT by step */}
              <Grid item lg={6} xl={5} className="w-full">
                {currentStep === 1 && renderStepOne()}
                {currentStep === 2 && renderStepTwo()}

                {/* If user is logged in, step 3 => Checkout */}
                {isAuthenticated && currentStep === 3 && renderCheckout()}

                {/* If user is NOT logged in, step 3 => Register/Login, step 4 => Checkout */}
                {!isAuthenticated && (
                  <>
                    {currentStep === 3 && renderRegisterOrLogin()}
                    {currentStep === 4 && renderCheckout()}
                  </>
                )}
              </Grid>

              {/* SIDE CARD (Price Summary) */}
              {/* SIDE CARD (Order Summary with Coupon Code) */}
              <Grid item lg={6} xl={4} className="w-full">
                <OrderSummary
                  basePlanPrice={basePlanPrice}
                  additionalCategoriesCost={additionalCategoriesCost}
                  additionalCountriesCost={additionalCountriesCost}
                  totalTranslationCost={totalTranslationCost}
                  writeCost={writeCost}
                  planType={planType}
                  discount={discount} // ✅ Pass discount
                  setDiscount={setDiscount} // ✅ Allow setting discount from OrderSummary
                />
              </Grid>
            </Grid>
          </Box>
          <Dialog
            open={openTermsDialog}
            onClose={handleCloseTermsDialog}
            fullWidth
            maxWidth="md"
            PaperProps={{
              sx: {
                borderRadius: '12px',
                boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden',
              },
            }}
          >
            {/* Header with a Gradient Background and Close Icon */}
            <Box
              sx={{
                background: 'linear-gradient(45deg, #924BC3 30%, #21CBF3 90%)',
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Terms and Conditions
              </Typography>
              {/* <IconButton onClick={handleCloseTermsDialog} sx={{ color: 'white' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                  <path
                    fill="#ff0808"
                    d="m13.41 12l4.3-4.29a1 1 0 1 0-1.42-1.42L12 10.59l-4.29-4.3a1 1 0 0 0-1.42 1.42l4.3 4.29l-4.3 4.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l4.29-4.3l4.29 4.3a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42Z"
                  />
                </svg>
              </IconButton> */}
            </Box>

            {/* Content Area */}
            <DialogContent
              dividers
              sx={{
                backgroundColor: '#fafafa',
                p: 3,
              }}
            >
              {/* Non-Refundable Payment Policy Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Non-Refundable Payment Policy
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
                  All payments made for our press release distribution services are non-refundable.
                  This policy is enforced due to the upfront costs we incur, including payments to
                  third-party websites for publication slots. Once a press release is processed for
                  distribution across our extensive network, including premier sites such as Yahoo
                  Finance, Bloomberg, MarketWatch, among others, we cannot offer refunds as we do
                  not receive refunds from these websites.
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />

              {/* Publication on Specific Topics Section */}
              <Box sx={{ my: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Publication on Specific Topics
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
                  Please note that if your press release covers topics such as Cryptocurrency, NFTs,
                  Mining, Finance, Gambling, Casinos, and similar areas, we will submit your article
                  to the websites you select. However, if your content is rejected three times by
                  these platforms, we cannot refund your payment. We urge you to choose your topics
                  and target websites carefully and consult with our support team if you have any
                  questions or require guidance.{' '}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />

              {/* Additional Details Section */}
              <Box sx={{ my: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Additional Details
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
                  For further details about our services and specific policies, please visit our FAQ
                  section or contact our support team for assistance.{' '}
                  <a
                    href="https://imcwire.com/contact/"
                    style={{ color: 'blue', textDecoration: 'underline' }}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <b> Contact Us</b>
                  </a>
                </Typography>
              </Box>
            </DialogContent>

            {/* Actions Area */}
            <DialogActions
              sx={{
                backgroundColor: '#fafafa',
                p: 2,
                justifyContent: 'flex-end',
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Button onClick={handleCloseTermsDialog} variant="contained" color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </DashboardContent>
  );
}

function OrderSummary({
  basePlanPrice,
  additionalCategoriesCost,
  additionalCountriesCost,
  totalTranslationCost,
  writeCost,
  planType,
  discount,
  setDiscount, // ✅ Receive setDiscount
}: {
  basePlanPrice: number;
  additionalCategoriesCost: number;
  additionalCountriesCost: number;
  totalTranslationCost: number;
  writeCost: number;
  planType: string;
  discount: number;
  setDiscount: React.Dispatch<React.SetStateAction<number>>; // ✅ Allow updating discount
}) {
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error');

  function showSnackbar(message: string, severity: 'error' | 'success' = 'error') {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }

  function handleCloseSnackbar() {
    setSnackbarOpen(false);
  }

  function handleCouponChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCouponCode(e.target.value.replace(/\s+/g, ''));
    setCouponError('');
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      setCouponError('Coupon code cannot be empty.');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const response = await axios.get(`${BASE_URL}/v1/coupon/validate?couponCode=${couponCode}`, {
        headers: {
          'x-api-key': X_API_KEY,
        },
      });

      if (response.data.status === 'active') {
        const discountAmount = (basePlanPrice * parseFloat(response.data.discountPercentage)) / 100;

        // ✅ Coupons only apply to "package" plans, NOT "product" plans
        if (planType === 'package') {
          setDiscount(discountAmount);
          setIsCouponApplied(true);
          showSnackbar(`Coupon applied! You saved $${discountAmount.toFixed(2)}.`, 'success');
        } else {
          setCouponError('Coupons can only be applied to package plans.');
          setDiscount(0);
        }
      } else {
        setCouponError('Invalid or expired coupon.');
        setDiscount(0);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Invalid coupon code or expired.');
      setDiscount(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setDiscount(0);
    setCouponCode('');
    setIsCouponApplied(false);
    showSnackbar('Coupon removed. Full price restored.', 'success');
  }

  const totalBeforeDiscount = useMemo(
    () =>
      basePlanPrice +
      additionalCategoriesCost +
      additionalCountriesCost +
      totalTranslationCost +
      writeCost,
    [
      basePlanPrice,
      additionalCategoriesCost,
      additionalCountriesCost,
      totalTranslationCost,
      writeCost,
    ]
  );

  // ✅ Apply discount only to basePlanPrice, not additional costs
  const discountedPlanPrice =
    planType === 'package' ? Math.max(0, basePlanPrice - discount) : basePlanPrice;
  const finalTotal =
    discountedPlanPrice +
    additionalCategoriesCost +
    additionalCountriesCost +
    totalTranslationCost +
    writeCost;

  return (
    <Card className="p-6 w-full">
      <Typography variant="h6" sx={{ mb: 2 }}>
        Order Summary
      </Typography>

      {/* Show Coupon Field ONLY if Plan Type is "package" */}
      {planType === 'package' && !isCouponApplied && (
        <div className="mb-4">
          <TextField
            label="Enter Coupon Code"
            variant="outlined"
            value={couponCode}
            onChange={handleCouponChange}
            fullWidth
            error={!!couponError}
            helperText={couponError}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleApplyCoupon}
            disabled={isApplyingCoupon}
            sx={{ mt: 2, width: '100%' }}
          >
            {isApplyingCoupon ? 'Applying...' : 'Apply'}
          </Button>
        </div>
      )}

      {/* Show Applied Coupon (if any) */}
      {isCouponApplied && (
        <div className="flex items-center justify-between mb-4 bg-green-100 p-2 rounded">
          <Typography variant="body1" color="success">
            Coupon &quot;{couponCode}&quot; applied!
          </Typography>
          <Button variant="outlined" color="error" onClick={handleRemoveCoupon}>
            Remove
          </Button>
        </div>
      )}

      <div className="border-t pt-4 mt-4 text-sm space-y-2">
        <div className="bg-gray-100 p-2 flex justify-between">
          <span className="text-gray-500 font-bold">Base Plan:</span>
          <span className="text-gray-700 font-bold">${basePlanPrice}</span>
        </div>

        <div className="bg-white p-2 flex justify-between">
          <span className="text-gray-700 font-bold">Additional Categories:</span>
          <span className="font-bold text-red-500">+${additionalCategoriesCost}</span>
        </div>

        <div className="bg-gray-100 p-2 flex justify-between">
          <span className="text-gray-500 font-bold">Additional Countries:</span>
          <span className="font-bold text-red-500">+${additionalCountriesCost}</span>
        </div>

        <div className="bg-white p-2 flex justify-between">
          <span className="text-gray-700 font-bold">Translations:</span>
          <span className="font-bold text-red-500">+${totalTranslationCost}</span>
        </div>

        <div className="bg-gray-100 p-2 flex justify-between">
          <span className="text-gray-500 font-bold">Write & Publication:</span>
          <span className="font-bold text-red-500">+${writeCost}</span>
        </div>

        {discount > 0 && (
          <div className="bg-white p-2 flex justify-between text-green-600 font-bold">
            <span>Discount Applied:</span>
            <span>- ${discount.toFixed(2)}</span>
          </div>
        )}

        <div className="bg-gray-100 p-2 flex justify-between font-bold">
          <span className="text-gray-700 text-xl font-bold">Total:</span>
          <span className="text-purple-600 text-xl font-bold">${finalTotal.toFixed(2)}</span>
        </div>
      </div>

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
    </Card>
  );
}
