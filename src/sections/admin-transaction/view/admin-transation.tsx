import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

interface Transaction {
  id: number;
  transaction_id: string;
  receipt_email: string;
  amount: string;
  currency: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
}
export function AdminTransaction() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
        if (user && user.token && user.message === 'Login successful' && user.isActive) {
          const { token } = user;
          const response = await axios.get(`${BASE_URL}/v1/payment/all`, {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': X_API_KEY,
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.data.success) {
            setTransactions(response.data.payments);
          }
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Transaction History
        </Typography>
      </Box>
      <section>
        <div className="container mx-auto">
          <div className="p-6 mb-6 bg-white shadow rounded overflow-x-auto">
            {loading ? (
              <p>Loading transactions...</p>
            ) : (
              <table className="table-auto w-full">
                <thead>
                  <tr className="text-xs text-gray-500 text-left">
                    <th className="pb-3 font-medium">Transaction ID</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Currency</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Method</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr
                      key={transaction.id}
                      className={`text-xs ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                    >
                      <td className="py-3 px-4 font-medium">#{transaction.transaction_id}</td>
                      <td className="py-3 px-4">{transaction.receipt_email}</td>
                      <td className="py-3 px-4">${transaction.amount}</td>
                      <td className="py-3 px-4">{transaction.currency}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block py-1 px-2 text-white rounded-full ${transaction.payment_status === 'paid' ? 'bg-green-500' : 'bg-red-500'}`}
                        >
                          {transaction.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{transaction.payment_method}</td>
                      <td className="py-3 px-4">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </DashboardContent>
  );
}
