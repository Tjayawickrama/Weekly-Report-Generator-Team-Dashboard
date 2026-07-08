import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const User = (await import('@/models/User')).default;
    const Project = (await import('@/models/Project')).default;

    const report = await Report.findById(id)
      .populate('project', 'name color description')
      .populate('userId', 'name email role title');

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('GET /api/reports/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const update = {};
    if (body.weekStart) update.weekStart = new Date(body.weekStart);
    if (body.weekEnd) update.weekEnd = new Date(body.weekEnd);
    if (body.project) update.project = body.project;
    if (body.tasksCompleted) update.tasksCompleted = body.tasksCompleted;
    if (body.tasksPlanned) update.tasksPlanned = body.tasksPlanned;
    if (body.blockers !== undefined) update.blockers = body.blockers;
    if (body.hoursWorked !== undefined) update.hoursWorked = body.hoursWorked;
    if (body.notes !== undefined) update.notes = body.notes;
    if (body.status) {
      update.status = body.status;
      if (body.status === 'submitted') {
        update.submittedAt = new Date();
      }
    }

    const report = await Report.findByIdAndUpdate(id, update, { new: true })
      .populate('project', 'name color')
      .populate('userId', 'name email');

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('PUT /api/reports/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const report = await Report.findByIdAndDelete(id);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Report deleted' });
  } catch (error) {
    console.error('DELETE /api/reports/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
