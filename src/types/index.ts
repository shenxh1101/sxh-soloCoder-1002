export type TopicStatus = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type ScriptBlockType = 'opening' | 'question' | 'ad' | 'closing';
export type TimelineItemType = 'talk' | 'music' | 'ad';
export type MaterialType = 'link' | 'reference' | 'todo';

export interface Topic {
  id: string;
  title: string;
  description: string;
  status: TopicStatus;
  guest: string;
  priority: Priority;
  tags: string[];
  createdAt: string;
}

export interface ScriptBlock {
  id: string;
  topicId: string;
  type: ScriptBlockType;
  title: string;
  content: string;
  order: number;
  collapsed: boolean;
}

export interface TimelineItem {
  id: string;
  topicId: string;
  title: string;
  duration: number;
  type: TimelineItemType;
  marker?: 'music' | 'voiceover';
  startTime: number;
}

export interface Material {
  id: string;
  topicId: string;
  type: MaterialType;
  title: string;
  url?: string;
  note?: string;
  confirmed: boolean;
}

export interface PodcastState {
  topics: Topic[];
  scriptBlocks: ScriptBlock[];
  timelineItems: TimelineItem[];
  materials: Material[];
  activeTopicId: string | null;
}

export const SCRIPT_BLOCK_TYPES: { value: ScriptBlockType; label: string; color: string }[] = [
  { value: 'opening', label: '开场', color: 'bg-indigo-500' },
  { value: 'question', label: '问题', color: 'bg-emerald-500' },
  { value: 'ad', label: '广告', color: 'bg-amber-500' },
  { value: 'closing', label: '结尾', color: 'bg-rose-500' },
];

export const TIMELINE_ITEM_TYPES: { value: TimelineItemType; label: string; color: string }[] = [
  { value: 'talk', label: '口播', color: 'bg-indigo-500' },
  { value: 'music', label: '音乐', color: 'bg-purple-500' },
  { value: 'ad', label: '广告', color: 'bg-amber-500' },
];

export const MATERIAL_TYPES: { value: MaterialType; label: string; icon: string }[] = [
  { value: 'link', label: '链接', icon: 'Link' },
  { value: 'reference', label: '引用', icon: 'Quote' },
  { value: 'todo', label: '待办', icon: 'CheckSquare' },
];

export const PRIORITY_LEVELS: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: '高优先级', color: 'bg-rose-500' },
  { value: 'medium', label: '中优先级', color: 'bg-amber-500' },
  { value: 'low', label: '低优先级', color: 'bg-emerald-500' },
];

export const TOPIC_STATUS: { value: TopicStatus; label: string }[] = [
  { value: 'todo', label: '待开发' },
  { value: 'in-progress', label: '进行中' },
  { value: 'done', label: '已完成' },
];
