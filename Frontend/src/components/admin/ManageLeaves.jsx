import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllLeaves, updateLeaveStatus } from '../../redux/leaveSlice';

function ManageLeaves() {
  const dispatch = useDispatch();
  const { leaves, loading, error } = useSelector((state) => state.leaves);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [message, setMessage] = useState('');
  const [updatingLeaveId, setUpdatingLeaveId] = useState(null);

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    dispatch(fetchAllLeaves());
  }, [dispatch]);

  const handleUpdateStatus = (id, newStatus) => {
    setUpdatingLeaveId(id);
    dispatch(updateLeaveStatus({ id, status: newStatus })).then((result) => {
      setUpdatingLeaveId(null);
      if (result.meta.requestStatus === 'fulfilled') {
        setMessage(`Leave ${id} updated to ${newStatus}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`Failed to update leave: ${result.payload}`);
        setTimeout(() => setMessage(''), 5000);
      }
    });
  };

  const handleBulkUpdate = (status) => {
    if (selectedIds.length === 0) {
      setMessage('Please select at least one leave to update');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setUpdatingLeaveId('bulk');
    Promise.all(selectedIds.map((id) => dispatch(updateLeaveStatus({ id, status }))))
      .then((results) => {
        setUpdatingLeaveId(null);
        const allFulfilled = results.every((r) => r.meta.requestStatus === 'fulfilled');
        if (allFulfilled) {
          setMessage(`Bulk updated ${selectedIds.length} leaves to ${status}`);
          setSelectedIds([]);
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage('Some leaves failed to update');
          setTimeout(() => setMessage(''), 5000);
        }
      })
      .catch(() => {
        setUpdatingLeaveId(null);
        setMessage('Bulk update failed');
        setTimeout(() => setMessage(''), 5000);
      });
  };

  const handleRefresh = () => {
    setMessage('Refreshing leaves...');
    dispatch(fetchAllLeaves()).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setMessage('Leaves refreshed successfully');
        setSelectedIds([]);
        setPage(1);
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage('Failed to refresh leaves');
        setTimeout(() => setMessage(''), 5000);
      }
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSelectLeave = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((lid) => lid !== id) : [...prev, id]
    );
  };

  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      leave.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (leave.student?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (leave.student?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (leave.teacher?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (leave.teacher?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || leave.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedLeaves = [...filteredLeaves].sort((a, b) => {
    if (sortBy === 'createdAt') {
      return sortOrder === 'asc'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'applicant') {
      const nameA = a.student?.name || a.teacher?.name || '';
      const nameB = b.student?.name || b.teacher?.name || '';
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedLeaves.length / itemsPerPage);
  const paginatedLeaves = sortedLeaves.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Helper function to get applicant display text
  const getApplicantDisplay = (leave) => {
    if (leave.student) {
      return getStudentDisplay(leave);
    } else if (leave.teacher) {
      return getTeacherDisplay(leave);
    }
    return 'N/A';
  };

  // Helper function to get student display text
  const getStudentDisplay = (leave) => {
    if (leave.student && leave.student.name) {
      return `${leave.student.name} (Student, ${leave.student.email || 'No email'})`;
    }
    return leave.student?._id ? `Student ID: ${leave.student._id}` : 'N/A';
  };

  // Helper function to get teacher display text
  const getTeacherDisplay = (leave) => {
    if (leave.teacher && leave.teacher.name) {
      return `${leave.teacher.name} (Teacher, ${leave.teacher.email || 'No email'})`;
    }
    return leave.teacher?._id ? `Teacher ID: ${leave.teacher._id}` : 'N/A';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Leave Applications</h1>

      {message && (
        <p
          className={`mb-4 p-2 rounded text-center ${
            message.includes('successfully') || message.includes('updated')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </p>
      )}

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by reason, student, or teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleBulkUpdate('Approved')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors"
            disabled={loading || selectedIds.length === 0 || updatingLeaveId}
          >
            Approve Selected
          </button>
          <button
            onClick={() => handleBulkUpdate('Rejected')}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400 transition-colors"
            disabled={loading || selectedIds.length === 0 || updatingLeaveId}
          >
            Reject Selected
          </button>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            disabled={loading}
          >
            {loading && !updatingLeaveId ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading && !updatingLeaveId ? (
        <p className="text-gray-500 text-center">Loading leaves...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : sortedLeaves.length === 0 ? (
        <p className="text-gray-500 text-center">No leaves match your criteria</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 bg-white shadow-sm rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === paginatedLeaves.length && paginatedLeaves.length > 0}
                      onChange={() =>
                        setSelectedIds(
                          selectedIds.length === paginatedLeaves.length
                            ? []
                            : paginatedLeaves.map((leave) => leave._id)
                        )
                      }
                      className="cursor-pointer"
                    />
                  </th>
                  <th
                    className="border p-3 text-left text-gray-700 font-semibold cursor-pointer"
                    onClick={() => handleSort('applicant')}
                  >
                    Applicant {sortBy === 'applicant' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="border p-3 text-left text-gray-700 font-semibold">Reason</th>
                  <th className="border p-3 text-left text-gray-700 font-semibold">Date</th>
                  <th className="border p-3 text-left text-gray-700 font-semibold">Status</th>
                  <th
                    className="border p-3 text-left text-gray-700 font-semibold cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    Created At {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="border p-3 text-left text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                    <td className="border p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(leave._id)}
                        onChange={() => handleSelectLeave(leave._id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="border p-3">
                      {getApplicantDisplay(leave)}
                    </td>
                    <td className="border p-3 truncate max-w-xs" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="border p-3">{new Date(leave.date).toLocaleDateString()}</td>
                    <td className="border p-3">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          leave.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : leave.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="border p-3">
                      {new Date(leave.createdAt).toLocaleDateString()} {new Date(leave.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="border p-3 flex gap-2">
                      {leave.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors"
                            disabled={updatingLeaveId === leave._id}
                          >
                            {updatingLeaveId === leave._id ? 'Updating...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                            disabled={updatingLeaveId === leave._id}
                          >
                            {updatingLeaveId === leave._id ? 'Updating...' : 'Reject'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(leave._id, 'Pending')}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 disabled:bg-gray-400 transition-colors"
                          disabled={updatingLeaveId === leave._id}
                        >
                          {updatingLeaveId === leave._id ? 'Updating...' : 'Revert to Pending'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="bg-gray-200 text-gray-700 px-7 py-1 rounded hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ManageLeaves;