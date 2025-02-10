
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { UserTransaction } from '../UserTransaction';


// ----------------------------------------------------------------------
// interface BlogViewProps {
//   id?: string; // Define id as an optional prop
// } { id }: BlogViewProps
export function UserTransation() {
  return (
    <DashboardContent>
      <UserTransaction />
    </DashboardContent>
  );
}
