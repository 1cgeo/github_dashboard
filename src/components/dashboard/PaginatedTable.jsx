// Path: components\dashboard\PaginatedTable.jsx
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TableContainer,
  useTheme,
  useMediaQuery
} from '@mui/material';

const PaginatedTable = ({ 
  data, 
  columns,
  columnWidths, 
  renderRow,
  renderMobileRow,
  defaultRowsPerPage = 10,
  mobileRowsPerPage = 5
}) => {
  const [page, setPage] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const rowsPerPage = isMobile ? mobileRowsPerPage : defaultRowsPerPage;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <TableContainer>
        <Table sx={{ tableLayout: 'fixed' }}>
          {!isMobile && (
            <TableHead>
              <TableRow>
                {columns.map((column, index) => (
                  <TableCell 
                    key={index}
                    style={{
                      width: columnWidths[index]
                    }}
                  >
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {paginatedData.map((item, index) => 
              isMobile ? renderMobileRow(item, index, {
                backgroundColor: index % 2 === 0 ? 'background.paper' : 'action.hover'
              }) : renderRow(item, index)
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[rowsPerPage]}
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count}`
        }
      />
    </>
  );
};

export default PaginatedTable;