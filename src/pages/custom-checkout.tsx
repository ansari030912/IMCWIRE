import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { CustomPlanCheckOutView } from 'src/sections/add-custom-plan/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { id } = useParams<{ id?: string }>();
  return (
    <>
      <Helmet>
        <title> {`Custom Invoice Checkout - ${CONFIG.appName}`}</title>
      </Helmet>

      <CustomPlanCheckOutView id={id} />
    </>
  );
}
