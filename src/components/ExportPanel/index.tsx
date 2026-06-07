import { useState, useMemo, useEffect } from 'react';
import { FileText, Users, Share2, Copy, Check, Download, ChevronDown, ChevronUp, Plus, Trash2, Save, Edit3, X, Layout, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TopicHeader } from '../TopicHeader';
import { usePodcastStore } from '@/store/usePodcastStore';
import { copyToClipboard } from '@/utils/export';
import type { ExportType, ExportOptions } from '@/types';
import { EXPORT_TYPES, TEMPLATE_PRESETS } from '@/types';
import { cn } from '@/lib/utils';

const defaultOptions: ExportOptions = {
  includeScript: true,
  includeTimeline: true,
  includeMaterials: true,
  includeUnconfirmed: false,
  includeTimelineMarkers: true,
  includeChecklist: false,
};

export function ExportPanel() {
  const getActiveTopic = usePodcastStore((state) => state.getActiveTopic);
  const scriptBlocks = usePodcastStore((state) => state.scriptBlocks);
  const timelineItems = usePodcastStore((state) => state.timelineItems);
  const materials = usePodcastStore((state) => state.materials);
  const checklistItems = usePodcastStore((state) => state.checklistItems);
  const exportTemplates = usePodcastStore((state) => state.exportTemplates);
  const activeTopicId = usePodcastStore((state) => state.activeTopicId);
  const exportRecordingOutline = usePodcastStore((state) => state.exportRecordingOutline);
  const exportGuestQuestions = usePodcastStore((state) => state.exportGuestQuestions);
  const exportPublishDescription = usePodcastStore((state) => state.exportPublishDescription);
  const addExportTemplate = usePodcastStore((state) => state.addExportTemplate);
  const updateExportTemplate = usePodcastStore((state) => state.updateExportTemplate);
  const deleteExportTemplate = usePodcastStore((state) => state.deleteExportTemplate);
  const applyExportTemplate = usePodcastStore((state) => state.applyExportTemplate);

  const activeTopic = getActiveTopic();

  const [activeExport, setActiveExport] = useState<ExportType | null>(null);
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [options, setOptions] = useState<ExportOptions>(defaultOptions);
  const [titleFormat, setTitleFormat] = useState('');
  const [footerText, setFooterText] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editTemplateName, setEditTemplateName] = useState('');
  const [editTemplateDesc, setEditTemplateDesc] = useState('');
  const [activeTab, setActiveTab] = useState<'export' | 'templates'>('export');

  const hasActiveTopic = !!activeTopic;

  const topicTemplates = useMemo(() => {
    if (!activeTopicId) return [];
    return exportTemplates.filter((t) => t.topicId === activeTopicId);
  }, [exportTemplates, activeTopicId]);

  useEffect(() => {
    if (activeTopicId) {
      setSelectedTemplateId(null);
    }
  }, [activeTopicId]);

  const exportContent = useMemo(() => {
    if (!activeTopic || !activeExport) return '';

    switch (activeExport) {
      case 'outline':
        return exportRecordingOutline(options, titleFormat || undefined, footerText || undefined);
      case 'questions':
        return exportGuestQuestions(options, titleFormat || undefined, footerText || undefined);
      case 'description':
        return exportPublishDescription(options, titleFormat || undefined, footerText || undefined);
      default:
        return '';
    }
  }, [activeTopic, activeExport, options, titleFormat, footerText, exportRecordingOutline, exportGuestQuestions, exportPublishDescription]);

  const handleExport = (type: ExportType) => {
    setActiveExport(type);
    setSelectedTemplateId(null);
    setTitleFormat('');
    setFooterText('');
  };

  const handleApplyTemplate = (templateId: string) => {
    const result = applyExportTemplate(templateId);
    if (result) {
      setOptions(result.options);
      setTitleFormat(result.titleFormat);
      setFooterText(result.footerText);
      setSelectedTemplateId(templateId);
      const template = exportTemplates.find((t) => t.id === templateId);
      if (template) {
        setActiveExport(template.exportType);
      }
    }
  };

  const handleSaveTemplate = () => {
    if (!activeTopicId || !newTemplateName.trim() || !activeExport) return;

    addExportTemplate({
      topicId: activeTopicId,
      name: newTemplateName.trim(),
      description: newTemplateDesc.trim(),
      exportType: activeExport,
      options,
      titleFormat,
      footerText,
    });

    setNewTemplateName('');
    setNewTemplateDesc('');
    setShowSaveTemplate(false);
  };

  const handleApplyPreset = (preset: typeof TEMPLATE_PRESETS[0]) => {
    if (!activeExport) return;
    setOptions({ ...defaultOptions, ...preset.options });
    setTitleFormat(preset.exportType === 'outline' ? '📻 录制提纲 - {title}' : preset.exportType === 'questions' ? '❓ 嘉宾问题单 - {title}' : '🎙️ {title}');
    setFooterText('');
    setSelectedTemplateId(null);
  };

  const handleStartEditTemplate = (template: typeof exportTemplates[0]) => {
    setEditingTemplateId(template.id);
    setEditTemplateName(template.name);
    setEditTemplateDesc(template.description);
  };

  const handleSaveEditTemplate = () => {
    if (!editingTemplateId || !editTemplateName.trim()) return;
    updateExportTemplate(editingTemplateId, {
      name: editTemplateName.trim(),
      description: editTemplateDesc.trim(),
    });
    setEditingTemplateId(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    deleteExportTemplate(templateId);
    if (selectedTemplateId === templateId) {
      setSelectedTemplateId(null);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(exportContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = activeExport === 'outline' ? '录制提纲' : activeExport === 'questions' ? '嘉宾问题单' : '发布简介';
    a.download = `${activeTopic?.title || '播客'}_${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleOption = (key: keyof ExportOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    setSelectedTemplateId(null);
  };

  const exportButtons = [
    {
      type: 'outline' as ExportType,
      icon: <FileText size={18} />,
      label: '录制提纲',
      description: '完整的时间轴和脚本',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      type: 'questions' as ExportType,
      icon: <Users size={18} />,
      label: '嘉宾问题单',
      description: '访谈问题清单',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      type: 'description' as ExportType,
      icon: <Share2 size={18} />,
      label: '发布简介',
      description: '节目介绍文案',
      color: 'from-amber-500 to-amber-600',
    },
  ];

  const optionItems = [
    { key: 'includeTimeline' as const, label: '包含时间轴', description: '显示各时段的时间安排' },
    { key: 'includeScript' as const, label: '包含脚本内容', description: '显示脚本段落详情' },
    { key: 'includeMaterials' as const, label: '包含素材引用', description: '显示链接和引用来源' },
    { key: 'includeUnconfirmed' as const, label: '包含待确认事项', description: '显示未确认的待办和素材' },
    { key: 'includeTimelineMarkers' as const, label: '包含时间轴标记', description: '显示负责人、备注、音乐/口播标记' },
    { key: 'includeChecklist' as const, label: '包含检查清单', description: '显示准备检查清单内容' },
    { key: 'includeRehearsalNotes' as const, label: '包含排练记录', description: '显示最近一次排练记录和问题' },
  ];

  return (
    <Card className="h-full flex flex-col overflow-hidden animate-fade-in" style={{ animationDelay: '400ms' }}>
      <CardContent className="flex-1 overflow-y-auto min-h-0 p-4">
        <TopicHeader moduleIcon="📤" moduleName="导出区" />

        {!hasActiveTopic ? (
          <div className="flex flex-col items-center justify-center h-[60%] text-slate-500">
            <p className="text-sm">请先选择一个选题</p>
            <p className="text-xs mt-1">在上方下拉框中选择或前往选题板创建</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                size="sm"
                variant={activeTab === 'export' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('export')}
                className="flex-1"
              >
                <FileText size={14} className="mr-1" />
                文档导出
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'templates' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('templates')}
                className="flex-1"
              >
                <Layout size={14} className="mr-1" />
                模板管理
              </Button>
            </div>

            {activeTab === 'export' && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {exportButtons.map((btn) => (
                    <button
                      key={btn.type}
                      onClick={() => handleExport(btn.type)}
                      className={cn(
                        'relative overflow-hidden rounded-xl p-4 border transition-all duration-300 group text-left',
                        activeExport === btn.type
                          ? 'border-amber-500/50 bg-slate-700/50'
                          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                      )}
                    >
                      <div className={cn(
                        'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br',
                        btn.color
                      )} />
                      <div className="relative z-10">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center mb-2 bg-gradient-to-br',
                          btn.color,
                          'text-white'
                        )}>
                          {btn.icon}
                        </div>
                        <h4 className="font-medium text-slate-100 text-sm mb-1">{btn.label}</h4>
                        <p className="text-xs text-slate-500">{btn.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {activeExport && (
                  <>
                    {topicTemplates.length > 0 && (
                      <div className="mt-4 bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
                        <button
                          onClick={() => setShowTemplates(!showTemplates)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/20 transition-colors"
                        >
                          <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Layout size={16} />
                            快速应用模板
                          </span>
                          {showTemplates ? (
                            <ChevronUp size={16} className="text-slate-400" />
                          ) : (
                            <ChevronDown size={16} className="text-slate-400" />
                          )}
                        </button>
                        {showTemplates && (
                          <div className="px-4 pb-4 space-y-2">
                            {topicTemplates.map((template) => (
                              <button
                                key={template.id}
                                onClick={() => handleApplyTemplate(template.id)}
                                className={cn(
                                  'w-full text-left p-3 rounded-lg transition-all duration-200 border',
                                  selectedTemplateId === template.id
                                    ? 'bg-amber-500/10 border-amber-500/30'
                                    : 'bg-slate-700/30 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600'
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium text-slate-200">{template.name}</div>
                                    {template.description && (
                                      <div className="text-xs text-slate-500 mt-0.5">{template.description}</div>
                                    )}
                                  </div>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-600/50 text-slate-400">
                                    {EXPORT_TYPES.find(t => t.value === template.exportType)?.label}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
                      <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/20 transition-colors"
                      >
                        <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                          <Settings size={16} />
                          导出选项
                          {selectedTemplateId && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                              使用模板
                            </span>
                          )}
                        </span>
                        {showOptions ? (
                          <ChevronUp size={16} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-400" />
                        )}
                      </button>
                      {showOptions && (
                        <div className="px-4 pb-4 space-y-3">
                          <div className="space-y-2">
                            {optionItems.map((item) => (
                              <label
                                key={item.key}
                                className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-700/20 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={options[item.key]}
                                  onChange={() => toggleOption(item.key)}
                                  className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                                />
                                <div>
                                  <div className="text-sm text-slate-200">{item.label}</div>
                                  <div className="text-xs text-slate-500">{item.description}</div>
                                </div>
                              </label>
                            ))}
                          </div>

                          <div className="border-t border-slate-700/50 pt-3 space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">
                                标题格式 <span className="text-slate-600">（使用 {'{title}'} 作为占位符）</span>
                              </label>
                              <Input
                                value={titleFormat}
                                onChange={(e) => {
                                  setTitleFormat(e.target.value);
                                  setSelectedTemplateId(null);
                                }}
                                placeholder="例如：📻 录制提纲 - {title}"
                                inputSize="sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">
                                结尾文本
                              </label>
                              <Input
                                value={footerText}
                                onChange={(e) => {
                                  setFooterText(e.target.value);
                                  setSelectedTemplateId(null);
                                }}
                                placeholder="例如：--- 由播客规划工具生成 ---"
                                inputSize="sm"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex gap-2">
                              {TEMPLATE_PRESETS.map((preset, idx) => (
                                <Button
                                  key={idx}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleApplyPreset(preset)}
                                  className="text-xs"
                                >
                                  {preset.name}
                                </Button>
                              ))}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => setShowSaveTemplate(true)}
                              className="text-xs"
                            >
                              <Save size={14} className="mr-1" />
                              保存为模板
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {showSaveTemplate && (
                      <div className="mt-4 bg-slate-700/30 rounded-xl border border-slate-600/30 p-4 animate-slide-down">
                        <div className="space-y-3">
                          <Input
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            placeholder="模板名称，如：访谈版、商业合作版"
                            inputSize="sm"
                            autoFocus
                          />
                          <Input
                            value={newTemplateDesc}
                            onChange={(e) => setNewTemplateDesc(e.target.value)}
                            placeholder="模板说明（可选）"
                            inputSize="sm"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setShowSaveTemplate(false);
                                setNewTemplateName('');
                                setNewTemplateDesc('');
                              }}
                            >
                              取消
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveTemplate}
                              disabled={!newTemplateName.trim()}
                            >
                              保存模板
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden animate-slide-up">
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                        <span className="text-sm font-medium text-slate-200">
                          {exportButtons.find(b => b.type === activeExport)?.label} 预览
                          <span className="ml-2 text-xs text-slate-500">
                            ({exportContent.length} 字符)
                          </span>
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={handleDownload}>
                            <Download size={14} />
                            下载
                          </Button>
                          <Button size="sm" onClick={handleCopy}>
                            {copied ? (
                              <>
                                <Check size={14} className="text-emerald-400" />
                                已复制
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                复制
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 max-h-[300px] overflow-y-auto">
                        <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                          {exportContent || '请选择要包含的内容...'}
                        </pre>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-300">导出模板</h4>
                  <span className="text-xs text-slate-500">
                    共 {topicTemplates.length} 个模板
                  </span>
                </div>

                {topicTemplates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <Layout size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">暂无自定义模板</p>
                    <p className="text-xs mt-1">在「文档导出」中配置选项后保存为模板</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topicTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={cn(
                          'rounded-lg border p-4 transition-all duration-200',
                          editingTemplateId === template.id
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                        )}
                      >
                        {editingTemplateId === template.id ? (
                          <div className="space-y-3">
                            <Input
                              value={editTemplateName}
                              onChange={(e) => setEditTemplateName(e.target.value)}
                              inputSize="sm"
                              autoFocus
                            />
                            <Input
                              value={editTemplateDesc}
                              onChange={(e) => setEditTemplateDesc(e.target.value)}
                              placeholder="模板说明"
                              inputSize="sm"
                            />
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setEditingTemplateId(null)}>
                                <X size={14} className="mr-1" />
                                取消
                              </Button>
                              <Button size="sm" onClick={handleSaveEditTemplate}>
                                <Check size={14} className="mr-1" />
                                保存
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-200">{template.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400">
                                  {EXPORT_TYPES.find(t => t.value === template.exportType)?.label}
                                </span>
                              </div>
                              {template.description && (
                                <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {template.options.includeTimeline && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">时间轴</span>}
                                {template.options.includeScript && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">脚本</span>}
                                {template.options.includeMaterials && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">素材</span>}
                                {template.options.includeChecklist && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">检查清单</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => handleApplyTemplate(template.id)}
                                title="应用模板"
                              >
                                <Check size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => handleStartEditTemplate(template)}
                                title="编辑模板"
                              >
                                <Edit3 size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                onClick={() => handleDeleteTemplate(template.id)}
                                title="删除模板"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
