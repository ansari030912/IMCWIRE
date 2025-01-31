import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { UserTransation } from 'src/sections/transactions/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Transaction History - ${CONFIG.appName}`}</title>
      </Helmet>

      <UserTransation />
    </>
  );
}
