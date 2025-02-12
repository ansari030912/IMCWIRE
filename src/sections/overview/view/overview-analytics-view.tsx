// import axios from 'axios';
// import Cookies from 'js-cookie';
// import { useState, useEffect } from 'react';

// import Grid from '@mui/material/Unstable_Grid2';
// import Typography from '@mui/material/Typography';

// import { DashboardContent } from 'src/layouts/dashboard';

// import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

// import DahboardVideos from 'src/sections/dashboard-videos/dashboard-video';

// import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
// import { AnalyticsCurrentVisits } from '../analytics-current-visits';
// import { AnalyticsConversionRates } from '../analytics-conversion-rates';

// // ----------------------------------------------------------------------
// // // Define TypeScript types for PR data
// interface PRData {
//   NotStarted: number;
//   Pending: number;
//   Approved: number;
//   InProgress: number;
//   Published: number;
//   Rejected: number;
// }
// export function OverviewAnalyticsView() {
//   const [token, setToken] = useState<string | null>(null);
//   const [prData, setPrData] = useState<PRData>({
//     NotStarted: 0,
//     Pending: 0,
//     Approved: 0,
//     InProgress: 0,
//     Published: 0,
//     Rejected: 0,
//   });
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const userTokenString = Cookies.get('user');
//     if (userTokenString) {
//       try {
//         const userToken = JSON.parse(userTokenString);
//         setToken(userToken.token as string);
//       } catch (err) {
//         console.error('Error parsing user token:', err);
//         setError('Invalid user token');
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (token) {
//       setLoading(true);
//       axios
//         .get<{ data: PRData }>(`${BASE_URL}/v1/pr/get-single-pr/user/statuses`, {
//           headers: {
//             'x-api-key': X_API_KEY,
//             Authorization: `Bearer ${token}`,
//           },
//         })
//         .then((response) => {
//           if (response.data && response.data.data) {
//             setPrData(response.data.data);
//           }
//         })
//         .catch((err) => {
//           console.error('Error fetching PR status counts:', err);
//           setError('Error fetching data');
//         })
//         .finally(() => {
//           setLoading(false);
//         });
//     }
//   }, [token]);
//   console.log(prData);
//   return (
//     <DashboardContent maxWidth="xl">
//       <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
//         Hi, Welcome back 👋
//       </Typography>

//       <Grid container spacing={3}>
//         <Grid xs={12} sm={6} md={3}>
//           <AnalyticsWidgetSummary
//             title="Not Started PR's"
//             percent={0}
//             total={0}
//             icon={<img alt="icon" src="/assets/icons/glass/ic-glass-bag.svg" />}
//             chart={{
//               categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
//               series: [22, 8, 35, 50, 82, 84, 77, 12],
//             }}
//           />
//         </Grid>

//         <Grid xs={12} sm={6} md={3}>
//           <AnalyticsWidgetSummary
//             title="In Progress"
//             percent={0}
//             total={0}
//             color="secondary"
//             icon={<img alt="icon" src="/assets/icons/glass/ic-glass-users.svg" />}
//             chart={{
//               categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
//               series: [56, 47, 40, 62, 73, 30, 23, 54],
//             }}
//           />
//         </Grid>

//         <Grid xs={12} sm={6} md={3}>
//           <AnalyticsWidgetSummary
//             title="Pending Approval"
//             percent={0}
//             total={0}
//             color="warning"
//             icon={<img alt="icon" src="/assets/icons/glass/ic-glass-buy.svg" />}
//             chart={{
//               categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
//               series: [40, 70, 50, 28, 70, 75, 7, 64],
//             }}
//           />
//         </Grid>

//         <Grid xs={12} sm={6} md={3}>
//           <AnalyticsWidgetSummary
//             title="Completed PR's"
//             percent={0}
//             total={0}
//             color="error"
//             icon={<img alt="icon" src="/assets/icons/glass/ic-glass-message.svg" />}
//             chart={{
//               categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
//               series: [56, 30, 23, 54, 47, 40, 62, 73],
//             }}
//           />
//         </Grid>

//         <Grid xs={12} md={6} lg={4}>
//           <AnalyticsCurrentVisits
//             title="Current visits"
//             chart={{
//               series: [
//                 { label: 'America', value: 3500 },
//                 { label: 'Asia', value: 2500 },
//                 { label: 'Europe', value: 1500 },
//                 { label: 'Africa', value: 500 },
//               ],
//             }}
//           />
//         </Grid>

//         {/* <Grid xs={12} md={6} lg={8}>
//           <AnalyticsWebsiteVisits
//             title="Website visits"
//             subheader="(+43%) than last year"
//             chart={{
//               categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
//               series: [
//                 { name: 'Team A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
//                 { name: 'Team B', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
//               ],
//             }}
//           />
//         </Grid> */}

//         <Grid xs={12} md={6} lg={8}>
//           <AnalyticsConversionRates
//             title="Current Users Analytics"
//             subheader="(+73%) than last year"
//             chart={{
//               categories: ['Italy', 'Japan', 'China', 'Canada', 'France'],
//               series: [
//                 { name: '2023', data: [572, 125, 343, 2223, 512] },
//                 { name: '2024', data: [828, 329, 753, 3155, 1242] },
//               ],
//             }}
//           />
//         </Grid>

//         {/* <Grid xs={12} md={6} lg={4}>
//           <AnalyticsCurrentSubject
//             title="Current subject"
//             chart={{
//               categories: ['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math'],
//               series: [
//                 { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
//                 { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
//                 { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
//               ],
//             }}
//           />
//         </Grid> */}
//         {/*
//         <Grid xs={12} md={6} lg={8}>
//           <AnalyticsNews title="News" list={_posts.slice(0, 5)} />
//         </Grid> */}
//         {/*
//         <Grid xs={12} md={6} lg={4}>
//           <AnalyticsOrderTimeline title="Order timeline" list={_timeline} />
//         </Grid> */}
//         {/* <Grid xs={12} md={6} lg={4}>
//           <AnalyticsOrderTimeline title="Order timeline" list={_timeline} />
//         </Grid>
//         <Grid xs={12} md={6} lg={4}>
//           <AnalyticsOrderTimeline title="Order timeline" list={_timeline} />
//         </Grid> */}
//       </Grid>
//       <br />
//       <DahboardVideos />
//     </DashboardContent>
//   );
// }

import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { Box, CircularProgress } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

import DashboardFAQSection from 'src/sections/faq/view/dashboardfaq';
import DahboardVideos from 'src/sections/dashboard-videos/dashboard-video';
import DashboardPlanView from 'src/sections/dashbaord-plans.tsx/dashboard-plan';

import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';

// ----------------------------------------------------------------------
// Define TypeScript types for PR data
interface PRData {
  NotStarted: number;
  Pending: number;
  Approved: number;
  InProgress: number;
  Published: number;
  Rejected: number;
}

export function OverviewAnalyticsView() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [prData, setPrData] = useState<PRData>({
    NotStarted: 0,
    Pending: 0,
    Approved: 0,
    InProgress: 0,
    Published: 0,
    Rejected: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Parse the user cookie to extract token and role
  useEffect(() => {
    const userTokenString = Cookies.get('user');
    if (userTokenString) {
      try {
        const userData = JSON.parse(userTokenString);
        setToken(userData.token as string);
        setRole(userData.role); // e.g. "user" or "super_admin"
      } catch (err) {
        console.error('Error parsing user token:', err);
        setError('Invalid user token');
      }
    }
  }, []);

  // Fetch PR status counts based on role
  useEffect(() => {
    if (token && role) {
      setLoading(true);
      let url = '';
      if (role === 'user') {
        url = `${BASE_URL}/v1/pr/get-single-pr/user/statuses`;
      } else if (role === 'super_admin' || role === 'admin') {
        url = `${BASE_URL}/v1/pr/get-single-pr/superadmin/statuses`;
      } else {
        // Fallback endpoint if role is unknown
        url = `${BASE_URL}/v1/pr/get-single-pr/user/statuses`;
      }
      axios
        .get<{ data: PRData }>(url, {
          headers: {
            'x-api-key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data && response.data.data) {
            setPrData(response.data.data);
          }
        })
        .catch((err) => {
          console.error('Error fetching PR status counts:', err);
          setError('Error fetching data');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token, role]);

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        {/* Not Started PR's */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Not Started PR's"
            percent={0}
            total={prData.NotStarted}
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid>

        {/* In Progress */}
        {/* <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="In Progress"
            percent={0}
            total={prData.InProgress}
            color="secondary"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 47, 40, 62, 73, 30, 23, 54],
            }}
          />
        </Grid> */}

        {/* Pending Approval */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Pending Approval"
            percent={0}
            total={prData.Pending}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [40, 70, 50, 28, 70, 75, 7, 64],
            }}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Approved"
            percent={0}
            total={prData.Approved}
            color="secondary"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 47, 40, 62, 73, 30, 23, 54],
            }}
          />
        </Grid>
        {/* Completed PR's */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Completed PR's"
            percent={0}
            total={prData.Published}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 30, 23, 54, 47, 40, 62, 73],
            }}
          />
        </Grid>

        {/* Other analytics sections */}
        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentVisits
            title="Current visits"
            chart={{
              series: [
                { label: 'America', value: 3500 },
                { label: 'Asia', value: 2500 },
                { label: 'Europe', value: 1500 },
                { label: 'Africa', value: 500 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsConversionRates
            title="Current Users Analytics"
            subheader="(+73%) than last year"
            chart={{
              categories: ['Italy', 'China', 'Canada', 'France', 'United State'],
              series: [
                { name: '2023', data: [572, 343, 2223, 512, 5812] },
                { name: '2024', data: [828, 753, 3155, 1242, 7012] },
              ],
            }}
          />
        </Grid>
      </Grid>
      <DashboardPlanView />
      <br />
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center my-4">
          {/* Heading with left and right lines */}
          <div className="flex items-center w-full max-w-6xl">
            <div className="flex-grow border-t border-gray-300" />
            <h1 className="mx-4 text-3xl font-bold text-purple-800">How it Works!</h1>
            <div className="flex-grow border-t border-gray-300" />
          </div>
        </div>
      </div>
      <DahboardVideos />
      <DashboardFAQSection />
    </DashboardContent>
  );
}
