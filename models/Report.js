import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weekStart: {
    type: Date,
    required: [true, 'Please provide the week start date'],
  },
  weekEnd: {
    type: Date,
    required: [true, 'Please provide the week end date'],
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Please assign a project'],
  },
  tasksCompleted: [{
    text: { type: String, required: true },
    completed: { type: Boolean, default: true },
  }],
  tasksPlanned: [{
    text: { type: String, required: true },
  }],
  blockers: [{
    text: { type: String, required: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    resolved: { type: Boolean, default: false },
  }],
  hoursWorked: {
    type: Number,
    min: 0,
    max: 168,
    default: 0,
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    default: '',
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'late'],
    default: 'draft',
  },
  submittedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes
ReportSchema.index({ userId: 1, weekStart: -1 });
ReportSchema.index({ project: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ weekStart: 1, weekEnd: 1 });

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
