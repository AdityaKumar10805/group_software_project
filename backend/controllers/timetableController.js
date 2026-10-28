const Timetable = require('../models/Timetable');

// GET /api/timetable
exports.getTimetable = async (req, res) => {
  try {
    const { day, className, section, teacher } = req.query;
    const filter = {};

    if (day) filter.day = day;
    if (className) filter.className = className;
    if (section) filter.section = section;
    if (teacher) filter.teacher = teacher;

    const timetable = await Timetable.find(filter)
      .populate('teacher', 'name email department')
      .sort({ day: 1, startTime: 1 });

    res.json({ timetable });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/timetable/current — get current lecture for teacher
exports.getCurrentLecture = async (req, res) => {
  try {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const currentSlot = await Timetable.findOne({
      day: dayName,
      teacher: req.user._id,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime },
    }).populate('teacher', 'name');

    // Also get today's remaining slots
    const todaySlots = await Timetable.find({
      day: dayName,
      teacher: req.user._id,
    })
      .populate('teacher', 'name')
      .sort({ startTime: 1 });

    res.json({
      currentSlot,
      todaySlots,
      currentDay: dayName,
      currentTime,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/timetable
exports.createTimetable = async (req, res) => {
  try {
    const slot = await Timetable.create(req.body);
    res.status(201).json({ message: 'Timetable slot created', slot });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/timetable/:id
exports.updateTimetable = async (req, res) => {
  try {
    const slot = await Timetable.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!slot) {
      return res.status(404).json({ message: 'Timetable slot not found' });
    }
    res.json({ message: 'Timetable slot updated', slot });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/timetable/:id
exports.deleteTimetable = async (req, res) => {
  try {
    const slot = await Timetable.findByIdAndDelete(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Timetable slot not found' });
    }
    res.json({ message: 'Timetable slot deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/timetable/teacher/my — teacher's full timetable
exports.getMyTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find({ teacher: req.user._id })
      .sort({ day: 1, startTime: 1 });

    // Group by day
    const grouped = {};
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayOrder.forEach((day) => {
      grouped[day] = timetable.filter((slot) => slot.day === day);
    });

    res.json({ timetable, grouped });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
