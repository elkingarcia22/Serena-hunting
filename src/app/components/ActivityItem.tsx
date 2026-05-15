import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';

type EventType = 'email' | 'interview' | 'system' | 'note' | 'stage' | 'todo' | 'message' | 'trigger' | 'meeting' | 'update' | 'evaluation';
type StatusType = 'success' | 'failed' | 'pending' | 'warning';

interface ActivityItemProps {
  actor: {
    name: string;
    avatar?: string;
    type: 'system' | 'recruiter' | 'candidate' | 'ai' | 'integration';
  };
  eventType: EventType;
  status: StatusType;
  timestamp: string;
  title: string;
  description?: string;
  metadata?: React.ReactNode;
  actions?: Array<{ label: string; onClick: () => void }>;
  stackedEvents?: Array<{ label: string; status: StatusType }>;
}

const eventTypeBadges: Record<EventType, { label: string; className: string }> = {
  trigger: { label: 'Trigger', className: 'bg-purple-100 text-purple-700' },
  meeting: { label: 'Meeting', className: 'bg-blue-100 text-blue-700' },
  interview: { label: 'Interview', className: 'bg-indigo-100 text-indigo-700' },
  message: { label: 'Message', className: 'bg-green-100 text-green-700' },
  email: { label: 'Email', className: 'bg-cyan-100 text-cyan-700' },
  update: { label: 'Update', className: 'bg-gray-100 text-gray-700' },
  stage: { label: 'Stage', className: 'bg-orange-100 text-orange-700' },
  system: { label: 'System', className: 'bg-gray-100 text-gray-700' },
  note: { label: 'Note', className: 'bg-yellow-100 text-yellow-700' },
  todo: { label: 'To-do', className: 'bg-pink-100 text-pink-700' },
  evaluation: { label: 'Evaluación', className: 'bg-emerald-100 text-emerald-700' },
};

export function ActivityItem({
  actor,
  eventType,
  status,
  timestamp,
  title,
  description,
  metadata,
  actions,
  stackedEvents,
}: ActivityItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const eventBadge = eventTypeBadges[eventType];

  return (
    <div className="border-l-2 border-gray-200 pl-4 pb-4 relative">
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-300" />

      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="w-6 h-6 text-xs">
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                {actor.name.charAt(0)}
              </div>
            </Avatar>
            <span className="text-sm text-gray-700 truncate">{actor.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${eventBadge.className}`}>
              {eventBadge.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <span className="text-xs text-gray-500 whitespace-nowrap">{timestamp}</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <p className="text-sm text-gray-900">{title}</p>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>

        {/* Stacked events */}
        {stackedEvents && stackedEvents.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {stackedEvents.map((event, idx) => (
              <div key={idx} className="flex items-center gap-1 text-xs text-gray-600">
                <StatusBadge status={event.status} />
                <span>{event.label}</span>
                {idx < stackedEvents.length - 1 && <span className="text-gray-400">→</span>}
              </div>
            ))}
          </div>
        )}

        {/* Expandable section */}
        {(metadata || actions) && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2 text-xs"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Ocultar
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Expandir
                </>
              )}
            </Button>

            {isExpanded && (
              <div className="mt-2 space-y-3 bg-gray-50 rounded-lg p-3">
                {metadata && <div className="text-sm text-gray-700">{metadata}</div>}
                {actions && actions.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {actions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={action.onClick}
                        className="h-7 text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}