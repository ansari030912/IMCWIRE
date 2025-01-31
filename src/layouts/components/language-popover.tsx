import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

// ----------------------------------------------------------------------

export type LanguagePopoverProps = IconButtonProps & {
  data?: {
    value: string;
    label: string;
    icon: string;
  }[];
};

export function LanguagePopover({ sx, ...other }: LanguagePopoverProps) {
  const data = [
    {
      value: 'fr',
      label: 'French',
      icon: '/balance.svg',
    },
  ];

  const [locale, setLocale] = useState<string>(data[0].value);

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleChangeLang = useCallback(
    (newLang: string) => {
      setLocale(newLang);
      handleClosePopover();
    },
    [handleClosePopover]
  );

  const currentLang = data.find((lang) => lang.value === locale);

  return (
    <MenuList
      disablePadding
      sx={{
        p: 0.5,
        gap: 0.5,
        // width: 220,
        display: 'flex',
        flexDirection: 'column',
        [`& .${menuItemClasses.root}`]: {
          px: 1,
          gap: 2,
          borderRadius: 0.75,
          [`&.${menuItemClasses.selected}`]: {
            bgcolor: 'action.selected',
            fontWeight: 'fontWeightSemiBold',
          },
        },
      }}
    >
      {data?.map((option) => (
        <MenuItem
          key={option.value}
          selected={option.value === currentLang?.value}
          onClick={() => handleChangeLang(option.value)}
        >
          <Box
            component="img"
            alt="French"
            src="/balance.svg"
            sx={{ width: 25, height: 32, borderRadius: 0.5, objectFit: 'cover' }}
          />
          <div>
            <div style={{ marginLeft: '-10px', fontSize: '11px', color: 'green' }}>$ 10</div>
            <div style={{ marginLeft: '-10px', fontSize: '9px', color: '#5F4880', font: 'bold' }}>
              <b>PR Balanace</b>
            </div>
          </div>
        </MenuItem>
      ))}
    </MenuList>
  );
}
