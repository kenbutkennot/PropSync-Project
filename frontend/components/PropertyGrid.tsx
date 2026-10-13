"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { Property } from "@/lib/types";
import { api } from "@/lib/api";

const columnHelper = createColumnHelper<Property>();

// Adjust to match however your agency's pipeline stages are actually named.
const LISTING_STATUSES = ["On Market", "Under Offer", "Sold", "Withdrawn"];

interface Props {
  properties: Property[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChanged: () => void; // re-fetch after an edit/delete
  onView: (id: string) => void;
}

function EditableCell({
  value: initialValue,
  propertyId,
  field,
  onSaved,
  type = "text",
}: {
  value: string | number | null | undefined;
  propertyId: string;
  field: string;
  onSaved: () => void;
  type?: "text" | "number";
}) {
  const [value, setValue] = useState(initialValue ?? "");

  async function commit() {
    if (value === (initialValue ?? "")) return; // no change, skip the request
    await api.updateProperty(propertyId, {
      [field]: type === "number" ? (value === "" ? null : Number(value)) : value,
    });
    onSaved();
  }

  return (
    <input
      className="w-full bg-transparent px-1 py-0.5 hover:bg-gray-50 focus:bg-white focus:border focus:rounded outline-none"
      value={value}
      type={type}
      onClick={(e) => e.stopPropagation()} // don't trigger row select while editing
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
    />
  );
}

export default function PropertyGrid({ properties, selectedId, onSelect, onChanged, onView }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo(
    () => [
      columnHelper.accessor("proposal_title", {
        header: "Proposal Title",
        cell: (info) => <span className="text-xs">{info.getValue()}</span>
      }),

      columnHelper.accessor("category", { 
        header: "Category",
        cell: (info) => <span className="text-xs">{info.getValue()}</span>
      }),

      columnHelper.accessor("area", { 
        header: "Area",
        cell: (info) => <span className="text-xs">{info.getValue()}</span> 
      }),

      columnHelper.accessor("district", { 
        header: "District",
        cell: (info) => <span className="text-xs">{info.getValue()}</span>
      }),

      columnHelper.accessor("state", { 
        header: "State",
        cell: (info) => <span className="text-xs">{info.getValue()}</span>
      }),
      columnHelper.accessor("total_price", { 
        header: "Total Price",
        cell: (info) => <span className="text-xs">{info.getValue()}</span>
      }),
      columnHelper.accessor("listing_status", {
        header: "Status",
        cell: (info) => (
          <select
            className="border rounded px-1 py-0.5 text-xs bg-white"
            value={info.getValue() ?? ""}
            onClick={(e) => e.stopPropagation()}
            onChange={async (e) => {
              await api.updateProperty(info.row.original.id, { listing_status: e.target.value });
              onChanged();
            }}
          >
            <option value="">—</option>
            {LISTING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <div className="flex gap-2">
            <button
              className="text-blue-600 text-sm hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onView(info.row.original.id);
              }}
            >
              View
            </button>
            <button
              className="text-red-600 text-sm hover:underline"
              onClick={async (e) => {
                e.stopPropagation();
                if (confirm("Delete this property?")) {
                  await api.deleteProperty(info.row.original.id);
                  onChanged();
                }
              }}
            >
              Delete
            </button>
          </div>
        ),
      }),
    ],
    [onChanged]
  );

  const table = useReactTable({
    data: properties,
    columns,
    getRowId: (row) => row.id,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-auto h-full border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 sticky top-0">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  className={`text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap ${
                    header.column.getCanSort() ? "cursor-pointer select-none hover:bg-gray-100" : ""
                  }`}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? ""}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.original.id}
              onClick={() => onSelect(row.original.id)}
              className={`cursor-pointer border-t hover:bg-blue-50 ${
                row.original.id === selectedId ? "bg-blue-100" : ""
              }`}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {properties.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center text-gray-400 py-8">
                No properties yet — add one, paste an owner message, or import a CSV.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}