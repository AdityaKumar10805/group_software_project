// ============================================================
//  MOCK DATA — full hardcoded dataset for demo/offline mode
// ============================================================

export const MOCK_USERS = [
  { _id: 'u1', name: 'Admin User', email: 'admin@smartqr.edu', password: 'admin123', role: 'admin', department: 'Administration', subjects: [], phone: '9876543210', isActive: true },
  { _id: 'u2', name: 'Priya Sharma', email: 'priya@smartqr.edu', password: 'teacher123', role: 'teacher', department: 'Computer Science', subjects: ['Data Structures', 'Algorithms'], phone: '9876543211', isActive: true },
  { _id: 'u3', name: 'Rahul Verma', email: 'rahul@smartqr.edu', password: 'teacher123', role: 'teacher', department: 'Mathematics', subjects: ['Calculus', 'Linear Algebra'], phone: '9876543212', isActive: true },
  { _id: 'u4', name: 'Anjali Mehta', email: 'anjali@smartqr.edu', password: 'teacher123', role: 'teacher', department: 'Physics', subjects: ['Engineering Physics'], phone: '9876543213', isActive: true },
];

export const MOCK_STUDENTS = [
  { _id: 's1', studentId: 'STU2024001', name: 'Aarav Singh', rollNumber: 'CS-A-001', className: 'CS-A', section: 'A', email: 'aarav@student.edu', phone: '9111111001', isActive: true },
  { _id: 's2', studentId: 'STU2024002', name: 'Diya Patel', rollNumber: 'CS-A-002', className: 'CS-A', section: 'A', email: 'diya@student.edu', phone: '9111111002', isActive: true },
  { _id: 's3', studentId: 'STU2024003', name: 'Kabir Khan', rollNumber: 'CS-A-003', className: 'CS-A', section: 'A', email: 'kabir@student.edu', phone: '9111111003', isActive: true },
  { _id: 's4', studentId: 'STU2024004', name: 'Meera Nair', rollNumber: 'CS-A-004', className: 'CS-A', section: 'A', email: 'meera@student.edu', phone: '9111111004', isActive: true },
  { _id: 's5', studentId: 'STU2024005', name: 'Rohan Gupta', rollNumber: 'CS-A-005', className: 'CS-A', section: 'A', email: 'rohan@student.edu', phone: '9111111005', isActive: true },
  { _id: 's6', studentId: 'STU2024006', name: 'Sneha Reddy', rollNumber: 'CS-A-006', className: 'CS-A', section: 'A', email: 'sneha@student.edu', phone: '9111111006', isActive: true },
  { _id: 's7', studentId: 'STU2024007', name: 'Vikram Joshi', rollNumber: 'CS-B-001', className: 'CS-B', section: 'B', email: 'vikram@student.edu', phone: '9111111007', isActive: true },
  { _id: 's8', studentId: 'STU2024008', name: 'Pooja Iyer', rollNumber: 'CS-B-002', className: 'CS-B', section: 'B', email: 'pooja@student.edu', phone: '9111111008', isActive: true },
  { _id: 's9', studentId: 'STU2024009', name: 'Arjun Chopra', rollNumber: 'CS-B-003', className: 'CS-B', section: 'B', email: 'arjun@student.edu', phone: '9111111009', isActive: true },
  { _id: 's10', studentId: 'STU2024010', name: 'Nisha Desai', rollNumber: 'CS-B-004', className: 'CS-B', section: 'B', email: 'nisha@student.edu', phone: '9111111010', isActive: false },
  { _id: 's11', studentId: 'STU2024011', name: 'Aditya Kumar', rollNumber: 'IT-A-001', className: 'IT-A', section: 'A', email: 'aditya@student.edu', phone: '9111111011', isActive: true },
  { _id: 's12', studentId: 'STU2024012', name: 'Riya Shah', rollNumber: 'IT-A-002', className: 'IT-A', section: 'A', email: 'riya@student.edu', phone: '9111111012', isActive: true },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

export const MOCK_ATTENDANCE = [
  // Today
  { _id: 'a1', studentId: 'STU2024001', student: { name: 'Aarav Singh', rollNumber: 'CS-A-001' }, className: 'CS-A', section: 'A', subject: 'Data Structures', date: today, time: '09:05', status: 'present' },
  { _id: 'a2', studentId: 'STU2024002', student: { name: 'Diya Patel', rollNumber: 'CS-A-002' }, className: 'CS-A', section: 'A', subject: 'Data Structures', date: today, time: '09:03', status: 'present' },
  { _id: 'a3', studentId: 'STU2024003', student: { name: 'Kabir Khan', rollNumber: 'CS-A-003' }, className: 'CS-A', section: 'A', subject: 'Data Structures', date: today, time: '09:17', status: 'late' },
  { _id: 'a4', studentId: 'STU2024004', student: { name: 'Meera Nair', rollNumber: 'CS-A-004' }, className: 'CS-A', section: 'A', subject: 'Data Structures', date: today, time: '09:01', status: 'present' },
  { _id: 'a5', studentId: 'STU2024005', student: { name: 'Rohan Gupta', rollNumber: 'CS-A-005' }, className: 'CS-A', section: 'A', subject: 'Data Structures', date: today, time: '', status: 'absent' },
  { _id: 'a6', studentId: 'STU2024006', student: { name: 'Sneha Reddy', rollNumber: 'CS-A-006' }, className: 'CS-A', section: 'A', subject: 'Data Structures', date: today, time: '09:09', status: 'present' },
  { _id: 'a7', studentId: 'STU2024007', student: { name: 'Vikram Joshi', rollNumber: 'CS-B-001' }, className: 'CS-B', section: 'B', subject: 'Algorithms', date: today, time: '10:02', status: 'present' },
  { _id: 'a8', studentId: 'STU2024008', student: { name: 'Pooja Iyer', rollNumber: 'CS-B-002' }, className: 'CS-B', section: 'B', subject: 'Algorithms', date: today, time: '10:00', status: 'present' },
  { _id: 'a9', studentId: 'STU2024009', student: { name: 'Arjun Chopra', rollNumber: 'CS-B-003' }, className: 'CS-B', section: 'B', subject: 'Algorithms', date: today, time: '10:22', status: 'late' },
  // Yesterday
  { _id: 'a10', studentId: 'STU2024001', student: { name: 'Aarav Singh', rollNumber: 'CS-A-001' }, className: 'CS-A', section: 'A', subject: 'Data Structures', date: yesterday, time: '09:00', status: 'present' },
  { _id: 'a11', studentId: 'STU2024002', student: { name: 'Diya Patel', rollNumber: 'CS-A-002' }, className: 'CS-A', section: 'A', subject: 'Data Structures', date: yesterday, time: '09:04', status: 'present' },
  { _id: 'a12', studentId: 'STU2024003', student: { name: 'Kabir Khan', rollNumber: 'CS-A-003' }, className: 'CS-A', section: 'A', subject: 'Data Structures', date: yesterday, time: '', status: 'absent' },
  { _id: 'a13', studentId: 'STU2024007', student: { name: 'Vikram Joshi', rollNumber: 'CS-B-001' }, className: 'CS-B', section: 'B', subject: 'Algorithms', date: yesterday, time: '10:00', status: 'present' },
  { _id: 'a14', studentId: 'STU2024008', student: { name: 'Pooja Iyer', rollNumber: 'CS-B-002' }, className: 'CS-B', section: 'B', subject: 'Algorithms', date: yesterday, time: '10:19', status: 'late' },
  // Two days ago
  { _id: 'a15', studentId: 'STU2024001', student: { name: 'Aarav Singh', rollNumber: 'CS-A-001' }, className: 'CS-A', section: 'A', subject: 'Calculus', date: twoDaysAgo, time: '11:00', status: 'present' },
  { _id: 'a16', studentId: 'STU2024002', student: { name: 'Diya Patel', rollNumber: 'CS-A-002' }, className: 'CS-A', section: 'A', subject: 'Calculus', date: twoDaysAgo, time: '11:14', status: 'late' },
  { _id: 'a17', studentId: 'STU2024004', student: { name: 'Meera Nair', rollNumber: 'CS-A-004' }, className: 'CS-A', section: 'A', subject: 'Calculus', date: twoDaysAgo, time: '11:02', status: 'present' },
  { _id: 'a18', studentId: 'STU2024005', student: { name: 'Rohan Gupta', rollNumber: 'CS-A-005' }, className: 'CS-A', section: 'A', subject: 'Calculus', date: twoDaysAgo, time: '', status: 'absent' },
];

export const MOCK_TIMETABLE = [
  { _id: 't1', day: 'Monday', subject: 'Data Structures', className: 'CS-A', section: 'A', startTime: '09:00', endTime: '10:00', room: '101', teacher: { _id: 'u2', name: 'Priya Sharma' } },
  { _id: 't2', day: 'Monday', subject: 'Algorithms', className: 'CS-B', section: 'B', startTime: '10:00', endTime: '11:00', room: '102', teacher: { _id: 'u2', name: 'Priya Sharma' } },
  { _id: 't3', day: 'Monday', subject: 'Calculus', className: 'CS-A', section: 'A', startTime: '11:00', endTime: '12:00', room: '201', teacher: { _id: 'u3', name: 'Rahul Verma' } },
  { _id: 't4', day: 'Tuesday', subject: 'Data Structures', className: 'CS-A', section: 'A', startTime: '09:00', endTime: '10:00', room: '101', teacher: { _id: 'u2', name: 'Priya Sharma' } },
  { _id: 't5', day: 'Tuesday', subject: 'Engineering Physics', className: 'IT-A', section: 'A', startTime: '10:00', endTime: '11:00', room: 'Lab 1', teacher: { _id: 'u4', name: 'Anjali Mehta' } },
  { _id: 't6', day: 'Wednesday', subject: 'Algorithms', className: 'CS-A', section: 'A', startTime: '09:00', endTime: '10:00', room: '101', teacher: { _id: 'u2', name: 'Priya Sharma' } },
  { _id: 't7', day: 'Wednesday', subject: 'Linear Algebra', className: 'CS-B', section: 'B', startTime: '11:00', endTime: '12:00', room: '203', teacher: { _id: 'u3', name: 'Rahul Verma' } },
  { _id: 't8', day: 'Thursday', subject: 'Data Structures', className: 'CS-B', section: 'B', startTime: '09:00', endTime: '10:00', room: '102', teacher: { _id: 'u2', name: 'Priya Sharma' } },
  { _id: 't9', day: 'Thursday', subject: 'Calculus', className: 'IT-A', section: 'A', startTime: '10:00', endTime: '11:00', room: '201', teacher: { _id: 'u3', name: 'Rahul Verma' } },
  { _id: 't10', day: 'Friday', subject: 'Engineering Physics', className: 'CS-A', section: 'A', startTime: '09:00', endTime: '10:00', room: 'Lab 2', teacher: { _id: 'u4', name: 'Anjali Mehta' } },
  { _id: 't11', day: 'Friday', subject: 'Algorithms', className: 'IT-A', section: 'A', startTime: '11:00', endTime: '12:00', room: '102', teacher: { _id: 'u2', name: 'Priya Sharma' } },
  { _id: 't12', day: 'Saturday', subject: 'Linear Algebra', className: 'CS-A', section: 'A', startTime: '09:00', endTime: '10:00', room: '201', teacher: { _id: 'u3', name: 'Rahul Verma' } },
];

// ---- Derived stats ----
const todayRecords = MOCK_ATTENDANCE.filter(a => a.date === today);
const todayPresent = todayRecords.filter(a => a.status === 'present').length;
const todayLate    = todayRecords.filter(a => a.status === 'late').length;
const todayAbsent  = todayRecords.filter(a => a.status === 'absent').length;

const makeDay = (daysAgo, p, l, ab) => {
  const d = new Date(Date.now() - daysAgo * 86400000);
  return { _id: d.toISOString().split('T')[0], present: p, late: l, absent: ab };
};

export const MOCK_DASHBOARD = {
  totalStudents: MOCK_STUDENTS.length,
  totalUsers: MOCK_USERS.length,
  todayStats: { present: todayPresent, late: todayLate, absent: todayAbsent, total: todayRecords.length },
  weeklyTrend: [
    makeDay(6, 8, 2, 2),
    makeDay(5, 10, 1, 1),
    makeDay(4, 7, 3, 2),
    makeDay(3, 9, 1, 2),
    makeDay(2, 11, 2, 1),
    makeDay(1, todayPresent || 8, todayLate || 2, todayAbsent || 2),
    makeDay(0, todayPresent, todayLate, todayAbsent),
  ],
};

export const MOCK_TODAY_SUMMARY = {
  total: todayRecords.length,
  present: todayPresent,
  late: todayLate,
  absent: todayAbsent,
  subjectWise: {
    'Data Structures': { present: 4, late: 1, absent: 1, total: 6 },
    'Algorithms':      { present: 2, late: 1, absent: 0, total: 3 },
  },
};

export const MOCK_SUBJECT_REPORT = [
  { subject: 'Data Structures', totalDays: 15, totalPresent: 72, totalLate: 12, totalAbsent: 6, totalRecords: 90, attendanceRate: 93.3 },
  { subject: 'Algorithms',      totalDays: 12, totalPresent: 55, totalLate: 10, totalAbsent: 7, totalRecords: 72, attendanceRate: 90.3 },
  { subject: 'Calculus',        totalDays: 14, totalPresent: 60, totalLate: 8,  totalAbsent: 16, totalRecords: 84, attendanceRate: 80.9 },
  { subject: 'Linear Algebra',  totalDays: 10, totalPresent: 42, totalLate: 5,  totalAbsent: 13, totalRecords: 60, attendanceRate: 78.3 },
  { subject: 'Engineering Physics', totalDays: 8, totalPresent: 30, totalLate: 6, totalAbsent: 12, totalRecords: 48, attendanceRate: 75.0 },
];

export const MOCK_STUDENT_REPORT = MOCK_STUDENTS.map((s, i) => ({
  studentId: s.studentId,
  name: s.name,
  rollNumber: s.rollNumber,
  className: s.className,
  section: s.section,
  totalPresent: 20 - i,
  totalLate: i % 3,
  totalAbsent: i % 4,
  totalRecords: 24,
  attendanceRate: Math.max(55, 95 - i * 3),
}));

export const MOCK_DAILY_REPORT = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(Date.now() - (13 - i) * 86400000);
  return {
    date: d.toISOString().split('T')[0],
    totalPresent: 7 + (i % 4),
    totalLate: 1 + (i % 2),
    totalAbsent: 2 - (i % 2),
  };
});
