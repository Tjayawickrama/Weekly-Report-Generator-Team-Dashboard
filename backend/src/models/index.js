const sequelize = require('../config/db');
const User = require('./User');
const Project = require('./Project');
const Report = require('./Report');

// Relationships

// A User creates many Projects
User.hasMany(Project, { as: 'createdProjects', foreignKey: 'createdById' });
Project.belongsTo(User, { as: 'creator', foreignKey: 'createdById' });

// Many-to-Many: Users belong to many Projects, and Projects have many Users (members)
User.belongsToMany(Project, { through: 'ProjectMembers', as: 'projects', foreignKey: 'userId' });
Project.belongsToMany(User, { through: 'ProjectMembers', as: 'members', foreignKey: 'projectId' });

// Reports belong to a User
User.hasMany(Report, { foreignKey: 'userId', onDelete: 'CASCADE' });
Report.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

// Reports belong to a Project
Project.hasMany(Report, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Report.belongsTo(Project, { foreignKey: 'projectId', onDelete: 'CASCADE' });

module.exports = {
  sequelize,
  User,
  Project,
  Report,
};
