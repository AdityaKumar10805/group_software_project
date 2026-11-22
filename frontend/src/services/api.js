import {
  MOCK_USERS, MOCK_STUDENTS, MOCK_ATTENDANCE, MOCK_TIMETABLE,
  MOCK_DASHBOARD, MOCK_TODAY_SUMMARY,
  MOCK_SUBJECT_REPORT, MOCK_STUDENT_REPORT, MOCK_DAILY_REPORT,
} from './mockData';

// In-memory state (resets on page refresh — demo only)
let students   = [...MOCK_STUDENTS];
let attendance = [...MOCK_ATTENDANCE];
let timetable  = [...MOCK_TIMETABLE];
let users      = [...MOCK_USERS];
let nextId     = 100;

const delay = () => new Promise(r => setTimeout(r, 300));
const ok = (data) => ({ data });

// ===== Auth =====
export const authAPI = {
  login: async ({ email, password }) => {
    await delay();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw { response: { data: { message: 'Invalid email or password' } } };
    const token = 'mock-jwt-token-' + user._id;
    return ok({ token, user: { ...user, id: user._id } });
  },
  getMe: async () => {
    await delay();
    const stored = localStorage.getItem('user');
    if (!stored) throw { response: { status: 401 } };
    return ok({ user: JSON.parse(stored) });
  },
  register: async (data) => {
    await delay();
    const newUser = { ...data, _id: 'u' + (++nextId), isActive: true, subjects: data.subjects || [] };
    users.push(newUser);
    return ok({ user: newUser });
  },
  getUsers: async () => {
    await delay();
    return ok({ users });
  },
  updateUser: async (id, data) => {
    await delay();
    users = users.map(u => u._id === id ? { ...u, ...data } : u);
    return ok({ user: users.find(u => u._id === id) });
  },
  deleteUser: async (id) => {
    await delay();
    users = users.filter(u => u._id !== id);
    return ok({});
  },
};

// ===== Students =====
export const studentAPI = {
  getAll: async ({ search } = {}) => {
    await delay();
    let result = [...students];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q)
      );
    }
    return ok({ students: result });
  },
  getById: async (id) => {
    await delay();
    return ok({ student: students.find(s => s._id === id) });
  },
  verify: async (studentId) => {
    await delay();
    const s = students.find(s => s.studentId === studentId);
    if (!s) throw { response: { data: { message: 'Student not found' } } };
    return ok({ student: s });
  },
  create: async (data) => {
    await delay();
    const s = { ...data, _id: 's' + (++nextId), isActive: true };
    students.push(s);
    return ok({ student: s });
  },
  update: async (id, data) => {
    await delay();
    students = students.map(s => s._id === id ? { ...s, ...data } : s);
    return ok({ student: students.find(s => s._id === id) });
  },
  delete: async (id) => {
    await delay();
    students = students.filter(s => s._id !== id);
    return ok({});
  },
  getClasses: async () => {
    await delay();
    const classes = [...new Set(students.map(s => s.className))];
    return ok({ classes });
  },
};

// ===== Attendance =====
export const attendanceAPI = {
  scan: async ({ studentId, subject, className, section }) => {
    await delay();
    const student = students.find(s => s.studentId === studentId);
    if (!student) throw { response: { data: { message: 'Student not found' } } };
    const record = {
      _id: 'a' + (++nextId),
      studentId,
      student: { name: student.name, rollNumber: student.rollNumber },
      className: className || student.className,
      section: section || student.section,
      subject: subject || 'General',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      status: 'present',
    };
    attendance.push(record);
    return ok({ message: 'Attendance recorded', record });
  },
  manual: async (data) => {
    await delay();
    const record = { _id: 'a' + (++nextId), ...data };
    attendance.push(record);
    return ok({ record });
  },
  getAll: async (params = {}) => {
    await delay();
    let result = [...attendance];
    if (params.date)      result = result.filter(a => a.date === params.date);
    if (params.subject)   result = result.filter(a => a.subject.toLowerCase().includes(params.subject.toLowerCase()));
    if (params.className) result = result.filter(a => a.className.toLowerCase().includes(params.className.toLowerCase()));
    if (params.studentId) result = result.filter(a => a.studentId.includes(params.studentId));
    return ok({ attendance: result });
  },
  update: async (id, data) => {
    await delay();
    attendance = attendance.map(a => a._id === id ? { ...a, ...data } : a);
    return ok({ record: attendance.find(a => a._id === id) });
  },
  delete: async (id) => {
    await delay();
    attendance = attendance.filter(a => a._id !== id);
    return ok({});
  },
  todaySummary: async () => {
    await delay();
    return ok(MOCK_TODAY_SUMMARY);
  },
};

// ===== Timetable =====
export const timetableAPI = {
  getAll: async () => {
    await delay();
    return ok({ timetable });
  },
  getCurrent: async () => {
    await delay();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = days[new Date().getDay()];
    const now = new Date().toTimeString().slice(0,5);
    const current = timetable.find(t => t.day === today && t.startTime <= now && t.endTime >= now);
    return ok({ slot: current || null });
  },
  getMy: async () => {
    await delay();
    const stored = localStorage.getItem('user');
    const user = stored ? JSON.parse(stored) : null;
    const mySlots = user
      ? timetable.filter(t => t.teacher?._id === user._id || t.teacher?._id === user.id)
      : timetable;
    const grouped = {};
    mySlots.forEach(s => {
      if (!grouped[s.day]) grouped[s.day] = [];
      grouped[s.day].push(s);
    });
    return ok({ timetable: mySlots, grouped });
  },
  getTeachers: async () => {
    await delay();
    return ok({ teachers: users.filter(u => u.role === 'teacher' || u.role === 'admin') });
  },
  create: async (data) => {
    await delay();
    const teacher = users.find(u => u._id === data.teacher);
    const slot = { ...data, _id: 't' + (++nextId), teacher: teacher ? { _id: teacher._id, name: teacher.name } : data.teacher };
    timetable.push(slot);
    return ok({ slot });
  },
  update: async (id, data) => {
    await delay();
    const teacher = users.find(u => u._id === data.teacher);
    timetable = timetable.map(t => t._id === id
      ? { ...t, ...data, teacher: teacher ? { _id: teacher._id, name: teacher.name } : t.teacher }
      : t
    );
    return ok({ slot: timetable.find(t => t._id === id) });
  },
  delete: async (id) => {
    await delay();
    timetable = timetable.filter(t => t._id !== id);
    return ok({});
  },
};

// ===== Reports =====
export const reportAPI = {
  dashboard: async () => {
    await delay();
    return ok(MOCK_DASHBOARD);
  },
  subject: async () => {
    await delay();
    return ok({ report: MOCK_SUBJECT_REPORT });
  },
  student: async () => {
    await delay();
    return ok({ report: MOCK_STUDENT_REPORT });
  },
  daily: async () => {
    await delay();
    return ok({ report: MOCK_DAILY_REPORT });
  },
};

export default { authAPI, studentAPI, attendanceAPI, timetableAPI, reportAPI };
