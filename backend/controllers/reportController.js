const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// GET /api/reports/subject — subject-wise attendance report
exports.subjectReport = async (req, res) => {
  try {
    const { subject, className, section, startDate, endDate } = req.query;

    const matchFilter = {};
    if (subject) matchFilter.subject = subject;
    if (className) matchFilter.className = className;
    if (section) matchFilter.section = section;
    if (req.user.role === 'teacher') matchFilter.teacher = req.user._id;

    if (startDate && endDate) {
      matchFilter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const report = await Attendance.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$subject',
          totalClasses: { $addToSet: '$date' },
          totalPresent: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          totalLate: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          totalAbsent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          totalRecords: { $sum: 1 },
        },
      },
      {
        $project: {
          subject: '$_id',
          totalDays: { $size: '$totalClasses' },
          totalPresent: 1,
          totalLate: 1,
          totalAbsent: 1,
          totalRecords: 1,
          attendanceRate: {
            $multiply: [
              {
                $divide: [
                  { $add: ['$totalPresent', '$totalLate'] },
                  { $cond: [{ $eq: ['$totalRecords', 0] }, 1, '$totalRecords'] },
                ],
              },
              100,
            ],
          },
        },
      },
      { $sort: { subject: 1 } },
    ]);

    res.json({ report });
  } catch (error) {
    console.error('Subject report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/reports/student — student-wise attendance report
exports.studentReport = async (req, res) => {
  try {
    const { studentId, className, section, startDate, endDate } = req.query;

    const matchFilter = {};
    if (studentId) matchFilter.studentId = studentId;
    if (className) matchFilter.className = className;
    if (section) matchFilter.section = section;
    if (req.user.role === 'teacher') matchFilter.teacher = req.user._id;

    if (startDate && endDate) {
      matchFilter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const report = await Attendance.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { studentId: '$studentId', student: '$student' },
          totalPresent: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          totalLate: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          totalAbsent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          totalRecords: { $sum: 1 },
          subjects: { $addToSet: '$subject' },
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id.student',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
      {
        $project: {
          studentId: '$_id.studentId',
          name: '$studentInfo.name',
          rollNumber: '$studentInfo.rollNumber',
          className: '$studentInfo.className',
          section: '$studentInfo.section',
          totalPresent: 1,
          totalLate: 1,
          totalAbsent: 1,
          totalRecords: 1,
          subjects: 1,
          attendanceRate: {
            $multiply: [
              {
                $divide: [
                  { $add: ['$totalPresent', '$totalLate'] },
                  { $cond: [{ $eq: ['$totalRecords', 0] }, 1, '$totalRecords'] },
                ],
              },
              100,
            ],
          },
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.json({ report });
  } catch (error) {
    console.error('Student report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/reports/daily — daily attendance summary
exports.dailyReport = async (req, res) => {
  try {
    const { startDate, endDate, className, section } = req.query;

    const matchFilter = {};
    if (className) matchFilter.className = className;
    if (section) matchFilter.section = section;
    if (req.user.role === 'teacher') matchFilter.teacher = req.user._id;

    if (startDate && endDate) {
      matchFilter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const report = await Attendance.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalPresent: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          totalLate: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          totalAbsent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          totalRecords: { $sum: 1 },
        },
      },
      {
        $project: {
          date: '$_id',
          totalPresent: 1,
          totalLate: 1,
          totalAbsent: 1,
          totalRecords: 1,
          attendanceRate: {
            $multiply: [
              {
                $divide: [
                  { $add: ['$totalPresent', '$totalLate'] },
                  { $cond: [{ $eq: ['$totalRecords', 0] }, 1, '$totalRecords'] },
                ],
              },
              100,
            ],
          },
        },
      },
      { $sort: { date: -1 } },
    ]);

    res.json({ report });
  } catch (error) {
    console.error('Daily report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/reports/dashboard — dashboard stats
exports.dashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalStudents = await Student.countDocuments({ isActive: true });

    const todayFilter = { date: today };
    if (req.user.role === 'teacher') todayFilter.teacher = req.user._id;

    const todayAttendance = await Attendance.find(todayFilter);

    const todayPresent = todayAttendance.filter((a) => a.status === 'present').length;
    const todayLate = todayAttendance.filter((a) => a.status === 'late').length;
    const todayAbsent = todayAttendance.filter((a) => a.status === 'absent').length;

    // Last 7 days trend
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekFilter = { date: { $gte: weekAgo, $lte: today } };
    if (req.user.role === 'teacher') weekFilter.teacher = req.user._id;

    const weeklyData = await Attendance.aggregate([
      { $match: weekFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalStudents,
      todayStats: {
        present: todayPresent,
        late: todayLate,
        absent: todayAbsent,
        total: todayAttendance.length,
      },
      weeklyTrend: weeklyData,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
