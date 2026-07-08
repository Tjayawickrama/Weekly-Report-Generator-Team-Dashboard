const { Project } = require('../models');
const { z } = require('zod');

const projectSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  color: z.string().optional(),
  status: z.enum(['active', 'completed', 'archived']).default('active'),
});

async function getProjects(req, res) {
  try {
    const projects = await Project.findAll({
      order: [['createdAt', 'desc']],
    });
    res.json({ projects });
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

async function createProject(req, res) {
  try {
    const validatedData = projectSchema.parse(req.body);

    const newProject = await Project.create({
      name: validatedData.name,
      description: validatedData.description || '',
      color: validatedData.color || '#7C3AED',
      status: validatedData.status,
      createdById: req.user.id,
    });

    res.status(201).json({ project: newProject });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

module.exports = {
  getProjects,
  createProject,
};
