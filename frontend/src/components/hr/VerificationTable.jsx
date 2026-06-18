import React from "react";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Button } from "flowbite-react";
import VerificationStatusBadge from "./VerificationStatusBadge";

export default function VerificationTable({ employees, onView }) {
  if (!employees || employees.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No verification records found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table hoverable>
        <TableHead>
          <TableRow>
            <TableHeadCell>Employee ID</TableHeadCell>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Department</TableHeadCell>
            <TableHeadCell>Designation</TableHeadCell>
            <TableHeadCell>PAN Status</TableHeadCell>
            <TableHeadCell>Aadhaar Status</TableHeadCell>
            <TableHeadCell>Bank Status</TableHeadCell>
            <TableHeadCell>Submitted Date</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y">
          {employees.map((emp) => (
            <TableRow key={emp._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {emp.employeeId}
              </TableCell>
              <TableCell>{emp.firstName} {emp.lastName}</TableCell>
              <TableCell>{emp.department?.departmentName || "N/A"}</TableCell>
              <TableCell>{emp.designation || "N/A"}</TableCell>
              <TableCell>
                <VerificationStatusBadge status={emp.panStatus} />
              </TableCell>
              <TableCell>
                <VerificationStatusBadge status={emp.aadhaarStatus} />
              </TableCell>
              <TableCell>
                <VerificationStatusBadge status={emp.bankStatus} />
              </TableCell>
              <TableCell>
                {new Date(emp.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button size="sm" onClick={() => onView(emp)}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
