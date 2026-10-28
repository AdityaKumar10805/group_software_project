const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Timetable = require('../models/Timetable');

// Helper: get current day name
const getDayName = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

// Helper: get today's date at midnight (for date-only comparisons)
const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Helper: current time as HH:mm string
const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// POST /api/attendance/scan — main QR scan endpoint
exports.scanAttendance = async (req, res) => {
  try {
    const { studentId, timetableSlotId } = req.body;
    const teacherId = req.user._id;
    const now = new Date();
    const today = getToday();
    const currentTime = getCurrentTime();
    const dayName = getDayName(now);

    // 1. Verify student
    const student = await Student.findOne({ studentId, isActive: true });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or inactive',
      });
    }

    // 2. Find current timetable slot
    let timetableSlot;
    if (timetableSlotId) {
      timetableSlot = await Timetable.findById(timetableSlotId);
    } else {
      // Auto-detect from timetable:
      // First try matching logged-in user's assigned slot
      timetableSlot = await Timetable.findOne({
        day: dayName,
        teacher: teacherId,
        startTime: { $lte: currentTime },
        endTime: { $gte: currentTime },
      });

      // If not found, match ANY active slot for current day and time (e.g. for admin or subbing)
      if (!timetableSlot) {
        timetableSlot = await Timetable.findOne({
          day: dayName,
          startTime: { $lte: currentTime },
          endTime: { $gte: currentTime },
        });
      }
    }

    if (!timetableSlot) {
      return res.status(400).json({
        success: false,
        message: 'No lecture found for the current time slot. Please select a subject manually.',
        student: { name: student.name, studentId: student.studentId, className: student.className },
      });
    }

    // 3. Check for duplicate attendance
    const existingAttendance = await Attendance.findOne({
      student: student._id,
      timetableSlot: timetableSlot._id,
      date: today,
    });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: `${student.name} is already marked ${existingAttendance.status} for ${timetableSlot.subject}`,
        duplicate: true,
        student: { name: student.name, studentId: student.studentId },
      });
    }

    // 4. Determine status (late if more than 10 minutes after start)
    const [startH, startM] = timetableSlot.startTime.split(':').map(Number);
    const [currH, currM] = currentTime.split(':').map(Number);
    const minutesLate = (currH * 60 + currM) - (startH * 60 + startM);
    const status = minutesLate > 10 ? 'late' : 'present';

    // 5. Record attendance
    const attendance = await Attendance.create({
      student: student._id,
      studentId: student.studentId,
      subject: timetableSlot.subject,
      teacher: teacherId,
      timetableSlot: timetableSlot._id,
      date: today,
      time: currentTime,
      status,
      className: student.className,
      section: student.section,
      markedBy: teacherId,
    });

    res.status(201).json({
      success: true,
      message: `${student.name} marked ${status} for ${timetableSlot.subject}`,
      attendance: {
        id: attendance._id,
        studentName: student.name,
        studentId: student.studentId,
        rollNumber: student.rollNumber,
        subject: timetableSlot.subject,
        status,
        time: currentTime,
        className: student.className,
        section: student.section,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate attendance entry',
        duplicate: true,
      });
    }
    console.error('Scan attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error during attendance recording' });
  }
};

// POST /api/attendance/manual — manual attendance entry
exports.manualAttendance = async (req, res) => {
  try {
    const { studentId, subject, date, status, className, section, timetableSlotId } = req.body;
    const teacherId = req.user._id;

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const attendanceDate = date ? new Date(date) : getToday();

    // Check duplicate
    const filter = { student: student._id, subject, date: attendanceDate };
    if (timetableSlotId) filter.timetableSlot = timetableSlotId;

    const existing = await Attendance.findOne(filter);
    if (existing) {
      return res.status(409).json({ message: 'Attendance already recorded', duplicate: true });
    }

    const attendance = await Attendance.create({
      student: student._id,
      studentId: student.studentId,
      subject,
      teacher: teacherId,
      timetableSlot: timetableSlotId,
      date: attendanceDate,
      time: getCurrentTime(),
      status: status || 'present',
      className: className || student.className,
      section: section || student.section,
      markedBy: teacherId,
    });

    res.status(201).json({ message: 'Attendance recorded', attendance });
  } catch (error) {
    console.error('Manual attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/attendance — list attendance records
exports.getAttendance = async (req, res) => {
  try {
    const { date, subject, className, section, studentId, startDate, endDate } = req.query;
    const filter = {};

    if (date) {
      const d = new Date(date);
      filter.date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (subject) filter.subject = subject;
    if (className) filter.className = className;
    if (section) filter.section = section;
    if (studentId) filter.studentId = studentId;

    // Teachers can only see their own records (admins see all)
    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }

    const attendance = await Attendance.find(filter)
      .populate('student', 'name rollNumber studentId className section')
      .populate('teacher', 'name email')
      .populate('timetableSlot', 'startTime endTime room')
      .sort({ date: -1, time: -1 });

    res.json({ attendance, count: attendance.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/attendance/:id — edit attendance (teacher only)
exports.updateAttendance = async (req, res) => {
  try {
    const { status } = req.body;
    const filter = { _id: req.params.id };

    // Teachers can only edit their own records
    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }

    const attendance = await Attendance.findOneAndUpdate(
      filter,
      { status, markedBy: req.user._id },
      { new: true }
    ).populate('student', 'name rollNumber studentId');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance updated', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/attendance/:id
exports.deleteAttendance = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }

    const attendance = await Attendance.findOneAndDelete(filter);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/attendance/today/summary — today's summary for dashboard
exports.getTodaySummary = async (req, res) => {
  try {
    const today = getToday();
    const filter = { date: today };
    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }

    const records = await Attendance.find(filter).populate('student', 'name rollNumber');

    const totalPresent = records.filter((r) => r.status === 'present').length;
    const totalLate = records.filter((r) => r.status === 'late').length;
    const totalAbsent = records.filter((r) => r.status === 'absent').length;

    // Group by subject
    const subjectWise = {};
    records.forEach((r) => {
      if (!subjectWise[r.subject]) {
        subjectWise[r.subject] = { present: 0, late: 0, absent: 0, total: 0 };
      }
      subjectWise[r.subject][r.status]++;
      subjectWise[r.subject].total++;
    });

    res.json({
      date: today,
      totalRecords: records.length,
      totalPresent,
      totalLate,
      totalAbsent,
      subjectWise,
      recentScans: records.slice(-10).reverse(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
