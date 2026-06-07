import { useState } from 'react';
import { FileText, Users, Share2, Copy, Check, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { usePodcastStore } from '@/store/usePodcastStore';
import { copyToClipboard } from '@/utils/export';
import { cn } from '@/lib/utils';

type ExportType = 'outline' | 'questions' | 'description';

export function ExportPanel() {
  const exportRecordingOutline = usePodcastStore((state) => state.exportRecordingOutline);
  const exportGuestQuestions = usePodcastStore((state) => state.exportGuestQuestions);
  const exportPublishDescription = usePodcastStore((state) => state.exportPublishDescription);
  const getActiveTopic = usePodcastStore((state) => state.getActiveTopic);
  const activeTopic = getActiveTopic();

  const [activeExport, setActiveExport] = useState<ExportType | null>(null);
  const [copied, setCopied] = useState(false);
  const [exportContent, setExportContent] = useState('');

  const handleExport = (type: ExportType) => {
    let content = '';
    switch (type) {
      case 'outline':
        content = exportRecordingOutline();
        break;
      case 'questions':
        content = exportGuestQuestions();
        break;
      case 'description':
        content = exportPublishDescription();
        break;
    }
    setActiveExport(type);
    setExportContent(content);
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

  return (
    <Card className="h-full flex flex-col overflow-hidden animate-fade-in" style={{ animationDelay: '400ms' }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📤</span>
          导出区
        </CardTitle>
        {activeTopic && (
          <span className="text-xs text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
            当前: {activeTopic.title}
          </span>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto min-h-0">
        {!activeTopic ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <p className="text-sm">请先在选题板中选择一个选题</p>
            <p className="text-xs mt-1">点击选题卡片进行选择</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {exportButtons.map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => handleExport(btn.type)}
                  className={cn(
                    'relative overflow-hidden rounded-xl p-4 border transition-all duration-300 group',
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
              <div className="mt-4 bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden animate-slide-up">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                  <span className="text-sm font-medium text-slate-200">
                    {exportButtons.find(b => b.type === activeExport)?.label} 预览
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
                    {exportContent}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
