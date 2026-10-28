import { useState, useEffect } from 'react';
import { reportAPI, attendanceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todaySummary, setTodaySummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, summaryRes] = await Promise.all([
        reportAPI.dashboard(),
        attendanceAPI.todaySummary(),
      ]);
      setStats(statsRes.data);
      setTodaySummary(summaryRes.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  const pieData = stats?.todayStats
    ? [
        { name: 'Present', value: stats.todayStats.present },
        { name: 'Late', value: stats.todayStats.late },
        { name: 'Absent', value: stats.todayStats.absent },
      ].filter((d) => d.value > 0)
    : [];

  const weeklyChartData = stats?.weeklyTrend?.map((d) => ({
    date: d._id.slice(5),
    Present: d.present,
    Late: d.late,
    Absent: d.absent,
  })) || [];

  return (
    <div>
      {/* Welcome */}
      <div className="page-header">
        <div>
          <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Here's what's happening with attendance today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-purple">
          <div className="stat-icon"><HiOutlineUserGroup /></div>
          <div className="stat-info">
            <h3>Total Students</h3>
            <div className="stat-value">{stats?.totalStudents || 0}</div>
            <div className="stat-sub">Registered students</div>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon"><HiOutlineCheckCircle /></div>
          <div className="stat-info">
            <h3>Present Today</h3>
            <div className="stat-value">{stats?.todayStats?.present || 0}</div>
            <div className="stat-sub">Scanned today</div>
          </div>
        </div>
        <div className="stat-card stat-amber">
          <div className="stat-icon"><HiOutlineClock /></div>
          <div className="stat-info">
            <h3>Late Today</h3>
            <div className="stat-value">{stats?.todayStats?.late || 0}</div>
            <div className="stat-sub">Arrived late</div>
          </div>
        </div>
        <div className="stat-card stat-red">
          <div className="stat-icon"><HiOutlineXCircle /></div>
          <div className="stat-info">
            <h3>Absent Today</h3>
            <div className="stat-value">{stats?.todayStats?.absent || 0}</div>
            <div className="stat-sub">Not scanned</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Weekly Trend Bar Chart */}
        <div className="chart-container">
          <h3>Weekly Attendance Trend</h3>
          {weeklyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1f35',
                    border: '1px solid rgba(148,163,184,0.1)',
                    borderRadius: 10,
                    color: '#f1f5f9',
                  }}
                />
                <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p>No weekly data yet</p>
            </div>
          )}
        </div>

        {/* Today's Pie Chart */}
        <div className="chart-container">
          <h3>Today's Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1a1f35',
                    border: '1px solid rgba(148,163,184,0.1)',
                    borderRadius: 10,
                    color: '#f1f5f9',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 13, color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p>No attendance recorded today</p>
            </div>
          )}
        </div>
      </div>

      {/* Subject-wise Summary */}
      {todaySummary?.subjectWise && Object.keys(todaySummary.subjectWise).length > 0 && (
        <div className="chart-container">
          <h3>Today's Subject-wise Breakdown</h3>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Present</th>
                  <th>Late</th>
                  <th>Absent</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(todaySummary.subjectWise).map(([subject, data]) => (
                  <tr key={subject}>
                    <td style={{ fontWeight: 600 }}>{subject}</td>
                    <td><span className="badge badge-present">{data.present}</span></td>
                    <td><span className="badge badge-late">{data.late}</span></td>
                    <td><span className="badge badge-absent">{data.absent}</span></td>
                    <td>{data.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
