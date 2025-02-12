import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AllOrdersView } from 'src/sections/all-orders/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`All Orders - ${CONFIG.appName}`}</title>
      </Helmet>

      <AllOrdersView />
    </>
  );
}
