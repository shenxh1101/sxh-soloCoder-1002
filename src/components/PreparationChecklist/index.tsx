import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Trash2, Check, Edit3, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TopicHeader } from '../TopicHeader';
import { usePodcastStore } from '@/store/usePodcastStore';
import type { ChecklistItem } from '@/types';
import { cn } from '@/lib/utils';

export function PreparationChecklist() {
  const activeTopicId = usePodcastStore((state) => state.activeTopicId);
  const checklistItems = usePodcastStore((state) => state.checklistItems);
  const toggleChecklistCompleted = usePodcastStore((state) => state.toggleChecklistCompleted);
  const regenerateChecklist = usePodcastStore((state) => state.regenerateChecklist);
  const deleteChecklistItem = usePodcastStore((state) => state.deleteChecklistItem);
  const addChecklistItem = usePodcastStore((state) => state.addChecklistItem);
  const updateChecklistItem = usePodcastStore((state) => state.updateChecklistItem);

  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const hasActiveTopic = !!activeTopicId;

  const filteredItems = checklistItems
    .filter((c) => !activeTopicId || c.topicId === activeTopicId)
    .sort((a, b) => {
      const typeOrder = ['empty-script', 'unconfirmed-material', 'timeline-duration', 'ad-marker', 'music-marker', 'voiceover-marker', 'custom'];
      return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
    });

  const completedCount = filteredItems.filter((i) => i.completed).length;
  const totalCount = filteredItems.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  useEffect(() => {
    if (activeTopicId && filteredItems.length === 0) {
      regenerateChecklist(activeTopicId);
    }
  }, [activeTopicId]);

  const handleRegenerate = () => {
    if (activeTopicId) {
      regenerateChecklist(activeTopicId);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !activeTopicId) return;

    addChecklistItem({
      topicId: activeTopicId,
      type: 'custom',
      title: newItemTitle.trim(),
      description: newItemDesc.trim(),
      completed: false,
    });

    setNewItemTitle('');
    setNewItemDesc('');
    setShowAddCustom(false);
  };

  const handleStartEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDesc(item.description);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editTitle.trim()) return;
    updateChecklistItem(editingId, {
      title: editTitle.trim(),
      description: editDesc.trim(),
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'empty-script': return '📝';
      case 'unconfirmed-material': return '📚';
      case 'timeline-duration': return '⏱️';
      case 'ad-marker': return '📢';
      case 'music-marker': return '🎵';
      case 'voiceover-marker': return '🎙️';
      case 'custom': return '✅';
      default: return '📋';
    }
  };

  const getTypeColor = (type: string, completed: boolean) => {
    if (completed) return 'bg-emerald-900/30 border-emerald-700/50';
    switch (type) {
      case 'empty-script':
      case 'unconfirmed-material':
        return 'bg-rose-900/20 border-rose-700/50';
      case 'timeline-duration':
        return 'bg-amber-900/20 border-amber-700/50';
      case 'ad-marker':
      case 'music-marker':
      case 'voiceover-marker':
        return 'bg-indigo-900/20 border-indigo-700/50';
      default:
        return 'bg-slate-800/50 border-slate-700/50';
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden animate-fade-in" style={{ animationDelay: '300ms' }}>
      <CardContent className="flex-1 overflow-y-auto min-h-0 p-4">
        <TopicHeader moduleIcon="✅" moduleName="准备检查清单" />

        {!hasActiveTopic ? (
          <div className="flex flex-col items-center justify-center h-[60%] text-slate-500">
            <p className="text-sm">请先选择一个选题</p>
            <p className="text-xs mt-1">在上方下拉框中选择或前往选题板创建</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-300">准备进度</span>
                    <span className="text-sm font-mono text-amber-400">
                      {completedCount}/{totalCount}
                    </span>
                  </div>
                  <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={handleRegenerate} title="重新生成">
                  <RefreshCw size={14} />
                </Button>
                <Button size="sm" onClick={() => setShowAddCustom(true)}>
                  <Plus size={14} className="mr-1" />
                  添加检查项
                </Button>
              </div>
            </div>

            {showAddCustom && (
              <form onSubmit={handleAddCustom} className="mb-4 bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 animate-slide-down">
                <div className="space-y-3">
                  <Input
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="检查项标题"
                    inputSize="sm"
                    autoFocus
                  />
                  <Input
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    placeholder="详细说明（可选）"
                    inputSize="sm"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowAddCustom(false);
                        setNewItemTitle('');
                        setNewItemDesc('');
                      }}
                    >
                      取消
                    </Button>
                    <Button type="submit" size="sm" disabled={!newItemTitle.trim()}>
                      添加
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[40%] text-slate-500">
                <p className="text-sm">暂无检查项</p>
                <p className="text-xs mt-1">点击「重新生成」基于当前内容生成检查项</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'rounded-lg border p-3 transition-all duration-200 group',
                      getTypeColor(item.type, item.completed)
                    )}
                  >
                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          inputSize="sm"
                          autoFocus
                        />
                        <Input
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="详细说明"
                          inputSize="sm"
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                            <X size={14} className="mr-1" />
                            取消
                          </Button>
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Check size={14} className="mr-1" />
                            保存
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleChecklistCompleted(item.id)}
                          className={cn(
                            'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0',
                            item.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-500 hover:border-emerald-400'
                          )}
                        >
                          {item.completed && <Check size={12} />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{getTypeIcon(item.type)}</span>
                            <span className={cn(
                              'text-sm font-medium',
                              item.completed ? 'text-slate-400 line-through' : 'text-slate-200'
                            )}>
                              {item.title}
                            </span>
                          </div>
                          {item.description && (
                            <p className={cn(
                              'text-xs mt-1 whitespace-pre-line',
                              item.completed ? 'text-slate-500' : 'text-slate-400'
                            )}>
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.type === 'custom' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => handleStartEdit(item)}
                              >
                                <Edit3 size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                onClick={() => deleteChecklistItem(item.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
