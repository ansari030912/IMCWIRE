import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import ButtonBase from '@mui/material/ButtonBase';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { varAlpha } from 'src/theme/styles';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type WorkspacesPopoverProps = ButtonBaseProps & {
  data?: {
    id: string;
    name: string;
    logo: string;
    plan: string;
  }[];
};

export function WorkspacesPopover({ data = [], sx, ...other }: WorkspacesPopoverProps) {
  const [workspace, setWorkspace] = useState(data[0]);

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleChangeWorkspace = useCallback(
    (newValue: (typeof data)[number]) => {
      setWorkspace(newValue);
      handleClosePopover();
    },
    [handleClosePopover]
  );

  const renderAvatar = (alt: string, src: string) => (
    <Box component="img" alt={alt} src={src} sx={{ width: 24, height: 24, borderRadius: '50%' }} />
  );

  const renderLabel = (plan: string) => (
    <Label color={plan === 'Free' ? 'default' : 'info'}>{plan}</Label>
  );

  return (
    <>
      <ButtonBase
        disableRipple
        onClick={handleOpenPopover}
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
          ...sx,
        }}
        {...other}
      >
        {renderAvatar(workspace?.name, workspace?.logo)}

        <Box
          gap={1}
          flexGrow={1}
          display="flex"
          alignItems="center"
          sx={{ typography: 'body2', fontWeight: 'fontWeightSemiBold' }}
        >
          {workspace?.name}
          {renderLabel(workspace?.plan)}
        </Box>

        <Iconify width={16} icon="carbon:chevron-sort" sx={{ color: 'text.disabled' }} />
      </ButtonBase>

      <Popover open={!!openPopover} anchorEl={openPopover} onClose={handleClosePopover}>
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 260,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              p: 1.5,
              gap: 1.5,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: {
                bgcolor: 'action.selected',
                fontWeight: 'fontWeightSemiBold',
              },
            },
          }}
        >
          {data.map((option) => (
            <MenuItem
              key={option.id}
              selected={option.id === workspace?.id}
              onClick={() => handleChangeWorkspace(option)}
            >
              {renderAvatar(option.name, option.logo)}

              <Box component="span" sx={{ flexGrow: 1 }}>
                {option.name}
              </Box>

              {renderLabel(option.plan)}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  );
}



// import type { ButtonBaseProps } from '@mui/material/ButtonBase';
// import { useState, useCallback, useEffect } from 'react';
// import Cookies from 'js-cookie';

// import Box from '@mui/material/Box';
// import Popover from '@mui/material/Popover';
// import MenuList from '@mui/material/MenuList';
// import ButtonBase from '@mui/material/ButtonBase';
// import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

// import { Label } from 'src/components/label';
// import { Iconify } from 'src/components/iconify';

// // ----------------------------------------------------------------------

// // Mapping workspace names to roles
// const workspaceToRole: Record<string, string> = {
//   'USER': 'user',
//   'ADMIN': 'admin',
//   'SUPER ADMIN': 'super_admin',
// };

// const roleToWorkspace: Record<string, string> = {
//   'user': 'USER',
//   'admin': 'ADMIN',
//   'super_admin': 'SUPER ADMIN',
// };

// export type WorkspacesPopoverProps = ButtonBaseProps & {
//   data?: {
//     id: string;
//     name: string;
//     logo: string;
//     plan: string;
//   }[];
// };

// export function WorkspacesPopover({ data = [], sx, ...other }: WorkspacesPopoverProps) {
//   // Get user from cookies
//   const getUserFromCookies = useCallback(() => {
//     const userData = Cookies.get('user');
//     return userData ? JSON.parse(userData) : null;
//   }, []);

//   // Set initial user state
//   const [user, setUser] = useState(getUserFromCookies());

//   // Get workspace name based on role
//   const getWorkspaceByRole = useCallback(
//     (role: string) => {
//       const workspaceName = roleToWorkspace[role] || 'USER'; // Default to 'USER'
//       return data.find((workspace) => workspace.name === workspaceName) || data[0];
//     },
//     [data] // Dependency on `data`
//   );

//   // Initialize workspace state
//   const [workspace, setWorkspace] = useState(getWorkspaceByRole(user?.role || 'user'));

//   // Update workspace if user changes
//   useEffect(() => {
//     if (user) {
//       setWorkspace(getWorkspaceByRole(user.role));
//     }
//   }, [user, data, getWorkspaceByRole]);

//   // Popover handling
//   const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

//   const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
//     setOpenPopover(event.currentTarget);
//   }, []);

//   const handleClosePopover = useCallback(() => {
//     setOpenPopover(null);
//   }, []);

//   // Handle workspace change and refresh the page
//   const handleChangeWorkspace = useCallback(
//     (newWorkspace: (typeof data)[number]) => {
//       setWorkspace(newWorkspace);

//       // Find the corresponding role for the selected workspace
//       const newRole = workspaceToRole[newWorkspace.name] || 'user';

//       if (newRole) {
//         const updatedUser = { ...user, role: newRole };
//         Cookies.set('user', JSON.stringify(updatedUser)); // Update role in cookies
//         setUser(updatedUser); // Update state

//         // Refresh the page after setting the new role
//         setTimeout(() => {
//           window.location.reload();
//         }, 500); // Small delay to ensure cookies update before refresh
//       }

//       handleClosePopover();
//     },
//     [handleClosePopover, user] // Dependencies
//   );

//   // Render workspace avatar
//   const renderAvatar = useCallback(
//     (alt: string, src: string) => (
//       <Box component="img" alt={alt} src={src} sx={{ width: 24, height: 24, borderRadius: '50%' }} />
//     ),
//     []
//   );

//   // Render label
//   const renderLabel = useCallback(
//     (plan: string) => <Label color={plan === 'Free' ? 'default' : 'info'}>{plan}</Label>,
//     []
//   );

//   return (
//     <>
//       <ButtonBase
//         disableRipple
//         onClick={handleOpenPopover}
//         sx={{
//           pl: 2,
//           py: 3,
//           gap: 1.5,
//           pr: 1.5,
//           width: 1,
//           borderRadius: 1.5,
//           textAlign: 'left',
//           justifyContent: 'flex-start',
//           bgcolor: '#f1eaff',
//           ...sx,
//         }}
//         {...other}
//       >
//         {workspace && renderAvatar(workspace.name, workspace.logo)}

//         <Box
//           gap={1}
//           flexGrow={1}
//           display="flex"
//           alignItems="center"
//           sx={{ typography: 'body2', fontWeight: 'fontWeightSemiBold' }}
//         >
//           {workspace?.name}
//           {workspace && renderLabel(workspace.plan)}
//         </Box>

//         <Iconify width={16} icon="carbon:chevron-sort" sx={{ color: 'text.disabled' }} />
//       </ButtonBase>

//       <Popover open={!!openPopover} anchorEl={openPopover} onClose={handleClosePopover}>
//         <MenuList
//           disablePadding
//           sx={{
//             p: 0.5,
//             gap: 0.5,
//             width: 260,
//             display: 'flex',
//             flexDirection: 'column',
//             [`& .${menuItemClasses.root}`]: {
//               p: 1.5,
//               gap: 1.5,
//               borderRadius: 0.75,
//               [`&.${menuItemClasses.selected}`]: {
//                 bgcolor: 'action.selected',
//                 fontWeight: 'fontWeightSemiBold',
//               },
//             },
//           }}
//         >
//           {data.map((option) => (
//             <MenuItem
//               key={option.id}
//               selected={option.id === workspace?.id}
//               onClick={() => handleChangeWorkspace(option)}
//             >
//               {renderAvatar(option.name, option.logo)}

//               <Box component="span" sx={{ flexGrow: 1 }}>
//                 {option.name}
//               </Box>

//               {renderLabel(option.plan)}
//             </MenuItem>
//           ))}
//         </MenuList>
//       </Popover>
//     </>
//   );
// }
