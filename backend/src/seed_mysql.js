const { sequelize, User, Project, Report } = require('./models');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Starting database seed for MySQL (Sequelize)...');

  // Sync database (drops and recreates tables)
  await sequelize.sync({ force: true });
  console.log('🗑️  Database synced and tables recreated');

  // Create users
  const passwordHash = await bcrypt.hash('password123', 12);

  const userData = [
    { name: 'Ama sumanaweera',       email: 'sumanaweeraama@gmail.com',   password: passwordHash, role: 'admin',       title: 'Admin' },
    { name: 'Kanishka Kalansooriya', email: 'kkalansooriya@gmail.com',     password: passwordHash, role: 'manager',     title: 'Engineering Manager' },
    { name: 'Pradeep Suranga',       email: 'surangapradeep@gmail.com',    password: passwordHash, role: 'team_member', title: 'Senior Developer' },
    { name: 'Shantha Perera',        email: 'pererashantha@gmail.com',     password: passwordHash, role: 'team_member', title: 'UI/UX Designer' },
    { name: 'Thilak Ranasingha',     email: 'ranasinghathilak@gmail.com',  password: passwordHash, role: 'team_member', title: 'Backend Engineer' },
    { name: 'Renuka Nanayakkara',    email: 'nanayakkararenuka@gmail.com', password: passwordHash, role: 'team_member', title: 'QA Engineer' },
    { name: 'Preethi jay',           email: 'jaypreethi@gmail.com',        password: passwordHash, role: 'team_member', title: 'DevOps Engineer' },
    { name: 'Hiruni Amaya',          email: 'amayahiruni@gmail.com',       password: passwordHash, role: 'team_member', title: 'Frontend Developer' },
    { name: 'Sunil perera',          email: 'pererasunil@gmail.com',       password: passwordHash, role: 'team_member', title: 'Team Member' },
    { name: 'kasun kalhara',         email: 'kalharakasun@gmail.com',      password: passwordHash, role: 'manager',     title: 'Manager' },
  ];

  const users = [];
  for (const u of userData) {
    const user = await User.create(u);
    users.push(user);
  }
  console.log(`👤 Created ${users.length} users`);

  const admin = users[0];
  const manager = users[1];
  const teamMembers = users.slice(2);

  // Create projects
  const projectData = [
    {
      name: 'Phoenix Infrastructure', description: 'Cloud infrastructure modernization and migration to Kubernetes',
      color: '#7C3AED', status: 'active', createdById: manager.id,
      members: [teamMembers[0].id, teamMembers[2].id, teamMembers[4].id],
      tasksCompleted: 45, efficiency: 87,
    },
    {
      name: 'Starlight SDK', description: 'Developer toolkit and SDK for third-party integrations',
      color: '#3B82F6', status: 'active', createdById: manager.id,
      members: [teamMembers[0].id, teamMembers[1].id],
      tasksCompleted: 38, efficiency: 92,
    },
    {
      name: 'Neptune UI', description: 'Internal design system and component library',
      color: '#06B6D4', status: 'active', createdById: manager.id,
      members: [teamMembers[1].id, teamMembers[5].id],
      tasksCompleted: 52, efficiency: 78,
    },
    {
      name: 'Quantum Ledger', description: 'Blockchain-based audit trail and compliance system',
      color: '#10B981', status: 'active', createdById: admin.id,
      members: [teamMembers[2].id, teamMembers[3].id],
      tasksCompleted: 28, efficiency: 81,
    },
    {
      name: 'Aurora Analytics', description: 'Real-time analytics dashboard and reporting engine',
      color: '#F59E0B', status: 'completed', createdById: manager.id,
      members: [teamMembers[4].id, teamMembers[5].id],
      tasksCompleted: 64, efficiency: 95,
    },
  ];

  const projects = [];
  for (const p of projectData) {
    const { members, createdById, tasksCompleted, efficiency, ...rest } = p;
    const project = await Project.create({ ...rest, createdById });
    await project.addMembers(members);
    projects.push(project);
  }
  console.log(`📁 Created ${projects.length} projects`);

  // Helper to get Monday of a given week offset
  function getWeekDates(weeksAgo = 0) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - (weeksAgo * 7));
    monday.setHours(0, 0, 0, 0);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);
    return { weekStart: monday, weekEnd: friday };
  }

  const taskSets = {
    0: {
      completed: ['Migrated auth service to Kubernetes', 'Set up Prometheus monitoring', 'Implemented auto-scaling', 'Configured CI/CD pipeline', 'Updated infrastructure docs'],
      planned: ['Set up production cluster', 'Configure disaster recovery', 'Load testing'],
      blockers: ['Waiting on AWS account approval', 'Need VPN access'],
    },
    1: {
      completed: ['Implemented OAuth2 flow', 'Added webhook support', 'Created TypeScript types', 'Published v2.1.0 to npm'],
      planned: ['Add GraphQL support', 'Implement retry logic', 'Build example apps'],
      blockers: ['Third-party API docs outdated'],
    },
    2: {
      completed: ['Designed modal component variants', 'Built responsive navigation', 'Created icon library', 'Implemented dark mode'],
      planned: ['Build data table', 'Design onboarding flow', 'Accessibility guidelines'],
      blockers: ['Color contrast issues on certain themes'],
    },
    3: {
      completed: ['Implemented smart contract for audit logs', 'Built transaction verification', 'Created compliance report generator'],
      planned: ['Integration with audit system', 'Regulatory compliance review'],
      blockers: ['Regulatory requirements being finalized'],
    },
  };

  const reports = [];
  for (let week = 0; week < 4; week++) {
    const { weekStart, weekEnd } = getWeekDates(week);
    for (let mi = 0; mi < teamMembers.length; mi++) {
      const member = teamMembers[mi];
      const projectIndex = mi % projects.length;
      const project = projects[projectIndex];
      const tasks = taskSets[projectIndex] || taskSets[0];

      const numCompleted = 2 + Math.floor(Math.random() * 3);
      const numPlanned = 2 + Math.floor(Math.random() * 2);
      const hasBlockers = Math.random() > 0.5;
      const numBlockers = hasBlockers ? 1 : 0;
      const status = week === 0 && Math.random() > 0.7 ? 'draft' : 'submitted';

      reports.push({
        userId: member.id,
        weekStart,
        weekEnd,
        projectId: project.id,
        tasksCompleted: JSON.stringify(tasks.completed.slice(0, numCompleted).map(text => ({ text, completed: true }))),
        tasksPlanned: JSON.stringify(tasks.planned.slice(0, numPlanned).map(text => ({ text }))),
        blockers: JSON.stringify(tasks.blockers.slice(0, numBlockers).map(text => ({ text, severity: 'medium', resolved: false }))),
        hoursWorked: 35 + Math.floor(Math.random() * 10),
        notes: week === 0 ? 'On track for sprint goals.' : '',
        status,
        submittedAt: status === 'submitted' ? new Date(weekEnd.getTime() - Math.random() * 86400000) : null,
      });
    }
  }

  for (const r of reports) {
    await Report.create(r);
  }
  console.log(`📝 Created ${reports.length} reports`);

  console.log('\n✨ Seed completed successfully!\n');
  console.log('📋 Login credentials (all passwords: password123)');
  console.log('─────────────────────────────────────────────────');
  console.log('  Admin:    sumanaweeraama@gmail.com');
  console.log('  Manager:  kkalansooriya@gmail.com');
  console.log('  Manager:  kalharakasun@gmail.com');
  console.log('  Members:  surangapradeep@gmail.com, pererashantha@gmail.com,');
  console.log('            ranasinghathilak@gmail.com, nanayakkararenuka@gmail.com,');
  console.log('            jaypreethi@gmail.com, amayahiruni@gmail.com, pererasunil@gmail.com');
  console.log('─────────────────────────────────────────────────');

  await sequelize.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message || err);
  sequelize.close();
  process.exit(1);
});
