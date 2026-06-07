import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit3, Check, X, Calendar, Tag, FileText, Globe, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { TopicHeader } from '../TopicHeader';
import { usePodcastStore } from '@/store/usePodcastStore';
import { copyToClipboard } from '@/utils/export';
import type { PublishPlatform } from '@/types';
import { PUBLISH_PLATFORMS } from '@/types';
import { cn } from '@/lib/utils';

export function PublishVersions() {
  const activeTopicId = usePodcastStore((state) => state.activeTopicId);
  const getPublishVersionsForTopic = usePodcastStore((state) => state.getPublishVersionsForTopic);
  const addPublishVersion = usePodcastStore((state) => state.addPublishVersion);
  const updatePublishVersion = usePodcastStore((state) => state.updatePublishVersion);
  const deletePublishVersion = usePodcastStore((state) => state.deletePublishVersion);

  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [newPlatform, setNewPlatform] = useState<PublishPlatform>('xiaoyuzhou');
  const [newPlatformName, setNewPlatformName] = useState('小宇宙');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newShownotes, setNewShownotes] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newScheduledDate, setNewScheduledDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const hasActiveTopic = !!activeTopicId;

  const versions = useMemo(() => {
    if (!activeTopicId) return [];
    return getPublishVersionsForTopic(activeTopicId);
  }, [activeTopicId, getPublishVersionsForTopic]);

  const handleAddVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTopicId || !newTitle.trim()) return;

    const selectedPlatform = PUBLISH_PLATFORMS.find((p) => p.value === newPlatform);
    const platformName = newPlatform === 'custom' ? newPlatformName.trim() : selectedPlatform?.label || newPlatform;

    addPublishVersion({
      topicId: activeTopicId,
      platform: newPlatform,
      platformName,
      title: newTitle.trim(),
      description: newDescription.trim(),
      shownotes: newShownotes.trim(),
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      scheduledDate: newScheduledDate,
      notes: newNotes.trim(),
    });

    setNewPlatform('xiaoyuzhou');
    setNewPlatformName('小宇宙');
    setNewTitle('');
    setNewDescription('');
    setNewShownotes('');
    setNewTags('');
    setNewScheduledDate('');
    setNewNotes('');
    setShowAddForm(false);
  };

  const handlePlatformChange = (platform: PublishPlatform) => {
    setNewPlatform(platform);
    const selectedPlatform = PUBLISH_PLATFORMS.find((p) => p.value === platform);
    if (selectedPlatform) {
      setNewPlatformName(selectedPlatform.label);
    }
  };

  const getPlatformIcon = (platform: string) => {
    return PUBLISH_PLATFORMS.find((p) => p.value === platform)?.icon || '🌐';
  };

  const getPlatformColor = (platform: string) => {
    return PUBLISH_PLATFORMS.find((p) => p.value === platform)?.color || 'bg-slate-500';
  };

  const handleCopyContent = async (version: typeof versions[0]) => {
    const content = `${version.title}\n\n${version.description}\n\n${version.shownotes ? '---\n\n' + version.shownotes + '\n\n' : ''}标签: ${version.tags.map((t) => '#' + t).join(' ')}`;
    const success = await copyToClipboard(content);
    if (success) {
      setCopiedId(version.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const renderEditForm = (version: typeof versions[0]) => (
    <div className="space-y-3 animate-slide-down">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">平台</label>
          <select
            value={version.platform}
            disabled
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-400"
          >
            {PUBLISH_PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.icon} {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">计划发布时间</label>
          <Input
            type="datetime-local"
            value={version.scheduledDate}
            onChange={(e) => updatePublishVersion(version.id, { scheduledDate: e.target.value })}
            inputSize="sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">标题</label>
        <Input
          value={version.title}
          onChange={(e) => updatePublishVersion(version.id, { title: e.target.value })}
          inputSize="sm"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">简介</label>
        <Textarea
          value={version.description}
          onChange={(e) => updatePublishVersion(version.id, { description: e.target.value })}
          rows={4}
          placeholder="吸引人的节目简介..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Shownotes</label>
        <Textarea
          value={version.shownotes}
          onChange={(e) => updatePublishVersion(version.id, { shownotes: e.target.value })}
          rows={4}
          placeholder="详细的时间节点和参考链接..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">标签（用逗号分隔）</label>
        <Input
          value={version.tags.join(', ')}
          onChange={(e) => updatePublishVersion(version.id, {
            tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
          })}
          placeholder="AI, 创作, 科技"
          inputSize="sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">备注</label>
        <Textarea
          value={version.notes}
          onChange={(e) => updatePublishVersion(version.id, { notes: e.target.value })}
          rows={2}
          placeholder="平台特定要求、注意事项..."
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setEditingId(null)}
        >
          完成编辑
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="h-full flex flex-col overflow-hidden animate-fade-in" style={{ animationDelay: '400ms' }}>
      <CardContent className="flex-1 overflow-y-auto min-h-0 p-4">
        <TopicHeader moduleIcon="🚀" moduleName="发布交付" />

        {!hasActiveTopic ? (
          <div className="flex flex-col items-center justify-center h-[60%] text-slate-500">
            <p className="text-sm">请先选择一个选题</p>
            <p className="text-xs mt-1">在上方下拉框中选择或前往选题板创建</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-300">平台版本</h4>
              <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
                <Plus size={14} className="mr-1" />
                添加发布版本
              </Button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddVersion} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30 animate-slide-down">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">平台</label>
                      <select
                        value={newPlatform}
                        onChange={(e) => handlePlatformChange(e.target.value as PublishPlatform)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      >
                        {PUBLISH_PLATFORMS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.icon} {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {newPlatform === 'custom' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">平台名称</label>
                        <Input
                          value={newPlatformName}
                          onChange={(e) => setNewPlatformName(e.target.value)}
                          placeholder="输入平台名称"
                          inputSize="sm"
                        />
                      </div>
                    )}
                    {newPlatform !== 'custom' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">计划发布时间</label>
                        <Input
                          type="datetime-local"
                          value={newScheduledDate}
                          onChange={(e) => setNewScheduledDate(e.target.value)}
                          inputSize="sm"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">标题</label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="吸引人的节目标题..."
                      inputSize="sm"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">简介</label>
                    <Textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={3}
                      placeholder="节目简介，吸引听众点击..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Shownotes</label>
                    <Textarea
                      value={newShownotes}
                      onChange={(e) => setNewShownotes(e.target.value)}
                      rows={3}
                      placeholder="时间节点、参考链接等详细信息..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">标签（用逗号分隔）</label>
                      <Input
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
                        placeholder="AI, 创作, 科技"
                        inputSize="sm"
                      />
                    </div>
                    {newPlatform !== 'custom' && (
                      <div className="flex items-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setNewScheduledDate(new Date().toISOString().slice(0, 16))}
                          className="w-full"
                        >
                          <Calendar size={14} className="mr-1" />
                          设为现在
                        </Button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">备注</label>
                    <Textarea
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      rows={2}
                      placeholder="平台特定要求、注意事项..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewPlatform('xiaoyuzhou');
                        setNewPlatformName('小宇宙');
                        setNewTitle('');
                        setNewDescription('');
                        setNewShownotes('');
                        setNewTags('');
                        setNewScheduledDate('');
                        setNewNotes('');
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newTitle.trim()}
                    >
                      保存版本
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {versions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Globe size={32} className="mb-2 opacity-50" />
                <p className="text-sm">暂无发布版本</p>
                <p className="text-xs mt-1">点击上方按钮为不同平台创建发布版本</p>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => {
                  const isExpanded = expandedId === version.id;
                  const isEditing = editingId === version.id;

                  return (
                    <div
                      key={version.id}
                      className={cn(
                        'rounded-xl border transition-all duration-200 overflow-hidden',
                        isExpanded
                          ? 'bg-slate-700/30 border-slate-600/50'
                          : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                      )}
                    >
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : version.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
                            getPlatformColor(version.platform)
                          )}>
                            {getPlatformIcon(version.platform)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-200">
                              {version.platformName}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {version.scheduledDate
                                ? `计划发布: ${new Date(version.scheduledDate).toLocaleString('zh-CN')}`
                                : '未设置发布时间'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyContent(version);
                            }}
                            title="复制内容"
                          >
                            {copiedId === version.id ? (
                              <Check size={14} className="text-emerald-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </Button>
                          {isExpanded ? (
                            <ChevronUp size={18} className="text-slate-400" />
                          ) : (
                            <ChevronDown size={18} className="text-slate-400" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-slate-700/50 pt-3">
                          {isEditing ? (
                            renderEditForm(version)
                          ) : (
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                  <FileText size={12} />
                                  标题
                                </div>
                                <p className="text-sm font-medium text-slate-200">{version.title}</p>
                              </div>

                              <div>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                  <FileText size={12} />
                                  简介
                                </div>
                                <p className="text-sm text-slate-300 whitespace-pre-wrap">{version.description}</p>
                              </div>

                              {version.shownotes && (
                                <div>
                                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                    <FileText size={12} />
                                    Shownotes
                                  </div>
                                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{version.shownotes}</p>
                                </div>
                              )}

                              {version.tags.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                    <Tag size={12} />
                                    标签
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {version.tags.map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {version.notes && (
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                    <FileText size={12} />
                                    备注
                                  </div>
                                  <p className="text-sm text-slate-400 whitespace-pre-wrap">{version.notes}</p>
                                </div>
                              )}

                              <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                                <span className="text-xs text-slate-600">
                                  最后更新: {new Date(version.updatedAt).toLocaleString('zh-CN')}
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('确定要删除这个发布版本吗？')) {
                                        deletePublishVersion(version.id);
                                        if (expandedId === version.id) {
                                          setExpandedId(null);
                                        }
                                      }
                                    }}
                                  >
                                    <Trash2 size={14} className="mr-1" />
                                    删除
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingId(isEditing ? null : version.id);
                                    }}
                                  >
                                    <Edit3 size={14} className="mr-1" />
                                    编辑
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
