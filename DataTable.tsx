import React, { useState, useMemo } from 'react';
import type { CsvRow } from '../types';

interface DataTableProps {
  data: CsvRow[];
}

const ROWS_PER_PAGE = 10;

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Hide the internal __AI_ROW_ID__ from the table headers
  const headers = useMemo(() => (data.length > 0 ? Object.keys(data[0]).filter(h => h !== '__AI_ROW_ID__') : []), [data]);
  const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const lastPageIndex = firstPageIndex + ROWS_PER_PAGE;
    return data.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, data]);

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };
  
  if (data.length === 0) {
    return <p className="text-gray-400">No data available to display.</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-white whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-900/50">
            {currentTableData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-800/70 transition-colors">
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="py-4 px-4 text-sm text-gray-300 whitespace-nowrap">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;