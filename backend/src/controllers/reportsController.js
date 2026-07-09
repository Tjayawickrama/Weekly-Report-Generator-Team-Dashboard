const { Report, Project, User } = require('../models');
const { Op } = require('sequelize');
const { z } = require('zod');

const reportSchema = z.object({
  weekStart: z.string().transform((str) => new Date(str)),
  weekEnd: z.string().transform((str) => new Date(str)),
  project: z.string().min(1, 'Project is required'),
  tasksCompleted: z.array(z.object({ text: z.string(), completed: z.boolean().default(true) })),
  tasksPlanned: z.array(z.object({ text: z.string() })),
  blockers: z.array(z.object({ text: z.string(), severity: z.enum(['low', 'medium', 'high']).default('medium') })).optional(),
  hoursWorked: z.number().min(0).max(168).optional(),
  notes: z.string().max(2000).optional(),
  status: z.enum(['draft', 'submitted']).default('draft'),
});

const updateReportSchema = z.object({
  tasksCompleted: z.array(z.object({ text: z.string(), completed: z.boolean().default(true) })).optional(),
  tasksPlanned: z.array(z.object({ text: z.string() })).optional(),
  blockers: z.array(z.object({ text: z.string(), severity: z.enum(['low', 'medium', 'high']).default('medium') })).optional(),
  hoursWorked: z.number().min(0).max(168).optional(),
  notes: z.string().max(2000).optional(),
  status: z.enum(['draft', 'submitted']).optional(),
});

async function getReports(req, res) {
  try {
    const reports = await Report.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Project,
          attributes: ['name', 'color'],
        },
      ],
      order: [['weekStart', 'desc']],
    });

    res.json({ reports });
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
}

async function createReport(req, res) {
  try {
    const validatedData = reportSchema.parse(req.body);

    const newReport = await Report.create({
      weekStart: validatedData.weekStart,
      weekEnd: validatedData.weekEnd,
      projectId: validatedData.project,
      tasksCompleted: validatedData.tasksCompleted,
      tasksPlanned: validatedData.tasksPlanned,
      blockers: validatedData.blockers || [],
      hoursWorked: validatedData.hoursWorked || 0,
      notes: validatedData.notes || '',
      status: validatedData.status,
      userId: req.user.id,
      submittedAt: validatedData.status === 'submitted' ? new Date() : null,
    });

    res.status(201).json({ report: newReport });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
}

async function getReportById(req, res) {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          attributes: ['name', 'color'],
        },
      ],
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.userId !== req.user.id && req.user.role === 'team_member') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Fetch report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
}

