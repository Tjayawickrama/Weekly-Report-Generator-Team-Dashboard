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
    const period = searchParams.get('period') || 'this_week';

    // Date range calculation
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'this_week': {
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case 'last_week': {
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case 'this_month': {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      }
      case 'last_month': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      }
      default: {
        startDate = new Date(0);
        endDate = now;
      }
    }

    const Project = (await import('@/models/Project')).default;

    const reports = await Report.find({
      weekStart: { $gte: startDate, $lte: endDate },
    })
      .populate('project', 'name color')
      .populate('userId', 'name email role title')
      .sort({ weekStart: -1 });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('GET /api/reports/team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
