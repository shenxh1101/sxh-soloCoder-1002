import { useState, useMemo } from 'react';
import { FileText, Users, Share2, Copy, Check, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { TopicHeader } from '../TopicHeader';
import { usePodcastStore } from '@/store/usePodcastStore';
import { exportRecordingOutline, exportGuestQuestions, exportPublishDescription } from '@/utils/export';
import { copyToClipboard } from '@/utils/export';
import { cn } from '@/lib/utils';

type ExportType = 'outline' | 'questions' | 'description';

interface ExportOptions {
  includeScript: boolean;
  includeTimeline: boolean;
  includeMaterials: boolean;
  includeUnconfirmed: boolean;
}

const defaultOptions: ExportOptions = {
  includeScript: true,
  includeTimeline: true,
  includeMaterials: true,
  includeUnconfirmed: false,
};

export function ExportPanel() {
  const getActiveTopic = usePodcastStore((state) => state.getActiveTopic);
  const scriptBlocks = usePodcastStore((state) => state.scriptBlocks);
  const timelineItems = usePodcastStore((state) => state.timelineItems);
  const materials = usePodcastStore((state) => state.materials);
  const activeTopic = getActiveTopic();

  const [activeExport, setActiveExport] = useState<ExportType | null>(null);
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [options, setOptions] = useState<ExportOptions>(defaultOptions);

  const exportContent = useMemo(() => {
    if (!activeTopic || !activeExport) return '';

    const topicScriptBlocks = scriptBlocks.filter((b) => b.topicId === activeTopic.id);
    const topicTimelineItems = timelineItems
      .filter((t) => t.topicId === activeTopic.id)
      .sort((a, b) => a.startTime - b.startTime);
    const topicMaterials = materials.filter((m) => m.topicId === activeTopic.id);
    const filteredMaterials = options.includeUnconfirmed
      ? topicMaterials
      : topicMaterials.filter((m) => m.confirmed);

    switch (activeExport) {
      case 'outline':
        return exportRecordingOutline(
          activeTopic,
          options.includeScript ? topicScriptBlocks : [],
          options.includeTimeline ? topicTimelineItems : [],
          options
        );
      case 'questions':
        return exportGuestQuestions(activeTopic, topicScriptBlocks, options);
      case 'description':
        return exportPublishDescription(
          activeTopic,
          options.includeScript ? topicScriptBlocks : [],
          options.includeMaterials ? filteredMaterials : [],
          options
        );
      default:
        return '';
    }
  }, [activeTopic, activeExport, scriptBlocks, timelineItems, materials, options]);

  const handleExport = (type: ExportType) => {
    setActiveExport(type);
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
  ];

  const hasActiveTopic = !!activeTopic;

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
                <div className="mt-4 bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/20 transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <span className="text-lg">⚙️</span>
                      导出选项
                    </span>
                    {showOptions ? (
                      <ChevronUp size={16} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400" />
                    )}
                  </button>
                  {showOptions && (
                    <div className="px-4 pb-4 space-y-2">
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
                  )}
                </div>

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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
