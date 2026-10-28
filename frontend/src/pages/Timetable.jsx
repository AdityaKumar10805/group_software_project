import { useState, useEffect } from 'react';
import { timetableAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiOutlineCalendarDays } from 'react-icons/hi2';

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timetable = () => {
  const { isAdmin } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('my'); // 'my' or 'all'

  useEffect(() => {
    loadTimetable();
  }, [view]);

  const loadTimetable = async () => {
    setLoading(true);
    try {
      if (view === 'my') {
        const res = await timetableAPI.getMy();
        setTimetable(res.data.timetable || []);
        setGrouped(res.data.grouped || {});
      } else {
        const res = await timetableAPI.getAll();
        const data = res.data.timetable || [];
        setTimetable(data);

        // Group manually
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

  const today = dayOrder[new Date().getDay() - 1] || '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Timetable</h2>
          <p>{timetable.length} scheduled slots</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`btn ${view === 'my' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('my')}
          >
            My Schedule
          </button>
          {isAdmin && (
            <button
              className={`btn ${view === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('all')}
            >
              All Schedules
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : timetable.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><HiOutlineCalendarDays /></div>
          <h3>No timetable entries</h3>
          <p>Timetable slots will appear here once configured</p>
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
                  {slots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((slot) => (
                    <div key={slot._id} className="timetable-slot">
                      <div className="slot-time">
                        {slot.startTime} – {slot.endTime}
                      </div>
                      <div className="slot-subject">{slot.subject}</div>
                      <div className="slot-meta">
                        {slot.className}-{slot.section} • Room {slot.room || '—'}
                      </div>
                      {view === 'all' && slot.teacher && (
                        <div className="slot-meta" style={{ marginTop: 4, color: 'var(--text-accent)' }}>
                          {slot.teacher.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Timetable;
