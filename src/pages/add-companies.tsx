import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { BlogView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { id } = useParams<{ id?: string }>();
  return (
    <>
      <Helmet>
        <title> {`Add Companies - ${CONFIG.appName}`}</title>
      </Helmet>

      <BlogView id={id} />
    </>
  );
}
