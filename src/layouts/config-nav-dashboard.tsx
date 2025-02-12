import { SvgColor } from 'src/components/svg-color';

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

// Navigation for Regular Users
export const userNavData = [
  {
    title: 'Dashboard',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: icon('ic-analytics') },
      // { title: 'Reports', path: '/reports', icon: icon('ic-report') },
      {
        title: 'Transactions History',
        path: '/dashboard/transactions',
        icon: icon('ic-trasaction'),
      },
    ],
  },
  {
    title: 'Press Releases',
    items: [
      { title: 'Press Release', path: '/dashboard/press-release', icon: icon('ic-press') },
      // { title: 'Add Press Release', path: '/dashboard/add-press-release', icon: icon('ic-addpress') },
    ],
  },
  {
    title: 'Companies',
    items: [
      // { title: 'View Companies', path: '/dashboard/companies', icon: icon('ic-company') },
      { title: 'Companies', path: '/dashboard/add-company', icon: icon('ic-add-company') },
    ],
  },
  {
    title: 'Packages',
    items: [{ title: 'Plans', path: '/dashboard/plans', icon: icon('ic-plans') }],
  },
  {
    title: 'Settings',
    items: [
      { title: 'How It Works', path: '/dashboard/how-it-works', icon: icon('ic-how-it-work') },
      { title: "FAQ's", path: '/dashboard/faqs', icon: icon('ic-faq') },
    ],
  },
];

// Navigation for Admins (Includes All Links)
export const adminNavData = [
  {
    title: 'Dashboard',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: icon('ic-analytics') },
      // { title: 'Reports', path: '/dashboard/reports', icon: icon('ic-report') },
      {
        title: 'Transactions History',
        path: '/dashboard/all-transactions',
        icon: icon('ic-trasaction'),
      },
      { title: 'All Orders', path: '/dashboard/all-orders', icon: icon('ic-orders') },
      // { title: 'All Customers', path: '/dashboard/users', icon: icon('ic-users') },
    ],
  },
  // {
  //   title: 'Press Releases',
  //   items: [{ title: 'Press Release', path: '/dashboard/press-release', icon: icon('ic-press') }],
  // },
  {
    title: 'Companies',
    items: [
      { title: 'View Companies', path: '/dashboard/companies', icon: icon('ic-company') },
      // { title: 'Add Company', path: '/dashboard/add-company', icon: icon('ic-add-company') },
    ],
  },
  // {
  //   title: 'Packages & Products',
  //   items: [{ title: 'Plans', path: '/dashboard/plans', icon: icon('ic-plans') }],
  // },
  // {
  //   title: 'Settings',
  //   items: [
  //     { title: 'How It Works', path: '/dashboard/how-it-works', icon: icon('ic-how-it-work') },
  //     { title: "FAQ's", path: '/dashboard/faqs', icon: icon('ic-faq') },
  //   ],
  // },
  {
    title: 'Add On',
    items: [
      { title: 'Add Coupons', path: '/dashboard/add-coupons', icon: icon('ic-add') },
      { title: 'Add Custom Invoice', path: '/dashboard/add-custom-invoice', icon: icon('ic-add') },
      { title: 'Add Packages', path: '/dashboard/add-packages', icon: icon('ic-add') },
      { title: 'Add FAQ', path: '/dashboard/add-faqs', icon: icon('ic-add') },
      { title: 'Add Videos', path: '/dashboard/add-videos', icon: icon('ic-add') },
    ],
  },
];
export const superAdminNavData = [
  {
    title: 'Dashboard',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: icon('ic-analytics') },
      // { title: 'Reports', path: '/dashboard/reports', icon: icon('ic-report') },
      {
        title: 'Transactions History',
        path: '/dashboard/all-transactions',
        icon: icon('ic-trasaction'),
      },
      { title: 'All Customers', path: '/dashboard/users', icon: icon('ic-users') },
      { title: 'All Orders', path: '/dashboard/all-orders', icon: icon('ic-orders') },
    ],
  },
  // {
  //   title: 'Press Releases',
  //   items: [{ title: 'Press Release', path: '/dashboard/press-release', icon: icon('ic-press') }],
  // },
  {
    title: 'Companies',
    items: [
      { title: 'View Companies', path: '/dashboard/companies', icon: icon('ic-company') },
      // { title: 'Add Company', path: '/dashboard/add-company', icon: icon('ic-add-company') },
    ],
  },
  // {
  //   title: 'Packages & Products',
  //   items: [{ title: 'Plans', path: '/dashboard/plans', icon: icon('ic-plans') }],
  // },
  // {
  //   title: 'Settings',
  //   items: [
  //     { title: 'How It Works', path: '/dashboard/how-it-works', icon: icon('ic-how-it-work') },
  //     { title: "FAQ's", path: '/dashboard/faqs', icon: icon('ic-faq') },
  //   ],
  // },
  {
    title: 'Add On',
    items: [
      { title: 'Add Coupons', path: '/dashboard/add-coupons', icon: icon('ic-add') },
      { title: 'Add Custom Invoice', path: '/dashboard/add-custom-invoice', icon: icon('ic-add') },
      {
        title: 'Generate Custom Order',
        path: '/dashboard/custom-order',
        icon: icon('ic-add'),
      },
      { title: 'Add Packages', path: '/dashboard/add-packages', icon: icon('ic-add') },
      { title: 'Add FAQ', path: '/dashboard/add-faqs', icon: icon('ic-add') },
      { title: 'Add Videos', path: '/dashboard/add-videos', icon: icon('ic-add') },
    ],
  },
];
