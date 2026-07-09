const { Project, User } = require('../models');
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
      include: [{ model: User, as: 'members', attributes: ['id', 'name', 'email', 'title'], through: { attributes: [] } }],
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

async function updateProject(req, res) {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const validatedData = projectSchema.partial().parse(req.body);
    await project.update(validatedData);
    res.json({ project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
}

async function deleteProject(req, res) {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    await project.destroy();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}

async function updateProjectMembers(req, res) {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const { memberIds } = req.body;
    if (!Array.isArray(memberIds)) return res.status(400).json({ error: 'memberIds must be an array' });
    await project.setMembers(memberIds);
    const updated = await Project.findByPk(req.params.id, {
      include: [{ model: User, as: 'members', attributes: ['id', 'name', 'email', 'title'], through: { attributes: [] } }],
    });
    res.json({ project: updated });
  } catch (error) {
    console.error('Update project members error:', error);
    res.status(500).json({ error: 'Failed to update project members' });
  }
}

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  updateProjectMembers,
};

