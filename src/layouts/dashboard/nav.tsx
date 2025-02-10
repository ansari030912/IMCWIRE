import type { Breakpoint, SxProps, Theme } from '@mui/material/styles';
import { useEffect } from 'react';

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { varAlpha } from 'src/theme/styles';

import { Scrollbar } from 'src/components/scrollbar';
import { NavUpgrade } from '../components/nav-upgrade';
import { WorkspacesPopover } from '../components/workspaces-popover';

import type { WorkspacesPopoverProps } from '../components/workspaces-popover';

// ----------------------------------------------------------------------

export type NavContentProps = {
  data: {
    title: string;
    items: {
      path: string;
      title: string;
      icon: React.ReactNode;
      info?: React.ReactNode;
    }[];
  }[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  // workspaces: WorkspacesPopoverProps['data'];
  sx?: SxProps<Theme>;
};

// ----------------------------------------------------------------------

export function NavDesktop({
  sx,
  data,
  slots,
  // workspaces,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2.5,
        px: 2.5,
        top: 0,
        left: 0,
        height: '100vh',
        display: { xs: 'none', [layoutQuery]: 'flex' }, // Show only on large screens
        position: 'fixed',
        flexDirection: 'column',
        bgcolor: 'var(--layout-nav-bg)',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha('0 145 158', 0.12)})`,
        ...sx,
        boxShadow: '5px 0 10px rgba(0, 0, 0, 0.03)',
      }}
    >
      <NavContent data={data} slots={slots} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      setTimeout(onClose, 60000); // ✅ Small delay prevents instant closing
    }
  }, [onClose, open, pathname]); // ✅ Removed unnecessary dependencies

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          bgcolor: 'var(--layout-nav-bg)',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ data, slots, sx }: NavContentProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <img src="/logo.webp" alt="Imcwire" style={{ width: '70%' }} />
      </Box>

      {slots?.topArea}

      <WorkspacesPopover sx={{ my: 2 }} />

      <Scrollbar fillContent>
        <Box component="nav" display="flex" flex="1 1 auto" flexDirection="column" sx={sx}>
          <Box component="ul" gap={0.5} display="flex" flexDirection="column">
            {data.map((section) => (
              <Box key={section.title}>
                {/* Section Title */}
                <Typography
                  variant="caption"
                  sx={{
                    pl: 2,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: 'var(--layout-nav-section-title)',
                    mt: 8,
                  }}
                >
                  {section.title}
                </Typography>

                {/* Menu Items */}
                {section.items.map((item) => {
                  const isActive = pathname === item.path; // ✅ Ensures only exact match is active

                  return (
                    <ListItem sx={{ px: 1.4 }} disableGutters disablePadding key={item.title}>
                      <ListItemButton
                        disableGutters
                        component={RouterLink}
                        href={item.path}
                        sx={{
                          pl: 2,
                          py: 1,
                          gap: 2,
                          pr: 1.5,
                          borderRadius: 0.75,
                          typography: 'body2',
                          fontWeight: isActive ? 'fontWeightSemiBold' : 'fontWeightMedium',
                          color: isActive
                            ? 'var(--layout-nav-item-active-color)'
                            : 'var(--layout-nav-item-color)',
                          bgcolor: isActive ? 'var(--layout-nav-item-active-bg)' : 'transparent',
                          minHeight: 'var(--layout-nav-item-height)',
                          '&:hover': {
                            bgcolor: 'var(--layout-nav-item-hover-bg)',
                          },
                          transition: 'background-color 0.3s ease', // ✅ Smooth transition
                        }}
                      >
                        <Box component="span" sx={{ width: 24, height: 24 }}>
                          {item.icon}
                        </Box>

                        <Box component="span" flexGrow={1}>
                          {item.title}
                        </Box>

                        {item.info && item.info}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}
      <br />
      <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
        <NavUpgrade />
      </Box>
    </>
  );
}
