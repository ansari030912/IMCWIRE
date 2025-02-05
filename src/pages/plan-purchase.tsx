import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { PackagesView } from 'src/sections/packages/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { id } = useParams<{ id?: string }>();
  return (
    <>
      <Helmet>
        <title> {`Purcahse - ${CONFIG.appName}`}</title>
      </Helmet>
      {/* <br /> */}
      {/* <br /> */}
      <PackagesView id={id} />
    </>
  );
}
