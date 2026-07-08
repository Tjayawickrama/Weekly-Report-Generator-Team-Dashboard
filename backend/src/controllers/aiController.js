const { Report, User, Project } = require('../models');
const { Op } = require('sequelize');

async function handleChat(req, res) {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Gather context from the database
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);

    const recentReports = await Report.findAll({
      where: {
        weekStart: {
          [Op.gte]: weekStart,
        },
      },
      include: [
        { model: Project, attributes: ['name'] },
        { model: User, attributes: ['name', 'role'] },
      ],
      limit: 50,
    });

    const allUsers = await User.findAll({
      where: { isActive: true },
      attributes: ['name', 'role'],
    });

    const allProjects = await Project.findAll({
      where: { status: 'active' },
      attributes: ['name'],
    });

    // Build context summary
    const totalSubmitted = recentReports.filter(r => r.status === 'submitted').length;
    const totalPending = recentReports.filter(r => r.status === 'draft' || r.status === 'late').length;
    const openBlockers = recentReports.reduce((sum, r) => sum + (r.blockers?.filter(b => !b.resolved)?.length || 0), 0);
    const totalHours = recentReports.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);

    const teamMembers = allUsers.map(u => u.name).join(', ');
    const projectNames = allProjects.map(p => p.name).join(', ');

    const tasksCompletedSummary = recentReports
      .flatMap(r => (r.tasksCompleted || []).map(t => `${r.User?.name || 'Unknown'}: ${t.text}`))
      .slice(0, 20)
      .join('\n');

    const blockersSummary = recentReports
      .flatMap(r => (r.blockers || []).filter(b => !b.resolved).map(b => `${r.User?.name || 'Unknown'}: ${b.text}`))
      .slice(0, 10)
      .join('\n');

    // Generate response based on context
    const responseText = generateContextualResponse(message, {
      totalSubmitted,
      totalPending,
      openBlockers,
      totalHours,
      teamMembers,
      projectNames,
      tasksCompletedSummary,
      blockersSummary,
      recentReports,
      totalUsers: allUsers.length,
    });

    res.json({ response: responseText });
  } catch (error) {
    console.error('AI Chat controller error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function generateContextualResponse(query, context) {
  const q = query.toLowerCase();

  // Report summary queries
  if (q.includes('summar') || q.includes('overview') || q.includes('this week')) {
    return `📊 **Weekly Team Summary**

Here's an overview of this week's activity:

• **Reports Submitted:** ${context.totalSubmitted} out of ${context.totalUsers} team members
• **Pending Reports:** ${context.totalPending}
• **Total Hours Logged:** ${context.totalHours} hours
• **Open Blockers:** ${context.openBlockers}
• **Submission Rate:** ${context.totalUsers > 0 ? Math.round((context.totalSubmitted / context.totalUsers) * 100) : 0}%

${context.totalPending > 0 ? `⚠️ There are ${context.totalPending} pending reports. Consider sending reminders to team members who haven't submitted yet.` : '✅ All reports are on track!'}

${context.openBlockers > 0 ? `\n🔴 **Attention:** ${context.openBlockers} open blockers need attention. Check the blockers section for details.` : ''}`;
  }

  // Blockers queries
  if (q.includes('blocker') || q.includes('challenge') || q.includes('issue') || q.includes('problem')) {
    if (context.openBlockers === 0) {
      return `✅ **No Open Blockers**\n\nGreat news! There are currently no unresolved blockers across the team. The team is making smooth progress.`;
    }

    return `⚠️ **Open Blockers (${context.openBlockers})**

Here are the current blockers reported by team members:

${context.blockersSummary || 'No specific blocker details available.'}

**Recommendation:** Consider scheduling a quick sync to address these blockers and unblock the team. Recurring blockers should be escalated to relevant stakeholders.`;
  }

  // Productivity/performance queries
  if (q.includes('productiv') || q.includes('perform') || q.includes('trend') || q.includes('efficiency')) {
    return `📈 **Team Productivity Insights**

• **Total Tasks Completed This Week:** ${context.recentReports.reduce((s, r) => s + (r.tasksCompleted?.length || 0), 0)}
• **Average Hours per Member:** ${context.totalUsers > 0 ? Math.round(context.totalHours / context.contextUsers) : 0} hours
• **Active Projects:** ${context.projectNames || 'None'}
• **Compliance Rate:** ${context.totalUsers > 0 ? Math.round((context.totalSubmitted / context.totalUsers) * 100) : 0}%

**Key Observations:**
1. Task completion is ${context.totalSubmitted > context.totalUsers * 0.7 ? 'on track' : 'below expected levels'}
2. ${context.openBlockers > 3 ? 'Multiple blockers may be impacting velocity' : 'Blockers are within manageable range'}
3. Consider reviewing workload distribution across projects

💡 **Suggestion:** Teams with consistent reporting tend to have 23% higher productivity. Focus on maintaining the submission cadence.`;
  }

  // Submission status queries
  if (q.includes('submit') || q.includes('pending') || q.includes('late') || q.includes('missing') || q.includes('hasn\'t')) {
    const submitted = context.recentReports.filter(r => r.status === 'submitted');
    const submittedNames = [...new Set(submitted.map(r => r.User?.name).filter(Boolean))];
    
    return `📋 **Submission Status**

• **Submitted:** ${context.totalSubmitted} reports (${submittedNames.join(', ') || 'None yet'})
• **Pending/Draft:** ${context.totalPending}
• **Team Size:** ${context.totalUsers} members

${context.totalPending > 0 ? `\n⏳ **Action Required:** ${context.totalPending} team members still need to submit their reports. Consider sending a reminder before the deadline.` : '\n✅ All team members have submitted their reports!'}`;
  }

  // Project-specific queries
  if (q.includes('project') || q.includes('workload') || q.includes('distribution')) {
    return `📁 **Project Overview**

Active projects: ${context.projectNames || 'No active projects'}

**Reports by Project This Week:**
${context.recentReports.reduce((acc, r) => {
  const pName = r.Project?.name || 'Unassigned';
  acc[pName] = (acc[pName] || 0) + 1;
  return acc;
}, {}) ? Object.entries(context.recentReports.reduce((acc, r) => {
  const pName = r.Project?.name || 'Unassigned';
  acc[pName] = (acc[pName] || 0) + 1;
  return acc;
}, {})).map(([name, count]) => `• **${name}:** ${count} reports`).join('\n') || '• No reports this week' : '• No data available'}

💡 Monitor workload distribution to prevent team burnout and ensure balanced project assignments.`;
  }

  // Team member queries
  if (q.includes('team') || q.includes('member') || q.includes('who')) {
    return `👥 **Team Overview**

• **Total Members:** ${context.totalUsers}
• **Active Team:** ${context.teamMembers || 'No members found'}

**This Week\'s Activity:**
• ${context.totalSubmitted} members have submitted reports
• ${context.totalPending} reports are still pending
• ${context.openBlockers} open blockers across the team

${context.tasksCompletedSummary ? `\n**Recent Completed Tasks:**\n${context.tasksCompletedSummary.split('\n').slice(0, 8).map(t => `• ${t}`).join('\n')}` : ''}`;
  }

  // Default response
  return `I'd be happy to help you analyze your team's data! Here's what I can assist with:

📊 **Reports & Analytics**
• "Summarize this week's reports"
• "Show me team productivity trends"
• "What's the submission status?"

⚠️ **Blockers & Issues**
• "List all open blockers"
• "Who has the most challenges?"

📁 **Projects & Workload**
• "Show project distribution"
• "Who's working on what?"

👥 **Team Insights**
• "Who hasn't submitted their report?"
• "Show team performance"

Based on current data:
• **${context.totalSubmitted}** reports submitted this week
• **${context.openBlockers}** open blockers
• **${context.totalUsers}** active team members

What would you like to know more about?`;
}

module.exports = {
  handleChat,
};
