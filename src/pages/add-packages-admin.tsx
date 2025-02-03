import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import AddPlanView from 'src/sections/add-plans/view/add-plan';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Add Packages - ${CONFIG.appName}`}</title>
      </Helmet>

      <AddPlanView />
    </>
  );
}
