import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import HowItWorkView from 'src/sections/how-it-works/view/how-it-work';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`How It Works - ${CONFIG.appName}`}</title>
      </Helmet>

      <HowItWorkView />
    </>
  );
}
