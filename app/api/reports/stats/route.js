import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';
import User from '@/models/User';

export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const period = searchParams.get('period') || 'this_week';

    const Project = (await import('@/models/Project')).default;

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
      const user = await User.findOne({ email: session.user.email });
      if (!user) return NextResponse.json({ stats: {} });

      const myReports = await Report.find({ userId: user._id });
      const submittedReports = myReports.filter(r => r.status === 'submitted');
      const pendingReports = myReports.filter(r => r.status === 'draft' || r.status === 'pending');
      const openBlockers = myReports.reduce((sum, r) => sum + (r.blockers?.filter(b => !b.resolved)?.length || 0), 0);
      const projectIds = [...new Set(myReports.map(r => r.project?.toString()).filter(Boolean))];

      return NextResponse.json({
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
    const totalUsers = await User.countDocuments({ role: 'team_member', isActive: true });

    const thisWeekReports = await Report.find({
      weekStart: { $gte: weekStart, $lte: weekEnd },
    }).populate('project', 'name color').populate('userId', 'name email role title');

    const submittedCount = thisWeekReports.filter(r => r.status === 'submitted').length;
    const pendingCount = thisWeekReports.filter(r => r.status === 'draft' || r.status === 'pending').length;
    const lateCount = thisWeekReports.filter(r => r.status === 'late').length;

    const allReports = await Report.find({}).populate('userId', 'name email');
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
      _id: r._id,
      projectName: r.project?.name || 'Unknown',
      user: r.userId?.name || 'Unknown',
      userName: r.userId?.name || 'Unknown',
      status: r.status,
      hours: r.hoursWorked,
      time: getTimeAgo(r.createdAt),
    }));

    // Top contributors
    const userReportCounts = {};
    allReports.forEach(r => {
      const uid = r.userId?._id?.toString() || r.userId?.toString();
      const name = r.userId?.name || 'Unknown';
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

    return NextResponse.json({
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
    console.error('GET /api/reports/stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
