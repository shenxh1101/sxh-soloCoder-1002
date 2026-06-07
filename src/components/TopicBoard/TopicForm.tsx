import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Tag } from '../ui/Tag';
import { usePodcastStore } from '@/store/usePodcastStore';
import type { Priority, TopicStatus } from '@/types';
import { PRIORITY_LEVELS } from '@/types';
interface TopicFormProps {
  onClose?: () => void;
  initialStatus?: TopicStatus;
}
export function TopicForm({ onClose, initialStatus = 'todo' }: TopicFormProps) {
 const addTopic = usePodcastStore((state) => state.addTopic);
 const [title, setTitle] = useState('');
 const [description, setDescription] = useState('');
 const [guest, setGuest] = useState('');
 const [priority, setPriority] = useState<Priority>('medium');
 const [tagInput, setTagInput] = useState('');
 const [tags, setTags] = useState<string[]>([]);
 const [status, setStatus] = useState<TopicStatus>(initialStatus);
 const handleAddTag = (e: React.KeyboardEvent) => {
 if (e.key === 'Enter' && tagInput.trim()) {
 e.preventDefault();
 if (!tags.includes(tagInput.trim())) {
 setTags([...tags, tagInput.trim()]);
 }
 setTagInput('');
 }
 };
 const handleRemoveTag = (tagToRemove: string) => {
 setTags(tags.filter((t) => t !== tagToRemove));
 };
 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!title.trim())
 return;
 addTopic({
 title: title.trim(),
 description: description.trim(),
 status,
 guest: guest.trim(),
 priority,
 tags,
 });
 setTitle('');
 setDescription('');
 setGuest('');
 setPriority('medium');
 setTags([]);
 onClose?.();
 };
 return (<form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-slate-300 mb-1">
 主题标题 *
 </label>
 <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="输入本期播客主题" autoFocus/>
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-300 mb-1">
 主题描述
 </label>
 <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="简要描述本期内容" rows={3}/>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-slate-300 mb-1">
 嘉宾
 </label>
 <Input value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="嘉宾姓名"/>
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-300 mb-1">
 优先级
 </label>
 <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full h-10 rounded-lg border border-slate-600/50 bg-slate-900/50 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50">
 {PRIORITY_LEVELS.map(p => (<option key={p.value} value={p.value}>
 {p.label}
 </option>))}
 </select>
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-300 mb-1">
 标签
 </label>
 <div className="flex flex-wrap gap-2 mb-2">
 {tags.map((tag) => (<Tag key={tag} variant="info" removable onRemove={() => handleRemoveTag(tag)}>
 {tag}
 </Tag>))}
 </div>
 <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="输入标签后按回车"/>
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-300 mb-1">
 状态
 </label>
 <select value={status} onChange={(e) => setStatus(e.target.value as TopicStatus)} className="w-full h-10 rounded-lg border border-slate-600/50 bg-slate-900/50 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50">
 <option value="todo">待开发</option>
 <option value="in-progress">进行中</option>
 <option value="done">已完成</option>
 </select>
 </div>

 <div className="flex justify-end gap-2 pt-2">
 {onClose && (<Button type="button" variant="ghost" onClick={onClose}>
 <X size={16}/>
 取消
 </Button>)}
 <Button type="submit" disabled={!title.trim()}>
 <Plus size={16}/>
 创建选题
 </Button>
 </div>
 </form>);
}

