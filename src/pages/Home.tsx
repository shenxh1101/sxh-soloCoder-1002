import { useState } from 'react';
import { Radio, LayoutGrid, AlignLeft, Clock, BookOpen, Download, Menu, X } from 'lucide-react';
import { TopicBoard } from '@/components/TopicBoard';
import { ScriptEditor } from '@/components/ScriptEditor';
import { Timeline } from '@/components/Timeline';
import { MaterialList } from '@/components/MaterialList';
import { ExportPanel } from '@/components/ExportPanel';
import { usePodcastStore } from '@/store/usePodcastStore';
import { cn } from '@/lib/utils';

type TabType = 'topics' | 'script' | 'timeline' | 'materials' | 'export';

const tabs = [
  { id: 'topics' as TabType, label: '选题板', icon: <LayoutGrid size={18} /> },
  { id: 'script' as TabType, label: '脚本编辑', icon: <AlignLeft size={18} /> },
  { id: 'timeline' as TabType, label: '时间轴', icon: <Clock size={18} /> },
  { id: 'materials' as TabType, label: '素材清单', icon: <BookOpen size={18} /> },
  { id: 'export' as TabType, label: '导出区', icon: <Download size={18} /> },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('topics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeTopic = usePodcastStore((state) => state.getActiveTopic());

  return (
    <div className="min-h-screen bg-animated">
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Radio size={20} className="text-slate-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-white">
                  播客<span className="text-gradient">规划师</span>
                </h1>
                <p className="text-[10px] text-slate-500">Podcast Planner Studio</p>
              </div>
            </div>

            {activeTopic && (
              <div className="hidden lg:flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm text-slate-300 max-w-[200px] truncate">
                  {activeTopic.title}
                </span>
              </div>
            )}

            <button
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <nav className={cn(
            'lg:hidden overflow-hidden transition-all duration-300',
            mobileMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'
          )}>
            <div className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                    activeTab === tab.id
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  )}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="hidden lg:flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/25'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-slate-700/50'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div className={cn(
            'h-[calc(100vh-180px)]',
            activeTab !== 'topics' && 'hidden lg:block'
          )}>
            {activeTab === 'topics' && <TopicBoard />}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={cn(
              'h-[calc(100vh-180px)]',
              activeTab !== 'script' && 'hidden lg:block'
            )}>
              {activeTab === 'script' && <ScriptEditor />}
            </div>

            <div className={cn(
              'h-[calc(100vh-180px)]',
              activeTab !== 'timeline' && 'hidden lg:block'
            )}>
              {activeTab === 'timeline' && <Timeline />}
            </div>

            <div className={cn(
              'h-[calc(100vh-180px)]',
              activeTab !== 'materials' && 'hidden lg:block'
            )}>
              {activeTab === 'materials' && <MaterialList />}
            </div>

            <div className={cn(
              'h-[calc(100vh-180px)]',
              activeTab !== 'export' && 'hidden lg:block'
            )}>
              {activeTab === 'export' && <ExportPanel />}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/50 mt-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
          <p className="text-center text-xs text-slate-600">
            所有数据保存在本地浏览器中 · 无需登录即可使用
          </p>
        </div>
      </footer>
    </div>
  );
}
