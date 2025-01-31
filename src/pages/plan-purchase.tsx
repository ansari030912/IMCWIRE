import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PackagesView } from 'src/sections/packages/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Purcahse - ${CONFIG.appName}`}</title>
      </Helmet>
      {/* <br /> */}
      {/* <br /> */}
      <PackagesView />
    </>
  );
}
