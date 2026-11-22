import { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineUserGroup,
  HiOutlineQrCode,
} from 'react-icons/hi2';
import StudentIdCard from '../components/StudentIdCard';

const emptyForm = {
  studentId: '', name: '', rollNumber: '', className: '', section: '', email: '', phone: '',
};

const Students = () => {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudentCard, setSelectedStudentCard] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadStudents();
  }, [search]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const res = await studentAPI.getAll(params);
      setStudents(res.data.students || []);
    } catch (err) {
      console.error('Load students error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingStudent(null);
    setShowModal(true);
  };

  const openEdit = (student) => {
    setForm({
      studentId: student.studentId,
      name: student.name,
      rollNumber: student.rollNumber,
      className: student.className,
      section: student.section,
      email: student.email || '',
      phone: student.phone || '',
    });
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await studentAPI.update(editingStudent._id, form);
        toast.success('Student updated');
      } else {
        await studentAPI.create(form);
        toast.success('Student created');
      }
      setShowModal(false);
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await studentAPI.delete(id);
      toast.success('Student deleted');
      loadStudents();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Students</h2>
          <p>{students.length} students registered</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate} id="add-student-btn">
            <HiOutlinePlus /> Add Student
          </button>
        )}
      </div>

      {/* Search */}
      <div className="filters-bar">
        <HiOutlineMagnifyingGlass style={{ color: 'var(--text-muted)', fontSize: 18 }} />
        <input
          type="text"
          className="form-input"
          placeholder="Search by name, ID, or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 350 }}
        />
        {search && (
          <button className="btn btn-secondary btn-sm" onClick={() => setSearch('')}>
            <HiOutlineXMark /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><HiOutlineUserGroup /></div>
          <h3>No students found</h3>
          <p>{search ? 'Try a different search term' : 'Add students to get started'}</p>
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
                <th>Section</th>
                <th>Email</th>
                <th>Status</th>
                <th>QR Card</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent-primary)' }}>
                    {student.studentId}
                  </td>
                  <td style={{ fontWeight: 600 }}>{student.name}</td>
                  <td>{student.rollNumber}</td>
                  <td>{student.className}</td>
                  <td>{student.section}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{student.email || '—'}</td>
                  <td>
                    <span className={`badge ${student.isActive ? 'badge-present' : 'badge-absent'}`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedStudentCard(student)}
                      title="View Student QR Card"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      <HiOutlineQrCode /> ID Card
                    </button>
                  </td>
                  {isAdmin && (
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(student)} title="Edit">
                          <HiOutlinePencilSquare />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDelete(student._id)}
                          title="Delete"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <HiOutlineXMark />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Student ID (QR Code)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    required
                    disabled={!!editingStudent}
                    placeholder="e.g., STU2024001"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Student name"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.rollNumber}
                    onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                    required
                    placeholder="e.g., CS-A-001"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Class</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                    required
                    placeholder="e.g., CS-A"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    required
                    placeholder="e.g., A"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="student@email.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStudent ? 'Update' : 'Create'} Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student ID Card & QR Modal */}
      {selectedStudentCard && (
        <StudentIdCard
          student={selectedStudentCard}
          onClose={() => setSelectedStudentCard(null)}
        />
      )}
    </div>
  );
};

export default Students;
