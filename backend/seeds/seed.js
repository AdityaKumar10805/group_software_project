const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Student = require('../models/Student');
const Timetable = require('../models/Timetable');
const Attendance = require('../models/Attendance');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Timetable.deleteMany({});
    await Attendance.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@smartqr.edu',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
      phone: '9876543210',
    });
    console.log('👤 Admin created: admin@smartqr.edu / admin123');

    // Create Teachers
    const teachers = await User.create([
      {
        name: 'Dr. Priya Sharma',
        email: 'priya@smartqr.edu',
        password: 'teacher123',
        role: 'teacher',
        department: 'Computer Science',
        subjects: ['Data Structures', 'Algorithms'],
        phone: '9876543211',
      },
      {
        name: 'Prof. Rajesh Kumar',
        email: 'rajesh@smartqr.edu',
        password: 'teacher123',
        role: 'teacher',
        department: 'Computer Science',
        subjects: ['Database Systems', 'Operating Systems'],
        phone: '9876543212',
      },
      {
        name: 'Dr. Anita Verma',
        email: 'anita@smartqr.edu',
        password: 'teacher123',
        role: 'teacher',
        department: 'Mathematics',
        subjects: ['Mathematics', 'Statistics'],
        phone: '9876543213',
      },
    ]);
    console.log(`👨‍🏫 ${teachers.length} Teachers created`);

    // Create Students
    const studentsData = [];
    const names = [
      'Aarav Patel', 'Vivaan Singh', 'Aditya Mehta', 'Vihaan Gupta', 'Arjun Reddy',
      'Sai Kumar', 'Reyansh Joshi', 'Ayaan Shah', 'Krishna Nair', 'Ishaan Iyer',
      'Diya Sharma', 'Ananya Mishra', 'Saanvi Rao', 'Aadhya Verma', 'Myra Das',
      'Kavya Pillai', 'Riya Chopra', 'Isha Saxena', 'Nisha Agarwal', 'Priya Tiwari',
      'Rahul Deshmukh', 'Amit Chauhan', 'Deepak Pandey', 'Saurabh Yadav', 'Nikhil Bhatt',
      'Pooja Kulkarni', 'Sneha Patil', 'Ritika Jain', 'Megha Srivastava', 'Tanvi Bhat',
    ];

    const classes = ['CS-A', 'CS-B'];
    const sections = ['A', 'B'];

    names.forEach((name, i) => {
      const classIdx = i < 15 ? 0 : 1;
      studentsData.push({
        studentId: `STU${String(2024001 + i)}`,
        name,
        rollNumber: `${classes[classIdx]}-${String(i + 1).padStart(3, '0')}`,
        className: classes[classIdx],
        section: sections[classIdx],
        email: `${name.toLowerCase().replace(/\s/g, '.')}@student.edu`,
        phone: `98765${String(43000 + i)}`,
      });
    });

    const students = await Student.create(studentsData);
    console.log(`🎓 ${students.length} Students created`);

    // Create Timetable
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '11:00' },
      { startTime: '11:15', endTime: '12:15' },
      { startTime: '12:15', endTime: '13:15' },
      { startTime: '14:00', endTime: '15:00' },
      { startTime: '15:00', endTime: '16:00' },
    ];

    const subjects = [
      { subject: 'Data Structures', teacher: teachers[0]._id, room: 'CS-101' },
      { subject: 'Algorithms', teacher: teachers[0]._id, room: 'CS-102' },
      { subject: 'Database Systems', teacher: teachers[1]._id, room: 'CS-103' },
      { subject: 'Operating Systems', teacher: teachers[1]._id, room: 'CS-104' },
      { subject: 'Mathematics', teacher: teachers[2]._id, room: 'MT-201' },
      { subject: 'Statistics', teacher: teachers[2]._id, room: 'MT-202' },
    ];

    const timetableEntries = [];

    days.forEach((day) => {
      classes.forEach((cls, clsIdx) => {
        // Assign 4 lectures per day per class
        const shuffled = [...subjects].sort(() => Math.random() - 0.5).slice(0, 4);
        shuffled.forEach((subj, slotIdx) => {
          timetableEntries.push({
            day,
            ...timeSlots[slotIdx],
            subject: subj.subject,
            teacher: subj.teacher,
            className: cls,
            section: sections[clsIdx],
            room: subj.room,
          });
        });
      });
    });

    const timetable = await Timetable.create(timetableEntries);
    console.log(`📅 ${timetable.length} Timetable entries created`);

    // Create some sample attendance records for the last 7 days
    const attendanceRecords = [];
    const today = new Date();

    for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      date.setHours(0, 0, 0, 0);

      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
      if (dayName === 'Sunday' || dayName === 'Saturday') continue;

      // Get timetable slots for this day
      const daySlots = timetable.filter((t) => t.day === dayName);

      daySlots.forEach((slot) => {
        // Get students from the class
        const classStudents = students.filter((s) => s.className === slot.className);

        classStudents.forEach((student) => {
          // 85% chance of being present, 10% late, 5% absent
          const rand = Math.random();
          let status;
          if (rand < 0.85) status = 'present';
          else if (rand < 0.95) status = 'late';
          else status = 'absent';

          attendanceRecords.push({
            student: student._id,
            studentId: student.studentId,
            subject: slot.subject,
            teacher: slot.teacher,
            timetableSlot: slot._id,
            date,
            time: slot.startTime,
            status,
            className: student.className,
            section: student.section,
            markedBy: slot.teacher,
          });
        });
      });
    }

    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
      console.log(`✅ ${attendanceRecords.length} Attendance records created`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin:   admin@smartqr.edu / admin123');
    console.log('   Teacher: priya@smartqr.edu / teacher123');
    console.log('   Teacher: rajesh@smartqr.edu / teacher123');
    console.log('   Teacher: anita@smartqr.edu / teacher123');
    console.log('\n📱 Sample Student IDs for QR scanning:');
    console.log('   STU2024001, STU2024002, STU2024003, ...');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
