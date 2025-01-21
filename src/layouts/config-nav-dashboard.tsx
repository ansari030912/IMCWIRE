import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Press Release',
    path: '/press-release',
    icon: icon('ic-press'),
  },
  {
    title: 'Add Press Release',
    path: '/add-press-release',
    icon: icon('ic-addpress'),
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: icon('ic-report'),
  },
  {
    title: 'Packages',
    path: '/packages',
    icon: icon('ic-plans'),
  },
  {
    title: 'Transactions',
    path: '/transactions',
    icon: icon('ic-trasaction'),
  },
  {
    title: 'View Companies',
    path: '/companies',
    icon: icon('ic-company'),
  },
  {
    title: 'Add Company',
    path: '/add-company',
    icon: icon('ic-add-company'),
  },
  // {
  //   title: 'Product',
  //   path: '/products',
  //   icon: icon('ic-cart'),
  //   info: (
  //     <Label color="error" variant="inverted">
  //       +3
  //     </Label>
  //   ),
  // },
  {
    title: "How it work's",
    path: '/how-it-works',
    icon: icon('ic-how-it-work'),
  },
  {
    title: "FAQ's",
    path: '/faqs',
    icon: icon('ic-faq'),
  },
  {
    title: 'Log out',
    path: '/log-in',
    icon: icon('ic-logout'),
  },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic-disabled'),
  // },
];
