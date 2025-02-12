import axios from 'axios';
import Cookies from 'js-cookie';
import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';

import { Scrollbar } from 'src/components/scrollbar';
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';
import { DashboardContent } from 'src/layouts/dashboard';

import { TableEmptyRows } from '../table-empty-rows';
import { TableNoData } from '../table-no-data';
import { UserTableHead } from '../user-table-head';
import { UserTableRow } from '../user-table-row';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows } from '../utils';

import type { UserProps } from '../user-table-row';

export function UserView() {
  const table = useTable();
  const [filterName, setFilterName] = useState('');
  // New state for filtering by user role. 'all' means no role filtering.
  const [filterRole, setFilterRole] = useState('all');
  const [users, setUsers] = useState<UserProps[]>([]);

  // --------------------------
  // 1) Fetch users
  // --------------------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userCookie = Cookies.get('user');
        if (!userCookie) return;

        const parsedUser = JSON.parse(decodeURIComponent(userCookie));
        const { token } = parsedUser;
        if (!token) return;

        const response = await axios.get(`${BASE_URL}/v1/account/superadmin-list`, {
          headers: {
            'x-api-key': X_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        });

        // After mapping the response data...
        setUsers(
          response.data.users
            .map((user: any) => ({
              ...user,
              createdAccDate: user.createdAt ? user.createdAt : '',
              fullName: user.profile ? user.profile.full_name : user.username,
              avatarUrl: user.profile ? user.profile.image_url : '',
              streetAddress: user.profile ? user.profile.street_address : '',
              city: user.profile ? user.profile.city : '',
              country: user.profile ? user.profile.country : '',
              zipCode: user.profile ? user.profile.zip_code : '',
              phoneNumber: user.profile ? user.profile.phone_number : '',
              gender: user.profile ? user.profile.gender : '',
              dateOfBirth: user.profile ? user.profile.date_of_birth : '',
              createdAt: user.profile ? user.profile.created_at : '',
            }))
            // Sort so that the latest date comes first
            .sort(
              (a: any, b: any) =>
                new Date(b.createdAccDate).getTime() - new Date(a.createdAccDate).getTime()
            )
        );
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // --------------------------
  // 2) Filter users (by search text and role)
  // --------------------------
  const dataFiltered: UserProps[] = users.filter((user) => {
    const search = filterName.toLowerCase();
    const matchesSearch =
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search);

    // If filterRole is 'all', include every user; otherwise only include those whose role matches.
    const matchesRole =
      filterRole === 'all' ? true : user.role?.toLowerCase() === filterRole.toLowerCase();

    return matchesSearch && matchesRole;
  });

  // --------------------------
  // 3) Sort the filtered data
  // --------------------------
  // ... After filtering:
  const dataSorted = [...dataFiltered].sort((a, b) => compareRow(a, b, table.orderBy, table.order));

  // --------------------------
  // 4) Paginate after sorting
  // --------------------------
  const dataPage = dataSorted.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  // For "No data found" display
  const notFound = dataSorted.length === 0 && filterName.trim() !== '';

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          User History
        </Typography>
      </Box>

      {/* Role Filter UI */}
      <Card>
        <Scrollbar>
          {/* Search / Toolbar */}
          <div className="flex flex-nowrap">
            <div>
              <UserTableToolbar
                numSelected={table.selected.length}
                filterName={filterName}
                onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setFilterName(event.target.value);
                  table.onResetPage();
                }}
              />
            </div>
            <div className="flex flex-col justify-center flex-nowrap">
              <Box mb={1}>
                {/* Change flexWrap from "wrap" to "nowrap" */}
                <Box display="flex" gap={1} mt={1} flexWrap="nowrap">
                  <Button
                    variant={filterRole === 'all' ? 'contained' : 'outlined'}
                    onClick={() => {
                      setFilterRole('all');
                      table.onResetPage();
                    }}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterRole === 'user' ? 'contained' : 'outlined'}
                    onClick={() => {
                      setFilterRole('user');
                      table.onResetPage();
                    }}
                  >
                    User
                  </Button>
                  <Button
                    variant={filterRole === 'admin' ? 'contained' : 'outlined'}
                    onClick={() => {
                      setFilterRole('admin');
                      table.onResetPage();
                    }}
                  >
                    Admin
                  </Button>
                  <Button
                    variant={filterRole === 'super admin' ? 'contained' : 'outlined'}
                    onClick={() => {
                      setFilterRole('super_admin');
                      table.onResetPage();
                    }}
                    className="text-nowrap"
                  >
                    Super Admin
                  </Button>
                </Box>
              </Box>
            </div>
          </div>

          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              {/* Table Head with sorting */}
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                onSort={table.onSort}
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'email', label: 'Email / Password' }, // Updated header label
                  { id: 'role', label: 'Role' },
                  { id: 'isVerified', label: 'Verified', align: 'center' },
                  { id: 'status', label: 'Status' },
                  { id: '', label: '' },
                ]}
              />

              {/* Table Body */}
              <TableBody>
                {dataPage.map((row) => (
                  <UserTableRow
                    key={row.id}
                    row={row}
                    selected={table.selected.includes(row.id)}
                    onSelectRow={() => table.onSelectRow(row.id)}
                  />
                ))}

                {/* Empty rows filler */}
                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataSorted.length)}
                />

                {/* "No data found" if filter yields none */}
                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        {/* Pagination */}
        <TablePagination
          sx={{ bgcolor: '#F4F6F8' }}
          component="div"
          page={table.page}
          count={dataSorted.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

// -------------------------------------------------
// useTable() Hook (remains unchanged)
// -------------------------------------------------
export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('createdAccDate');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];
      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}

/**
 * Compares two rows (a & b) based on the specified orderBy and order.
 */
function compareRow(a: UserProps, b: UserProps, orderBy: string, order: 'asc' | 'desc'): number {
  if (orderBy === 'createdAccDate') {
    const dateA = new Date(a.createdAccDate).getTime();
    const dateB = new Date(b.createdAccDate).getTime();
    // For descending order (latest first), subtract A from B
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  }

  // For other columns, fallback to string comparison:
  const valA = getFieldValue(a, orderBy);
  const valB = getFieldValue(b, orderBy);
  if (valA < valB) return order === 'asc' ? -1 : 1;
  if (valA > valB) return order === 'asc' ? 1 : -1;
  return 0;
}

/**
 * Maps the column key (orderBy) to an actual field in your user data.
 */
function getFieldValue(row: UserProps, orderBy: string): string {
  if (orderBy === 'name') {
    return (row.username || '').toLowerCase();
  }
  if (orderBy === 'email') {
    return (row.email || '').toLowerCase();
  }
  if (orderBy === 'role') {
    return (row.role || '').toLowerCase();
  }
  if (orderBy === 'status') {
    return (row.status || '').toLowerCase();
  }
  return '';
}
