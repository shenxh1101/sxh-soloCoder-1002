export type TopicStatus = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type ScriptBlockType = 'opening' | 'question' | 'ad' | 'closing';
export type TimelineItemType = 'talk' | 'music' | 'ad';
export type MaterialType = 'link' | 'reference' | 'todo';
export type ExportType = 'outline' | 'questions' | 'description';
export type ChecklistItemType = 'empty-script' | 'unconfirmed-material' | 'timeline-duration' | 'ad-marker' | 'music-marker' | 'voiceover-marker' | 'custom';
export type PublishPlatform = 'xiaoyuzhou' | 'apple' | 'wechat' | 'spotify' | 'bilibili' | 'youtube' | 'custom';
export type RehearsalIssueType = 'timing' | 'content' | 'flow' | 'technical' | 'other';

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
  assignee?: string;
  note?: string;
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

export interface ExportTemplate {
  id: string;
  topicId: string;
  name: string;
  description: string;
  exportType: ExportType;
  options: ExportOptions;
  titleFormat: string;
  footerText: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  topicId: string;
  type: ChecklistItemType;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

export interface RehearsalRecord {
  id: string;
  topicId: string;
  date: string;
  participants: string;
  actualDuration: number;
  issues: RehearsalIssue[];
  notes: string;
  createdAt: string;
}

export interface RehearsalIssue {
  id: string;
  type: RehearsalIssueType;
  timelineItemId?: string;
  timelineItemTitle?: string;
  timePoint?: number;
  description: string;
  resolved: boolean;
}

export interface PublishVersion {
  id: string;
  topicId: string;
  platform: PublishPlatform;
  platformName: string;
  title: string;
  description: string;
  shownotes: string;
  tags: string[];
  scheduledDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportOptions {
  includeScript: boolean;
  includeTimeline: boolean;
  includeMaterials: boolean;
  includeUnconfirmed: boolean;
  includeTimelineMarkers: boolean;
  includeChecklist: boolean;
  includeRehearsalNotes: boolean;
}

export interface PodcastState {
  topics: Topic[];
  scriptBlocks: ScriptBlock[];
  timelineItems: TimelineItem[];
  materials: Material[];
  exportTemplates: ExportTemplate[];
  checklistItems: ChecklistItem[];
  rehearsalRecords: RehearsalRecord[];
  publishVersions: PublishVersion[];
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

export const MATERIAL_TYPES: { value: MaterialType; label: string; icon: string; color: string }[] = [
  { value: 'link', label: '链接', icon: '🔗', color: 'bg-indigo-500' },
  { value: 'reference', label: '引用', icon: '📖', color: 'bg-emerald-500' },
  { value: 'todo', label: '待办', icon: '✅', color: 'bg-amber-500' },
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

export const EXPORT_TYPES: { value: ExportType; label: string }[] = [
  { value: 'outline', label: '录制提纲' },
  { value: 'questions', label: '嘉宾问题单' },
  { value: 'description', label: '发布简介' },
];

export const TEMPLATE_PRESETS: { name: string; description: string; exportType: ExportType; options: Partial<ExportOptions> }[] = [
  {
    name: '访谈版',
    description: '适合嘉宾访谈节目，包含完整问题和时间轴',
    exportType: 'outline',
    options: { includeScript: true, includeTimeline: true, includeMaterials: true, includeUnconfirmed: false, includeTimelineMarkers: true, includeChecklist: false, includeRehearsalNotes: false }
  },
  {
    name: '单口版',
    description: '适合单人主播，侧重脚本和时间控制',
    exportType: 'outline',
    options: { includeScript: true, includeTimeline: true, includeMaterials: false, includeUnconfirmed: false, includeTimelineMarkers: true, includeChecklist: true, includeRehearsalNotes: true }
  },
  {
    name: '商业合作版',
    description: '适合品牌合作，突出广告时段和素材来源',
    exportType: 'outline',
    options: { includeScript: true, includeTimeline: true, includeMaterials: true, includeUnconfirmed: false, includeTimelineMarkers: true, includeChecklist: true, includeRehearsalNotes: false }
  },
];

export const PUBLISH_PLATFORMS: { value: PublishPlatform; label: string; icon: string; color: string }[] = [
  { value: 'xiaoyuzhou', label: '小宇宙', icon: '🎧', color: 'bg-gradient-to-r from-rose-500 to-orange-500' },
  { value: 'apple', label: 'Apple Podcasts', icon: '🍎', color: 'bg-gradient-to-r from-blue-500 to-purple-500' },
  { value: 'wechat', label: '微信公众号', icon: '💬', color: 'bg-gradient-to-r from-emerald-500 to-teal-500' },
  { value: 'spotify', label: 'Spotify', icon: '🎵', color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
  { value: 'bilibili', label: 'B站', icon: '📺', color: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  { value: 'youtube', label: 'YouTube', icon: '▶️', color: 'bg-gradient-to-r from-red-500 to-orange-500' },
  { value: 'custom', label: '其他平台', icon: '🌐', color: 'bg-gradient-to-r from-slate-500 to-slate-600' },
];

export const REHEARSAL_ISSUE_TYPES: { value: RehearsalIssueType; label: string; icon: string; color: string }[] = [
  { value: 'timing', label: '时长问题', icon: '⏱️', color: 'bg-amber-500' },
  { value: 'content', label: '内容问题', icon: '📝', color: 'bg-indigo-500' },
  { value: 'flow', label: '流程问题', icon: '🔄', color: 'bg-emerald-500' },
  { value: 'technical', label: '技术问题', icon: '🔧', color: 'bg-rose-500' },
  { value: 'other', label: '其他问题', icon: '❓', color: 'bg-slate-500' },
];
