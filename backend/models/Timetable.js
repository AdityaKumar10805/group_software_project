const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, 'Day is required'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
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
    className: {
      type: String,
      required: [true, 'Class is required'],
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
    },
    room: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookup by day, time, and teacher
timetableSchema.index({ day: 1, startTime: 1, endTime: 1, teacher: 1 });
timetableSchema.index({ day: 1, className: 1, section: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
