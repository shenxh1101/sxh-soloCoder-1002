import type { Topic, ScriptBlock, TimelineItem, Material } from '../types';
import { SCRIPT_BLOCK_TYPES, TIMELINE_ITEM_TYPES } from '../types';

export interface ExportOptions {
  includeScript: boolean;
  includeTimeline: boolean;
  includeMaterials: boolean;
  includeUnconfirmed: boolean;
}

const formatDuration = (minutes: number): string => {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getScriptBlockLabel = (type: string): string => {
  return SCRIPT_BLOCK_TYPES.find(t => t.value === type)?.label || type;
};

const getTimelineTypeLabel = (type: string): string => {
  return TIMELINE_ITEM_TYPES.find(t => t.value === type)?.label || type;
};

export const exportRecordingOutline = (
  topic: Topic,
  scriptBlocks: ScriptBlock[],
  timelineItems: TimelineItem[],
  options: ExportOptions
): string => {
  const blocks = scriptBlocks
    .filter(b => b.topicId === topic.id)
    .sort((a, b) => a.order - b.order);

  const items = timelineItems
    .filter(t => t.topicId === topic.id)
    .sort((a, b) => a.startTime - b.startTime);

  const totalDuration = items.reduce((sum, item) => sum + item.duration, 0);

  let outline = `📻 录制提纲 - ${topic.title}\n`;
  outline += `${'='.repeat(50)}\n\n`;
  outline += `📅 创建日期: ${new Date(topic.createdAt).toLocaleDateString('zh-CN')}\n`;
  outline += `👤 嘉宾: ${topic.guest || '无'}\n`;
  outline += `🏷️  标签: ${topic.tags.join(', ') || '无'}\n`;
  if (options.includeTimeline && totalDuration > 0) {
    outline += `⏱️  预估总时长: ${formatDuration(totalDuration)}\n`;
  }
  outline += '\n';

  if (topic.description) {
    outline += `📝 主题描述:\n${topic.description}\n\n`;
  }

  if (options.includeTimeline && items.length > 0) {
    outline += `${'='.repeat(50)}\n`;
    outline += `🎬 时间轴\n`;
    outline += `${'='.repeat(50)}\n\n`;

    items.forEach((item, index) => {
      outline += `${index + 1}. [${formatDuration(item.startTime)} - ${formatDuration(item.startTime + item.duration)}] `;
      outline += `${getTimelineTypeLabel(item.type)}: ${item.title}`;
      if (item.marker === 'music') outline += ' 🎵';
      if (item.marker === 'voiceover') outline += ' 🎙️';
      outline += ` (${formatDuration(item.duration)})\n`;
    });
    outline += '\n';
  }

  if (options.includeScript && blocks.length > 0) {
    outline += `${'='.repeat(50)}\n`;
    outline += `📄 脚本内容\n`;
    outline += `${'='.repeat(50)}\n\n`;

    blocks.forEach(block => {
      outline += `【${getScriptBlockLabel(block.type)}】${block.title}\n`;
      outline += `${'-'.repeat(40)}\n`;
      outline += block.content || '(暂无内容)\n\n';
    });
  }

  if (!options.includeTimeline && !options.includeScript) {
    outline += '⚠️ 请在导出选项中选择要包含的内容\n';
  }

  return outline;
};

export const exportGuestQuestions = (
  topic: Topic,
  scriptBlocks: ScriptBlock[],
  options: ExportOptions
): string => {
  const questionBlocks = scriptBlocks
    .filter(b => b.topicId === topic.id && b.type === 'question')
    .sort((a, b) => a.order - b.order);

  let doc = `❓ 嘉宾问题单 - ${topic.title}\n`;
  doc += `${'='.repeat(50)}\n\n`;
  doc += `👤 嘉宾: ${topic.guest || '待确认'}\n`;
  doc += `📅 录制日期: ${new Date(topic.createdAt).toLocaleDateString('zh-CN')}\n\n`;

  if (topic.description) {
    doc += `📝 本期主题:\n${topic.description}\n\n`;
  }

  if (options.includeScript && questionBlocks.length > 0) {
    doc += `${'='.repeat(50)}\n`;
    doc += `💬 访谈问题\n`;
    doc += `${'='.repeat(50)}\n\n`;

    questionBlocks.forEach((block, index) => {
      doc += `Q${index + 1}: ${block.title}\n\n`;
      if (block.content) {
        doc += `   引导/补充: ${block.content}\n`;
      }
      doc += '\n';
    });
  }

  doc += `${'='.repeat(50)}\n`;
  doc += `📌 注意事项\n`;
  doc += `${'='.repeat(50)}\n\n`;
  doc += `1. 请嘉宾提前熟悉以上问题\n`;
  doc += `2. 录制前请确认设备正常\n`;
  doc += `3. 访谈过程中请保持自然流畅\n`;
  doc += `4. 如有补充问题可随时沟通\n`;

  if (options.includeScript && questionBlocks.length === 0) {
    doc += '\n⚠️ 暂无问题，请先在脚本编辑中添加问题模块。\n';
  }

  return doc;
};

export const exportPublishDescription = (
  topic: Topic,
  scriptBlocks: ScriptBlock[],
  materials: Material[],
  options: ExportOptions
): string => {
  const openingBlock = scriptBlocks.find(b => b.topicId === topic.id && b.type === 'opening');
  const closingBlock = scriptBlocks.find(b => b.topicId === topic.id && b.type === 'closing');
  const questionBlocks = scriptBlocks.filter(b => b.topicId === topic.id && b.type === 'question');
  const refs = materials.filter(m => m.topicId === topic.id && m.type === 'reference');
  const todos = materials.filter(m => m.topicId === topic.id && m.type === 'todo');
  const filteredTodos = options.includeUnconfirmed ? todos : todos.filter(t => t.confirmed);

  let desc = `🎙️ ${topic.title}\n`;
  desc += `${'='.repeat(50)}\n\n`;

  if (options.includeScript && openingBlock?.content) {
    desc += `${openingBlock.content}\n\n`;
  } else if (topic.description) {
    desc += `${topic.description}\n\n`;
  }

  if (options.includeScript && questionBlocks.length > 0) {
    desc += `📋 本期要点:\n`;
    questionBlocks.forEach((q, i) => {
      desc += `${i + 1}. ${q.title}\n`;
    });
    desc += '\n';
  }

  if (topic.guest) {
    desc += `👤 嘉宾: ${topic.guest}\n\n`;
  }

  if (options.includeMaterials && refs.length > 0) {
    desc += `📚 引用来源:\n`;
    refs.forEach((ref, i) => {
      desc += `${i + 1}. ${ref.title}`;
      if (ref.url) desc += ` - ${ref.url}`;
      if (ref.note) desc += ` (${ref.note})`;
      desc += '\n';
    });
    desc += '\n';
  }

  if (options.includeUnconfirmed && filteredTodos.length > 0) {
    desc += `✅ 待办事项:\n`;
    filteredTodos.forEach((todo, i) => {
      desc += `${i + 1}. ${todo.title}`;
      if (todo.note) desc += ` - ${todo.note}`;
      desc += todo.confirmed ? ' ✓\n' : ' ⏳\n';
    });
    desc += '\n';
  }

  if (options.includeScript && closingBlock?.content) {
    desc += `\n💭 ${closingBlock.content}\n\n`;
  }

  desc += `🏷️  标签: ${topic.tags.map(t => '#' + t.replace(/\s+/g, '')).join(' ')}\n`;

  return desc;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
};
