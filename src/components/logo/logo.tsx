import type { BoxProps } from '@mui/material/Box';

import { useId, forwardRef } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = BoxProps & {
  href?: string;
  isSingle?: boolean;
  disableLink?: boolean;
};

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  (
    {
      width,
      href = '/dashboard',
      height,
      isSingle = true,
      disableLink = false,
      className,
      sx,
      ...other
    },
    ref
  ) => {
    const theme = useTheme();

    const gradientId = useId();

    const TEXT_PRIMARY = theme.vars.palette.text.primary;
    const PRIMARY_LIGHT = theme.vars.palette.primary.light;
    const PRIMARY_MAIN = theme.vars.palette.primary.main;
    const PRIMARY_DARKER = theme.vars.palette.primary.dark;

    /*
    * OR using local (public folder)
    *
    const singleLogo = (
      <Box
        alt="Single logo"
        component="img"
        src={`/logo/logo-single.svg`}
        width="100%"
        height="100%"
      />
    );

    const fullLogo = (
      <Box
        alt="Full logo"
        component="img"
        src={`/logo/logo-full.svg`}
        width="100%"
        height="100%"
      />
    );
    *
    */

    const baseSize = {
      width: width ?? 180,
      height: height ?? 50,
      ...(!isSingle && {
        width: width ?? 120,
        height: height ?? 30,
      }),
    };

    return (
      <Box
        ref={ref}
        component={RouterLink}
        to="/dashboard" // Navigates to /dashboard when clicked
        className={logoClasses.root.concat(className ? ` ${className}` : '')}
        aria-label="Logo"
        sx={{
          ...baseSize,
          flexShrink: 0,
          display: 'inline-flex',
          verticalAlign: 'middle',
          ...(disableLink && { pointerEvents: 'none' }),
          ...sx,
        }}
        {...other}
      >
        <img src="/logo.webp" alt="IMCWIRE DASHBOARD" />
      </Box>
    );
  }
);
