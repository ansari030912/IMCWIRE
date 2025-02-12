import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import PressReleaseView from 'src/sections/press-release/view/order';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Press Release - ${CONFIG.appName}`}</title>
      </Helmet>

      <PressReleaseView />
    </>
  );
}
