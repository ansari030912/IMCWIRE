import type { StackProps } from '@mui/material/Stack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { textGradient } from 'src/theme/styles';

// ----------------------------------------------------------------------

export function NavUpgrade({ sx, ...other }: StackProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      flexDirection="column"
      sx={{ mb: 4, textAlign: 'center', ...sx }}
      {...other}
    >
      <Typography
        variant="h6"
        sx={(theme) => ({
          ...textGradient(
            `to right, ${theme.vars.palette.secondary.main}, ${theme.vars.palette.warning.main}`
          ),
        })}
      >
        IMC40NEWYEAR
      </Typography>
      <Box
        component="img"
        alt="Minimal dashboard"
        src="/assets/illustrations/vendor.gif"
        sx={{ width: 200, my: 2 }}
      />
      <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
        <Button
          href="/dashboard/plans"
          // target="_blank"
          variant="contained"
          style={{ backgroundColor: '#482D70' }}
        >
          <Box component="strong">Get UPTO </Box>
          <Typography
            style={{ paddingLeft: '4px', paddingRight: '4px' }}
            variant="h6"
            sx={(theme) => ({
              ...textGradient(
                `to right, ${theme.vars.palette.secondary.main}, ${theme.vars.palette.warning.main}`
              ),
            })}
          >
            40%
          </Typography>
          <Box component="strong"> Off</Box>
        </Button>
      </Typography>
    </Box>
  );
}
