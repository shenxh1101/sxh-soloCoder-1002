import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { User, Trash2, Edit3, Check, X, GripVertical } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tag } from '../ui/Tag';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { usePodcastStore } from '@/store/usePodcastStore';
import type { Topic, Priority } from '@/types';
import { PRIORITY_LEVELS } from '@/types';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  topic: Topic;
}

export function TopicCard({ topic }: TopicCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const updateTopic = usePodcastStore((state) => state.updateTopic);
  const deleteTopic = usePodcastStore((state) => state.deleteTopic);
  const setActiveTopic = usePodcastStore((state) => state.setActiveTopic);
  const activeTopicId = usePodcastStore((state) => state.activeTopicId);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(topic.title);
  const [editDescription, setEditDescription] = useState(topic.description);
  const [editGuest, setEditGuest] = useState(topic.guest);
  const [editPriority, setEditPriority] = useState<Priority>(topic.priority);
  const [tagInput, setTagInput] = useState('');
  const [editTags, setEditTags] = useState<string[]>(topic.tags);

  const isActive = activeTopicId === topic.id;

  const priorityConfig = PRIORITY_LEVELS.find((p) => p.value === topic.priority);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!editTags.includes(tagInput.trim())) {
        setEditTags([...editTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    updateTopic(topic.id, {
      title: editTitle.trim() || topic.title,
      description: editDescription.trim(),
      guest: editGuest.trim(),
      priority: editPriority,
      tags: editTags,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(topic.title);
    setEditDescription(topic.description);
    setEditGuest(topic.guest);
    setEditPriority(topic.priority);
    setEditTags(topic.tags);
    setIsEditing(false);
  };

  const handleSelect = () => {
    if (!isEditing) {
      setActiveTopic(isActive ? null : topic.id);
    }
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-slate-700/80 rounded-lg p-4 border-2 border-amber-500/50 shadow-lg"
      >
        <div className="space-y-3">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="主题标题"
            className="text-sm font-semibold"
          />
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="主题描述"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={editGuest}
              onChange={(e) => setEditGuest(e.target.value)}
              placeholder="嘉宾"
              icon={<User size={14} />}
            />
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as Priority)}
              className="w-full h-10 rounded-lg border border-slate-600/50 bg-slate-900/50 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {PRIORITY_LEVELS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-1">
            {editTags.map((tag) => (
              <Tag key={tag} variant="info" removable onRemove={() => handleRemoveTag(tag)}>
                {tag}
              </Tag>
            ))}
          </div>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="输入标签后按回车"
            inputSize="sm"
          />
          <div className="flex justify-end gap-2">
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
      onClick={handleSelect}
      className={cn(
        'bg-slate-800/80 rounded-lg p-4 border border-slate-700/50 cursor-pointer transition-all duration-200 group',
        isActive && 'ring-2 ring-amber-500 border-amber-500/50',
        isDragging && 'opacity-50',
        !isEditing && 'hover:border-slate-600 hover:shadow-lg hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <GripVertical size={16} />
          </div>
          <h4 className="font-medium text-slate-100 text-sm truncate flex-1">
            {topic.title}
          </h4>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Edit3 size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            onClick={(e) => {
              e.stopPropagation();
              deleteTopic(topic.id);
            }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {topic.description && (
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{topic.description}</p>
      )}

      <div className="flex items-center justify-between mb-3">
        {topic.guest && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <User size={12} />
            <span className="truncate">{topic.guest}</span>
          </div>
        )}
        {priorityConfig && (
          <Badge variant={topic.priority === 'high' ? 'danger' : topic.priority === 'medium' ? 'warning' : 'success'}>
            {priorityConfig.label}
          </Badge>
        )}
      </div>

      {topic.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {topic.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} variant="default" size="sm">
              {tag}
            </Tag>
          ))}
          {topic.tags.length > 3 && (
            <Tag variant="default" size="sm">
              +{topic.tags.length - 3}
            </Tag>
          )}
        </div>
      )}
    </div>
  );
}
