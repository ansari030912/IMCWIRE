import { SvgColor } from 'src/components/svg-color';

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

// Role-Based Menu Data
export const navData = [
  {
    title: 'Dashboard',
    items: [
      { title: 'Dashboard', path: '/', icon: icon('ic-analytics') },
      { title: 'Reports', path: '/reports', icon: icon('ic-report') },
      { title: 'Transactions', path: '/transactions', icon: icon('ic-trasaction') },
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
      { title: 'Log out', path: '/log-in', icon: icon('ic-logout') },
    ],
  },
];