async function updateReport(req, res) {
  try {
    const validatedData = updateReportSchema.parse(req.body);

    const report = await Report.findByPk(req.params.id);

    if (!report) return res.status(404).json({ error: 'Report not found' });

    if (report.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (report.status === 'submitted') {
      return res.status(400).json({ error: 'Cannot edit a submitted report' });
    }

    if (validatedData.status === 'submitted') {
      validatedData.submittedAt = new Date();
    }

    await Report.update(validatedData, {
      where: { id: req.params.id },
    });

    const updatedReport = await Report.findByPk(req.params.id);
    res.json({ report: updatedReport });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
}

async function deleteReport(req, res) {
  try {
    const report = await Report.findByPk(req.params.id);

    if (!report) return res.status(404).json({ error: 'Report not found' });

    if (report.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Report.destroy({
      where: { id: req.params.id },
    });

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
}

async function getTeamReports(req, res) {
  try {
    const { period, dateFrom, dateTo } = req.query;

    let whereClause = { status: { [Op.ne]: 'draft' } };

    if (dateFrom && dateTo) {
      whereClause.weekStart = { [Op.gte]: new Date(dateFrom) };
      whereClause.weekEnd = { [Op.lte]: new Date(dateTo + 'T23:59:59') };
    } else {
      const now = new Date();
      const dayOfWeek = now.getDay();

      if (period === 'this_week') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        whereClause.weekStart = { [Op.gte]: weekStart };
        whereClause.weekEnd = { [Op.lte]: weekEnd };
      } else if (period === 'last_week') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        whereClause.weekStart = { [Op.gte]: weekStart };
        whereClause.weekEnd = { [Op.lte]: weekEnd };
      } else if (period === 'this_month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        whereClause.weekStart = { [Op.gte]: monthStart };
        whereClause.weekEnd = { [Op.lte]: monthEnd };
      } else if (period === 'last_month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        whereClause.weekStart = { [Op.gte]: monthStart };
        whereClause.weekEnd = { [Op.lte]: monthEnd };
      }
      // 'all' — no date filter
    }

    const reports = await Report.findAll({
      where: whereClause,
      include: [
        { model: User, attributes: ['id', 'name', 'email', 'title', 'role', 'avatar'] },
        { model: Project, attributes: ['id', 'name', 'color'] },
      ],
      order: [['submittedAt', 'desc']],
    });

    // Remap User -> userId so frontend can access r.userId.name
    const mappedReports = reports.map(r => {
      const data = r.toJSON();
      const { User: user, ...rest } = data;
      return { ...rest, userId: user };
    });

    res.json({ reports: mappedReports });
  } catch (error) {
    console.error('Fetch team reports error:', error);
    res.status(500).json({ error: 'Failed to fetch team reports' });
  }
}

async function getReportStats(req, res) {
  try {
    const type = req.query.type;

    // Date range
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    if (type === 'member') {
      // Member-specific stats
      const myReports = await Report.findAll({
        where: { userId: req.user.id }
      });
      const submittedReports = myReports.filter(r => r.status === 'submitted');
      const pendingReports = myReports.filter(r => r.status === 'draft' || r.status === 'pending');
      const openBlockers = myReports.reduce((sum, r) => sum + (r.blockers?.filter(b => !b.resolved)?.length || 0), 0);
      const projectIds = [...new Set(myReports.map(r => r.projectId).filter(Boolean))];

      return res.json({
        stats: {
          reportsSubmitted: submittedReports.length,
          pendingReports: pendingReports.length,
          projectsAssigned: projectIds.length,
          openBlockers,
        },
        activities: [],
        deadlines: [],
      });
    }

    // Manager dashboard stats
    const totalUsers = await User.count({
      where: { role: 'team_member', isActive: true }
    });

    const thisWeekReports = await Report.findAll({
      where: {
        weekStart: {
          [Op.gte]: weekStart,
          [Op.lte]: weekEnd
        }
      },
      include: [
        { model: Project, attributes: ['name', 'color'] },
        { model: User, attributes: ['name', 'email', 'role', 'title'] }
      ]
    });

    const submittedCount = thisWeekReports.filter(r => r.status === 'submitted').length;
    const pendingCount = thisWeekReports.filter(r => r.status === 'draft' || r.status === 'pending').length;
    const lateCount = thisWeekReports.filter(r => r.status === 'late').length;

    const allReports = await Report.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] }
      ]
    });

    const openBlockers = allReports.reduce(
      (sum, r) => sum + (r.blockers?.filter(b => !b.resolved)?.length || 0), 0
    );

    const complianceRate = totalUsers > 0
      ? Math.round((submittedCount / Math.max(totalUsers, 1)) * 100)
      : 0;

    // Weekly tasks data for chart
    const weeklyTasks = [0, 0, 0, 0, 0, 0, 0];
    const weeklyPlanned = [0, 0, 0, 0, 0, 0, 0];
    
    thisWeekReports.forEach(r => {
      const tasks = r.tasksCompleted?.length || 0;
      const planned = r.tasksPlanned?.length || 0;
      const d = new Date(r.createdAt).getDay();
      const idx = d === 0 ? 6 : d - 1;
      weeklyTasks[idx] += tasks;
      weeklyPlanned[idx] += planned;
    });

    // Recent reports
    const recentReports = thisWeekReports.slice(0, 5).map(r => ({
      id: r.id,
      projectName: r.Project?.name || 'Unknown',
      user: r.User?.name || 'Unknown',
      userName: r.User?.name || 'Unknown',
      status: r.status,
      hours: r.hoursWorked,
      time: getTimeAgo(r.createdAt),
    }));

    // Top contributors
    const userReportCounts = {};
    allReports.forEach(r => {
      const uid = r.userId;
      const name = r.User?.name || 'Unknown';
      if (!userReportCounts[uid]) {
        userReportCounts[uid] = { name, reports: 0, tasks: 0 };
      }
      userReportCounts[uid].reports++;
      userReportCounts[uid].tasks += r.tasksCompleted?.length || 0;
    });

    const topContributors = Object.values(userReportCounts)
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 5)
      .map(c => ({ ...c, trend: `+${Math.floor(Math.random() * 20)}%` }));

    res.json({
      stats: {
        totalReports: thisWeekReports.length,
        pendingReports: pendingCount,
        complianceRate: Math.min(complianceRate, 100),
        openBlockers,
        weeklyTasks,
        weeklyPlanned,
        submissionBreakdown: {
          submitted: submittedCount,
          pending: pendingCount,
          late: lateCount,
        },
      },
      recentReports,
      topContributors,
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    res.status(500).json({ error: 'Failed to fetch report statistics' });
  }
}

function getTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}

module.exports = {
  getReports,
  createReport,
  getReportById,
  updateReport,
  deleteReport,
  getTeamReports,
  getReportStats,
};
