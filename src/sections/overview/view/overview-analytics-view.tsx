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
  const [salesData, setSalesData] = useState<any>(null); // Adjust the type as needed

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

  useEffect(() => {
    if (token && role) {
      setLoading(true);
      let salesUrl = '';
      if (role === 'user') {
        salesUrl = `${BASE_URL}/v1/pr/user-sales`;
      } else if (role === 'super_admin' || role === 'admin') {
        salesUrl = `${BASE_URL}/v1/pr/all-sales`;
      } else {
        // Fallback endpoint if role is unknown
        salesUrl = `${BASE_URL}/v1/pr/user-sales`;
      }
      axios
        .get(salesUrl, {
          headers: {
            'x-api-key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setSalesData(response.data);
        })
        .catch((err) => {
          console.error('Error fetching sales data:', err);
          setError('Error fetching sales data');
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
            percent={prData.NotStarted}
            total={prData.NotStarted}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                <g fill="none">
                  <path
                    fill="url(#fluentColorPersonAvailable240)"
                    d="M15.755 14a2.25 2.25 0 0 1 2.248 2.249v.918a2.75 2.75 0 0 1-.512 1.6C15.945 20.928 13.42 22 10 22c-3.422 0-5.945-1.072-7.487-3.236a2.75 2.75 0 0 1-.51-1.596v-.92a2.25 2.25 0 0 1 2.249-2.25z"
                  />
                  <path
                    fill="url(#fluentColorPersonAvailable241)"
                    d="M15.755 14a2.25 2.25 0 0 1 2.248 2.249v.918a2.75 2.75 0 0 1-.512 1.6C15.945 20.928 13.42 22 10 22c-3.422 0-5.945-1.072-7.487-3.236a2.75 2.75 0 0 1-.51-1.596v-.92a2.25 2.25 0 0 1 2.249-2.25z"
                  />
                  <path
                    fill="url(#fluentColorPersonAvailable245)"
                    fillOpacity="0.5"
                    d="M15.755 14a2.25 2.25 0 0 1 2.248 2.249v.918a2.75 2.75 0 0 1-.512 1.6C15.945 20.928 13.42 22 10 22c-3.422 0-5.945-1.072-7.487-3.236a2.75 2.75 0 0 1-.51-1.596v-.92a2.25 2.25 0 0 1 2.249-2.25z"
                  />
                  <path
                    fill="url(#fluentColorPersonAvailable242)"
                    d="M10 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10"
                  />
                  <path
                    fill="url(#fluentColorPersonAvailable243)"
                    d="M17.5 12a5.5 5.5 0 1 1 0 11a5.5 5.5 0 0 1 0-11"
                  />
                  <path
                    fill="url(#fluentColorPersonAvailable244)"
                    fillRule="evenodd"
                    d="M20.854 15.146a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708l1.646 1.647l3.646-3.647a.5.5 0 0 1 .708 0"
                    clipRule="evenodd"
                  />
                  <defs>
                    <linearGradient
                      id="fluentColorPersonAvailable240"
                      x1="5.809"
                      x2="8.394"
                      y1="15.063"
                      y2="23.319"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset=".125" stopColor="#304C91" />
                      <stop offset="1" stopColor="#456fd6" />
                    </linearGradient>
                    <linearGradient
                      id="fluentColorPersonAvailable241"
                      x1="10.004"
                      x2="13.624"
                      y1="13.047"
                      y2="26.573"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#3963ca" stopOpacity="0" />
                      <stop offset="1" stopColor="#eaeaea" />
                    </linearGradient>
                    <linearGradient
                      id="fluentColorPersonAvailable242"
                      x1="7.378"
                      x2="12.474"
                      y1="3.334"
                      y2="11.472"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset=".125" stopColor="#304C91" />
                      <stop offset="1" stopColor="#456fd6" />
                    </linearGradient>
                    <linearGradient
                      id="fluentColorPersonAvailable243"
                      x1="12.393"
                      x2="19.984"
                      y1="14.063"
                      y2="21.95"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#6289ac" />
                      <stop offset="1" stopColor="#8c949b" />
                    </linearGradient>
                    <linearGradient
                      id="fluentColorPersonAvailable244"
                      x1="15.313"
                      x2="16.45"
                      y1="15.51"
                      y2="21.13"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#fff" />
                      <stop offset="1" stopColor="#e3ffd9" />
                    </linearGradient>
                    <radialGradient
                      id="fluentColorPersonAvailable245"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientTransform="matrix(0 8.5 -8.49852 0 17.5 18.5)"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset=".493" stopColor="#4f1fb0" />
                      <stop offset=".912" stopColor="#4f1fb0" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </g>
              </svg>
            }
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [0, 30, 0, 90, 0, 84, 0, 12],
            }}
          />
        </Grid>
        {/* Pending Approval */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Pending Approval"
            percent={prData.Pending}
            total={prData.Pending}
            color="warning"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                <path
                  fill="#EAA214"
                  d="M15 16.69V13h1.5v2.82l2.44 1.41l-.75 1.3zM19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2L7.5 3.5L6 2L4.5 3.5L3 2v20l1.5-1.5L6 22l1.5-1.5L9 22l1.58-1.58c.14.19.3.36.47.53A7.001 7.001 0 0 0 21 11.1V2zM11.1 11c-.6.57-1.07 1.25-1.43 2H6v-2zm-2.03 4c-.07.33-.07.66-.07 1s0 .67.07 1H6v-2zM18 9H6V7h12zm2.85 7c0 .64-.12 1.27-.35 1.86c-.26.58-.62 1.14-1.07 1.57c-.43.45-.99.81-1.57 1.07c-.59.23-1.22.35-1.86.35c-2.68 0-4.85-2.17-4.85-4.85c0-1.29.51-2.5 1.42-3.43c.93-.91 2.14-1.42 3.43-1.42c2.67 0 4.85 2.17 4.85 4.85"
                />
              </svg>
            }
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [39, 32, 31, 0, 100, 0, 0, 12],
            }}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Approved"
            percent={prData.Approved}
            total={prData.Approved}
            color="success"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                <path
                  fill="#138D59"
                  d="m17.275 20.25l3.475-3.45l-1.05-1.05l-2.425 2.375l-.975-.975l-1.05 1.075zM6 9h12V7H6zm12 14q-2.075 0-3.537-1.463T13 18t1.463-3.537T18 13t3.538 1.463T23 18t-1.463 3.538T18 23M3 22V3h18v8.675q-.7-.35-1.463-.513T18 11H6v2h7.1q-.425.425-.787.925T11.675 15H6v2h5.075q-.05.25-.062.488T11 18q0 1.05.288 2.013t.862 1.837L12 22l-1.5-1.5L9 22l-1.5-1.5L6 22l-1.5-1.5z"
                />
              </svg>
            }
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [0, 0, 15, 73, 34, 53, 0, 0],
            }}
          />
        </Grid>
        {/* Completed PR's */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Completed PR's"
            percent={prData.Published}
            total={prData.Published}
            color="error"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                <path
                  fill="#E2472E"
                  fillRule="evenodd"
                  d="M3.04 2.292a.75.75 0 0 0-.497 1.416l.261.091c.668.235 1.107.39 1.43.549c.303.149.436.27.524.398c.09.132.16.314.2.677c.04.38.042.875.042 1.615V9.64c0 2.942.063 3.912.93 4.826c.866.914 2.26.914 5.05.914h5.302c1.561 0 2.342 0 2.893-.45c.552-.45.71-1.214 1.025-2.742l.5-2.425c.347-1.74.52-2.609.076-3.186S18.816 6 17.131 6H6.492a9 9 0 0 0-.043-.738c-.054-.497-.17-.95-.452-1.362c-.284-.416-.662-.682-1.103-.899c-.412-.202-.936-.386-1.552-.603zm12.477 6.165c.3.286.312.76.026 1.06l-2.857 3a.75.75 0 0 1-1.086 0l-1.143-1.2a.75.75 0 1 1 1.086-1.034l.6.63l2.314-2.43a.75.75 0 0 1 1.06-.026"
                  clipRule="evenodd"
                />
                <path
                  fill="#E2472E"
                  d="M7.5 18a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3m9 0a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3"
                />
              </svg>
            }
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [55, 12, 42, 40, 53, 0, 0, 12],
            }}
          />
        </Grid>

        {role === 'super_admin' ? (
          <>
            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="TODAY"
                percent={salesData?.today}
                total={salesData?.today}
                color="secondary"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#432D69"
                      d="M7 10h5v5H7m12 4H5V8h14m0-5h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"
                    />
                  </svg>
                }
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                  series: [55, 12, 42, 40, 53, 0, 0, 12],
                }}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="THIS WEEK"
                percent={salesData?.thisWeek}
                total={salesData?.thisWeek}
                color="secondary"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="#432D69"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm12-4v4M8 3v4m-4 4h16M7 14h.013m2.997 0h.005m2.995 0h.005m3 0h.005m-3.005 3h.005m-6.01 0h.005m2.995 0h.005"
                    />
                  </svg>
                }
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                  series: [0, 0, 15, 73, 34, 53, 0, 0],
                }}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="THIS MONTH"
                percent={salesData?.thisWeek}
                total={salesData?.thisWeek}
                color="secondary"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#432D69"
                      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 16H5V10h14zM9 14H7v-2h2zm4 0h-2v-2h2zm4 0h-2v-2h2zm-8 4H7v-2h2zm4 0h-2v-2h2zm4 0h-2v-2h2z"
                    />
                  </svg>
                }
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                  series: [39, 32, 31, 0, 100, 0, 0, 12],
                }}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="THIS YEAR"
                percent={salesData?.thisYear}
                total={salesData?.thisYear}
                color="secondary"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 2048 2048"
                  >
                    <path
                      fill="#432D69"
                      d="M1664 512h256v1536H256V512h256V384h128v128h896V384h128zm128 128h-128v128h128zm-256 0H640v128h896zm-1024 0H384v128h128zM384 1920h1408V896H384zM256 384V256H128v1408H0V128h256V0h128v128h896V0h128v128h256v128h-256v128h-128V256H384v128zm384 1024v-128h128v128zm256 0v-128h128v128zm256 0v-128h128v128zm256 0v-128h128v128zm-768 256v-128h128v128zm256 0v-128h128v128zm256 0v-128h128v128zm-256-512v-128h128v128zm256 0v-128h128v128zm256 0v-128h128v128z"
                    />
                  </svg>
                }
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                  series: [0, 30, 0, 90, 0, 84, 0, 12],
                }}
              />
            </Grid>

            {/* Completed PR's */}
          </>
        ) : (
          ''
        )}
        {/* Pending Approval */}

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
