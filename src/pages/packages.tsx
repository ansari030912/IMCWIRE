import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PackagesView } from 'src/sections/packages/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Packages - ${CONFIG.appName}`}</title>
      </Helmet>

      <PackagesView />
    </>
  );
}
