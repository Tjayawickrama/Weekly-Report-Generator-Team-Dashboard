const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pulse-ai-reports';

// Define schemas inline for the seed script
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['team_member', 'manager', 'admin'], default: 'team_member' },
  title: String,
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  color: String,
  status: { type: String, default: 'active' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tasksCompleted: { type: Number, default: 0 },
  efficiency: { type: Number, default: 0 },
}, { timestamps: true });

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  weekStart: Date,
  weekEnd: Date,
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  tasksCompleted: [{ text: String, completed: { type: Boolean, default: true } }],
  tasksPlanned: [{ text: String }],
  blockers: [{ text: String, severity: String, resolved: { type: Boolean, default: false } }],
  hoursWorked: Number,
  notes: String,
  status: { type: String, default: 'draft' },
  submittedAt: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema);

async function seed() {
  console.log('🌱 Starting database seed...');
  console.log(`📡 Connecting to: ${MONGODB_URI}`);

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Project.deleteMany({});
  await Report.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create users
  const passwordHash = await bcrypt.hash('password123', 12);

  const users = await User.insertMany([
    { name: 'Alex Thompson', email: 'admin@pulse.ai', password: passwordHash, role: 'admin', title: 'Admin' },
    { name: 'Sarah Chen', email: 'sarah@pulse.ai', password: passwordHash, role: 'manager', title: 'Engineering Manager' },
    { name: 'James Miller', email: 'james@pulse.ai', password: passwordHash, role: 'team_member', title: 'Senior Developer' },
    { name: 'Elena Rodriguez', email: 'elena@pulse.ai', password: passwordHash, role: 'team_member', title: 'UI/UX Designer' },
    { name: 'Marcus Johnson', email: 'marcus@pulse.ai', password: passwordHash, role: 'team_member', title: 'Backend Engineer' },
    { name: 'Priya Sharma', email: 'priya@pulse.ai', password: passwordHash, role: 'team_member', title: 'QA Engineer' },
    { name: 'David Kim', email: 'david@pulse.ai', password: passwordHash, role: 'team_member', title: 'DevOps Engineer' },
    { name: 'Emma Wilson', email: 'emma@pulse.ai', password: passwordHash, role: 'team_member', title: 'Frontend Developer' },
  ]);
  console.log(`👤 Created ${users.length} users`);

  const admin = users[0];
  const manager = users[1];
  const teamMembers = users.slice(2);

  // Create projects
  const projects = await Project.insertMany([
    {
      name: 'Phoenix Infrastructure', description: 'Cloud infrastructure modernization and migration to Kubernetes',
      color: '#7C3AED', status: 'active', createdBy: manager._id,
      members: [teamMembers[0]._id, teamMembers[2]._id, teamMembers[4]._id],
      tasksCompleted: 45, efficiency: 87,
    },
    {
      name: 'Starlight SDK', description: 'Developer toolkit and SDK for third-party integrations',
      color: '#3B82F6', status: 'active', createdBy: manager._id,
      members: [teamMembers[0]._id, teamMembers[1]._id],
      tasksCompleted: 38, efficiency: 92,
    },
    {
      name: 'Neptune UI', description: 'Internal design system and component library',
      color: '#06B6D4', status: 'active', createdBy: manager._id,
      members: [teamMembers[1]._id, teamMembers[5]._id],
      tasksCompleted: 52, efficiency: 78,
    },
    {
      name: 'Quantum Ledger', description: 'Blockchain-based audit trail and compliance system',
      color: '#10B981', status: 'active', createdBy: admin._id,
      members: [teamMembers[2]._id, teamMembers[3]._id],
      tasksCompleted: 28, efficiency: 81,
    },
    {
      name: 'Aurora Analytics', description: 'Real-time analytics dashboard and reporting engine',
      color: '#F59E0B', status: 'completed', createdBy: manager._id,
      members: [teamMembers[4]._id, teamMembers[5]._id],
      tasksCompleted: 64, efficiency: 95,
    },
  ]);
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
    [projects[0]._id]: {
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
    [projects[1]._id]: {
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
    [projects[2]._id]: {
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
    [projects[3]._id]: {
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
      // Each member reports on 1-2 projects
      const memberProjects = projects.filter(p => 
        p.members.some(m => m.toString() === member._id.toString()) && p.status === 'active'
      );

      if (memberProjects.length === 0) continue;

      const project = memberProjects[Math.floor(Math.random() * memberProjects.length)];
      const tasks = taskSets[project._id.toString()] || taskSets[projects[0]._id.toString()];

      const numCompleted = 2 + Math.floor(Math.random() * 4);
      const numPlanned = 2 + Math.floor(Math.random() * 3);
      const hasBlockers = Math.random() > 0.5;
      const numBlockers = hasBlockers ? 1 + Math.floor(Math.random() * 2) : 0;

      const status = week === 0 && Math.random() > 0.7 ? 'draft' : 'submitted';

      reports.push({
        userId: member._id,
        weekStart,
        weekEnd,
        project: project._id,
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

  await Report.insertMany(reports);
  console.log(`📝 Created ${reports.length} reports`);

  console.log('\n✨ Seed completed successfully!\n');
  console.log('📋 Login credentials:');
  console.log('─────────────────────────────────');
  console.log('  Admin:    admin@pulse.ai / password123');
  console.log('  Manager:  sarah@pulse.ai / password123');
  console.log('  Member:   james@pulse.ai / password123');
  console.log('  Member:   elena@pulse.ai / password123');
  console.log('  Member:   marcus@pulse.ai / password123');
  console.log('  Member:   priya@pulse.ai / password123');
  console.log('  Member:   david@pulse.ai / password123');
  console.log('  Member:   emma@pulse.ai / password123');
  console.log('─────────────────────────────────');
  console.log('  (All passwords: password123)');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
