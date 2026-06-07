import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit3, Check, X, Calendar, Users, Clock, AlertCircle, FileText, ChevronDown, ChevronUp, User, Tag } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { TopicHeader } from '../TopicHeader';
import { usePodcastStore } from '@/store/usePodcastStore';
import type { RehearsalIssue, RehearsalIssueType, RehearsalResolution, TimelineItem } from '@/types';
import { REHEARSAL_ISSUE_TYPES, REHEARSAL_RESOLUTIONS } from '@/types';
import { cn } from '@/lib/utils';

interface IssueFormData {
  type: RehearsalIssueType;
  timelineItemId?: string;
  timelineItemTitle?: string;
  timePoint?: number;
  description: string;
  assignee?: string;
  resolution?: RehearsalResolution;
  resolutionNotes?: string;
  resolved: boolean;
}

interface QuickAddIssueForm {
  show: boolean;
  recordId: string | null;
  isEditing: boolean;
  issueId?: string;
  data: IssueFormData;
}

export function RehearsalRecords() {
  const activeTopicId = usePodcastStore((state) => state.activeTopicId);
  const timelineItems = usePodcastStore((state) => state.timelineItems);
  const getRehearsalRecordsForTopic = usePodcastStore((state) => state.getRehearsalRecordsForTopic);
  const addRehearsalRecord = usePodcastStore((state) => state.addRehearsalRecord);
  const updateRehearsalRecord = usePodcastStore((state) => state.updateRehearsalRecord);
  const deleteRehearsalRecord = usePodcastStore((state) => state.deleteRehearsalRecord);
  const addRehearsalIssue = usePodcastStore((state) => state.addRehearsalIssue);
  const updateRehearsalIssue = usePodcastStore((state) => state.updateRehearsalIssue);
  const toggleRehearsalIssueResolved = usePodcastStore((state) => state.toggleRehearsalIssueResolved);

  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newParticipants, setNewParticipants] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const [quickAddIssue, setQuickAddIssue] = useState<QuickAddIssueForm>({
    show: false,
    recordId: null,
    isEditing: false,
    data: {
      type: 'content',
      description: '',
      resolved: false,
    },
  });

  const hasActiveTopic = !!activeTopicId;

  const records = useMemo(() => {
    if (!activeTopicId) return [];
    return getRehearsalRecordsForTopic(activeTopicId);
  }, [activeTopicId, getRehearsalRecordsForTopic]);

  const topicTimelineItems = useMemo(() => {
    if (!activeTopicId) return [];
    return timelineItems
      .filter((t) => t.topicId === activeTopicId)
      .sort((a, b) => a.startTime - b.startTime);
  }, [activeTopicId, timelineItems]);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTopicId || !newDate.trim() || !newParticipants.trim() || !newDuration) return;

    const duration = parseFloat(newDuration);
    if (isNaN(duration) || duration <= 0) return;

    addRehearsalRecord({
      topicId: activeTopicId,
      date: newDate,
      participants: newParticipants.trim(),
      actualDuration: duration,
      issues: [],
      notes: newNotes.trim(),
    });

    setNewDate(new Date().toISOString().split('T')[0]);
    setNewParticipants('');
    setNewDuration('');
    setNewNotes('');
    setShowAddForm(false);
  };

  const handleOpenAddIssue = (recordId: string, prefillData?: Partial<IssueFormData>) => {
    setQuickAddIssue({
      show: true,
      recordId,
      isEditing: false,
      data: {
        type: 'content',
        description: '',
        resolved: false,
        ...prefillData,
      },
    });
    setExpandedRecordId(recordId);
  };

  const handleOpenEditIssue = (recordId: string, issue: RehearsalIssue) => {
    setQuickAddIssue({
      show: true,
      recordId,
      isEditing: true,
      issueId: issue.id,
      data: {
        type: issue.type,
        timelineItemId: issue.timelineItemId,
        timelineItemTitle: issue.timelineItemTitle,
        timePoint: issue.timePoint,
        description: issue.description,
        assignee: issue.assignee,
        resolution: issue.resolution,
        resolutionNotes: issue.resolutionNotes,
        resolved: issue.resolved,
      },
    });
  };

  const handleCloseIssueForm = () => {
    setQuickAddIssue({
      show: false,
      recordId: null,
      isEditing: false,
      data: {
        type: 'content',
        description: '',
        resolved: false,
      },
    });
  };

  const handleIssueFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddIssue.recordId || !quickAddIssue.data.description.trim()) return;

    if (quickAddIssue.isEditing && quickAddIssue.issueId) {
      updateRehearsalIssue(quickAddIssue.recordId, quickAddIssue.issueId, {
        ...quickAddIssue.data,
      });
    } else {
      addRehearsalIssue(quickAddIssue.recordId, {
        ...quickAddIssue.data,
      });
    }

    handleCloseIssueForm();
  };

  const handleAddIssueFromTimeline = (timelineItem: TimelineItem) => {
    if (records.length === 0) {
      alert('请先创建一条排练记录');
      return;
    }

    const latestRecord = records[0];
    handleOpenAddIssue(latestRecord.id, {
      timelineItemId: timelineItem.id,
      timelineItemTitle: timelineItem.title,
      timePoint: timelineItem.startTime * 60,
    });
  };

  const formatDuration = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimePoint = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIssueTypeIcon = (type: string) => {
    return REHEARSAL_ISSUE_TYPES.find((t) => t.value === type)?.icon || '❓';
  };

  const getIssueTypeLabel = (type: string) => {
    return REHEARSAL_ISSUE_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getIssueTypeColor = (type: string) => {
    return REHEARSAL_ISSUE_TYPES.find((t) => t.value === type)?.color || 'bg-slate-500';
  };

  const getResolutionLabel = (resolution?: string) => {
    return REHEARSAL_RESOLUTIONS.find((r) => r.value === resolution)?.label || '';
  };

  const getResolutionIcon = (resolution?: string) => {
    return REHEARSAL_RESOLUTIONS.find((r) => r.value === resolution)?.icon || '';
  };

  const handleTimelineSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const timelineItemId = e.target.value;
    if (!timelineItemId) {
      setQuickAddIssue((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          timelineItemId: undefined,
          timelineItemTitle: undefined,
        },
      }));
      return;
    }
    const item = topicTimelineItems.find((t) => t.id === timelineItemId);
    if (item) {
      setQuickAddIssue((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          timelineItemId: item.id,
          timelineItemTitle: item.title,
          timePoint: prev.data.timePoint ?? item.startTime * 60,
        },
      }));
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden animate-fade-in" style={{ animationDelay: '350ms' }}>
      <CardContent className="flex-1 overflow-y-auto min-h-0 p-4">
        <TopicHeader moduleIcon="🎯" moduleName="排练记录" />

        {!hasActiveTopic ? (
          <div className="flex flex-col items-center justify-center h-[60%] text-slate-500">
            <p className="text-sm">请先选择一个选题</p>
            <p className="text-xs mt-1">在上方下拉框中选择或前往选题板创建</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-300">排练历史</h4>
              <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
                <Plus size={14} className="mr-1" />
                添加排练记录
              </Button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddRecord} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30 animate-slide-down">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">排练日期</label>
                      <Input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        inputSize="sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">实际时长(分钟)</label>
                      <Input
                        type="number"
                        value={newDuration}
                        onChange={(e) => setNewDuration(e.target.value)}
                        placeholder="例如：30"
                        inputSize="sm"
                        step="0.5"
                        min="0.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">参与人</label>
                    <Input
                      value={newParticipants}
                      onChange={(e) => setNewParticipants(e.target.value)}
                      placeholder="主播、嘉宾、音频编辑..."
                      inputSize="sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">改稿备注</label>
                    <Textarea
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="记录本次排练的整体反馈和改进点..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAddForm(false)}
                    >
                      取消
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newDate.trim() || !newParticipants.trim() || !newDuration}
                    >
                      保存记录
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {quickAddIssue.show && (
              <form onSubmit={handleIssueFormSubmit} className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30 animate-slide-down">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-amber-400">
                      <AlertCircle size={16} />
                      <span>{quickAddIssue.isEditing ? '编辑排练问题' : '添加排练问题'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">问题类型</label>
                      <select
                        value={quickAddIssue.data.type}
                        onChange={(e) => setQuickAddIssue((prev) => ({
                          ...prev,
                          data: { ...prev.data, type: e.target.value as RehearsalIssueType },
                        }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      >
                        {REHEARSAL_ISSUE_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.icon} {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">关联时段</label>
                      <select
                        value={quickAddIssue.data.timelineItemId || ''}
                        onChange={handleTimelineSelect}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      >
                        <option value="">-- 不关联 --</option>
                        {topicTimelineItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.title} ({formatDuration(item.startTime)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">卡住时间点(秒)</label>
                      <Input
                        type="number"
                        value={quickAddIssue.data.timePoint ?? ''}
                        onChange={(e) => setQuickAddIssue((prev) => ({
                          ...prev,
                          data: { ...prev.data, timePoint: parseFloat(e.target.value) || undefined },
                        }))}
                        placeholder="例如：125"
                        inputSize="sm"
                        min="0"
                      />
                      {quickAddIssue.data.timePoint !== undefined && (
                        <div className="text-[10px] text-slate-500 mt-1">
                          对应时间: {formatTimePoint(quickAddIssue.data.timePoint)}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">责任人</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <Input
                          value={quickAddIssue.data.assignee || ''}
                          onChange={(e) => setQuickAddIssue((prev) => ({
                            ...prev,
                            data: { ...prev.data, assignee: e.target.value.trim() || undefined },
                          }))}
                          placeholder="负责人姓名"
                          inputSize="sm"
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">问题描述</label>
                    <Textarea
                      value={quickAddIssue.data.description}
                      onChange={(e) => setQuickAddIssue((prev) => ({
                        ...prev,
                        data: { ...prev.data, description: e.target.value },
                      }))}
                      placeholder="描述具体问题..."
                      rows={2}
                      autoFocus
                    />
                  </div>

                  {quickAddIssue.isEditing && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">处理结果</label>
                          <select
                            value={quickAddIssue.data.resolved && quickAddIssue.data.resolution ? quickAddIssue.data.resolution : ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setQuickAddIssue((prev) => ({
                                ...prev,
                                data: {
                                  ...prev.data,
                                  resolution: value as RehearsalResolution || undefined,
                                  resolved: !!value,
                                },
                              }));
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          >
                            <option value="">-- 未解决 --</option>
                            {REHEARSAL_RESOLUTIONS.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.icon} {r.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {quickAddIssue.data.resolved && (
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">处理备注</label>
                          <Textarea
                            value={quickAddIssue.data.resolutionNotes || ''}
                            onChange={(e) => setQuickAddIssue((prev) => ({
                              ...prev,
                              data: { ...prev.data, resolutionNotes: e.target.value.trim() || undefined },
                            }))}
                            placeholder="说明如何处理的..."
                            rows={2}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleCloseIssueForm}
                    >
                      取消
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!quickAddIssue.data.description.trim()}
                    >
                      {quickAddIssue.isEditing ? '保存修改' : '添加问题'}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Calendar size={32} className="mb-2 opacity-50" />
                <p className="text-sm">暂无排练记录</p>
                <p className="text-xs mt-1">点击上方按钮添加第一条排练记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((record, recordIndex) => {
                  const isExpanded = expandedRecordId === record.id;
                  const unresolvedCount = record.issues.filter((i) => !i.resolved).length;

                  return (
                    <div
                      key={record.id}
                      className={cn(
                        'rounded-xl border transition-all duration-200',
                        isExpanded
                          ? 'bg-slate-700/30 border-slate-600/50'
                          : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                      )}
                    >
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-amber-400">
                              {new Date(record.date).getDate()}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(record.date).toLocaleDateString('zh-CN', { month: 'short' })}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-200">
                                第 {records.length - recordIndex} 次排练
                              </span>
                              {unresolvedCount > 0 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">
                                  {unresolvedCount} 个未解决
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Users size={12} />
                                {record.participants}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatDuration(record.actualDuration)}
                              </span>
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
                              handleOpenAddIssue(record.id);
                            }}
                            title="添加问题"
                          >
                            <Plus size={14} />
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
                          {record.notes && (
                            <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                <FileText size={12} />
                                改稿备注
                              </div>
                              <p className="text-sm text-slate-300 whitespace-pre-wrap">{record.notes}</p>
                            </div>
                          )}

                          {record.issues.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-slate-400 mb-2">
                                排练问题 ({record.issues.length})
                              </div>
                              {record.issues.map((issue) => (
                                <div
                                  key={issue.id}
                                  className={cn(
                                    'p-3 rounded-lg border transition-all duration-200 group',
                                    issue.resolved
                                      ? 'bg-emerald-900/20 border-emerald-800/30'
                                      : 'bg-slate-800/50 border-slate-700/50'
                                  )}
                                >
                                  <div className="flex items-start gap-3">
                                    <button
                                      onClick={() => toggleRehearsalIssueResolved(record.id, issue.id)}
                                      className={cn(
                                        'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0',
                                        issue.resolved
                                          ? 'bg-emerald-500 border-emerald-500 text-white'
                                          : 'border-slate-500 hover:border-emerald-400'
                                      )}
                                    >
                                      {issue.resolved && <Check size={12} />}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={cn(
                                          'text-xs px-2 py-0.5 rounded-full flex items-center gap-1',
                                          getIssueTypeColor(issue.type),
                                          'text-white/90'
                                        )}>
                                          {getIssueTypeIcon(issue.type)}
                                          {getIssueTypeLabel(issue.type)}
                                        </span>
                                        {issue.timelineItemTitle && (
                                          <span className="text-xs text-slate-500">
                                            🎬 {issue.timelineItemTitle}
                                            {issue.timePoint !== undefined && (
                                              <span className="ml-1">({formatTimePoint(issue.timePoint)})</span>
                                            )}
                                          </span>
                                        )}
                                        {issue.assignee && (
                                          <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <User size={10} />
                                            {issue.assignee}
                                          </span>
                                        )}
                                        {issue.resolved && issue.resolution && (
                                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                                            {getResolutionIcon(issue.resolution)}
                                            {getResolutionLabel(issue.resolution)}
                                          </span>
                                        )}
                                      </div>
                                      <p className={cn(
                                        'text-sm mt-1',
                                        issue.resolved ? 'text-slate-500 line-through' : 'text-slate-300'
                                      )}>
                                        {issue.description}
                                      </p>
                                      {issue.resolved && issue.resolutionNotes && (
                                        <p className="text-xs text-emerald-400/70 mt-1">
                                          💡 {issue.resolutionNotes}
                                        </p>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleOpenEditIssue(record.id, issue)}
                                      title="编辑问题"
                                    >
                                      <Edit3 size={12} />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {record.issues.length === 0 && (
                            <div className="text-center py-4 text-slate-500 text-sm">
                              暂无问题记录
                            </div>
                          )}

                          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-700/50">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                              onClick={() => {
                                if (confirm('确定要删除这条排练记录吗？')) {
                                  deleteRehearsalRecord(record.id);
                                  if (expandedRecordId === record.id) {
                                    setExpandedRecordId(null);
                                  }
                                }
                              }}
                            >
                              <Trash2 size={14} className="mr-1" />
                              删除记录
                            </Button>
                          </div>
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

export function useRehearsalQuickAdd() {
  const records = usePodcastStore((state) =>
    state.activeTopicId ? state.getRehearsalRecordsForTopic(state.activeTopicId) : []
  );
  const addRehearsalIssue = usePodcastStore((state) => state.addRehearsalIssue);

  const handleAddIssueFromTimeline = (timelineItem: TimelineItem) => {
    if (records.length === 0) {
      alert('请先在「排练记录」中创建一条排练记录');
      return;
    }
    const latestRecord = records[0];
    const description = prompt(`请输入「${timelineItem.title}」的排练问题：`);
    if (!description?.trim()) return;
    addRehearsalIssue(latestRecord.id, {
      type: 'content',
      timelineItemId: timelineItem.id,
      timelineItemTitle: timelineItem.title,
      timePoint: timelineItem.startTime * 60,
      description: description.trim(),
      resolved: false,
    });
  };

  return { handleAddIssueFromTimeline };
}
