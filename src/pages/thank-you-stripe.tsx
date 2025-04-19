import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import ThankyouStripe from 'src/sections/thankyou-stripe/view/thankyoustripe';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`ThankYou - ${CONFIG.appName}`}</title>
      </Helmet>

      <ThankyouStripe />
    </>
  );
}
