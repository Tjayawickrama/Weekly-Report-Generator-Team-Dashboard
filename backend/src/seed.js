const { Client } = require('pg');
const { sequelize, User, Project, Report } = require('./models');
const bcrypt = require('bcryptjs');

async function createDatabaseIfNotExists() {
  const connectionString = "postgresql://postgres:password123@localhost:5432/postgres";
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query('CREATE DATABASE progresshub_db');
    console.log('✨ Created database "progresshub_db"');
  } catch (err) {
    // 42P04 is the PostgreSQL error code for "database already exists"
    if (err.code === '42P04') {
      console.log('📡 Database "progresshub_db" already exists');
    } else {
      throw err;
    }
  } finally {
    await client.end();
  }
}

async function seed() {
  console.log('🌱 Starting database seed for PostgreSQL (Sequelize)...');

  // Auto-create database if it doesn't exist
  await createDatabaseIfNotExists();

  // Sync database (drops tables and recreates them)
  await sequelize.sync({ force: true });
  console.log('🗑️  Database synced and tables recreated');

  // Create users
  const passwordHash = await bcrypt.hash('password123', 12);

  const userData = [
    { name: 'Alex Thompson', email: 'admin@pulse.ai', password: passwordHash, role: 'admin', title: 'Admin' },
    { name: 'Sarah Chen', email: 'sarah@pulse.ai', password: passwordHash, role: 'manager', title: 'Engineering Manager' },
    { name: 'James Miller', email: 'james@pulse.ai', password: passwordHash, role: 'team_member', title: 'Senior Developer' },
    { name: 'Elena Rodriguez', email: 'elena@pulse.ai', password: passwordHash, role: 'team_member', title: 'UI/UX Designer' },
    { name: 'Marcus Johnson', email: 'marcus@pulse.ai', password: passwordHash, role: 'team_member', title: 'Backend Engineer' },
    { name: 'Priya Sharma', email: 'priya@pulse.ai', password: passwordHash, role: 'team_member', title: 'QA Engineer' },
    { name: 'David Kim', email: 'david@pulse.ai', password: passwordHash, role: 'team_member', title: 'DevOps Engineer' },
    { name: 'Emma Wilson', email: 'emma@pulse.ai', password: passwordHash, role: 'team_member', title: 'Frontend Developer' },
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
    const { members, createdById, ...rest } = p;
    const project = await Project.create({
      ...rest,
      createdById,
    });
    // Add members using Sequelize association helpers
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

  // Create reports for the last 4 weeks
  const reports = [];
  const taskSets = {
    [projects[0].id]: {
      completed: [
        'Migrated auth service to Kubernetes cluster',
        'Set up monitoring with Prometheus and Grafana',
        'Implemented auto-scaling policies',
        'Configured CI/CD pipeline for staging',
        'Updated infrastructure documentation',
        'Resolved DNS resolution issues',
        'Optimized container resource limits',
        'Deployed load balancer configuration',
      ],
      planned: [
        'Set up production cluster',
        'Configure disaster recovery',
        'Implement secrets management',
        'Load testing and benchmarking',
        'Security audit preparation',
      ],
      blockers: [
        'Waiting on AWS account approval',
        'Need VPN access for staging environment',
        'Unclear requirements for compliance logging',
      ],
    },
    [projects[1].id]: {
      completed: [
        'Implemented OAuth2 flow in SDK',
        'Added webhook support for events',
        'Created TypeScript type definitions',
        'Built rate limiting middleware',
        'Published v2.1.0 to npm registry',
        'Wrote API reference documentation',
      ],
      planned: [
        'Add GraphQL support',
        'Implement retry logic',
        'Build example applications',
        'Performance benchmarking',
      ],
      blockers: [
        'Third-party API documentation outdated',
        'Need decision on GraphQL vs REST for v3',
      ],
    },
    [projects[2].id]: {
      completed: [
        'Designed new modal component variants',
        'Built responsive navigation patterns',
        'Created icon library with 200+ icons',
        'Implemented dark mode toggle',
        'Added animation system utilities',
        'Created Figma design tokens',
      ],
      planned: [
        'Build data table component',
        'Design onboarding flow',
        'Create accessibility guidelines',
        'Implement theme customization',
      ],
      blockers: [
        'Color contrast issues on certain themes',
      ],
    },
    [projects[3].id]: {
      completed: [
        'Implemented smart contract for audit logs',
        'Built transaction verification system',
        'Created compliance report generator',
        'Set up test blockchain network',
      ],
      planned: [
        'Integration with existing audit system',
        'Regulatory compliance review',
        'Performance optimization',
      ],
      blockers: [
        'Regulatory requirements still being finalized',
        'Need legal review of smart contract terms',
      ],
    },
  };

  for (let week = 0; week < 4; week++) {
    const { weekStart, weekEnd } = getWeekDates(week);

    for (const member of teamMembers) {
      // Find projects this user belongs to
      const memberProjects = projects.filter(p => 
        projectData.find(pd => pd.name === p.name).members.includes(member.id) && p.status === 'active'
      );

      if (memberProjects.length === 0) continue;

      const project = memberProjects[Math.floor(Math.random() * memberProjects.length)];
      const tasks = taskSets[project.id] || taskSets[projects[0].id];

      const numCompleted = 2 + Math.floor(Math.random() * 4);
      const numPlanned = 2 + Math.floor(Math.random() * 3);
      const hasBlockers = Math.random() > 0.5;
      const numBlockers = hasBlockers ? 1 + Math.floor(Math.random() * 2) : 0;

      const status = week === 0 && Math.random() > 0.7 ? 'draft' : 'submitted';

      reports.push({
        userId: member.id,
        weekStart,
        weekEnd,
        projectId: project.id,
        tasksCompleted: tasks.completed
          .sort(() => Math.random() - 0.5)
          .slice(0, numCompleted)
          .map(text => ({ text, completed: true })),
        tasksPlanned: tasks.planned
          .sort(() => Math.random() - 0.5)
          .slice(0, numPlanned)
          .map(text => ({ text })),
        blockers: tasks.blockers
          .sort(() => Math.random() - 0.5)
          .slice(0, numBlockers)
          .map(text => ({ text, severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)], resolved: Math.random() > 0.7 })),
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
  console.log('📋 Login credentials:');
  console.log('─────────────────────────────────');
  console.log('  Admin:    admin@pulse.ai / password123');
  console.log('  Manager:  sarah@pulse.ai / password123');
  console.log('  Member:   james@pulse.ai / password123');
  console.log('─────────────────────────────────');

  await sequelize.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  sequelize.close();
  process.exit(1);
});
