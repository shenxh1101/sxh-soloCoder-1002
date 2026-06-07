import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus, Clock, Music, Mic, Megaphone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TimelineItem } from './TimelineItem';
import { TopicHeader } from '../TopicHeader';
import { usePodcastStore } from '@/store/usePodcastStore';
import type { TimelineItemType, TimelineItem as TimelineItemTypeDef } from '@/types';
import { TIMELINE_ITEM_TYPES } from '@/types';

export function Timeline() {
  const timelineItems = usePodcastStore((state) => state.timelineItems);
  const addTimelineItem = usePodcastStore((state) => state.addTimelineItem);
  const updateTimelineItem = usePodcastStore((state) => state.updateTimelineItem);
  const deleteTimelineItem = usePodcastStore((state) => state.deleteTimelineItem);
  const recalculateTimeline = usePodcastStore((state) => state.recalculateTimeline);
  const insertTimelineItem = usePodcastStore((state) => state.insertTimelineItem);
  const getRehearsalRecordsForTopic = usePodcastStore((state) => state.getRehearsalRecordsForTopic);
  const addRehearsalIssue = usePodcastStore((state) => state.addRehearsalIssue);
  const activeTopicId = usePodcastStore((state) => state.activeTopicId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('5');
  const [newType, setNewType] = useState<TimelineItemType>('talk');
  const [insertAfterId, setInsertAfterId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const hasActiveTopic = !!activeTopicId;

  const filteredItems = timelineItems
    .filter((i) => !activeTopicId || i.topicId === activeTopicId)
    .sort((a, b) => a.startTime - b.startTime);

  const itemIds = filteredItems.map((i) => i.id);
  const totalDuration = filteredItems.reduce((sum, item) => sum + item.duration, 0);

  const activeItem = activeId ? filteredItems.find((i) => i.id === activeId) : null;

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = itemIds.indexOf(active.id as string);
    const newIndex = itemIds.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(filteredItems, oldIndex, newIndex);
      if (activeTopicId) {
        recalculateTimeline(activeTopicId, newItems);
      }
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = parseFloat(newDuration);
    if (!newTitle.trim() || isNaN(duration) || duration <= 0) return;

    if (insertAfterId !== null) {
      insertTimelineItem(insertAfterId, {
        topicId: activeTopicId || '',
        title: newTitle.trim(),
        duration,
        type: newType,
        startTime: 0,
      });
    } else {
      addTimelineItem({
        topicId: activeTopicId || '',
        title: newTitle.trim(),
        duration,
        type: newType,
        startTime: 0,
      });
    }

    setNewTitle('');
    setNewDuration('5');
    setNewType('talk');
    setShowAddForm(false);
    setInsertAfterId(null);
  };

  const handleInsertAfter = (itemId: string) => {
    setInsertAfterId(itemId);
    setShowAddForm(true);
  };

  const handleCancelInsert = () => {
    setInsertAfterId(null);
    setShowAddForm(false);
    setNewTitle('');
    setNewDuration('5');
    setNewType('talk');
  };

  const handleAddRehearsalIssue = (item: TimelineItemTypeDef) => {
    if (!activeTopicId) return;

    const records = getRehearsalRecordsForTopic(activeTopicId);
    if (records.length === 0) {
      alert('请先在「排练记录」中创建一条排练记录，然后再添加问题');
      return;
    }

    const latestRecord = records[0];
    const description = prompt(`请输入「${item.title}」的排练问题：`);
    if (!description || !description.trim()) return;

    addRehearsalIssue(latestRecord.id, {
      type: 'content',
      timelineItemId: item.id,
      timelineItemTitle: item.title,
      timePoint: item.startTime * 60,
      description: description.trim(),
      resolved: false,
    });

    alert('已添加到最新的排练记录中');
  };

  const getTypeIcon = (type: TimelineItemType) => {
    switch (type) {
      case 'music':
        return <Music size={16} />;
      case 'talk':
        return <Mic size={16} />;
      case 'ad':
        return <Megaphone size={16} />;
    }
  };

  const getTimelineTrack = () => {
    if (totalDuration === 0) return null;

    return (
      <div className="relative h-12 bg-slate-900/50 rounded-lg overflow-hidden mb-4 group">
        <div className="absolute inset-0 flex">
          {filteredItems.map((item, index) => {
            const typeConfig = TIMELINE_ITEM_TYPES.find((t) => t.value === item.type);
            const widthPercent = (item.duration / totalDuration) * 100;
            return (
              <div
                key={item.id}
                className="h-full flex items-center justify-center group/item relative transition-all duration-300 hover:brightness-110"
                style={{
                  width: `${widthPercent}%`,
                }}
              >
                <div
                  className={`absolute inset-0 ${typeConfig?.color} opacity-80`}
                />
                <span className="relative z-10 text-[10px] text-white font-medium truncate px-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                  {item.title}
                </span>
                {item.marker && (
                  <div className="absolute top-1 right-1 text-white text-[10px]">
                    {item.marker === 'music' ? '🎵' : '🎙️'}
                  </div>
                )}
                {index < filteredItems.length - 1 && (
                  <div className="absolute right-0 top-0 bottom-0 w-px bg-slate-900/30" />
                )}
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[10px] text-slate-500">
          <span>0:00</span>
          {totalDuration > 10 && (
            <>
              <span>{formatTime(totalDuration * 0.25)}</span>
              <span>{formatTime(totalDuration * 0.5)}</span>
              <span>{formatTime(totalDuration * 0.75)}</span>
            </>
          )}
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
      <CardContent className="flex-1 overflow-y-auto min-h-0 p-4">
        <TopicHeader moduleIcon="⏱️" moduleName="时间轴" />

        {!hasActiveTopic ? (
          <div className="flex flex-col items-center justify-center h-[60%] text-slate-500">
            <p className="text-sm">请先选择一个选题</p>
            <p className="text-xs mt-1">在上方下拉框中选择或前往选题板创建</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-slate-400">
                  <Clock size={14} />
                  <span>总时长: </span>
                  <span className="font-mono text-amber-400 font-semibold">{formatTime(totalDuration)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => {
                  setShowAddForm(!showAddForm);
                  setInsertAfterId(null);
                }}>
                  <Plus size={16} />
                  添加时段
                </Button>
              </div>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddItem} className="mb-4 bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 animate-slide-down">
                {insertAfterId && (
                  <div className="mb-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg">
                    <span>将在「{filteredItems.find(i => i.id === insertAfterId)?.title}」之后插入</span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      时段标题
                    </label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="例如：开场音乐"
                      inputSize="sm"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      时长(分钟)
                    </label>
                    <Input
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      type="number"
                      step="0.5"
                      min="0.1"
                      inputSize="sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-400">类型:</label>
                    <div className="flex gap-1">
                      {TIMELINE_ITEM_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setNewType(type.value)}
                          className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                            newType === type.value
                              ? `${type.color} text-white`
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {getTypeIcon(type.value)}
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="ghost" onClick={handleCancelInsert}>
                      取消
                    </Button>
                    <Button type="submit" size="sm" disabled={!newTitle.trim()}>
                      {insertAfterId ? '插入' : '添加'}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {filteredItems.length > 0 && getTimelineTrack()}

            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[40%] text-slate-500">
                <p className="text-sm">暂无时间规划</p>
                <p className="text-xs mt-1">点击「添加时段」开始规划</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {filteredItems.map((item, index) => (
                      <div key={item.id} className="group/item">
                        <TimelineItem
                          item={item}
                          totalDuration={totalDuration}
                          onInsertAfter={() => handleInsertAfter(item.id)}
                          onAddRehearsalIssue={handleAddRehearsalIssue}
                          isFirst={index === 0}
                          isLast={index === filteredItems.length - 1}
                        />
                        {index < filteredItems.length - 1 && (
                          <div className="h-px bg-slate-700/30 mx-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeItem ? (
                    <div className="opacity-90 shadow-2xl">
                      <TimelineItem
                        item={activeItem}
                        totalDuration={totalDuration}
                        onInsertAfter={() => {}}
                        onAddRehearsalIssue={() => {}}
                        isFirst={false}
                        isLast={false}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
