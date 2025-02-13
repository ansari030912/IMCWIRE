import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import ThankyouPaypro from 'src/sections/thankyou-paypro/view/thankyoupaypro';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      {/* <Helmet>
        <title> {`Transaction History - ${CONFIG.appName}`}</title>
      </Helmet> */}

      <ThankyouPaypro />
    </>
  );
}
