import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DashboardContent } from 'src/layouts/dashboard';

// Sample transaction data
const transactions = [
  {
    id: '#1006',
    user: {
      name: 'John Smith',
      email: 'john@shuffle.dev',
      avatar:
        'https://images.unsplash.com/photo-1559893088-c0787ebfc084?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    },
    joined: '09/04/2021',
    status: 'Paid',
    purchased: 'Monthly Subscription',
  },
  {
    id: '#1007',
    user: {
      name: 'Emily Davis',
      email: 'emily@shuffle.dev',
      avatar:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    },
    joined: '12/08/2021',
    status: 'Pending',
    purchased: 'Annual Subscription',
  },
  {
    id: '#1008',
    user: {
      name: 'Emily Davis',
      email: 'emily@shuffle.dev',
      avatar:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    },
    joined: '12/08/2021',
    status: 'Reject',
    purchased: 'Annual Subscription',
  },
  {
    id: '#1009',
    user: {
      name: 'Emily Davis',
      email: 'emily@shuffle.dev',
      avatar:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    },
    joined: '12/08/2021',
    status: 'Not Paid',
    purchased: 'Annual Subscription',
  },
  // Add more data as needed
];

export function AdminTransaction() {
  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Transaction History
        </Typography>
      </Box>
      <section >
        <div className="container mx-auto">
          <div className="p-6 mb-6 bg-white shadow rounded overflow-x-auto">
            <table className="table-auto w-full">
              <thead className=''>
                <tr className="text-xs text-gray-500 text-left">
                  {/* <th className="pl-6 pb-3 font-medium">Customer ID</th> */}
                  <th className="pb-3 font-medium">Name / Email</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Purchased</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className={`text-xs ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                  >
                    {/* <td className="py-5 px-6 font-medium">{transaction.id}</td> */}
                    <td className="flex px-4 py-3 mr-8">
                      <img
                        className="w-8 h-8 mr-4 object-cover rounded-md"
                        src={transaction.user.avatar}
                        alt={transaction.user.name}
                      />
                      <div>
                        <p className="font-medium">{transaction.user.name}</p>
                        <p className="text-gray-500">{transaction.user.email}</p>
                      </div>
                    </td>
                    <td className="font-medium mr-4 text-nowrap">{transaction.joined}</td>
                    <td className=''>
                      <span
                        className={`inline-block py-1 px-2 text-white mx-4 text-nowrap ${transaction.status === 'Paid' ? 'bg-green-500' : transaction.status === 'Reject' ? 'bg-red-500' : transaction.status === 'Not Paid' ? 'bg-gray-500' : 'bg-yellow-500'} rounded-full`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className='mr-4'>
                      <span className="inline-block py-1 text-nowrap px-2 text-purple-500 bg-purple-50 rounded-full">
                        {transaction.purchased}
                      </span>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </DashboardContent>
  );
}
