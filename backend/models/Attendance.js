const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher is required'],
    },
    timetableSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Timetable',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present',
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate attendance for same student in same lecture on same date
attendanceSchema.index(
  { student: 1, subject: 1, date: 1, timetableSlot: 1 },
  { unique: true }
);

// Index for report queries
attendanceSchema.index({ date: 1, subject: 1, className: 1, section: 1 });
attendanceSchema.index({ student: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
