import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { BlogView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Add Press Release - ${CONFIG.appName}`}</title>
      </Helmet>

      <BlogView />
    </>
  );
}
