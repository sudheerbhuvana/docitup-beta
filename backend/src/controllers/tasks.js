import { Task } from '../models/Task.js';
import { mongoLogger } from '../utils/logger.js';

// Create a new task
export const createTask = async (req, res, next) => {
  try {
    const { title, description, date, startTime, endTime, color } = req.body;

    if (!title || !date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Title, date, startTime, and endTime are required' });
    }

    // Validate time format
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ error: 'Start and end times must be in HH:MM format (24-hour)' });
    }

    // Validate end time is after start time
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const task = new Task({
      userId: req.userId,
      title,
      description,
      date: new Date(date),
      startTime,
      endTime,
      color: color || '#6366f1',
      completed: false,
    });

    mongoLogger.query('create', 'tasks', { userId: req.userId, title });
    const queryStartTime = Date.now();
    await task.save();
    const duration = Date.now() - queryStartTime;
    mongoLogger.queryResult('create', 1, duration);

    res.status(201).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// Get all tasks for the current user
export const getTasks = async (req, res, next) => {
  try {
    const { date, start, end } = req.query;
    const query = { userId: req.userId };

    // Filter by specific date
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Filter by date range
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    mongoLogger.query('find', 'tasks', query);
    const queryStartTime = Date.now();
    const tasks = await Task.find(query)
      .sort({ date: 1, startTime: 1 })
      .lean();
    const duration = Date.now() - queryStartTime;
    mongoLogger.queryResult('find', tasks.length, duration);

    res.json({
      success: true,
      data: { tasks },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single task
export const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    mongoLogger.query('findOne', 'tasks', { _id: id, userId: req.userId });
    const queryStartTime = Date.now();
    const task = await Task.findOne({ _id: id, userId: req.userId });
    const duration = Date.now() - queryStartTime;
    mongoLogger.queryResult('findOne', task ? 1 : 0, duration);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// Update a task
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, date, startTime, endTime, color, completed } = req.body;

    mongoLogger.query('findOne', 'tasks', { _id: id, userId: req.userId });
    const queryStartTime = Date.now();
    const task = await Task.findOne({ _id: id, userId: req.userId });
    const duration = Date.now() - queryStartTime;
    mongoLogger.queryResult('findOne', task ? 1 : 0, duration);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Validate times if provided
    if (startTime || endTime) {
      const finalStartTime = startTime || task.startTime;
      const finalEndTime = endTime || task.endTime;
      
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (finalStartTime && !timeRegex.test(finalStartTime)) {
        return res.status(400).json({ error: 'Start time must be in HH:MM format' });
      }
      if (finalEndTime && !timeRegex.test(finalEndTime)) {
        return res.status(400).json({ error: 'End time must be in HH:MM format' });
      }

      // Validate end time is after start time
      if (finalStartTime && finalEndTime) {
        const [startHour, startMin] = finalStartTime.split(':').map(Number);
        const [endHour, endMin] = finalEndTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (endMinutes <= startMinutes) {
          return res.status(400).json({ error: 'End time must be after start time' });
        }
      }
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (date !== undefined) task.date = new Date(date);
    if (startTime !== undefined) task.startTime = startTime;
    if (endTime !== undefined) task.endTime = endTime;
    if (color !== undefined) task.color = color;
    if (completed !== undefined) task.completed = completed;

    mongoLogger.query('save', 'tasks', { _id: id });
    const saveStartTime = Date.now();
    await task.save();
    const saveDuration = Date.now() - saveStartTime;
    mongoLogger.queryResult('save', 1, saveDuration);

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a task
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    mongoLogger.query('findOneAndDelete', 'tasks', { _id: id, userId: req.userId });
    const queryStartTime = Date.now();
    const task = await Task.findOneAndDelete({ _id: id, userId: req.userId });
    const duration = Date.now() - queryStartTime;
    mongoLogger.queryResult('findOneAndDelete', task ? 1 : 0, duration);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Toggle task completion
export const toggleTaskCompletion = async (req, res, next) => {
  try {
    const { id } = req.params;

    mongoLogger.query('findOne', 'tasks', { _id: id, userId: req.userId });
    const queryStartTime = Date.now();
    const task = await Task.findOne({ _id: id, userId: req.userId });
    const duration = Date.now() - queryStartTime;
    mongoLogger.queryResult('findOne', task ? 1 : 0, duration);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = !task.completed;

    mongoLogger.query('save', 'tasks', { _id: id });
    const saveStartTime = Date.now();
    await task.save();
    const saveDuration = Date.now() - saveStartTime;
    mongoLogger.queryResult('save', 1, saveDuration);

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

