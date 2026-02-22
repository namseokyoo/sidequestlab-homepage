import type { TimelineEvent } from '@/lib/timeline';

interface TimelineProps {
  events: TimelineEvent[];
  locale: 'ko' | 'en';
}

export default function Timeline({ events, locale }: TimelineProps) {
  const getDotColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'milestone':
        return 'bg-blue-500 ring-blue-100 dark:ring-blue-900/40';
      case 'project':
        return 'bg-green-500 ring-green-100 dark:ring-green-900/40';
      case 'governance':
        return 'bg-amber-500 ring-amber-100 dark:ring-amber-900/40';
      default:
        return 'bg-gray-400 ring-gray-100 dark:ring-gray-800';
    }
  };

  const getTypeLabel = (type: TimelineEvent['type']) => {
    const labels: Record<TimelineEvent['type'], { ko: string; en: string }> = {
      milestone: { ko: '마일스톤', en: 'Milestone' },
      project: { ko: '프로젝트', en: 'Project' },
      governance: { ko: '거버넌스', en: 'Governance' },
    };
    return labels[type][locale];
  };

  const getTypeBadgeColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'milestone':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'project':
        return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'governance':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (locale === 'ko') {
      return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="relative">
      {events.map((event, index) => (
        <div key={index} className="relative flex gap-6 pb-10 last:pb-0">
          {/* Vertical Line */}
          <div className="flex flex-col items-center">
            <div
              className={`relative z-10 h-4 w-4 rounded-full ring-4 ${getDotColor(event.type)}`}
            />
            {index < events.length - 1 && (
              <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700" />
            )}
          </div>

          {/* Content */}
          <div className="-mt-1 flex-1 pb-2">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <time className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {formatDate(event.date)}
              </time>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTypeBadgeColor(event.type)}`}
              >
                {getTypeLabel(event.type)}
              </span>
            </div>
            <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
              {event.title[locale]}
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {event.description[locale]}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
