import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import AddVideoView from 'src/sections/add-videos/view/add-video';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Add Videos - ${CONFIG.appName}`}</title>
      </Helmet>

      <AddVideoView />
    </>
  );
}
