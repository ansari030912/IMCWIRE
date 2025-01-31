import { SvgColor } from 'src/components/svg-color';

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

// Navigation for Regular Users
export const userNavData = [
  {
    title: 'Dashboard',
    items: [
      { title: 'Dashboard', path: '/', icon: icon('ic-analytics') },
      { title: 'Reports', path: '/reports', icon: icon('ic-report') },
      { title: 'Transactions History', path: '/transactions', icon: icon('ic-trasaction') },
    ],
  },
  {
    title: 'Press Releases',
    items: [
      { title: 'Press Release', path: '/press-release', icon: icon('ic-press') },
      { title: 'Add Press Release', path: '/add-press-release', icon: icon('ic-addpress') },
    ],
  },
  {
    title: 'Companies',
    items: [
      { title: 'View Companies', path: '/companies', icon: icon('ic-company') },
      { title: 'Add Company', path: '/add-company', icon: icon('ic-add-company') },
    ],
  },
  {
    title: 'Packages',
    items: [{ title: 'Packages', path: '/packages', icon: icon('ic-plans') }],
  },
  {
    title: 'Settings',
    items: [
      { title: 'How It Works', path: '/how-it-works', icon: icon('ic-how-it-work') },
      { title: "FAQ's", path: '/faqs', icon: icon('ic-faq') },
    ],
  },
];

// Navigation for Admins (Includes All Links)
export const adminNavData = [
  {
    title: 'Dashboard',
    items: [
      { title: 'Dashboard', path: '/', icon: icon('ic-analytics') },
      // { title: 'Reports', path: '/reports', icon: icon('ic-report') },
      // { title: 'Transactions', path: '/transactions', icon: icon('ic-trasaction') },
    ],
  },
  {
    title: 'Press Releases',
    items: [
      { title: 'Press Release', path: '/press-release', icon: icon('ic-press') },
      { title: 'Add Press Release', path: '/add-press-release', icon: icon('ic-addpress') },
    ],
  },
  {
    title: 'Companies',
    items: [
      { title: 'View Companies', path: '/companies', icon: icon('ic-company') },
      { title: 'Add Company', path: '/add-company', icon: icon('ic-add-company') },
    ],
  },
  // {
  //   title: 'Packages',
  //   items: [{ title: 'Packages', path: '/packages', icon: icon('ic-plans') }],
  // },
  // {
  //   title: 'Settings',
  //   items: [
  //     { title: 'How It Works', path: '/how-it-works', icon: icon('ic-how-it-work') },
  //     { title: "FAQ's", path: '/faqs', icon: icon('ic-faq') },
  //   ],
  // },
];
export const superAdminNavData = [
  {
    title: 'Dashboard',
    items: [
      { title: 'Dashboard', path: '/', icon: icon('ic-analytics') },
      // { title: 'Reports', path: '/reports', icon: icon('ic-report') },
      { title: 'Transactions History', path: '/all-transactions', icon: icon('ic-trasaction') },
      { title: 'All Customers', path: '/users', icon: icon('ic-users') },
    ],
  },
  {
    title: 'Press Releases',
    items: [{ title: 'Press Release', path: '/press-release', icon: icon('ic-press') }],
  },
  {
    title: 'Companies',
    items: [
      { title: 'View Companies', path: '/companies', icon: icon('ic-company') },
      // { title: 'Add Company', path: '/add-company', icon: icon('ic-add-company') },
    ],
  },
  {
    title: 'Packages',
    items: [{ title: 'Packages', path: '/packages', icon: icon('ic-plans') }],
  },
  {
    title: 'Settings',
    items: [
      { title: 'How It Works', path: '/how-it-works', icon: icon('ic-how-it-work') },
      { title: "FAQ's", path: '/faqs', icon: icon('ic-faq') },
    ],
  },
  {
    title: 'Add On',
    items: [
      { title: 'Add Coupons', path: '/add-coupons', icon: icon('ic-add') },
      { title: 'Add Packages', path: '/add-packages', icon: icon('ic-add') },
      { title: 'Add FAQ', path: '/add-faqs', icon: icon('ic-add') },
    ],
  },
];
