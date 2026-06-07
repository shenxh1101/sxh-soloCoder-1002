import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit3, Check, X, Calendar, Tag, FileText, Globe, ChevronDown, ChevronUp, Copy, Image, Megaphone, Mic2, ListChecks } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { TopicHeader } from '../TopicHeader';
import { usePodcastStore } from '@/store/usePodcastStore';
import { copyToClipboard } from '@/utils/export';
import type { PublishPlatform, PrePublishCheckItem } from '@/types';
import { PUBLISH_PLATFORMS, PRE_PUBLISH_CHECK_ITEMS } from '@/types';
import { cn } from '@/lib/utils';

type EditTabType = 'basic' | 'promo' | 'checklist';

const getInitialPrePublishChecklist = () =>
  PRE_PUBLISH_CHECK_ITEMS.map((item) => ({
    item: item.value as PrePublishCheckItem,
    checked: false,
  }));

export function PublishVersions() {
  const activeTopicId = usePodcastStore((state) => state.activeTopicId);
  const getPublishVersionsForTopic = usePodcastStore((state) => state.getPublishVersionsForTopic);
  const addPublishVersion = usePodcastStore((state) => state.addPublishVersion);
  const updatePublishVersion = usePodcastStore((state) => state.updatePublishVersion);
  const deletePublishVersion = usePodcastStore((state) => state.deletePublishVersion);
  const copyPublishVersion = usePodcastStore((state) => state.copyPublishVersion);
  const togglePrePublishCheck = usePodcastStore((state) => state.togglePrePublishCheck);

  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTab, setEditTab] = useState<EditTabType>('basic');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyDialogId, setCopyDialogId] = useState<string | null>(null);

  const [newPlatform, setNewPlatform] = useState<PublishPlatform>('xiaoyuzhou');
  const [newPlatformName, setNewPlatformName] = useState('小宇宙');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newShownotes, setNewShownotes] = useState('');
  const [newCoverText, setNewCoverText] = useState('');
  const [newSocialPost, setNewSocialPost] = useState('');
  const [newPromoLine, setNewPromoLine] = useState('');
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
      coverText: newCoverText.trim(),
      socialPost: newSocialPost.trim(),
      promoLine: newPromoLine.trim(),
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      scheduledDate: newScheduledDate,
      prePublishChecklist: getInitialPrePublishChecklist(),
      notes: newNotes.trim(),
    });

    setNewPlatform('xiaoyuzhou');
    setNewPlatformName('小宇宙');
    setNewTitle('');
    setNewDescription('');
    setNewShownotes('');
    setNewCoverText('');
    setNewSocialPost('');
    setNewPromoLine('');
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

  const handleCopyVersion = (sourceId: string, targetPlatform: PublishPlatform) => {
    copyPublishVersion(sourceId, targetPlatform);
    setCopyDialogId(null);
  };

  const getPlatformIcon = (platform: string) => {
    return PUBLISH_PLATFORMS.find((p) => p.value === platform)?.icon || '🌐';
  };

  const getPlatformColor = (platform: string) => {
    return PUBLISH_PLATFORMS.find((p) => p.value === platform)?.color || 'bg-slate-500';
  };

  const getChecklistProgress = (checklist: { item: PrePublishCheckItem; checked: boolean }[]) => {
    const checked = checklist.filter((c) => c.checked).length;
    return { checked, total: checklist.length, percent: checklist.length > 0 ? (checked / checklist.length) * 100 : 0 };
  };

  const handleCopyContent = async (version: typeof versions[0]) => {
    const lines = [];
    lines.push(version.title);
    if (version.coverText) lines.push('\n【封面文案】\n' + version.coverText);
    lines.push('\n【节目简介】\n' + version.description);
    if (version.shownotes) lines.push('\n【Shownotes】\n' + version.shownotes);
    if (version.promoLine) lines.push('\n【口播推广语】\n' + version.promoLine);
    if (version.socialPost) lines.push('\n【社媒短帖】\n' + version.socialPost);
    if (version.tags.length > 0) lines.push('\n【标签】\n' + version.tags.map((t) => '#' + t).join(' '));
    if (version.notes) lines.push('\n【备注】\n' + version.notes);

    const success = await copyToClipboard(lines.join('\n'));
    if (success) {
      setCopiedId(version.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const resetAddForm = () => {
    setShowAddForm(false);
    setNewPlatform('xiaoyuzhou');
    setNewPlatformName('小宇宙');
    setNewTitle('');
    setNewDescription('');
    setNewShownotes('');
    setNewCoverText('');
    setNewSocialPost('');
    setNewPromoLine('');
    setNewTags('');
    setNewScheduledDate('');
    setNewNotes('');
  };

  const renderEditForm = (version: typeof versions[0]) => {
    const tabs: { id: EditTabType; label: string; icon: React.ReactNode }[] = [
      { id: 'basic', label: '基本信息', icon: <FileText size={14} /> },
      { id: 'promo', label: '推广素材', icon: <Megaphone size={14} /> },
      { id: 'checklist', label: '发布检查', icon: <ListChecks size={14} /> },
    ];

    return (
      <div className="space-y-3 animate-slide-down">
        <div className="flex gap-2 border-b border-slate-700/50 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setEditTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                editTab === tab.id
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {editTab === 'basic' && (
          <div className="space-y-3">
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
          </div>
        )}

        {editTab === 'promo' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Image size={12} />
                  封面文案
                </span>
              </label>
              <Textarea
                value={version.coverText}
                onChange={(e) => updatePublishVersion(version.id, { coverText: e.target.value })}
                rows={2}
                placeholder="封面图上的宣传文案，简短有力..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Mic2 size={12} />
                  口播推广语
                </span>
              </label>
              <Textarea
                value={version.promoLine}
                onChange={(e) => updatePublishVersion(version.id, { promoLine: e.target.value })}
                rows={2}
                placeholder="节目中主播口播的推广内容..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Megaphone size={12} />
                  社媒短帖
                </span>
              </label>
              <Textarea
                value={version.socialPost}
                onChange={(e) => updatePublishVersion(version.id, { socialPost: e.target.value })}
                rows={4}
                placeholder="适合微博、小红书等平台的推广文案..."
              />
            </div>
          </div>
        )}

        {editTab === 'checklist' && (
          <div className="space-y-2">
            {PRE_PUBLISH_CHECK_ITEMS.map((checkItem) => {
              const status = version.prePublishChecklist.find((c) => c.item === checkItem.value);
              return (
                <label
                  key={checkItem.value}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/30 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={status?.checked || false}
                    onChange={() => togglePrePublishCheck(version.id, checkItem.value)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                  />
                  <div>
                    <div className="text-sm text-slate-200">{checkItem.label}</div>
                    <div className="text-xs text-slate-500">{checkItem.description}</div>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/50">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingId(null);
              setEditTab('basic');
            }}
          >
            完成编辑
          </Button>
        </div>
      </div>
    );
  };

  const renderCopyDialog = (sourceVersion: typeof versions[0]) => {
    const usedPlatforms = versions.map((v) => v.platform);
    const availablePlatforms = PUBLISH_PLATFORMS.filter((p) => !usedPlatforms.includes(p.value));

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setCopyDialogId(null)}>
        <div className="bg-slate-800 rounded-xl p-4 w-80 border border-slate-700" onClick={(e) => e.stopPropagation()}>
          <h4 className="text-sm font-medium text-slate-200 mb-3">复制到其他平台</h4>
          <p className="text-xs text-slate-400 mb-3">
            从「{sourceVersion.platformName}」复制内容到：
          </p>
          {availablePlatforms.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">所有平台都已有版本</p>
          ) : (
            <div className="space-y-2">
              {availablePlatforms.map((platform) => (
                <button
                  key={platform.value}
                  onClick={() => handleCopyVersion(sourceVersion.id, platform.value)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/50 text-left text-sm text-slate-300 transition-colors"
                >
                  <span className={cn('w-8 h-8 rounded flex items-center justify-center', platform.color)}>
                    {platform.icon}
                  </span>
                  {platform.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button size="sm" variant="ghost" onClick={() => setCopyDialogId(null)}>
              取消
            </Button>
          </div>
        </div>
      </div>
    );
  };

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
                      rows={2}
                      placeholder="节目简介，吸引听众点击..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        <span className="flex items-center gap-1">
                          <Image size={10} />
                          封面文案
                        </span>
                      </label>
                      <Input
                        value={newCoverText}
                        onChange={(e) => setNewCoverText(e.target.value)}
                        placeholder="封面宣传语..."
                        inputSize="sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        <span className="flex items-center gap-1">
                          <Mic2 size={10} />
                          口播推广语
                        </span>
                      </label>
                      <Input
                        value={newPromoLine}
                        onChange={(e) => setNewPromoLine(e.target.value)}
                        placeholder="主播口播推广..."
                        inputSize="sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Megaphone size={10} />
                        社媒短帖
                      </span>
                    </label>
                    <Textarea
                      value={newSocialPost}
                      onChange={(e) => setNewSocialPost(e.target.value)}
                      rows={2}
                      placeholder="社交媒体推广文案..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Shownotes</label>
                    <Textarea
                      value={newShownotes}
                      onChange={(e) => setNewShownotes(e.target.value)}
                      rows={2}
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
                      onClick={resetAddForm}
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
                  const progress = getChecklistProgress(version.prePublishChecklist);

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
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-200">
                                {version.platformName}
                              </span>
                              {progress.total > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-amber-500 transition-all duration-300"
                                      style={{ width: `${progress.percent}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-slate-400">
                                    {progress.checked}/{progress.total}
                                  </span>
                                </div>
                              )}
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
                              setCopyDialogId(version.id);
                            }}
                            title="复制到其他平台"
                          >
                            <Copy size={14} />
                          </Button>
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
                              <FileText size={14} />
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

                              {version.coverText && (
                                <div>
                                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                    <Image size={12} />
                                    封面文案
                                  </div>
                                  <p className="text-sm text-slate-300">{version.coverText}</p>
                                </div>
                              )}

                              {version.promoLine && (
                                <div>
                                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                    <Mic2 size={12} />
                                    口播推广语
                                  </div>
                                  <p className="text-sm text-amber-400/90 italic">"{version.promoLine}"</p>
                                </div>
                              )}

                              {version.socialPost && (
                                <div>
                                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                    <Megaphone size={12} />
                                    社媒短帖
                                  </div>
                                  <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{version.socialPost}</p>
                                  </div>
                                </div>
                              )}

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

                              {progress.total > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                                    <ListChecks size={12} />
                                    发布前检查
                                    <span className="text-emerald-400">
                                      {progress.checked}/{progress.total} 已完成
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1">
                                    {version.prePublishChecklist.map((check) => {
                                      const itemInfo = PRE_PUBLISH_CHECK_ITEMS.find((i) => i.value === check.item);
                                      return (
                                        <div
                                          key={check.item}
                                          className={cn(
                                            'flex items-center gap-2 text-xs p-1.5 rounded',
                                            check.checked ? 'text-emerald-400' : 'text-slate-500'
                                          )}
                                        >
                                          {check.checked ? <Check size={12} /> : <div className="w-3 h-3 border border-current rounded" />}
                                          {itemInfo?.label}
                                        </div>
                                      );
                                    })}
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
                                      setEditTab('basic');
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

        {copyDialogId && versions.find((v) => v.id === copyDialogId) &&
          renderCopyDialog(versions.find((v) => v.id === copyDialogId)!)}
      </CardContent>
    </Card>
  );
}
