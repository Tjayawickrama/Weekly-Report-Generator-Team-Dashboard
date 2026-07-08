import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';
import Project from '@/models/Project';

export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Import User model to resolve populate
    const User = (await import('@/models/User')).default;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    let query = {};
    
    // If not manager, only show own reports
    if (session.user.role === 'team_member') {
      const user = await User.findOne({ email: session.user.email });
      if (user) query.userId = user._id;
    } else if (userId) {
      query.userId = userId;
    }

    const reports = await Report.find(query)
      .populate('project', 'name color')
      .populate('userId', 'name email role title')
      .sort({ weekStart: -1 })
      .limit(100);

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();

    const report = await Report.create({
      userId: user._id,
      weekStart: new Date(body.weekStart),
      weekEnd: new Date(body.weekEnd),
      project: body.project,
      tasksCompleted: body.tasksCompleted || [],
      tasksPlanned: body.tasksPlanned || [],
      blockers: body.blockers || [],
      hoursWorked: body.hoursWorked || 0,
      notes: body.notes || '',
      status: body.status || 'draft',
      submittedAt: body.status === 'submitted' ? new Date() : null,
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
