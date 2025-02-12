import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { UpdateProfileView } from 'src/sections/auth/update-profile';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Setting - ${CONFIG.appName}`}</title>
      </Helmet>

      <UpdateProfileView />
    </>
  );
}
