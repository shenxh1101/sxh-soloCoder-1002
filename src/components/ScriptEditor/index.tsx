import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus, Minimize2, Maximize2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ScriptBlock } from './ScriptBlock';
import { TopicHeader } from '../TopicHeader';
import { usePodcastStore } from '@/store/usePodcastStore';
import type { ScriptBlockType } from '@/types';
import { SCRIPT_BLOCK_TYPES } from '@/types';

export function ScriptEditor() {
  const scriptBlocks = usePodcastStore((state) => state.scriptBlocks);
  const addScriptBlock = usePodcastStore((state) => state.addScriptBlock);
  const reorderScriptBlocks = usePodcastStore((state) => state.reorderScriptBlocks);
  const activeTopicId = usePodcastStore((state) => state.activeTopicId);

  const [showAddMenu, setShowAddMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredBlocks = scriptBlocks
    .filter((b) => !activeTopicId || b.topicId === activeTopicId)
    .sort((a, b) => a.order - b.order);

  const blockIds = filteredBlocks.map((b) => b.id);

  const totalChars = filteredBlocks.reduce((sum, b) => sum + b.content.length, 0);
  const totalWords = filteredBlocks.reduce(
    (sum, b) => sum + (b.content.trim() ? b.content.trim().split(/\s+/).length : 0),
    0
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blockIds.indexOf(active.id as string);
    const newIndex = blockIds.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newBlocks = arrayMove(filteredBlocks, oldIndex, newIndex);
      reorderScriptBlocks(activeTopicId || '', newBlocks);
    }
  };

  const handleAddBlock = (type: ScriptBlockType) => {
    const typeConfig = SCRIPT_BLOCK_TYPES.find((t) => t.value === type);
    addScriptBlock({
      topicId: activeTopicId || '',
      type,
      title: typeConfig?.label || '新段落',
      content: '',
      order: filteredBlocks.length,
      collapsed: false,
    });
    setShowAddMenu(false);
  };

  const toggleAllCollapse = (collapsed: boolean) => {
    filteredBlocks.forEach((block) => {
      usePodcastStore.getState().updateScriptBlock(block.id, { collapsed });
    });
  };

  const hasActiveTopic = !!activeTopicId;

  return (
    <Card className="h-full flex flex-col overflow-hidden animate-fade-in" style={{ animationDelay: '100ms' }}>
      <CardContent className="flex-1 overflow-y-auto min-h-0 p-4">
        <TopicHeader moduleIcon="📝" moduleName="脚本编辑" />

        {!hasActiveTopic ? (
          <div className="flex flex-col items-center justify-center h-[60%] text-slate-500">
            <p className="text-sm">请先选择一个选题</p>
            <p className="text-xs mt-1">在上方下拉框中选择或前往选题板创建</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="text-xs text-slate-400">
                  {totalChars} 字 / {totalWords} 词
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => toggleAllCollapse(true)} title="全部折叠">
                  <Minimize2 size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleAllCollapse(false)} title="全部展开">
                  <Maximize2 size={14} />
                </Button>
                <div className="relative">
                  <Button size="sm" onClick={() => setShowAddMenu(!showAddMenu)}>
                    <Plus size={16} />
                    添加段落
                  </Button>
                  {showAddMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1 min-w-[140px]">
                      {SCRIPT_BLOCK_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleAddBlock(type.value)}
                          className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                        >
                          <div className={`w-2 h-2 rounded-full ${type.color}`} />
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {filteredBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[40%] text-slate-500">
                <p className="text-sm">暂无脚本段落</p>
                <p className="text-xs mt-1">点击「添加段落」开始编写</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {filteredBlocks.map((block) => (
                      <ScriptBlock key={block.id} block={block} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
