import { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlineFunnel,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineArrowDownTray,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';

const Attendance = () => {
  const { isAdmin } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: '',
    className: '',
    studentId: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    loadAttendance();
  }, [filters]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.date) params.date = filters.date;
      if (filters.subject) params.subject = filters.subject;
      if (filters.className) params.className = filters.className;
      if (filters.studentId) params.studentId = filters.studentId;

      const res = await attendanceAPI.getAll(params);
      setRecords(res.data.attendance || []);
    } catch (err) {
      console.error('Load attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await attendanceAPI.update(id, { status: editStatus });
      toast.success('Attendance updated');
      setEditingId(null);
      loadAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await attendanceAPI.delete(id);
      toast.success('Record deleted');
      loadAttendance();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const exportCSV = () => {
    if (records.length === 0) return toast.error('No data to export');

    const headers = ['Student ID', 'Name', 'Roll No', 'Class', 'Section', 'Subject', 'Date', 'Time', 'Status'];
    const rows = records.map((r) => [
      r.studentId,
      r.student?.name || '',
      r.student?.rollNumber || '',
      r.className,
      r.section,
      r.subject,
      new Date(r.date).toLocaleDateString(),
      r.time,
      r.status,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${filters.date || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Attendance Records</h2>
          <p>{records.length} records found</p>
        </div>
        <button className="btn btn-secondary" onClick={exportCSV} id="export-csv-btn">
          <HiOutlineArrowDownTray /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <HiOutlineFunnel style={{ color: 'var(--text-muted)', fontSize: 18 }} />
        <input
          type="date"
          className="form-input"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          style={{ maxWidth: 180 }}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Subject"
          value={filters.subject}
          onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
          style={{ maxWidth: 160 }}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Class"
          value={filters.className}
          onChange={(e) => setFilters({ ...filters, className: e.target.value })}
          style={{ maxWidth: 120 }}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Student ID"
          value={filters.studentId}
          onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
          style={{ maxWidth: 140 }}
        />
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setFilters({ date: '', subject: '', className: '', studentId: '' })}
        >
          Clear
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <HiOutlineClipboardDocumentList />
          </div>
          <h3>No attendance records</h3>
          <p>Try changing the filters or scan some QR codes</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Roll No</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{record.studentId}</td>
                  <td style={{ fontWeight: 600 }}>{record.student?.name || '—'}</td>
                  <td>{record.student?.rollNumber || '—'}</td>
                  <td>{record.className}-{record.section}</td>
                  <td>{record.subject}</td>
                  <td>{record.time}</td>
                  <td>
                    {editingId === record._id ? (
                      <select
                        className="form-select"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        style={{ maxWidth: 110, padding: '4px 8px', fontSize: 12 }}
                      >
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                        <option value="absent">Absent</option>
                      </select>
                    ) : (
                      <span className={`badge badge-${record.status}`}>{record.status}</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {editingId === record._id ? (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => handleUpdate(record._id)}>
                            Save
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setEditingId(record._id);
                              setEditStatus(record.status);
                            }}
                            title="Edit"
                          >
                            <HiOutlinePencilSquare />
                          </button>
                          {isAdmin && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDelete(record._id)}
                              title="Delete"
                              style={{ color: 'var(--color-danger)' }}
                            >
                              <HiOutlineTrash />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attendance;
