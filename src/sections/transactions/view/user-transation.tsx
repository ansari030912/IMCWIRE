
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';


// ----------------------------------------------------------------------
// interface BlogViewProps {
//   id?: string; // Define id as an optional prop
// } { id }: BlogViewProps
export function UserTransation() {
  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Transation History
        </Typography>
        {/* <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          New post
        </Button> */}
      </Box>
    </DashboardContent>
  );
}
