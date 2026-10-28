const Timetable = require('../models/Timetable');
const User = require('../models/User');

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

// GET /api/timetable/current — get current lecture(s)
exports.getCurrentLecture = async (req, res) => {
  try {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 1. Find ALL slots currently active right now for today (handles coinciding slots)
    const activeSlots = await Timetable.find({
      day: dayName,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime },
    }).populate('teacher', 'name email department');

    // 2. Primary current slot: try logged-in teacher's active slot first, or the first active slot
    let currentSlot = activeSlots.find(
      (s) => s.teacher && (s.teacher._id.toString() === req.user._id.toString() || s.teacher.toString() === req.user._id.toString())
    ) || activeSlots[0] || null;

    // 3. Get today's slots (all slots for admin, or teacher's slots with fallback to all today's slots)
    let todaySlots = [];
    if (req.user.role === 'admin') {
      todaySlots = await Timetable.find({ day: dayName })
        .populate('teacher', 'name email department')
        .sort({ startTime: 1 });
    } else {
      todaySlots = await Timetable.find({
        day: dayName,
        teacher: req.user._id,
      })
        .populate('teacher', 'name email department')
        .sort({ startTime: 1 });

      if (todaySlots.length === 0) {
        todaySlots = await Timetable.find({ day: dayName })
          .populate('teacher', 'name email department')
          .sort({ startTime: 1 });
      }
    }

    res.json({
      currentSlot,
      activeSlots,
      todaySlots,
      currentDay: dayName,
      currentTime,
    });
  } catch (error) {
    console.error('getCurrentLecture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/timetable (admin and teacher)
exports.createTimetable = async (req, res) => {
  try {
    const slotData = { ...req.body };
    if (!slotData.teacher) {
      slotData.teacher = req.user._id;
    }
    const slot = await Timetable.create(slotData);
    await slot.populate('teacher', 'name email department');
    res.status(201).json({ message: 'Timetable slot created', slot });
  } catch (error) {
    console.error('Create timetable error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// PUT /api/timetable/:id (admin and teacher)
exports.updateTimetable = async (req, res) => {
  try {
    const slot = await Timetable.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Timetable slot not found' });
    }

    // Teachers can update their own slots, admin can update any slot
    if (req.user.role === 'teacher' && slot.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own timetable slots' });
    }

    const updateData = { ...req.body };
    if (req.user.role === 'teacher') {
      updateData.teacher = req.user._id;
    }

    const updatedSlot = await Timetable.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('teacher', 'name email department');

    res.json({ message: 'Timetable slot updated', slot: updatedSlot });
  } catch (error) {
    console.error('Update timetable error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// DELETE /api/timetable/:id (admin and teacher)
exports.deleteTimetable = async (req, res) => {
  try {
    const slot = await Timetable.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Timetable slot not found' });
    }

    // Teachers can delete their own slots, admin can delete any slot
    if (req.user.role === 'teacher' && slot.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own timetable slots' });
    }

    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: 'Timetable slot deleted' });
  } catch (error) {
    console.error('Delete timetable error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// GET /api/timetable/teachers — get instructors list for slot assignment
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: { $in: ['teacher', 'admin'] }, isActive: true })
      .select('name email department role')
      .sort({ name: 1 });
    res.json({ teachers });
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
