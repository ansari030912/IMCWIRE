import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ResetPasswordView } from 'src/sections/auth/reset-password';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Reset passowrd - ${CONFIG.appName}`}</title>
      </Helmet>

      <ResetPasswordView />
    </>
  );
}
