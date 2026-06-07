import { useState } from 'react';
import { Link, Quote, CheckSquare, Trash2, Edit3, Check, X, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { usePodcastStore } from '@/store/usePodcastStore';
import type { Material, MaterialType } from '@/types';
import { MATERIAL_TYPES } from '@/types';
import { cn } from '@/lib/utils';

interface MaterialItemProps {
  material: Material;
}

export function MaterialItem({ material }: MaterialItemProps) {
  const updateMaterial = usePodcastStore((state) => state.updateMaterial);
  const deleteMaterial = usePodcastStore((state) => state.deleteMaterial);
  const toggleMaterialConfirmed = usePodcastStore((state) => state.toggleMaterialConfirmed);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(material.title);
  const [editUrl, setEditUrl] = useState(material.url || '');
  const [editNote, setEditNote] = useState(material.note || '');
  const [showNote, setShowNote] = useState(false);

  const typeConfig = MATERIAL_TYPES.find((t) => t.value === material.type);

  const getIcon = () => {
    switch (material.type) {
      case 'link':
        return <Link size={16} />;
      case 'reference':
        return <Quote size={16} />;
      case 'todo':
        return <CheckSquare size={16} />;
    }
  };

  const handleSave = () => {
    updateMaterial(material.id, {
      title: editTitle.trim() || material.title,
      url: editUrl.trim() || undefined,
      note: editNote.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(material.title);
    setEditUrl(material.url || '');
    setEditNote(material.note || '');
    setIsEditing(false);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMaterial(material.id, { type: e.target.value as MaterialType });
  };

  if (isEditing) {
    return (
      <div className="bg-slate-700/80 rounded-lg p-4 border-2 border-amber-500/50 space-y-3">
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="素材标题"
          size="sm"
          autoFocus
        />
        <Input
          value={editUrl}
          onChange={(e) => setEditUrl(e.target.value)}
          placeholder="链接地址(可选)"
          size="sm"
        />
        <Textarea
          value={editNote}
          onChange={(e) => setEditNote(e.target.value)}
          placeholder="备注信息(可选)"
          rows={2}
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
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border transition-all duration-200 group overflow-hidden',
        material.confirmed
          ? 'bg-emerald-900/20 border-emerald-700/30'
          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
      )}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => toggleMaterialConfirmed(material.id)}
            className={cn(
              'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
              material.confirmed
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-slate-500 hover:border-slate-400'
            )}
          >
            {material.confirmed && <Check size={12} />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <select
                value={material.type}
                onChange={handleTypeChange}
                className="bg-transparent text-xs font-medium text-slate-400 focus:outline-none cursor-pointer border-none p-0"
              >
                {MATERIAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-slate-800">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className={cn(
                'text-sm flex-1',
                material.confirmed ? 'text-slate-400 line-through' : 'text-slate-100'
              )}>
                {material.title}
              </span>
            </div>

            {material.url && (
              <div className="mt-1">
                <a
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors truncate max-w-full"
                >
                  <Link size={12} />
                  <span className="truncate">{material.url}</span>
                  <ExternalLink size={10} className="flex-shrink-0" />
                </a>
              </div>
            )}

            {material.note && (
              <div className="mt-2">
                <button
                  onClick={() => setShowNote(!showNote)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                >
                  {showNote ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  备注
                </button>
                {showNote && (
                  <p className="mt-1 text-xs text-slate-400 bg-slate-900/50 rounded p-2">
                    {material.note}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-slate-400"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              onClick={() => deleteMaterial(material.id)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
