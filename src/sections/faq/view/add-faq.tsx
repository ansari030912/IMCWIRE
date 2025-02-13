/* eslint-disable react/button-has-type */
import axios from 'axios';
import moment from 'moment';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';

import { Box, Alert, Button, Snackbar, TextField } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

const AddFAQView = () => {
  const [faqs, setFaqs] = useState([]);
  const [newFaqs, setNewFaqs] = useState([{ question: '', answer: '' }]);
  const [showForm, setShowForm] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddField = () => {
    setNewFaqs([...newFaqs, { question: '', answer: '' }]);
  };

  const handleRemoveField = (index: number) => {
    const updatedFaqs = newFaqs.filter((_, i) => i !== index);
    setNewFaqs(updatedFaqs);
  };

  const handleInputChange = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedFaqs = [...newFaqs];
    updatedFaqs[index][field] = value;
    setNewFaqs(updatedFaqs);
  };

  useEffect(() => {
    const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
    if (user && user.token) {
      setToken(user.token);
    }
  }, []);

  const handleSubmit = async () => {
    // Validate at least one FAQ has both fields filled
    const hasValidFAQ = newFaqs.some(
      (faq) => faq.question.trim() !== '' && faq.answer.trim() !== ''
    );

    if (!hasValidFAQ) {
      setSnackbar({
        open: true,
        message: 'You must add at least one FAQ with both question and answer to continue',
        severity: 'error',
      });
      return;
    }

    try {
      await axios.post(`${BASE_URL}/v1/faq/add`, newFaqs, {
        headers: {
          'x-api-key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbar({ open: true, message: 'FAQs added successfully', severity: 'success' });
      setNewFaqs([{ question: '', answer: '' }]);
      setShowForm(false);
      fetchFaqs();
    } catch (error) {
      console.error('Error posting FAQs:', error);
      setSnackbar({ open: true, message: 'Failed to add FAQs', severity: 'error' });
    }
  };
  const fetchFaqs = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/v1/faq/list`, {
        headers: {
          'x-api-key': X_API_KEY,
        },
      });
      setFaqs(response.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const handleDeleteFAQ = async (faqId: number) => {
    try {
      await axios.delete(`${BASE_URL}/v1/faq/delete/${faqId}`, {
        headers: {
          'x-api-key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbar({ open: true, message: 'FAQ deleted successfully', severity: 'success' });
      fetchFaqs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      setSnackbar({ open: true, message: 'Failed to delete FAQ', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  return (
    <section className="py-4">
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <div className="container mx-auto px-4">
        <div className="text-left mb-12 pl-2">
          <h1 className="font-bold text-5xl text-purple-800 mb-6">
            Frequently Asked Question&apos;s
          </h1>
          <p className="text-gray-700">
            Here you will find the answers to the frequently asked questions.
          </p>
        </div>
        <Box display="flex" alignItems="end" justifyContent="end" mb={5}>
          <Button
            variant="contained"
            color={showForm ? 'error' : 'inherit'}
            startIcon={showForm ? '' : <Iconify icon="mingcute:add-line" />}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Close' : 'Add New FAQ'}
          </Button>
        </Box>
        {showForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-100">
            {newFaqs.map((faq, index) => (
              <>
                <div className="text-xl pl-1 text-purple-900 font-bold">{index + 1}.</div>
                <div key={index} className="mb-4">
                  <TextField
                    fullWidth
                    label="Question"
                    variant="outlined"
                    value={faq.question}
                    onChange={(e) => handleInputChange(index, 'question', e.target.value)}
                    className="mb-2 bg-white rounded-xl"
                  />
                  <br />
                  <br />
                  <TextField
                    className="-mt-12 bg-white rounded-xl"
                    fullWidth
                    label="Answer"
                    variant="outlined"
                    value={faq.answer}
                    onChange={(e) => handleInputChange(index, 'answer', e.target.value)}
                  />
                  <br />
                  <br />

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Iconify icon="mingcute:delete-line" />}
                    onClick={() => handleRemoveField(index)}
                    className="mt-2 "
                  >
                    Remove
                  </Button>
                </div>
              </>
            ))}
            <div className="flex justify-between">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={handleAddField}
                className="mt-2"
              >
                Add More
              </Button>
              <Button
                variant="contained"
                sx={{ bgcolor: '#4A2D6F' }}
                onClick={handleSubmit}
                className="mt-4 ml-4"
              >
                Post FAQ
              </Button>
            </div>
          </div>
        )}
        <div className="max-w-xl mx-auto lg:max-w-none">
          <div className="flex flex-wrap -mx-4 mb-12">
            {faqs
              .sort((a: any, b: any) => moment(b.updated_at).unix() - moment(a.updated_at).unix())
              .map((faq: any) => (
                <div key={faq.id} className="w-full lg:w-1/2 px-4 mb-4">
                  <button className="flex w-full py-4 px-8 items-start justify-between text-left shadow-md rounded-2xl">
                    <div className="pr-5 w-full">
                      <h5 className="text-lg text-purple-900 font-medium">{faq.question}</h5>
                      <div className="overflow-hidden transition-all w-full duration-500 max-h-screen">
                        <p className="text-gray-700 mt-4">{faq.answer}</p>
                        {/* <p className="text-sm text-right w-full text-gray-500">
                          {moment(faq.updated_at).format('MMMM Do YYYY, h:mm a')}
                        </p> */}
                      </div>
                    </div>
                    <span className="flex-shrink-0">
                      <button onClick={() => handleDeleteFAQ(faq.id)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="red"
                            fillRule="evenodd"
                            d="M9.774 5L3.758 3.94l.174-.986a.5.5 0 0 1 .58-.405L18.411 5h.088h-.087l1.855.327a.5.5 0 0 1 .406.58l-.174.984l-2.09-.368l-.8 13.594A2 2 0 0 1 15.615 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5h12.69zH5.5zM9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9zm-2.646-7.871l3.94.694a.5.5 0 0 1 .405.58l-.174.984l-4.924-.868l.174-.985a.5.5 0 0 1 .58-.405z"
                          />
                        </svg>
                      </button>
                    </span>
                  </button>
                </div>
              ))}
          </div>
          <div className="max-w-7xl pl-2 text-left">
            <h5 className="text-xl font-medium mb-4">Still have questions?</h5>
            <p className="text-gray-700">
              <span>For assistance, please visit our </span>
              <a
                href="https://imcwire.com/contact/"
                style={{ color: 'blue', textDecoration: 'underline' }}
                target="_blank"
                rel="noreferrer"
              >
                <b> Contact Us</b>
              </a>
              <span>
                . Our dedicated team is ready to help you on your journey to more sustainable
                future.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddFAQView;
