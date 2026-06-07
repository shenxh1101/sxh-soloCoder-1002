import { Radio, User, Tag, Flag, ChevronRight } from 'lucide-react';
import { usePodcastStore } from '@/store/usePodcastStore';
import { Badge } from './ui/Badge';
import { Tag as TagComponent } from './ui/Tag';
import { PRIORITY_LEVELS } from '@/types';

interface TopicHeaderProps {
  moduleIcon: string;
  moduleName: string;
}

export function TopicHeader({ moduleIcon, moduleName }: TopicHeaderProps) {
  const activeTopic = usePodcastStore((state) => state.getActiveTopic());
  const activeTopicId = usePodcastStore((state) => state.activeTopicId);
  const setActiveTopic = usePodcastStore((state) => state.setActiveTopic);
  const topics = usePodcastStore((state) => state.topics);

  const priorityConfig = activeTopic
    ? PRIORITY_LEVELS.find((p) => p.value === activeTopic.priority)
    : null;

  if (!activeTopic) {
    return (
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl p-4 mb-4 border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-xl">
              {moduleIcon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-300">{moduleName}</h3>
              <p className="text-xs text-slate-500">请先选择一个选题</p>
            </div>
          </div>
          {topics.length > 0 && (
            <div className="relative">
              <select
                value=""
                onChange={(e) => setActiveTopic(e.target.value || null)}
                className="bg-slate-700/50 text-sm text-slate-300 px-3 py-1.5 rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none pr-8 cursor-pointer"
              >
                <option value="">选择一个选题...</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
              <ChevronRight
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none rotate-90"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl p-4 mb-4 border border-amber-500/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
            <Radio size={18} className="text-slate-900" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-amber-400 font-medium">当前选题</span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-500">{moduleIcon} {moduleName}</span>
            </div>
            <h3 className="font-semibold text-slate-100 truncate text-lg">
              {activeTopic.title}
            </h3>
            {activeTopic.description && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {activeTopic.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {activeTopic.guest && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <User size={12} />
                  <span>嘉宾: {activeTopic.guest}</span>
                </div>
              )}
              {priorityConfig && (
                <div className="flex items-center gap-1">
                  <Badge
                    variant={priorityConfig.value === 'high' ? 'danger' : priorityConfig.value === 'medium' ? 'warning' : 'default'}
                  >
                    <Flag size={10} className="mr-1" />
                    {priorityConfig.label}
                  </Badge>
                </div>
              )}
            </div>
            {activeTopic.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {activeTopic.tags.map((tag, index) => (
                  <TagComponent key={index} variant="outline" size="sm">
                    <Tag size={10} className="mr-1" />
                    {tag}
                  </TagComponent>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <select
            value={activeTopicId || ''}
            onChange={(e) => setActiveTopic(e.target.value || null)}
            className="bg-slate-800/50 text-sm text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none pr-8 cursor-pointer hover:bg-slate-700/50 transition-colors"
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
          <ChevronRight
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none rotate-90"
          />
        </div>
      </div>
    </div>
  );
}
