import { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, AreaChart, Area,
} from 'recharts';
import { HiOutlineChartBarSquare, HiOutlineAcademicCap, HiOutlineCalendarDays } from 'react-icons/hi2';

const tooltipStyle = {
  background: '#1a1f35',
  border: '1px solid rgba(148,163,184,0.1)',
  borderRadius: 10,
  color: '#f1f5f9',
  fontSize: 13,
};

const Reports = () => {
  const [activeTab, setActiveTab] = useState('subject');
  const [subjectReport, setSubjectReport] = useState([]);
  const [studentReport, setStudentReport] = useState([]);
  const [dailyReport, setDailyReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; })(),
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = { ...dateRange };
      const [subRes, stuRes, dayRes] = await Promise.all([
        reportAPI.subject(params),
        reportAPI.student(params),
        reportAPI.daily(params),
      ]);
      setSubjectReport(subRes.data.report || []);
      setStudentReport(stuRes.data.report || []);
      setDailyReport(dayRes.data.report || []);
    } catch (err) {
      console.error('Reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'subject', label: 'Subject-wise', icon: HiOutlineChartBarSquare },
    { id: 'student', label: 'Student-wise', icon: HiOutlineAcademicCap },
    { id: 'daily', label: 'Daily Trend', icon: HiOutlineCalendarDays },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p>Comprehensive attendance analytics and insights</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="filters-bar">
        <label className="form-label" style={{ marginBottom: 0, marginRight: 8 }}>From:</label>
        <input
          type="date"
          className="form-input"
          value={dateRange.startDate}
          onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          style={{ maxWidth: 170 }}
        />
        <label className="form-label" style={{ marginBottom: 0, marginRight: 8 }}>To:</label>
        <input
          type="date"
          className="form-input"
          value={dateRange.endDate}
          onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          style={{ maxWidth: 170 }}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon /> {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <>
          {/* Subject-wise Report */}
          {activeTab === 'subject' && (
            <>
              <div className="chart-container">
                <h3>Subject-wise Attendance Overview</h3>
                {subjectReport.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={subjectReport}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="subject" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 13 }} />
                      <Bar dataKey="totalPresent" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="totalLate" name="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="totalAbsent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state"><p>No data available for this period</p></div>
                )}
              </div>

              {subjectReport.length > 0 && (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Days</th>
                        <th>Present</th>
                        <th>Late</th>
                        <th>Absent</th>
                        <th>Total</th>
                        <th>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectReport.map((r) => (
                        <tr key={r.subject}>
                          <td style={{ fontWeight: 600 }}>{r.subject}</td>
                          <td>{r.totalDays}</td>
                          <td><span className="badge badge-present">{r.totalPresent}</span></td>
                          <td><span className="badge badge-late">{r.totalLate}</span></td>
                          <td><span className="badge badge-absent">{r.totalAbsent}</span></td>
                          <td>{r.totalRecords}</td>
                          <td style={{ fontWeight: 700, color: r.attendanceRate >= 75 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            {r.attendanceRate?.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Student-wise Report */}
          {activeTab === 'student' && (
            <div className="table-container">
              {studentReport.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Name</th>
                      <th>Roll No</th>
                      <th>Class</th>
                      <th>Present</th>
                      <th>Late</th>
                      <th>Absent</th>
                      <th>Total</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentReport.map((r) => (
                      <tr key={r.studentId}>
                        <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{r.studentId}</td>
                        <td style={{ fontWeight: 600 }}>{r.name}</td>
                        <td>{r.rollNumber}</td>
                        <td>{r.className}-{r.section}</td>
                        <td><span className="badge badge-present">{r.totalPresent}</span></td>
                        <td><span className="badge badge-late">{r.totalLate}</span></td>
                        <td><span className="badge badge-absent">{r.totalAbsent}</span></td>
                        <td>{r.totalRecords}</td>
                        <td style={{
                          fontWeight: 700,
                          color: r.attendanceRate >= 75 ? 'var(--color-success)' : r.attendanceRate >= 50 ? 'var(--color-warning)' : 'var(--color-danger)',
                        }}>
                          {r.attendanceRate?.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state"><p>No student data for this period</p></div>
              )}
            </div>
          )}

          {/* Daily Trend */}
          {activeTab === 'daily' && (
            <div className="chart-container">
              <h3>Daily Attendance Trend</h3>
              {dailyReport.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={dailyReport}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                    <Area type="monotone" dataKey="totalPresent" name="Present" stroke="#10b981" fill="rgba(16,185,129,0.2)" />
                    <Area type="monotone" dataKey="totalLate" name="Late" stroke="#f59e0b" fill="rgba(245,158,11,0.2)" />
                    <Area type="monotone" dataKey="totalAbsent" name="Absent" stroke="#ef4444" fill="rgba(239,68,68,0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state"><p>No daily data available</p></div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
