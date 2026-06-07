import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Topic, ScriptBlock, TimelineItem, Material, TopicStatus, ScriptBlockType, Priority,
  ExportTemplate, ChecklistItem, ExportType, ChecklistItemType
} from '../types';
import { exportRecordingOutline, exportGuestQuestions, exportPublishDescription, type ExportOptions, generateChecklistItems } from '../utils/export';
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
  exportTemplates: ExportTemplate[];
  checklistItems: ChecklistItem[];
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
  recalculateTimeline: (topicId: string, items: TimelineItem[]) => void;
  insertTimelineItem: (afterId: string, item: Omit<TimelineItem, 'id'>) => void;

  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  toggleMaterialConfirmed: (id: string) => void;

  addExportTemplate: (template: Omit<ExportTemplate, 'id' | 'createdAt'>) => void;
  updateExportTemplate: (id: string, updates: Partial<ExportTemplate>) => void;
  deleteExportTemplate: (id: string) => void;
  getExportTemplatesForTopic: (topicId: string) => ExportTemplate[];
  applyExportTemplate: (templateId: string) => { options: ExportOptions; titleFormat: string; footerText: string } | null;

  addChecklistItem: (item: Omit<ChecklistItem, 'id' | 'createdAt'>) => void;
  updateChecklistItem: (id: string, updates: Partial<ChecklistItem>) => void;
  deleteChecklistItem: (id: string) => void;
  toggleChecklistCompleted: (id: string) => void;
  regenerateChecklist: (topicId: string) => void;
  getChecklistForTopic: (topicId: string) => ChecklistItem[];

  getActiveTopic: () => Topic | undefined;

  exportRecordingOutline: (options?: ExportOptions, titleFormat?: string, footerText?: string) => string;
  exportGuestQuestions: (options?: ExportOptions, titleFormat?: string, footerText?: string) => string;
  exportPublishDescription: (options?: ExportOptions, titleFormat?: string, footerText?: string) => string;
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
        { id: generateId(), topicId: initialTopicId, title: '开场音乐', duration: 0.5, type: 'music' as TimelineItemType, marker: 'music', startTime: 0, assignee: '音频编辑', note: '使用节目主题曲' },
        { id: generateId(), topicId: initialTopicId, title: '开场白', duration: 2, type: 'talk' as TimelineItemType, marker: 'voiceover', startTime: 0.5, assignee: '主播', note: '热情介绍本期主题' },
        { id: generateId(), topicId: initialTopicId, title: '主题讨论', duration: 25, type: 'talk' as TimelineItemType, startTime: 2.5, assignee: '主播&嘉宾', note: '围绕3个核心问题展开' },
        { id: generateId(), topicId: initialTopicId, title: '广告时段', duration: 1, type: 'ad' as TimelineItemType, startTime: 27.5, assignee: '运营', note: '品牌A口播广告' },
        { id: generateId(), topicId: initialTopicId, title: '结尾音乐', duration: 0.5, type: 'music' as TimelineItemType, marker: 'music', startTime: 28.5, assignee: '音频编辑', note: '渐弱收尾' },
      ],
      materials: [
        { id: generateId(), topicId: initialTopicId, type: 'link' as MaterialType, title: 'ChatGPT官网', url: 'https://chat.openai.com', note: '演示用', confirmed: true },
        { id: generateId(), topicId: initialTopicId, type: 'reference' as MaterialType, title: '2024年AI发展报告', url: '', note: '需要引用数据', confirmed: false },
        { id: generateId(), topicId: initialTopicId, type: 'todo' as MaterialType, title: '确认嘉宾时间', url: '', note: '下周一下午2点', confirmed: false },
      ],
      exportTemplates: [
        {
          id: generateId(),
          topicId: initialTopicId,
          name: '访谈版',
          description: '适合嘉宾访谈节目',
          exportType: 'outline' as ExportType,
          options: {
            includeScript: true,
            includeTimeline: true,
            includeMaterials: true,
            includeUnconfirmed: false,
            includeTimelineMarkers: true,
            includeChecklist: false,
          },
          titleFormat: '📻 录制提纲 - {title}',
          footerText: '--- 由播客规划工具生成 ---',
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          topicId: initialTopicId,
          name: '单口版',
          description: '适合单人主播节目',
          exportType: 'outline' as ExportType,
          options: {
            includeScript: true,
            includeTimeline: true,
            includeMaterials: false,
            includeUnconfirmed: false,
            includeTimelineMarkers: true,
            includeChecklist: true,
          },
          titleFormat: '🎙️ 主播录制指南 - {title}',
          footerText: '--- 祝录制顺利！---',
          createdAt: new Date().toISOString(),
        },
      ],
      checklistItems: [],
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
          exportTemplates: state.exportTemplates.filter((t) => t.topicId !== id),
          checklistItems: state.checklistItems.filter((c) => c.topicId !== id),
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
        set((state) => {
          const item = state.timelineItems.find((i) => i.id === id);
          if (!item) return state;

          const topicId = item.topicId;
          const allItems = [...state.timelineItems];
          const topicItems = allItems
            .filter((i) => i.topicId === topicId)
            .sort((a, b) => a.startTime - b.startTime);

          const itemIndex = topicItems.findIndex((i) => i.id === id);
          if (itemIndex === -1) return state;

          const updatedItem = { ...topicItems[itemIndex], ...updates };
          topicItems[itemIndex] = updatedItem;

          if ('duration' in updates && updates.duration !== undefined) {
            let currentTime = topicItems[0].startTime;
            for (let i = 0; i < topicItems.length; i++) {
              topicItems[i] = { ...topicItems[i], startTime: currentTime };
              currentTime += topicItems[i].duration;
            }
          }

          const otherItems = allItems.filter((i) => i.topicId !== topicId);
          return {
            timelineItems: [...otherItems, ...topicItems],
          };
        }),

      deleteTimelineItem: (id) =>
        set((state) => {
          const item = state.timelineItems.find((i) => i.id === id);
          if (!item) return state;

          const topicId = item.topicId;
          const remainingItems = state.timelineItems.filter((i) => i.id !== id);
          const topicItems = remainingItems
            .filter((i) => i.topicId === topicId)
            .sort((a, b) => a.startTime - b.startTime);

          let currentTime = 0;
          for (let i = 0; i < topicItems.length; i++) {
            topicItems[i] = { ...topicItems[i], startTime: currentTime };
            currentTime += topicItems[i].duration;
          }

          const otherItems = remainingItems.filter((i) => i.topicId !== topicId);
          return {
            timelineItems: [...otherItems, ...topicItems],
          };
        }),

      recalculateTimeline: (topicId, items) =>
        set((state) => {
          const sortedItems = [...items].sort((a, b) => {
            const aIndex = items.findIndex((i) => i.id === a.id);
            const bIndex = items.findIndex((i) => i.id === b.id);
            return aIndex - bIndex;
          });

          let currentTime = 0;
          for (let i = 0; i < sortedItems.length; i++) {
            sortedItems[i] = { ...sortedItems[i], startTime: currentTime };
            currentTime += sortedItems[i].duration;
          }

          const otherItems = state.timelineItems.filter((i) => i.topicId !== topicId);
          return {
            timelineItems: [...otherItems, ...sortedItems],
          };
        }),

      insertTimelineItem: (afterId, item) =>
        set((state) => {
          const afterItem = state.timelineItems.find((i) => i.id === afterId);
          if (!afterItem) return state;

          const topicId = afterItem.topicId;
          const allItems = [...state.timelineItems];
          const topicItems = allItems
            .filter((i) => i.topicId === topicId)
            .sort((a, b) => a.startTime - b.startTime);

          const insertIndex = topicItems.findIndex((i) => i.id === afterId) + 1;
          const newItem = {
            ...item,
            id: generateId(),
            topicId,
            startTime: 0,
          };

          topicItems.splice(insertIndex, 0, newItem);

          let currentTime = 0;
          for (let i = 0; i < topicItems.length; i++) {
            topicItems[i] = { ...topicItems[i], startTime: currentTime };
            currentTime += topicItems[i].duration;
          }

          const otherItems = allItems.filter((i) => i.topicId !== topicId);
          return {
            timelineItems: [...otherItems, ...topicItems],
          };
        }),

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

      addExportTemplate: (template) =>
        set((state) => ({
          exportTemplates: [
            ...state.exportTemplates,
            { ...template, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateExportTemplate: (id, updates) =>
        set((state) => ({
          exportTemplates: state.exportTemplates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteExportTemplate: (id) =>
        set((state) => ({
          exportTemplates: state.exportTemplates.filter((t) => t.id !== id),
        })),

      getExportTemplatesForTopic: (topicId) => {
        const state = get();
        return state.exportTemplates.filter((t) => t.topicId === topicId);
      },

      applyExportTemplate: (templateId) => {
        const state = get();
        const template = state.exportTemplates.find((t) => t.id === templateId);
        if (!template) return null;
        return {
          options: template.options,
          titleFormat: template.titleFormat,
          footerText: template.footerText,
        };
      },

      addChecklistItem: (item) =>
        set((state) => ({
          checklistItems: [
            ...state.checklistItems,
            { ...item, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateChecklistItem: (id, updates) =>
        set((state) => ({
          checklistItems: state.checklistItems.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteChecklistItem: (id) =>
        set((state) => ({
          checklistItems: state.checklistItems.filter((c) => c.id !== id),
        })),

      toggleChecklistCompleted: (id) =>
        set((state) => ({
          checklistItems: state.checklistItems.map((c) =>
            c.id === id ? { ...c, completed: !c.completed } : c
          ),
        })),

      regenerateChecklist: (topicId) => {
        const state = get();
        const topic = state.topics.find((t) => t.id === topicId);
        if (!topic) return;

        const items = generateChecklistItems(
          topic,
          state.scriptBlocks,
          state.timelineItems,
          state.materials
        );

        const existingItems = state.checklistItems.filter((c) => c.topicId === topicId && c.type === 'custom');
        const newItems: ChecklistItem[] = items.map((item) => ({
          id: generateId(),
          topicId,
          type: item.type as ChecklistItemType,
          title: item.title,
          description: item.description,
          completed: false,
          createdAt: new Date().toISOString(),
        }));

        set({ checklistItems: [...existingItems, ...newItems] });
      },

      getChecklistForTopic: (topicId) => {
        const state = get();
        return state.checklistItems.filter((c) => c.topicId === topicId);
      },

      getActiveTopic: () => {
        const state = get();
        if (!state.activeTopicId) return undefined;
        return state.topics.find((t) => t.id === state.activeTopicId);
      },

      exportRecordingOutline: (options, titleFormat, footerText) => {
        const state = get();
        const topic = state.getActiveTopic();
        if (!topic) return '请先选择一个选题';
        const defaultOptions: ExportOptions = {
          includeScript: true,
          includeTimeline: true,
          includeMaterials: true,
          includeUnconfirmed: false,
          includeTimelineMarkers: true,
          includeChecklist: false,
        };
        return exportRecordingOutline(
          topic,
          state.scriptBlocks,
          state.timelineItems,
          state.materials,
          state.checklistItems,
          options || defaultOptions,
          titleFormat,
          footerText
        );
      },

      exportGuestQuestions: (options, titleFormat, footerText) => {
        const state = get();
        const topic = state.getActiveTopic();
        if (!topic) return '请先选择一个选题';
        const defaultOptions: ExportOptions = {
          includeScript: true,
          includeTimeline: true,
          includeMaterials: true,
          includeUnconfirmed: false,
          includeTimelineMarkers: true,
          includeChecklist: false,
        };
        return exportGuestQuestions(
          topic,
          state.scriptBlocks,
          state.materials,
          state.checklistItems,
          options || defaultOptions,
          titleFormat,
          footerText
        );
      },

      exportPublishDescription: (options, titleFormat, footerText) => {
        const state = get();
        const topic = state.getActiveTopic();
        if (!topic) return '请先选择一个选题';
        const defaultOptions: ExportOptions = {
          includeScript: true,
          includeTimeline: true,
          includeMaterials: true,
          includeUnconfirmed: false,
          includeTimelineMarkers: true,
          includeChecklist: false,
        };
        return exportPublishDescription(
          topic,
          state.scriptBlocks,
          state.materials,
          options || defaultOptions,
          titleFormat,
          footerText
        );
      },
    }),
    {
      name: 'podcast-planner-storage',
    }
  )
);
