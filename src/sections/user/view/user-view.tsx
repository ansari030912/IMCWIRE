import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { DashboardContent } from 'src/layouts/dashboard';

import { Scrollbar } from 'src/components/scrollbar';
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

import { emptyRows } from '../utils';
import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';

import type { UserProps } from '../user-table-row';

export function UserView() {
  const table = useTable();
  const [filterName, setFilterName] = useState('');
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

        setUsers(
          response.data.users.map((user: any) => ({
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
        );
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // --------------------------
  // 2) Filter users
  // --------------------------
  const dataFiltered: UserProps[] = users.filter((user) => {
    const search = filterName.toLowerCase();
    return (
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search)
    );
  });

  // --------------------------
  // 3) Sort the filtered data
  // --------------------------
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

  console.log('🚀 ~ dataSorted:', dataSorted);

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          User History
        </Typography>
      </Box>

      <Card>
        {/* Search / Toolbar */}
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              {/* Table Head with sorting */}
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                onSort={table.onSort}
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'email', label: 'Email' },
                  { id: 'role', label: 'Role' },
                  { id: 'isVerified', label: 'Verified', align: 'center' },
                  { id: 'status', label: 'Status' },
                  {
                    id: '',
                    label: '',
                  },
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
          count={dataSorted.length} // Important: reflect sorted/filtered data length
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
// useTable() Hook
// -------------------------------------------------
export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

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
 * Adjust this to match your data (e.g. 'name' => row.fullName).
 */
function compareRow(a: UserProps, b: UserProps, orderBy: string, order: 'asc' | 'desc'): number {
  const valA = getFieldValue(a, orderBy);
  const valB = getFieldValue(b, orderBy);

  if (valA < valB) {
    return order === 'asc' ? -1 : 1;
  }
  if (valA > valB) {
    return order === 'asc' ? 1 : -1;
  }
  return 0;
}

/**
 * Maps the column key (orderBy) to an actual field in your user data.
 * For 'name', we use row.fullName (or row.username).
 */
function getFieldValue(row: UserProps, orderBy: string): string {
  if (orderBy === 'name') {
    // If your "name" column actually means row.fullName or row.username
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
  // Fallback: empty string
  return '';
}
