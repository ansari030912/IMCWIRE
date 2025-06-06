import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { UserView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`All Users - ${CONFIG.appName}`}</title>
      </Helmet>

      <UserView />
    </>
  );
}
