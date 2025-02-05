import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import PlanView from 'src/sections/plans/view/plan';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Plans - ${CONFIG.appName}`}</title>
      </Helmet>
      {/* <br /> */}
      {/* <br /> */}
      <PlanView />
    </>
  );
}
