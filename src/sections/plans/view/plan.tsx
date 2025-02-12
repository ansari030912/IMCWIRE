/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import axios from 'axios';
import Cookies from 'js-cookie';
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState, useEffect } from 'react';

import { Grid } from '@mui/material';

import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

interface Plan {
  perma: any;
  id: number;
  planName: string;
  totalPlanPrice: string;
  priceSingle: string;
  planDescription: string;
  pdfLink: string;
  numberOfPR: number;
  created_at: string;
  updated_at: string;
  activate_plan: number;
  type: string;
}

const PlanView = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
    user?.token && setToken(user.token);
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/v1/plan/list`, {
        headers: {
          'X-API-Key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching Plans:', error);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchPlans();
  }, [token]);

  return (
    <div className="container mx-auto px-4">
      <div className="text-left mb-12 pl-2">
        <h1 className="font-bold text-5xl text-purple-800 mb-6">IMCWIRE All Plans</h1>
        <p className="text-gray-700">
          Get your News Out to the World with a Professional Press Release Package, Valid for One
          Year from Purchase.
        </p>
      </div>
      {plans.length <= 0 ? (
        ''
      ) : (
        <>
          <hr className="text-gray-100 border-2" />
          <section className="pt-10">
            <Grid container spacing={4} justifyContent="start">
              {plans
                .filter((plan) => plan.type === 'product')
                .map(
                  (plan, index) =>
                    plan.activate_plan === 1 && (
                      <Grid key={index} item lg={4} md={6} sm={12} className="w-full ">
                        {/* Wrapped card inside div for spacing & shadow */}
                        <div
                          className="bg-white rounded-lg overflow-hidden"
                          style={{
                            boxShadow:
                              '4px 4px 10px rgba(0, 0, 0, 0.05), -4px 4px 10px rgba(0, 0, 0, 0.05), 0px -4px 10px rgba(0, 0, 0, 0.05), 0px 4px 10px rgba(0, 0, 0, 0.05)',
                            borderRadius: '10px',
                            marginBottom: '20px',
                          }}
                        >
                          {/* Plan Header */}
                          <div
                            style={{
                              backgroundImage: `url('/package.jpg')`, // No need for ./ or ../
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              // backgroundAttachment: 'fixed',
                            }}
                            className="w-full p-6 rounded-t-lg"
                          >
                            <h2 className="font-black text-center text-3xl">{plan.planName}</h2>
                            <h2 className="font-heading text-center pt-5 text-4xl font-black text-purple-800">
                              ${plan.totalPlanPrice}
                            </h2>
                            <div className="flex justify-center mt-4">
                              <div className="bg-red-500 text-white rounded-lg px-3 py-2 text-sm  font-bold inline-block">
                                {plan.type}
                              </div>
                            </div>
                          </div>

                          {/* Plan Features */}
                          <div className="w-full p-6 bg-white rounded-b-lg">
                            <ul className="space-y-3">
                              <li className="flex gap-2 items-center">
                                ✅ <p className="text-gray-500">{plan.planDescription}</p>
                              </li>
                              <li className="flex gap-2 items-center">
                                ✅{' '}
                                <p className="text-gray-500">
                                  Single PR{' '}
                                  <span className="text-purple-800 font-bold">
                                    {plan.priceSingle}$
                                  </span>
                                </p>
                              </li>
                              <li className="flex gap-2 items-center">
                                ✅ <p className="text-gray-500">{plan.numberOfPR} PR Articles</p>
                              </li>
                              <li className="flex gap-2 items-center">
                                ✅{' '}
                                <p className="text-gray-500">
                                  Download PDF:{' '}
                                  <a
                                    href={plan.pdfLink}
                                    target="_blank"
                                    className="text-blue-600 underline"
                                    rel="noreferrer"
                                  >
                                    View
                                  </a>
                                </p>
                              </li>
                            </ul>
                          </div>

                          {/* Buy Now Button */}
                          <div className="w-full p-6">
                            <a
                              className="px-6 py-3 block text-center w-full bg-gray-800 text-white text-sm font-bold hover:bg-gray-600 transition duration-200 rounded-md"
                              href={`/purchase/${plan.perma}`}
                            >
                              Buy Now
                            </a>
                          </div>
                        </div>
                      </Grid>
                    )
                )}
            </Grid>
          </section>
          <hr className="text-gray-100 border-2" />
          <section className="pt-10">
            <Grid container spacing={4} justifyContent="start">
              {plans
                .filter((plan) => plan.type === 'package')
                .map(
                  (plan, index) =>
                    plan.activate_plan === 1 && (
                      <Grid key={index} item lg={4} md={6} sm={12} className="w-full ">
                        {/* Wrapped card inside div for spacing & shadow */}
                        <div
                          className="bg-white rounded-lg overflow-hidden"
                          style={{
                            boxShadow:
                              '4px 4px 10px rgba(0, 0, 0, 0.05), -4px 4px 10px rgba(0, 0, 0, 0.05), 0px -4px 10px rgba(0, 0, 0, 0.05), 0px 4px 10px rgba(0, 0, 0, 0.05)',
                            borderRadius: '10px',
                            marginBottom: '20px',
                          }}
                        >
                          {/* Plan Header */}
                          <div
                            style={{
                              backgroundImage: `url('/package.jpg')`, // No need for ./ or ../
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              // backgroundAttachment: 'fixed',
                            }}
                            className="w-full p-6 rounded-t-lg"
                          >
                            <h2 className="font-black text-center text-3xl">{plan.planName}</h2>
                            <h2 className="font-heading text-center pt-5 text-4xl font-black text-purple-800">
                              ${plan.totalPlanPrice}
                            </h2>
                            <div className="flex justify-center mt-4">
                              <div className="bg-yellow-500 text-white rounded-lg px-3 py-2 text-sm font-bold inline-block">
                                {plan.type}
                              </div>
                            </div>
                          </div>

                          {/* Plan Features */}
                          <div className="w-full p-6 bg-white rounded-b-lg">
                            <ul className="space-y-3">
                              <li className="flex gap-2 items-center">
                                ✅ <p className="text-gray-500">{plan.planDescription}</p>
                              </li>
                              <li className="flex gap-2 items-center">
                                ✅{' '}
                                <p className="text-gray-500">
                                  Single PR{' '}
                                  <span className="text-purple-800 font-bold">
                                    {plan.priceSingle}$
                                  </span>
                                </p>
                              </li>
                              <li className="flex gap-2 items-center">
                                ✅ <p className="text-gray-500">{plan.numberOfPR} PR Articles</p>
                              </li>
                              <li className="flex gap-2 items-center">
                                ✅{' '}
                                <p className="text-gray-500">
                                  Download PDF:{' '}
                                  <a
                                    href={plan.pdfLink}
                                    target="_blank"
                                    className="text-blue-600 underline"
                                    rel="noreferrer"
                                  >
                                    View
                                  </a>
                                </p>
                              </li>
                            </ul>
                          </div>

                          {/* Buy Now Button */}
                          <div className="w-full p-6">
                            <a
                              className="px-6 py-3 block text-center w-full bg-gray-800 text-white text-sm font-bold hover:bg-gray-600 transition duration-200 rounded-md"
                              href={`/purchase/${plan.perma}`}
                            >
                              Buy Now
                            </a>
                          </div>
                        </div>
                      </Grid>
                    )
                )}
            </Grid>
          </section>
        </>
      )}
    </div>
  );
};
export default PlanView;
