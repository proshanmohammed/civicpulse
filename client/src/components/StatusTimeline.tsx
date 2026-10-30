import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  UserCheck, 
  Wrench, 
  CheckCheck, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { ReportStatus, ActivityLog } from '../types';

interface StatusTimelineProps {
  currentStatus: ReportStatus;
  activityLogs?: ActivityLog[];
  assignedTo?: string | null;
}

const STEPS: { status: ReportStatus; title: string; desc: string; icon: any }[] = [
  {
    status: 'Submitted',
    title: 'Report Received',
    desc: 'Citizen grievance captured & triaged by Gemini AI',
    icon: FileText
  },
  {
    status: 'Under Review',
    title: 'Municipal Triage',
    desc: 'Semantic duplicate check & priority validation',
    icon: Clock
  },
  {
    status: 'Assigned',
    title: 'Field Crew Assigned',
    desc: 'Dispatched to specialized municipal department',
    icon: UserCheck
  },
  {
    status: 'In Progress',
    title: 'Remediation Active',
    desc: 'Work crews actively operating on site',
    icon: Wrench
  },
  {
    status: 'Resolved',
    title: 'Verified Resolved',
    desc: 'Civic issue rectified and closed with audit verification',
    icon: CheckCheck
  }
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ 
  currentStatus, 
  activityLogs = [], 
  assignedTo 
}) => {
  const getStepIndex = (status: ReportStatus) => {
    switch (status) {
      case 'Submitted': return 0;
      case 'Under Review': return 1;
      case 'Assigned': return 2;
      case 'In Progress': return 3;
      case 'Resolved': return 4;
      case 'Rejected': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);
  const isRejected = currentStatus === 'Rejected';

  return (
    <div className="w-full">
      {/* Rejection Alert Banner if applicable */}
      {isRejected && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-rose-300">Report Status: Rejected / Closed</h4>
            <p className="text-xs text-rose-200/80">
              This grievance was reviewed by municipal officers and marked as non-actionable or out of municipal jurisdiction.
            </p>
          </div>
        </div>
      )}

      {/* Visual Timeline Track */}
      <div className="relative">
        <div className="space-y-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = !isRejected && idx < currentIndex;
            const isCurrent = !isRejected && idx === currentIndex;
            const isUpcoming = !isRejected && idx > currentIndex;

            // Find matching activity log entry if available
            const matchingLog = activityLogs.find(log => log.new_status === step.status);

            return (
              <div key={step.status} className="relative flex items-start gap-4 group">
                
                {/* Connecting Vertical Line */}
                {idx < STEPS.length - 1 && (
                  <div 
                    className={`absolute left-5 top-10 bottom-0 w-0.5 -ml-[1px] transition-colors duration-500 ${
                      idx < currentIndex 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600' 
                        : 'bg-slate-800'
                    }`}
                  />
                )}

                {/* Status Step Icon Circle */}
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 z-10 ${
                    isCompleted
                      ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/50 shadow-md shadow-indigo-600/20'
                      : isCurrent
                      ? 'bg-indigo-600 text-white border-indigo-400 ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-500/30 animate-pulse'
                      : 'bg-slate-900/80 text-slate-600 border-slate-800'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className={`text-sm font-semibold tracking-wide ${
                      isCurrent ? 'text-indigo-300' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                    }`}>
                      {step.title}
                    </h4>

                    {matchingLog?.created_at && (
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(matchingLog.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' · '}
                        {new Date(matchingLog.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {step.desc}
                  </p>

                  {/* Contextual Notes & Assignment callouts */}
                  {step.status === 'Assigned' && assignedTo && (isCompleted || isCurrent) && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                      Assigned to: <strong className="text-white">{assignedTo}</strong>
                    </div>
                  )}

                  {matchingLog?.notes && (
                    <div className="mt-2 text-xs bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-slate-300">
                      <span className="text-slate-500 font-mono text-[10px] block mb-0.5">
                        AUTHORITY AUDIT NOTE:
                      </span>
                      {matchingLog.notes}
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
