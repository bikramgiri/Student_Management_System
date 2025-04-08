// src/components/admin/ManageFeedbacks.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeedbacks, updateFeedbackStatus } from '../../redux/feedbackSlice';

function ManageFeedbacks() {
  const dispatch = useDispatch();
  const { feedbacks, loading, error } = useSelector((state) => state.feedback);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [message, setMessage] = useState('');
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Sorting
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  useEffect(() => {
    dispatch(fetchFeedbacks());
  }, [dispatch]);

  const handleUpdateStatus = (id, newStatus) => {
    setUpdatingFeedbackId(id);
    dispatch(updateFeedbackStatus({ id, status: newStatus })).then((result) => {
      setUpdatingFeedbackId(null);
      if (result.meta.requestStatus === 'fulfilled') {
        setMessage(`Feedback ${id} updated to ${newStatus}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`Failed to update feedback: ${result.payload}`);
        setTimeout(() => setMessage(''), 5000);
      }
    });
  };

  const handleBulkUpdate = (status) => {
    if (selectedIds.length === 0) {
      setMessage('Please select at least one feedback to update');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setUpdatingFeedbackId('bulk');
    Promise.all(selectedIds.map((id) => dispatch(updateFeedbackStatus({ id, status }))))
      .then((results) => {
        setUpdatingFeedbackId(null);
        const allFulfilled = results.every((r) => r.meta.requestStatus === 'fulfilled');
        if (allFulfilled) {
          setMessage(`Bulk updated ${selectedIds.length} feedbacks to ${status}`);
          setSelectedIds([]);
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage('Some feedbacks failed to update');
          setTimeout(() => setMessage(''), 5000);
        }
      })
      .catch(() => {
        setUpdatingFeedbackId(null);
        setMessage('Bulk update failed');
        setTimeout(() => setMessage(''), 5000);
      });
  };

  const handleRefresh = () => {
    setMessage('Refreshing feedbacks...');
    dispatch(fetchFeedbacks()).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setMessage('Feedbacks refreshed successfully');
        setSelectedIds([]); // Reset selection on refresh
        setPage(1); // Reset to first page
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage('Failed to refresh feedbacks');
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

  const handleSelectFeedback = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesSearch =
      fb.feedback.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.teacher?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.teacher?.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || fb.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort feedbacks
  const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
    if (sortBy === 'createdAt') {
      return sortOrder === 'asc'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'teacher') {
      const nameA = a.teacher?.name || '';
      const nameB = b.teacher?.name || '';
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    }
    return 0;
  });

  // Paginate feedbacks
  const totalPages = Math.ceil(sortedFeedbacks.length / itemsPerPage);
  const paginatedFeedbacks = sortedFeedbacks.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Feedbacks</h1>

      {/* Message Display */}
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

      {/* Controls Section */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by feedback or teacher..."
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
            <option value="Reviewed">Reviewed</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleBulkUpdate('Reviewed')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors"
            disabled={loading || selectedIds.length === 0 || updatingFeedbackId}
          >
            Mark Selected Reviewed
          </button>
          <button
            onClick={() => handleBulkUpdate('Pending')}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-gray-400 transition-colors"
            disabled={loading || selectedIds.length === 0 || updatingFeedbackId}
          >
            Revert Selected to Pending
          </button>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            disabled={loading}
          >
            {loading && !updatingFeedbackId ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Feedback Table */}
      {loading && !updatingFeedbackId ? (
        <p className="text-gray-500 text-center">Loading feedbacks...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : sortedFeedbacks.length === 0 ? (
        <p className="text-gray-500 text-center">No feedbacks match your criteria</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 bg-white shadow-sm rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === paginatedFeedbacks.length && paginatedFeedbacks.length > 0}
                      onChange={() =>
                        setSelectedIds(
                          selectedIds.length === paginatedFeedbacks.length
                            ? []
                            : paginatedFeedbacks.map((fb) => fb._id)
                        )
                      }
                      className="cursor-pointer"
                    />
                  </th>
                  <th
                    className="border p-3 text-left text-gray-700 font-semibold cursor-pointer"
                    onClick={() => handleSort('teacher')}
                  >
                    Teacher {sortBy === 'teacher' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="border p-3 text-left text-gray-700 font-semibold">Feedback</th>
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
                {paginatedFeedbacks.map((fb) => (
                  <tr key={fb._id} className="hover:bg-gray-50 transition-colors">
                    <td className="border p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(fb._id)}
                        onChange={() => handleSelectFeedback(fb._id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="border p-3">
                      {fb.teacher ? `${fb.teacher.name} (${fb.teacher.email})` : 'Unknown'}
                    </td>
                    <td className="border p-3 truncate max-w-xs" title={fb.feedback}>
                      {fb.feedback}
                    </td>
                    <td className="border p-3">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          fb.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {fb.status}
                      </span>
                    </td>
                    <td className="border p-3">
                      {new Date(fb.createdAt).toLocaleDateString()} {new Date(fb.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="border p-3 flex gap-2">
                      {fb.status === 'Pending' ? (
                        <button
                          onClick={() => handleUpdateStatus(fb._id, 'Reviewed')}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors"
                          disabled={updatingFeedbackId === fb._id}
                        >
                          {updatingFeedbackId === fb._id ? 'Updating...' : 'Mark Reviewed'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(fb._id, 'Pending')}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 disabled:bg-gray-400 transition-colors"
                          disabled={updatingFeedbackId === fb._id}
                        >
                          {updatingFeedbackId === fb._id ? 'Updating...' : 'Revert to Pending'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
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
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
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

export default ManageFeedbacks;