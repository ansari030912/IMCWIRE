import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AddCustomPlanView } from 'src/sections/add-custom-plan/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Add Custom Innvoice - ${CONFIG.appName}`}</title>
      </Helmet>

      <AddCustomPlanView />
    </>
  );
}
