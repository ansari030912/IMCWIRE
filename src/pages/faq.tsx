import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import FAQView from 'src/sections/faq/view/faq';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`FAQ's - ${CONFIG.appName}`}</title>
      </Helmet>

      <FAQView />
    </>
  );
}
