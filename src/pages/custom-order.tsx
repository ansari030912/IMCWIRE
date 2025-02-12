import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AddCustomOrderView } from 'src/sections/custom-order/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Custom Order - ${CONFIG.appName}`}</title>
      </Helmet>

      {/* <BlogView id={id} /> */}
      <AddCustomOrderView />
    </>
  );
}
