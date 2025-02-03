import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import AddFAQView from 'src/sections/faq/view/add-faq';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Add Faqs - ${CONFIG.appName}`}</title>
      </Helmet>

      <AddFAQView />
    </>
  );
}
