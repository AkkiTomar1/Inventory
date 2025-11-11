import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

const Table = ({ columns = [], data = [] }) => {

  return (
    <div className="bg-white w-full">
    
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200 rounded-lg">
          <thead className="bg-amber-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2 text-left text-gray-700 font-semibold border border-gray-200"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {(!data || data.length === 0) ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-2 border border-gray-200 text-sm text-gray-700"
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
