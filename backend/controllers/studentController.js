const Student = require('../models/Student');
const { validationResult } = require('express-validator');

// GET /api/students
exports.getStudents = async (req, res) => {
  try {
    const { className, section, search } = req.query;
    const filter = {};

    if (className) filter.className = className;
    if (section) filter.section = section;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter).sort({ className: 1, section: 1, rollNumber: 1 });
    res.json({ students, count: students.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/students/:id
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ student });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/students/verify/:studentId — used during QR scan
exports.verifyStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId, isActive: true });
    if (!student) {
      return res.status(404).json({ message: 'Student not found or inactive' });
    }
    res.json({ student, verified: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/students
exports.createStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId } = req.body;

    const existing = await Student.findOne({ studentId });
    if (existing) {
      return res.status(400).json({ message: 'Student with this ID already exists' });
    }

    const student = await Student.create(req.body);
    res.status(201).json({ message: 'Student created', student });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/students/:id
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student updated', student });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/students/:id
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/students/classes/list — unique classes
exports.getClasses = async (req, res) => {
  try {
    const classes = await Student.distinct('className');
    const sections = await Student.distinct('section');
    res.json({ classes, sections });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
