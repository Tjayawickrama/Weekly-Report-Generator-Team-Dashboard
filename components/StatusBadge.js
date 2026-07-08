'use client';

export default function StatusBadge({ status }) {
  const statusMap = {
    submitted: 'Submitted',
    pending: 'Pending',
    late: 'Late',
    draft: 'Draft',
    active: 'Active',
    completed: 'Completed',
    archived: 'Archived',
  };

  const displayText = statusMap[status] || status;

  return (
    <span className={`status-badge ${status}`}>
      {displayText}
    </span>
  );
}
