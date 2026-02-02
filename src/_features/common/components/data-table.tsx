"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/_utilities/utilities";

export type SortDirection = "asc" | "desc" | null;

export interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  sortKey?: (row: T) => string | number | Date;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  defaultSort?: {
    columnId: string;
    direction: SortDirection;
  };
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "데이터가 없습니다",
  emptyIcon,
  onRowClick,
  rowClassName,
  defaultSort,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(
    defaultSort?.columnId || null
  );
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(
    defaultSort?.direction || null
  );

  // 정렬된 데이터
  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return data;
    }

    const column = columns.find((col) => col.id === sortColumn);
    if (!column || !column.sortable || !column.sortKey) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      const aValue = column.sortKey!(a);
      const bValue = column.sortKey!(b);

      // 날짜 비교
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // 숫자 비교
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // 문자열 비교
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr, "ko", { numeric: true });
      } else {
        return bStr.localeCompare(aStr, "ko", { numeric: true });
      }
    });

    return sorted;
  }, [data, sortColumn, sortDirection, columns]);

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      // 같은 컬럼 클릭 시: 오름차순 -> 내림차순 -> 정렬 없음
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      // 다른 컬럼 클릭 시: 오름차순으로 시작
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) {
      return <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-3.5 w-3.5 text-[#0052CC]" />;
    }
    if (sortDirection === "desc") {
      return <ArrowDown className="ml-2 h-3.5 w-3.5 text-[#0052CC]" />;
    }
    return <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />;
  };
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id} className={column.className}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.id} className={column.className}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex flex-col items-center justify-center py-12">
          {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.className}>
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort(column.id)}
                  >
                    <span className="flex items-center">
                      {column.header}
                      {getSortIcon(column.id)}
                    </span>
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row) => (
            <TableRow
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={cn(
                onRowClick && "cursor-pointer",
                rowClassName?.(row)
              )}
            >
              {columns.map((column) => (
                <TableCell key={column.id} className={column.className}>
                  {column.accessor(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
