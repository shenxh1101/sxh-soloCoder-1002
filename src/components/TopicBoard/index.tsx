import { useState } from 'react';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { TopicColumn } from './TopicColumn';
import { TopicForm } from './TopicForm';
import { usePodcastStore } from '@/store/usePodcastStore';
import type { TopicStatus } from '@/types';

const COLUMNS: { status: TopicStatus; title: string; color: string }[] = [
  { status: 'todo', title: '待开发', color: 'bg-slate-500' },
  { status: 'in-progress', title: '进行中', color: 'bg-amber-500' },
  { status: 'done', title: '已完成', color: 'bg-emerald-500' },
];

export function TopicBoard() {
  const topics = usePodcastStore((state) => state.topics);
  const moveTopic = usePodcastStore((state) => state.moveTopic);
  const updateTopic = usePodcastStore((state) => state.updateTopic);
  const [showAddForm, setShowAddForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTopicsByStatus = (status: TopicStatus) => {
    return topics.filter((t) => t.status === status);
  };

  const findContainer = (id: string) => {
    if (id in COLUMNS.reduce((acc, col) => ({ ...acc, [col.status]: true }), {})) {
      return id as TopicStatus;
    }
    const topic = topics.find((t) => t.id === id);
    return topic?.status;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    moveTopic(activeId, overContainer);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      const containerTopics = getTopicsByStatus(activeContainer);
      const oldIndex = containerTopics.findIndex((t) => t.id === activeId);
      const newIndex = containerTopics.findIndex((t) => t.id === overId);

      if (oldIndex !== newIndex) {
        const newTopics = arrayMove(containerTopics, oldIndex, newIndex);
        newTopics.forEach((topic, index) => {
          const currentIndex = topics.findIndex((t) => t.id === topic.id);
          if (currentIndex !== -1) {
            updateTopic(topic.id, { createdAt: topic.createdAt });
          }
        });
      }
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden animate-fade-in" style={{ animationDelay: '0ms' }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          选题板
        </CardTitle>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} />
          新增选题
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col">
        {showAddForm && (
          <div className="mb-4 bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 animate-slide-down">
            <TopicForm onClose={() => setShowAddForm(false)} />
          </div>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 flex-1 min-h-0 overflow-x-auto">
            {COLUMNS.map((column) => (
              <TopicColumn
                key={column.status}
                status={column.status}
                title={column.title}
                color={column.color}
                topics={getTopicsByStatus(column.status)}
              />
            ))}
          </div>
        </DndContext>
      </CardContent>
    </Card>
  );
}
