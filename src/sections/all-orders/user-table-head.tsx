import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from './utils';

// ----------------------------------------------------------------------

type HeadCell = {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  minWidth?: number | string;
};

type UserTableHeadProps = {
  orderBy: string;            // e.g. "name", "email", "role", etc.
  order: 'asc' | 'desc';      // current direction
  onSort: (id: string) => void;
  headLabel: HeadCell[];
};

export function UserTableHead({
  order,
  onSort,
  orderBy,
  headLabel,
}: UserTableHeadProps) {
  return (
    <TableHead>
      <TableRow>
        {headLabel.map((headCell) => {
          const isActive = orderBy === headCell.id;

          return (
            <TableCell
              key={headCell.id}
              align={headCell.align || 'left'}
              sortDirection={isActive ? order : false}
              sx={{ width: headCell.width, minWidth: headCell.minWidth }}
            >
              <TableSortLabel
                // If you want the arrow to show only when active:
                hideSortIcon
                // If you want the arrow always visible for all columns, do `hideSortIcon={false}`

                active={isActive}
                direction={isActive ? order : 'asc'}
                onClick={() => onSort(headCell.id)}
              >
                {headCell.label}

                {/* Screen-reader text for accessibility */}
                {isActive && (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                )}
              </TableSortLabel>
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
}
