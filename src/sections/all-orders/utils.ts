import type { UserProps } from './user-table-row';

// For screen-reader text in MUI sorting
export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
} as const;

/**
 * Calculate how many empty rows to show when a table has fewer items on the last page
 */
export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

/**
 * A basic descending comparator for sorting
 */
function descendingComparator<T, K extends keyof T>(a: T, b: T, orderBy: K): number {
  // If the property doesn't exist or can't be compared, you might need extra checks
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

/**
 * Return a comparator function (asc or desc) for stable sorting
 */
export function getComparator<T>(order: 'asc' | 'desc', orderBy: keyof T) {
  return order === 'desc'
    ? (a: T, b: T) => descendingComparator(a, b, orderBy)
    : (a: T, b: T) => -descendingComparator(a, b, orderBy);
}

// ----------------------------------------------------------------------
// Apply stable sorting, then (optionally) filter by "filterName"
// ----------------------------------------------------------------------

type ApplyFilterProps<T> = {
  inputData: T[];
  filterName: string;
  comparator: (a: T, b: T) => number;
};

export function applyFilter<T extends UserProps>({
  inputData,
  comparator,
  filterName,
}: ApplyFilterProps<T>) {
  // 1) Stable sort
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    // Tie-break by original index to maintain stable sort
    return a[1] - b[1];
  });
  let sortedData = stabilizedThis.map((el) => el[0]);

  // 2) Filter by `filterName` (adjust fields as needed)
  if (filterName) {
    const search = filterName.toLowerCase();
    // If your UserProps does NOT have username/email/role or uses different field names,
    // adjust the filtering logic here accordingly.
    sortedData = sortedData.filter((user) =>
      user.username.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search)
    );
  }

  return sortedData;
}
