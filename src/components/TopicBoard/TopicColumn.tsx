import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { TopicCard } from './TopicCard';
import { TopicForm } from './TopicForm';
import type { Topic, TopicStatus } from '@/types';
import { cn } from '@/lib/utils';

interface TopicColumnProps {
  status: TopicStatus;
  title: string;
  topics: Topic[];
  color: string;
}

export function TopicColumn({ status, title, topics, color }: TopicColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const [showForm, setShowForm] = useState(false);

  const topicIds = topics.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 min-w-0 flex flex-col rounded-xl bg-slate-800/30 border transition-all duration-200',
        isOver ? 'border-amber-500/50 bg-slate-800/50' : 'border-slate-700/30'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700/30">
        <div className="flex items-center gap-2">
          <div className={cn('w-3 h-3 rounded-full', color)} />
          <h3 className="font-semibold text-slate-200 text-sm">{title}</h3>
          <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded-full">
            {topics.length}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} />
        </Button>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] max-h-[500px]">
        {showForm && (
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30">
            <TopicForm onClose={() => setShowForm(false)} initialStatus={status} />
          </div>
        )}

        <SortableContext items={topicIds} strategy={verticalListSortingStrategy}>
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </SortableContext>

        {topics.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <p className="text-sm">暂无选题</p>
            <p className="text-xs mt-1">点击 + 添加新选题</p>
          </div>
        )}
      </div>
    </div>
  );
}
