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
    const reports = await Report.findAll({
      where: {
        status: {
          [Op.ne]: 'draft',
        },
      },
      include: [
        {
          model: User,
          attributes: ['name', 'email', 'title', 'avatar'],
        },
        {
          model: Project,
          attributes: ['name', 'color'],
        },
      ],
      order: [['submittedAt', 'desc']],
    });

    // Map Sequelize user field to userId to match frontend expectations
    const mappedReports = reports.map(r => {
      const data = r.toJSON();
      const { User: user, ...rest } = data;
      return {
        ...rest,
        userId: user,
      };
    });

    res.json({ reports: mappedReports });
  } catch (error) {
    console.error('Fetch team reports error:', error);
    res.status(500).json({ error: 'Failed to fetch team reports' });
  }
}

module.exports = {
  getReports,
  createReport,
  getReportById,
  updateReport,
  deleteReport,
  getTeamReports,
};
