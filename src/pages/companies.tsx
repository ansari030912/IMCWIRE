import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { BlogView } from 'src/sections/blog/view';
import ViewCompany from 'src/sections/companies/view/ViewCompany';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Companies - ${CONFIG.appName}`}</title>
      </Helmet>

      <ViewCompany />
    </>
  );
}
