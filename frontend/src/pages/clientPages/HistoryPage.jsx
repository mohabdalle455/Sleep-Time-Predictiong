import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
} from "@tanstack/react-table";
import { API_URL } from "../../config/config.jsx";

// Helper function to calculate sleep quality from prediction hours
const getSleepQualityFromPrediction = (predictionHours) => {
    const hours = parseFloat(predictionHours);
    if (hours >= 7 && hours <= 9) {
        return "Good";
    } else if ((hours >= 6 && hours < 7) || (hours > 9 && hours <= 10)) {
        return "Normal";
    } else {
        return "Poor";
    }
};

// Helper function to get color for sleep quality
const getSleepQualityColor = (quality) => {
    switch (quality) {
        case "Poor":
            return "text-red-600 dark:text-red-400";
        case "Normal":
            return "text-yellow-600 dark:text-yellow-400";
        case "Good":
            return "text-green-600 dark:text-green-400";
        default:
            return "text-gray-600 dark:text-gray-400";
    }
};

const HistoryPage = () => {
    const [user, setUser] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterOption, setFilterOption] = useState("all");
    const [sorting, setSorting] = useState([]);


    useEffect(() => {
        const token = localStorage.getItem("token");
        axios
            .get(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setUser(res.data);
                fetchPredictions(res.data._id);
            })
            .catch((err) => console.error("Error loading profile", err));
    }, []);

    const fetchPredictions = (userId) => {
        // Fix the endpoint to use /api/recommendation instead of /api/predictions
        axios
            .get(`${API_URL}/recommendation/user/${userId}`)
            .then((res) => setPredictions(res.data))
            .catch((err) => console.error("Error fetching predictions", err));
    };

    const filteredData = useMemo(() => {
        return predictions
            .filter((p) => {
                // Search by sleep quality (Poor, Normal, Good) or prediction hours
                const sleepQuality = p.sleepQuality || getSleepQualityFromPrediction(p.prediction);
                const predictionHours = p.prediction ? p.prediction.toString() : '';
                const searchText = searchTerm.toLowerCase();
                
                return sleepQuality.toLowerCase().includes(searchText) || 
                       predictionHours.includes(searchText);
            })
            .filter((p) => {
                if (filterOption === "poor") {
                    const quality = p.sleepQuality || getSleepQualityFromPrediction(p.prediction);
                    return quality === "Poor";
                }
                if (filterOption === "normal") {
                    const quality = p.sleepQuality || getSleepQualityFromPrediction(p.prediction);
                    return quality === "Normal";
                }
                if (filterOption === "good") {
                    const quality = p.sleepQuality || getSleepQualityFromPrediction(p.prediction);
                    return quality === "Good";
                }
                return true;
            });
    }, [predictions, searchTerm, filterOption]);

    const columns = [
        {
            header: "#",
            cell: ({ row }) => row.index + 1,
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        },
        {
            accessorKey: "prediction",
            header: "Sleep Hours",
            cell: (info) => {
                const hours = parseFloat(info.getValue());
                return `${hours.toFixed(1)} hours`;
            },
        },
        {
            accessorKey: "sleepQuality",
            header: "Sleep Quality",
            cell: (info) => {
                const prediction = info.row.original.prediction;
                const quality = info.getValue() || getSleepQualityFromPrediction(prediction);
                const colorClass = getSleepQualityColor(quality);
                
                return (
                    <span className={`font-semibold ${colorClass}`}>
                        {quality}
                    </span>
                );
            },
        },
    ];


    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,

        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (!user) {
        return (
            <div className="text-center py-10 text-gray-600 dark:text-gray-300">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 py-10 text-gray-900 dark:text-white text-xl">
            <div className="w-full max-w-6xl mx-auto bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
                <div className="">
                    <h2 className="text-5xl font-bold text-center text-primary dark:text-primary mb-6">Prediction History</h2>

                    {/* Filter Row */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search (e.g. Poor, Normal, Good, 7.5)"
                            className="w-full md:w-1/2 p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        
                        <select
                            className="w-full md:w-1/3 p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
                            value={filterOption}
                            onChange={(e) => setFilterOption(e.target.value)}
                        >
                            <option value="all">All Sleep Quality</option>
                            <option value="poor">Poor (&lt; 6 hours)</option>
                            <option value="normal">Normal (6-7 or 9-10 hours)</option>
                            <option value="good">Good (7-9 hours)</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border rounded-md">
                        <table className="min-w-full table-auto text-xl">
                            <thead className="bg-gray-200 dark:bg-neutral-700 text-left text-xl uppercase">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th key={header.id} className="p-2 font-semibold">
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="border-t">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="p-2">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {table.getRowModel().rows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="text-center text-gray-500 p-4"
                                        >
                                            No matching records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between gap-4 mt-4">
                        {/* Right: Pagination buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                className="px-3 py-1 border rounded"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Previous
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="px-3 py-1 border rounded"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default HistoryPage;