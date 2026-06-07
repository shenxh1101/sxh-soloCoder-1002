import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Topic, ScriptBlock, TimelineItem, Material, TopicStatus, ScriptBlockType, Priority } from '../types';
import { exportRecordingOutline, exportGuestQuestions, exportPublishDescription } from '../utils/export';
import type { MaterialType, TimelineItemType } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialTopicId = generateId();

const getInitialTopics = (): Topic[] => {
  return [{
    id: initialTopicId,
    title: 'AI时代的创作者机遇',
    description: '探讨AI技术如何改变内容创作的未来趋势，分享实用的AI工具和创作方法论',
    status: 'in-progress',
    guest: '张小明',
    priority: 'high',
    tags: ['AI', '创作', '技术'],
    createdAt: new Date().toISOString(),
  }];
};

interface PodcastStore {
  topics: Topic[];
  scriptBlocks: ScriptBlock[];
  timelineItems: TimelineItem[];
  materials: Material[];
  activeTopicId: string | null;

  addTopic: (topic: Omit<Topic, 'id' | 'createdAt'>) => void;
  updateTopic: (id: string, updates: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;
  moveTopic: (id: string, newStatus: TopicStatus) => void;
  setActiveTopic: (id: string | null) => void;

  addScriptBlock: (block: Omit<ScriptBlock, 'id'>) => void;
  updateScriptBlock: (id: string, updates: Partial<ScriptBlock>) => void;
  deleteScriptBlock: (id: string) => void;
  reorderScriptBlocks: (topicId: string, blocks: ScriptBlock[]) => void;

  addTimelineItem: (item: Omit<TimelineItem, 'id'>) => void;
  updateTimelineItem: (id: string, updates: Partial<TimelineItem>) => void;
  deleteTimelineItem: (id: string) => void;

  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  toggleMaterialConfirmed: (id: string) => void;

  getActiveTopic: () => Topic | undefined;

  exportRecordingOutline: () => string;
  exportGuestQuestions: () => string;
  exportPublishDescription: () => string;
}

export const usePodcastStore = create<PodcastStore>()(
  persist(
    (set, get) => ({
      topics: getInitialTopics(),
      scriptBlocks: [
        {
          id: generateId(),
          topicId: initialTopicId,
          type: 'opening' as ScriptBlockType,
          title: '开场介绍',
          content: '大家好，欢迎收听本期节目，我是主播XXX。今天我们来聊聊一个非常热门的话题。',
          order: 0,
          collapsed: false,
        },
        {
          id: generateId(),
          topicId: initialTopicId,
          type: 'question' as ScriptBlockType,
          title: '你是如何开始接触AI的？',
          content: '可以先从你的个人经历讲起',
          order: 1,
          collapsed: false,
        },
        {
          id: generateId(),
          topicId: initialTopicId,
          type: 'question' as ScriptBlockType,
          title: 'AI工具如何提升创作效率？',
          content: '分享几个你常用的AI工具',
          order: 2,
          collapsed: false,
        },
        {
          id: generateId(),
          topicId: initialTopicId,
          type: 'ad' as ScriptBlockType,
          title: '赞助商广告',
          content: '本期节目由XXX赞助播出',
          order: 3,
          collapsed: false,
        },
        {
          id: generateId(),
          topicId: initialTopicId,
          type: 'closing' as ScriptBlockType,
          title: '结尾总结',
          content: '感谢大家的收听，我们下期再见！',
          order: 4,
          collapsed: false,
        },
      ],
      timelineItems: [
        { id: generateId(), topicId: initialTopicId, title: '开场音乐', duration: 0.5, type: 'music' as TimelineItemType, marker: 'music', startTime: 0 },
        { id: generateId(), topicId: initialTopicId, title: '开场白', duration: 2, type: 'talk' as TimelineItemType, marker: 'voiceover', startTime: 0.5 },
        { id: generateId(), topicId: initialTopicId, title: '主题讨论', duration: 25, type: 'talk' as TimelineItemType, startTime: 2.5 },
        { id: generateId(), topicId: initialTopicId, title: '广告时段', duration: 1, type: 'ad' as TimelineItemType, startTime: 27.5 },
        { id: generateId(), topicId: initialTopicId, title: '结尾音乐', duration: 0.5, type: 'music' as TimelineItemType, marker: 'music', startTime: 28.5 },
      ],
      materials: [
        { id: generateId(), topicId: initialTopicId, type: 'link' as MaterialType, title: 'ChatGPT官网', url: 'https://chat.openai.com', note: '演示用', confirmed: true },
        { id: generateId(), topicId: initialTopicId, type: 'reference' as MaterialType, title: '2024年AI发展报告', url: '', note: '需要引用数据', confirmed: false },
        { id: generateId(), topicId: initialTopicId, type: 'todo' as MaterialType, title: '确认嘉宾时间', url: '', note: '下周一下午2点', confirmed: false },
      ],
      activeTopicId: initialTopicId,

      addTopic: (topic) =>
        set((state) => {
          const newTopic: Topic = {
            ...topic,
            id: generateId(),
            createdAt: new Date().toISOString(),
          };
          return { topics: [...state.topics, newTopic] };
        }),

      updateTopic: (id, updates) =>
        set((state) => ({
          topics: state.topics.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTopic: (id) =>
        set((state) => ({
          topics: state.topics.filter((t) => t.id !== id),
          scriptBlocks: state.scriptBlocks.filter((b) => b.topicId !== id),
          timelineItems: state.timelineItems.filter((i) => i.topicId !== id),
          materials: state.materials.filter((m) => m.topicId !== id),
          activeTopicId: state.activeTopicId === id ? null : state.activeTopicId,
        })),

      moveTopic: (id, newStatus) =>
        set((state) => ({
          topics: state.topics.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
        })),

      setActiveTopic: (id) => set({ activeTopicId: id }),

      addScriptBlock: (block) =>
        set((state) => {
          const topicId = block.topicId || state.activeTopicId || '';
          const maxOrder = Math.max(
            ...state.scriptBlocks
              .filter((b) => b.topicId === topicId)
              .map((b) => b.order),
            -1
          );
          return {
            scriptBlocks: [
              ...state.scriptBlocks,
              { ...block, id: generateId(), topicId, order: maxOrder + 1 },
            ],
          };
        }),

      updateScriptBlock: (id, updates) =>
        set((state) => ({
          scriptBlocks: state.scriptBlocks.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        })),

      deleteScriptBlock: (id) =>
        set((state) => ({
          scriptBlocks: state.scriptBlocks.filter((b) => b.id !== id),
        })),

      reorderScriptBlocks: (topicId, blocks) =>
        set((state) => {
          const otherBlocks = state.scriptBlocks.filter((b) => b.topicId !== topicId);
          const reorderedBlocks = blocks.map((b, i) => ({ ...b, order: i }));
          return { scriptBlocks: [...otherBlocks, ...reorderedBlocks] };
        }),

      addTimelineItem: (item) =>
        set((state) => {
          const topicId = item.topicId || state.activeTopicId || '';
          const items = state.timelineItems.filter((i) => i.topicId === topicId);
          const lastItem = items[items.length - 1];
          const startTime = lastItem ? lastItem.startTime + lastItem.duration : 0;
          return {
            timelineItems: [
              ...state.timelineItems,
              { ...item, id: generateId(), topicId, startTime },
            ],
          };
        }),

      updateTimelineItem: (id, updates) =>
        set((state) => ({
          timelineItems: state.timelineItems.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        })),

      deleteTimelineItem: (id) =>
        set((state) => ({
          timelineItems: state.timelineItems.filter((i) => i.id !== id),
        })),

      addMaterial: (material) =>
        set((state) => {
          const topicId = material.topicId || state.activeTopicId || '';
          return {
            materials: [
              ...state.materials,
              { ...material, id: generateId(), topicId },
            ],
          };
        }),

      updateMaterial: (id, updates) =>
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      deleteMaterial: (id) =>
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
        })),

      toggleMaterialConfirmed: (id) =>
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, confirmed: !m.confirmed } : m
          ),
        })),

      getActiveTopic: () => {
        const state = get();
        if (!state.activeTopicId) return undefined;
        return state.topics.find((t) => t.id === state.activeTopicId);
      },

      exportRecordingOutline: () => {
        const state = get();
        const topic = state.getActiveTopic();
        if (!topic) return '请先选择一个选题';
        return exportRecordingOutline(topic, state.scriptBlocks, state.timelineItems);
      },

      exportGuestQuestions: () => {
        const state = get();
        const topic = state.getActiveTopic();
        if (!topic) return '请先选择一个选题';
        return exportGuestQuestions(topic, state.scriptBlocks);
      },

      exportPublishDescription: () => {
        const state = get();
        const topic = state.getActiveTopic();
        if (!topic) return '请先选择一个选题';
        return exportPublishDescription(topic, state.scriptBlocks, state.materials);
      },
    }),
    {
      name: 'podcast-planner-storage',
    }
  )
);
