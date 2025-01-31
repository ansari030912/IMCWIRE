import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AdminTransaction } from 'src/sections/admin-transaction/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Transactions History- ${CONFIG.appName}`}</title>
      </Helmet>

      <AdminTransaction />
    </>
  );
}
