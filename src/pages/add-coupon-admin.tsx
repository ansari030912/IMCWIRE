import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import AddCupponView from 'src/sections/add-cuppon/view/add-cuppon';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Add Coupons - ${CONFIG.appName}`}</title>
      </Helmet>

      <AddCupponView />
    </>
  );
}
