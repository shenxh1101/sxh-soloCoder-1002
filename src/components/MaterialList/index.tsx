import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { MaterialItem } from './MaterialItem';
import { usePodcastStore } from '@/store/usePodcastStore';
import type { MaterialType } from '@/types';
import { MATERIAL_TYPES } from '@/types';

type FilterType = 'all' | MaterialType;

export function MaterialList() {
  const materials = usePodcastStore((state) => state.materials);
  const addMaterial = usePodcastStore((state) => state.addMaterial);
  const activeTopicId = usePodcastStore((state) => state.activeTopicId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newType, setNewType] = useState<MaterialType>('link');

  const filteredMaterials = materials
    .filter((m) => !activeTopicId || m.topicId === activeTopicId)
    .filter((m) => filter === 'all' || m.type === filter);

  const confirmedCount = materials.filter((m) => m.confirmed).length;
  const totalCount = materials.length;

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addMaterial({
      topicId: activeTopicId || '',
      type: newType,
      title: newTitle.trim(),
      url: newUrl.trim() || undefined,
      note: newNote.trim() || undefined,
      confirmed: false,
    });

    setNewTitle('');
    setNewUrl('');
    setNewNote('');
    setNewType('link');
    setShowAddForm(false);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden animate-fade-in" style={{ animationDelay: '300ms' }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          素材清单
        </CardTitle>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400">
            {confirmedCount}/{totalCount} 已确认
          </div>
          <div className="relative">
            <Button size="sm" variant="ghost" onClick={() => setFilter(filter === 'all' ? 'link' : filter === 'link' ? 'reference' : filter === 'reference' ? 'todo' : 'all')}>
              <Filter size={14} />
              {filter === 'all' ? '全部' : MATERIAL_TYPES.find(t => t.value === filter)?.label}
            </Button>
          </div>
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus size={16} />
            添加素材
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto min-h-0">
        {showAddForm && (
          <form onSubmit={handleAddMaterial} className="mb-4 bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 animate-slide-down">
            <div className="space-y-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs font-medium text-slate-400">类型:</label>
                <div className="flex gap-1">
                  {MATERIAL_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewType(type.value)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        newType === type.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="素材标题"
                size="sm"
                autoFocus
              />
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="链接地址(可选)"
                size="sm"
              />
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="备注信息(可选)"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                取消
              </Button>
              <Button type="submit" size="sm" disabled={!newTitle.trim()}>
                添加
              </Button>
            </div>
          </form>
        )}

        {filteredMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <p className="text-sm">暂无素材</p>
            <p className="text-xs mt-1">点击「添加素材」开始收集</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMaterials.map((material) => (
              <MaterialItem key={material.id} material={material} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
