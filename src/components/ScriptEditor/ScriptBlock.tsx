import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  GripVertical,
  Type,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { usePodcastStore } from '@/store/usePodcastStore';
import type { ScriptBlock as ScriptBlockType, ScriptBlockType as BlockType } from '@/types';
import { SCRIPT_BLOCK_TYPES } from '@/types';
import { cn } from '@/lib/utils';

interface ScriptBlockProps {
  block: ScriptBlockType;
}

export function ScriptBlock({ block }: ScriptBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const updateScriptBlock = usePodcastStore((state) => state.updateScriptBlock);
  const deleteScriptBlock = usePodcastStore((state) => state.deleteScriptBlock);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(block.title);
  const [editContent, setEditContent] = useState(block.content);

  const typeConfig = SCRIPT_BLOCK_TYPES.find((t) => t.value === block.type);
  const charCount = block.content.length;
  const wordCount = block.content.trim() ? block.content.trim().split(/\s+/).length : 0;

  const handleSave = () => {
    updateScriptBlock(block.id, {
      title: editTitle.trim() || block.title,
      content: editContent.trim(),
    });
    setIsEditing(false);
  };

  const toggleCollapse = () => {
    if (!isEditing) {
      updateScriptBlock(block.id, { collapsed: !block.collapsed });
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateScriptBlock(block.id, { type: e.target.value as BlockType });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-slate-700/50 overflow-hidden transition-all duration-200',
        isDragging && 'opacity-50',
        block.collapsed ? 'bg-slate-800/30' : 'bg-slate-800/50'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors',
          typeConfig?.color + '/20',
          'border-b border-slate-700/30'
        )}
        onClick={toggleCollapse}
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-500 hover:text-slate-300 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </div>

        <div className={cn('w-2 h-2 rounded-full', typeConfig?.color)} />

        <select
          value={block.type}
          onChange={handleTypeChange}
          onClick={(e) => e.stopPropagation()}
          className="bg-transparent text-sm font-medium text-slate-200 focus:outline-none cursor-pointer border-none p-0"
        >
          {SCRIPT_BLOCK_TYPES.map((t) => (
            <option key={t.value} value={t.value} className="bg-slate-800">
              {t.label}
            </option>
          ))}
        </select>

        {!isEditing ? (
          <span
            className="flex-1 text-sm text-slate-100 truncate"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            {block.title}
          </span>
        ) : (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 h-7 text-sm"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        )}

        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Type size={12} />
          <span>{charCount} 字</span>
        </div>

        <div className="flex items-center gap-1 ml-2">
          {isEditing && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-emerald-400"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
              >
                ✓
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditTitle(block.title);
                  setEditContent(block.content);
                  setIsEditing(false);
                }}
              >
                ✕
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            onClick={(e) => {
              e.stopPropagation();
              deleteScriptBlock(block.id);
            }}
          >
            <Trash2 size={14} />
          </Button>
          {block.collapsed ? (
            <ChevronDown size={16} className="text-slate-400" />
          ) : (
            <ChevronUp size={16} className="text-slate-400" />
          )}
        </div>
      </div>

      {!block.collapsed && (
        <div className="p-3">
          {!isEditing ? (
            <div
              className="text-sm text-slate-300 whitespace-pre-wrap cursor-text min-h-[60px]"
              onClick={() => setIsEditing(true)}
            >
              {block.content || (
                <span className="text-slate-500 italic">点击编辑内容...</span>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="输入脚本内容..."
                rows={4}
                autoFocus
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {editContent.length} 字 / {editContent.trim() ? editContent.trim().split(/\s+/).length : 0} 词
                </span>
                <span className="text-slate-400">
                  预计朗读时长: ~{Math.max(1, Math.round(editContent.length / 300))} 分钟
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
