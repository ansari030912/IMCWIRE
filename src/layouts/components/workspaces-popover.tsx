import type { BoxProps } from '@mui/material/Box';

import Cookies from 'js-cookie';

import Box from '@mui/material/Box';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { _workspaces } from '../config-nav-workspace';

// ----------------------------------------------------------------------

export type WorkspacesPopoverProps = BoxProps & {
  // You can pass a data array if needed; however, in this example, we use _workspaces directly.
};

export function WorkspacesPopover({ sx, ...other }: WorkspacesPopoverProps) {
  // Retrieve the user data from cookies.
  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
  // Default to "user" if no valid role is found.
  const role = user?.role || 'user';
  // Convert the role to the expected title.
  const roleTitle = role === 'super_admin' ? 'SUPER ADMIN' : role.toUpperCase();
  // Find the matching workspace from the _workspaces array.
  const workspace = _workspaces.find((ws) => ws.name === roleTitle);

  return (
    <Box
      component="div"
      sx={{
        pl: 2,
        py: 3,
        gap: 1.5,
        pr: 1.5,
        width: 1,
        borderRadius: 1.5,
        textAlign: 'left',
        justifyContent: 'flex-start',
        bgcolor: '#f1eaff',
        display: 'flex',
        alignItems: 'center',
        ...sx,
      }}
      {...other}
    >
      {workspace && (
        <>
          <Box
            component="img"
            alt={workspace.name}
            src={workspace.logo}
            sx={{ width: 24, height: 24, borderRadius: '50%' }}
          />

          <Box
            gap={1}
            flexGrow={1}
            display="flex"
            alignItems="center"
            sx={{ typography: 'body2', fontWeight: 'fontWeightSemiBold' }}
          >
            {workspace.name}
            <Label color={workspace.plan === 'Free' ? 'default' : 'info'}>{workspace.plan}</Label>
          </Box>
        </>
      )}
    </Box>
  );
}
