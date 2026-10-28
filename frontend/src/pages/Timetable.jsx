import { useState, useEffect } from 'react';
import { timetableAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlineCalendarDays,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineClock,
  HiOutlineBookOpen,
} from 'react-icons/hi2';

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const initialForm = {
  day: 'Monday',
  subject: '',
  className: 'CS-A',
  section: 'A',
  startTime: '09:00',
  endTime: '10:00',
  room: '101',
  teacher: '',
};

const Timetable = () => {
  const { user, isAdmin } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('my'); // 'my' or 'all'
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTimetable();
  }, [view]);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const res = await timetableAPI.getTeachers();
      setTeachers(res.data.teachers || []);
    } catch (err) {
      console.error('Error loading teachers:', err);
    }
  };

  const loadTimetable = async () => {
    setLoading(true);
    try {
      if (view === 'my') {
        const res = await timetableAPI.getMy();
        const data = res.data.timetable || [];
        setTimetable(data);
        setGrouped(res.data.grouped || {});
      } else {
        const res = await timetableAPI.getAll();
        const data = res.data.timetable || [];
        setTimetable(data);

        const g = {};
        dayOrder.forEach((day) => {
          g[day] = data.filter((s) => s.day === day);
        });
        setGrouped(g);
      }
    } catch (err) {
      console.error('Timetable error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSlot(null);
    setForm({
      ...initialForm,
      teacher: isAdmin ? (teachers[0]?._id || user?.id || '') : (user?.id || ''),
    });
    setShowModal(true);
  };

  const openEditModal = (slot) => {
    setEditingSlot(slot);
    setForm({
      day: slot.day,
      subject: slot.subject,
      className: slot.className,
      section: slot.section,
      startTime: slot.startTime,
      endTime: slot.endTime,
      room: slot.room || '',
      teacher: slot.teacher?._id || slot.teacher || user?.id || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSlot(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.startTime >= form.endTime) {
      return toast.error('Start time must be before end time');
    }

    setSaving(true);
    try {
      if (editingSlot) {
        await timetableAPI.update(editingSlot._id, form);
        toast.success('Timetable slot updated successfully');
      } else {
        await timetableAPI.create(form);
        toast.success('Timetable slot created successfully');
      }
      closeModal();
      loadTimetable();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save timetable slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slot) => {
    if (!window.confirm(`Delete timetable slot for ${slot.subject} (${slot.day} ${slot.startTime}-${slot.endTime})?`)) {
      return;
    }

    try {
      await timetableAPI.delete(slot._id);
      toast.success('Timetable slot deleted');
      loadTimetable();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete slot');
    }
  };

  // Check if current user can edit/delete this slot
  const canModifySlot = (slot) => {
    if (isAdmin) return true;
    const slotTeacherId = slot.teacher?._id || slot.teacher;
    return slotTeacherId && (slotTeacherId === user?.id || slotTeacherId === user?._id);
  };

  const today = dayOrder[new Date().getDay() - 1] || '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Timetable Management</h2>
          <p>{timetable.length} scheduled lectures</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`btn ${view === 'my' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('my')}
            id="view-my-schedule"
          >
            My Schedule
          </button>
          <button
            className={`btn ${view === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('all')}
            id="view-all-schedules"
          >
            All Schedules
          </button>
          <button className="btn btn-primary" onClick={openCreateModal} id="add-slot-btn">
            <HiOutlinePlus /> Add Slot
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : timetable.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><HiOutlineCalendarDays /></div>
          <h3>No timetable entries found</h3>
          <p>Click "Add Slot" above to schedule a lecture</p>
        </div>
      ) : (
        <div className="timetable-grid">
          {dayOrder.map((day) => {
            const slots = grouped[day] || [];
            if (slots.length === 0) return null;

            return (
              <div
                key={day}
                className="timetable-day"
                style={day === today ? { borderColor: 'var(--accent-primary)', borderWidth: 2 } : {}}
              >
                <div className="timetable-day-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{day}</span>
                  {day === today && (
                    <span className="badge badge-present" style={{ fontSize: 10 }}>Today</span>
                  )}
                </div>
                <div className="timetable-slots">
                  {slots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((slot) => {
                    const modifiable = canModifySlot(slot);

                    return (
                      <div key={slot._id} className="timetable-slot" style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div className="slot-time">
                            <HiOutlineClock style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                            {slot.startTime} – {slot.endTime}
                          </div>
                          {modifiable && (
                            <div className="slot-actions" style={{ display: 'flex', gap: 4 }}>
                              <button
                                className="action-btn"
                                onClick={() => openEditModal(slot)}
                                title="Edit Slot"
                                style={{ padding: 2, fontSize: 13, color: 'var(--text-muted)' }}
                              >
                                <HiOutlinePencilSquare />
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={() => handleDelete(slot)}
                                title="Delete Slot"
                                style={{ padding: 2, fontSize: 13, color: 'var(--color-danger)' }}
                              >
                                <HiOutlineTrash />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="slot-subject">{slot.subject}</div>
                        <div className="slot-meta">
                          {slot.className}-{slot.section} • Room {slot.room || '—'}
                        </div>
                        {slot.teacher && (
                          <div className="slot-meta" style={{ marginTop: 4, color: 'var(--accent-primary)', fontWeight: 500 }}>
                            👨‍🏫 {slot.teacher.name || 'Assigned Instructor'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Timetable Slot Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <HiOutlineBookOpen style={{ fontSize: 22, color: 'var(--accent-primary)' }} />
                <h3>{editingSlot ? 'Edit Timetable Slot' : 'Add Timetable Slot'}</h3>
              </div>
              <button className="modal-close" onClick={closeModal}>
                <HiOutlineXMark />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Day of Week</label>
                <select
                  className="form-select"
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                  required
                >
                  {dayOrder.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Operating Systems, Mathematics"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Class</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CS-A"
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. A"
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Room / Hall</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 301, Lab 2"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                />
              </div>

              {/* Teacher Assignment */}
              <div className="form-group">
                <label className="form-label">Assigned Teacher</label>
                {isAdmin ? (
                  <select
                    className="form-select"
                    value={form.teacher}
                    onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                    required
                  >
                    <option value="">Select an instructor</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.department || t.role})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>👨‍🏫</span>
                    <strong>{user?.name}</strong> (Assigned to you)
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingSlot ? 'Update Slot' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
