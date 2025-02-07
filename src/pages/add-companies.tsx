import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import AddCompanyView from 'src/sections/add-comapnies/view/company';


// ----------------------------------------------------------------------

export default function Page() {

  return (
    <>
      <Helmet>
        <title> {`Add Companies - ${CONFIG.appName}`}</title>
      </Helmet>

      {/* <BlogView id={id} /> */}
      <AddCompanyView />
    </>
  );
}
