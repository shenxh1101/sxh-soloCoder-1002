import type { Topic, ScriptBlock, TimelineItem, Material, ChecklistItem, RehearsalRecord } from '../types';
import { SCRIPT_BLOCK_TYPES, TIMELINE_ITEM_TYPES, MATERIAL_TYPES, REHEARSAL_ISSUE_TYPES } from '../types';

export interface ExportOptions {
  includeScript: boolean;
  includeTimeline: boolean;
  includeMaterials: boolean;
  includeUnconfirmed: boolean;
  includeTimelineMarkers: boolean;
  includeChecklist: boolean;
  includeRehearsalNotes: boolean;
}

const formatDuration = (minutes: number): string => {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatTimePoint = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getScriptBlockLabel = (type: string): string => {
  return SCRIPT_BLOCK_TYPES.find(t => t.value === type)?.label || type;
};

const getTimelineTypeLabel = (type: string): string => {
  return TIMELINE_ITEM_TYPES.find(t => t.value === type)?.label || type;
};

const getMaterialTypeLabel = (type: string): string => {
  return MATERIAL_TYPES.find(t => t.value === type)?.label || type;
};

const getMaterialTypeIcon = (type: string): string => {
  return MATERIAL_TYPES.find(t => t.value === type)?.icon || '📎';
};

const getIssueTypeIcon = (type: string): string => {
  return REHEARSAL_ISSUE_TYPES.find(t => t.value === type)?.icon || '❓';
};

const getIssueTypeLabel = (type: string): string => {
  return REHEARSAL_ISSUE_TYPES.find(t => t.value === type)?.label || type;
};

const renderTimelineWithMarkers = (items: TimelineItem[], options: ExportOptions): string => {
  let result = '';
  items.forEach((item, index) => {
    result += `${index + 1}. [${formatDuration(item.startTime)} - ${formatDuration(item.startTime + item.duration)}] `;
    result += `${getTimelineTypeLabel(item.type)}: ${item.title}`;
    if (options.includeTimelineMarkers) {
      if (item.marker === 'music') result += ' 🎵';
      if (item.marker === 'voiceover') result += ' 🎙️';
    }
    result += ` (${formatDuration(item.duration)})\n`;
    if (options.includeTimelineMarkers) {
      if (item.assignee) {
        result += `   👤 负责人: ${item.assignee}\n`;
      }
      if (item.note) {
        result += `   📝 备注: ${item.note}\n`;
      }
    }
  });
  return result;
};

export const exportRecordingOutline = (
  topic: Topic,
  scriptBlocks: ScriptBlock[],
  timelineItems: TimelineItem[],
  materials: Material[],
  checklistItems: ChecklistItem[],
  options: ExportOptions,
  titleFormat?: string,
  footerText?: string,
  rehearsalRecord?: RehearsalRecord
): string => {
  const blocks = scriptBlocks
    .filter(b => b.topicId === topic.id)
    .sort((a, b) => a.order - b.order);

  const items = timelineItems
    .filter(t => t.topicId === topic.id)
    .sort((a, b) => a.startTime - b.startTime);

  const topicMaterials = materials.filter(m => m.topicId === topic.id);
  const filteredMaterials = options.includeUnconfirmed
    ? topicMaterials
    : topicMaterials.filter(m => m.confirmed);

  const topicChecklist = checklistItems.filter(c => c.topicId === topic.id);
  const filteredChecklist = options.includeUnconfirmed
    ? topicChecklist
    : topicChecklist.filter(c => c.completed);

  const totalDuration = items.reduce((sum, item) => sum + item.duration, 0);

  const title = titleFormat?.replace('{title}', topic.title) || `📻 录制提纲 - ${topic.title}`;

  let outline = `${title}\n`;
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
    outline += renderTimelineWithMarkers(items, options);
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

  if (options.includeMaterials && filteredMaterials.length > 0) {
    outline += `${'='.repeat(50)}\n`;
    outline += `📚 素材清单\n`;
    outline += `${'='.repeat(50)}\n\n`;

    filteredMaterials.forEach((material, index) => {
      outline += `${index + 1}. ${getMaterialTypeIcon(material.type)} ${getMaterialTypeLabel(material.type)}: ${material.title}`;
      if (!material.confirmed) outline += ' ⏳';
      outline += '\n';
      if (material.url) {
        outline += `   🔗 ${material.url}\n`;
      }
      if (material.note) {
        outline += `   📝 ${material.note}\n`;
      }
    });
    outline += '\n';
  }

  if (options.includeChecklist && filteredChecklist.length > 0) {
    outline += `${'='.repeat(50)}\n`;
    outline += `✅ 准备检查清单\n`;
    outline += `${'='.repeat(50)}\n\n`;

    filteredChecklist.forEach((item, index) => {
      outline += `${index + 1}. ${item.completed ? '[✓]' : '[ ]'} ${item.title}`;
      if (!item.completed && !options.includeUnconfirmed) return;
      outline += '\n';
      if (item.description) {
        outline += `   ${item.description}\n`;
      }
    });
    outline += '\n';
  }

  if (options.includeRehearsalNotes && rehearsalRecord) {
    outline += `${'='.repeat(50)}\n`;
    outline += `🎯 最近排练记录\n`;
    outline += `${'='.repeat(50)}\n\n`;

    outline += `📅 排练日期: ${new Date(rehearsalRecord.date).toLocaleDateString('zh-CN')}\n`;
    outline += `👥 参与人: ${rehearsalRecord.participants}\n`;
    outline += `⏱️  实际时长: ${formatDuration(rehearsalRecord.actualDuration)}\n\n`;

    if (rehearsalRecord.issues.length > 0) {
      outline += `❗ 排练问题 (${rehearsalRecord.issues.filter(i => !i.resolved).length}/${rehearsalRecord.issues.length} 未解决):\n\n`;
      rehearsalRecord.issues.forEach((issue, idx) => {
        outline += `${idx + 1}. ${issue.resolved ? '[✓]' : '[ ]'} ${getIssueTypeIcon(issue.type)} ${getIssueTypeLabel(issue.type)}: ${issue.description}\n`;
        if (issue.timelineItemTitle) {
          outline += `   🎬 相关时段: ${issue.timelineItemTitle}`;
          if (issue.timePoint !== undefined) {
            outline += ` (${formatTimePoint(issue.timePoint)})`;
          }
          outline += '\n';
        } else if (issue.timePoint !== undefined) {
          outline += `   ⏱️  时间点: ${formatTimePoint(issue.timePoint)}\n`;
        }
      });
      outline += '\n';
    }

    if (rehearsalRecord.notes) {
      outline += `📝 改稿备注:\n${rehearsalRecord.notes}\n\n`;
    }
  }

  if (footerText) {
    outline += `${'='.repeat(50)}\n`;
    outline += `${footerText}\n`;
  }

  if (!options.includeTimeline && !options.includeScript && !options.includeMaterials && !options.includeChecklist && !options.includeRehearsalNotes) {
    outline += '⚠️ 请在导出选项中选择要包含的内容\n';
  }

  return outline;
};

export const exportGuestQuestions = (
  topic: Topic,
  scriptBlocks: ScriptBlock[],
  materials: Material[],
  checklistItems: ChecklistItem[],
  options: ExportOptions,
  titleFormat?: string,
  footerText?: string
): string => {
  const questionBlocks = scriptBlocks
    .filter(b => b.topicId === topic.id && b.type === 'question')
    .sort((a, b) => a.order - b.order);

  const topicMaterials = materials.filter(m => m.topicId === topic.id);
  const filteredMaterials = options.includeUnconfirmed
    ? topicMaterials
    : topicMaterials.filter(m => m.confirmed);

  const topicChecklist = checklistItems.filter(c => c.topicId === topic.id);
  const filteredChecklist = options.includeUnconfirmed
    ? topicChecklist
    : topicChecklist.filter(c => c.completed);

  const title = titleFormat?.replace('{title}', topic.title) || `❓ 嘉宾问题单 - ${topic.title}`;

  let doc = `${title}\n`;
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

  if (options.includeMaterials && filteredMaterials.length > 0) {
    doc += `${'='.repeat(50)}\n`;
    doc += `📚 参考资料\n`;
    doc += `${'='.repeat(50)}\n\n`;

    filteredMaterials.forEach((material, index) => {
      doc += `${index + 1}. ${getMaterialTypeIcon(material.type)} ${material.title}`;
      if (!material.confirmed) doc += ' ⏳';
      doc += '\n';
      if (material.url) {
        doc += `   🔗 ${material.url}\n`;
      }
      if (material.note) {
        doc += `   📝 ${material.note}\n`;
      }
    });
    doc += '\n';
  }

  if (options.includeChecklist && filteredChecklist.length > 0) {
    doc += `${'='.repeat(50)}\n`;
    doc += `✅ 准备检查清单\n`;
    doc += `${'='.repeat(50)}\n\n`;

    filteredChecklist.forEach((item, index) => {
      doc += `${index + 1}. ${item.completed ? '[✓]' : '[ ]'} ${item.title}\n`;
      if (item.description) {
        doc += `   ${item.description}\n`;
      }
    });
    doc += '\n';
  }

  doc += `${'='.repeat(50)}\n`;
  doc += `📌 注意事项\n`;
  doc += `${'='.repeat(50)}\n\n`;
  doc += `1. 请嘉宾提前熟悉以上问题\n`;
  doc += `2. 录制前请确认设备正常\n`;
  doc += `3. 访谈过程中请保持自然流畅\n`;
  doc += `4. 如有补充问题可随时沟通\n`;

  if (footerText) {
    doc += `\n${footerText}\n`;
  }

  if (options.includeScript && questionBlocks.length === 0) {
    doc += '\n⚠️ 暂无问题，请先在脚本编辑中添加问题模块。\n';
  }

  return doc;
};

export const exportPublishDescription = (
  topic: Topic,
  scriptBlocks: ScriptBlock[],
  timelineItems: TimelineItem[],
  materials: Material[],
  options: ExportOptions,
  titleFormat?: string,
  footerText?: string
): string => {
  const openingBlock = scriptBlocks.find(b => b.topicId === topic.id && b.type === 'opening');
  const closingBlock = scriptBlocks.find(b => b.topicId === topic.id && b.type === 'closing');
  const questionBlocks = scriptBlocks.filter(b => b.topicId === topic.id && b.type === 'question');
  const refs = materials.filter(m => m.topicId === topic.id && m.type === 'reference');
  const todos = materials.filter(m => m.topicId === topic.id && m.type === 'todo');
  const filteredTodos = options.includeUnconfirmed ? todos : todos.filter(t => t.confirmed);

  const items = timelineItems
    .filter(t => t.topicId === topic.id)
    .sort((a, b) => a.startTime - b.startTime);

  const totalDuration = items.reduce((sum, item) => sum + item.duration, 0);

  const title = titleFormat?.replace('{title}', topic.title) || `🎙️ ${topic.title}`;

  let desc = `${title}\n`;
  desc += `${'='.repeat(50)}\n\n`;

  if (options.includeTimeline && totalDuration > 0) {
    desc += `⏱️  时长: ${formatDuration(totalDuration)}\n\n`;
  }

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

  if (options.includeTimeline && items.length > 0) {
    desc += `${'='.repeat(50)}\n`;
    desc += `🎬 节目大纲\n`;
    desc += `${'='.repeat(50)}\n\n`;
    desc += renderTimelineWithMarkers(items, options);
    desc += '\n';
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

  if (footerText) {
    desc += `${footerText}\n\n`;
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

export const generateChecklistItems = (
  topic: Topic,
  scriptBlocks: ScriptBlock[],
  timelineItems: TimelineItem[],
  materials: Material[]
): { type: string; title: string; description: string }[] => {
  const items: { type: string; title: string; description: string }[] = [];
  const topicId = topic.id;

  const emptyScripts = scriptBlocks.filter(b => b.topicId === topicId && !b.content.trim());
  if (emptyScripts.length > 0) {
    items.push({
      type: 'empty-script',
      title: `补全 ${emptyScripts.length} 个空脚本段落`,
      description: emptyScripts.map(b => `• ${b.title}`).join('\n')
    });
  }

  const unconfirmedMaterials = materials.filter(m => m.topicId === topicId && !m.confirmed);
  if (unconfirmedMaterials.length > 0) {
    items.push({
      type: 'unconfirmed-material',
      title: `确认 ${unconfirmedMaterials.length} 项待确认素材`,
      description: unconfirmedMaterials.map(m => `• ${m.title}`).join('\n')
    });
  }

  const totalDuration = timelineItems.filter(t => t.topicId === topicId).reduce((sum, t) => sum + t.duration, 0);
  items.push({
    type: 'timeline-duration',
    title: `确认总时长: ${formatDuration(totalDuration)}`,
    description: `时间轴共 ${timelineItems.filter(t => t.topicId === topicId).length} 个时段`
  });

  const adMarkers = timelineItems.filter(t => t.topicId === topicId && t.type === 'ad');
  if (adMarkers.length > 0) {
    items.push({
      type: 'ad-marker',
      title: `确认 ${adMarkers.length} 个广告时段`,
      description: adMarkers.map(a => `• ${a.title} (${formatDuration(a.duration)})`).join('\n')
    });
  }

  const musicMarkers = timelineItems.filter(t => t.topicId === topicId && t.marker === 'music');
  if (musicMarkers.length > 0) {
    items.push({
      type: 'music-marker',
      title: `确认 ${musicMarkers.length} 个音乐标记`,
      description: musicMarkers.map(m => `• ${m.title}`).join('\n')
    });
  }

  const voiceoverMarkers = timelineItems.filter(t => t.topicId === topicId && t.marker === 'voiceover');
  if (voiceoverMarkers.length > 0) {
    items.push({
      type: 'voiceover-marker',
      title: `确认 ${voiceoverMarkers.length} 个口播标记`,
      description: voiceoverMarkers.map(v => `• ${v.title}`).join('\n')
    });
  }

  return items;
};
