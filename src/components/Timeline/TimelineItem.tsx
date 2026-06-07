import { useState } from 'react';
import { GripVertical, Trash2, Music, Mic, Edit3, Check, X, Plus } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { usePodcastStore } from '@/store/usePodcastStore';
import type { TimelineItem as TimelineItemType, TimelineItemType as ItemType } from '@/types';
import { TIMELINE_ITEM_TYPES } from '@/types';
import { cn } from '@/lib/utils';

interface TimelineItemProps {
  item: TimelineItemType;
  totalDuration: number;
  onInsertAfter: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function TimelineItem({ item, totalDuration, onInsertAfter, isFirst, isLast }: TimelineItemProps) {
  const updateTimelineItem = usePodcastStore((state) => state.updateTimelineItem);
  const deleteTimelineItem = usePodcastStore((state) => state.deleteTimelineItem);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDuration, setEditDuration] = useState(item.duration.toString());

  const typeConfig = TIMELINE_ITEM_TYPES.find((t) => t.value === item.type);
  const widthPercent = totalDuration > 0 ? (item.duration / totalDuration) * 100 : 0;

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    const duration = parseFloat(editDuration);
    if (!isNaN(duration) && duration > 0) {
      updateTimelineItem(item.id, {
        title: editTitle.trim() || item.title,
        duration,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(item.title);
    setEditDuration(item.duration.toString());
    setIsEditing(false);
  };

  const toggleMarker = (marker: 'music' | 'voiceover') => {
    updateTimelineItem(item.id, {
      marker: item.marker === marker ? undefined : marker,
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTimelineItem(item.id, { type: e.target.value as ItemType });
  };

  const handleDelete = () => {
    deleteTimelineItem(item.id);
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-slate-700/80 rounded-lg p-3 border-2 border-amber-500/50"
      >
        <div className="space-y-2">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="时段标题"
            inputSize="sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Input
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value)}
              placeholder="时长(分钟)"
              inputSize="sm"
              type="number"
              step="0.5"
              min="0.1"
            />
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X size={14} />
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Check size={14} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-slate-700/50 bg-slate-800/50 overflow-hidden group transition-all duration-200 hover:border-slate-600',
        isDragging && 'opacity-50 shadow-xl',
        !isDragging && 'hover:shadow-md'
      )}
    >
      <div
        className={cn(
          'h-1.5 transition-all duration-300',
          typeConfig?.color
        )}
        style={{ width: `${widthPercent}%` }}
      />
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="text-slate-500 cursor-grab active:cursor-grabbing p-1 -ml-1 hover:text-slate-300 transition-colors"
          >
            <GripVertical size={16} />
          </div>

          <select
            value={item.type}
            onChange={handleTypeChange}
            className="bg-transparent text-xs font-medium text-slate-300 focus:outline-none cursor-pointer border-none p-0"
          >
            {TIMELINE_ITEM_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="bg-slate-800">
                {t.label}
              </option>
            ))}
          </select>

          <span className="flex-1 text-sm text-slate-100 truncate">{item.title}</span>

          <span className="text-xs text-slate-400 font-mono">
            {formatTime(item.startTime)} - {formatTime(item.startTime + item.duration)}
          </span>

          <span className="text-xs text-amber-400 font-mono font-semibold">
            {formatTime(item.duration)}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={onInsertAfter}
              title="在此之后插入"
            >
              <Plus size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                'h-7 w-7 p-0',
                item.marker === 'music' ? 'text-purple-400 bg-purple-500/20' : 'text-slate-400'
              )}
              onClick={() => toggleMarker('music')}
              title="标记音乐"
            >
              <Music size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                'h-7 w-7 p-0',
                item.marker === 'voiceover' ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-400'
              )}
              onClick={() => toggleMarker('voiceover')}
              title="标记口播"
            >
              <Mic size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              onClick={handleDelete}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        {item.marker && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span
              className={cn(
                'px-2 py-0.5 rounded-full',
                item.marker === 'music'
                  ? 'bg-purple-900/50 text-purple-300'
                  : 'bg-emerald-900/50 text-emerald-300'
              )}
            >
              {item.marker === 'music' ? '🎵 音乐' : '🎙️ 口播'} 标记
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
