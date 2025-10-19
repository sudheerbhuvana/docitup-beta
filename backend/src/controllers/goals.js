import { Goal } from '../models/Goal.js';
import { mongoLogger } from '../utils/logger.js';

export const getAllGoals = async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    const query = { userId: req.userId };
    if (status) query.status = status;

    mongoLogger.query('find', 'goals', query, { limit, offset, sort: { createdAt: -1 } });
    const startTime = Date.now();
    const goals = await Goal.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    const duration = Date.now() - startTime;

    const total = await Goal.countDocuments(query);
    mongoLogger.queryResult('find', goals.length, duration);

    res.json({
      success: true,
      data: {
        goals,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getGoal = async (req, res, next) => {
  try {
    mongoLogger.query('findOne', 'goals', { _id: req.params.id, userId: req.userId });
    const startTime = Date.now();
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findOne', goal ? 1 : 0, duration);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({
      success: true,
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const { title, description, category, targetDate, isPublic, steps } = req.body;

    mongoLogger.query('create', 'goals', { userId: req.userId, title, category, isPublic });
    const startTime = Date.now();
    const goal = await Goal.create({
      userId: req.userId,
      title,
      description,
      category,
      targetDate,
      isPublic: isPublic || false,
      steps: steps || [],
      progressPercentage: 0,
      status: 'active',
    });
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('create', 1, duration);

    res.status(201).json({
      success: true,
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const { title, description, category, targetDate, progressPercentage, status, isPublic, steps } = req.body;

    mongoLogger.query('findOneAndUpdate', 'goals', { _id: req.params.id, userId: req.userId });
    const startTime = Date.now();
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, description, category, targetDate, progressPercentage, status, isPublic, steps },
      { new: true, runValidators: true }
    );
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findOneAndUpdate', goal ? 1 : 0, duration);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({
      success: true,
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    mongoLogger.query('findOneAndDelete', 'goals', { _id: req.params.id, userId: req.userId });
    const startTime = Date.now();
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    const duration = Date.now() - startTime;
    mongoLogger.queryResult('findOneAndDelete', goal ? 1 : 0, duration);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({
      success: true,
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateGoalStep = async (req, res, next) => {
  try {
    const { stepId } = req.params;
    const { isCompleted } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const step = goal.steps.id(stepId);
    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    step.isCompleted = isCompleted;
    if (isCompleted) {
      step.completedAt = new Date();
    } else {
      step.completedAt = undefined;
    }

    // Recalculate progress
    const completedSteps = goal.steps.filter(s => s.isCompleted).length;
    goal.progressPercentage = goal.steps.length > 0 
      ? Math.round((completedSteps / goal.steps.length) * 100)
      : 0;

    await goal.save();

    res.json({
      success: true,
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

