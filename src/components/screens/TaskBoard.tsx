'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, TrendingUp, AlertTriangle, Filter, MessageSquare, Edit, UserPlus, Calendar as CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Task, TaskAnalytics, Agent } from '@/lib/types/tasks';
import { fetchTasks, fetchTaskAnalytics, approveTask, rejectTask, addComment } from '@/lib/api/tasks';

const agents: Agent[] = [
  { id: 'main', name: 'Rick Sanchez', color: '#3b82f6', initial: 'R', department: 'Leadership' },
  { id: 'popeye', name: 'Cleopatra', color: '#22c55e', initial: 'C', department: 'Health' },
  { id: 'nico', name: 'El Father', color: '#f59e0b', initial: 'E', department: 'Research' },
  { id: 'together', name: 'Dr. Ashley', color: '#a855f7', initial: 'A', department: 'Therapy' },
  { id: 'tesla', name: 'Tesla', color: '#06b6d4', initial: 'T', department: 'Education' },
];

const priorityConfig = {
  high: { color: 'bg-red-500', label: 'High', labelBg: 'bg-red-500/10', labelText: 'text-red-400' },
  medium: { color: 'bg-amber-500', label: 'Medium', labelBg: 'bg-amber-500/10', labelText: 'text-amber-400' },
  low: { color: 'bg-blue-500', label: 'Low', labelBg: 'bg-blue-500/10', labelText: 'text-blue-400' },
};

const departments = ['All', 'Leadership', 'Health', 'Research', 'Therapy', 'Education', 'Engineering'];

type ViewMode = 'all' | 'myReview' | 'overdue';

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [taskToReject, setTaskToReject] = useState<Task | null>(null);
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterDept, setFilterDept] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadData();
    requestNotificationPermission();
    
    // Poll for new tasks every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    const [tasksData, analyticsData] = await Promise.all([
      fetchTasks(),
      fetchTaskAnalytics(),
    ]);
    
    // Check for new review tasks and notify
    if (notificationsEnabled && tasks.length > 0) {
      const newReviewTasks = tasksData.filter(
        t => t.status === 'review' && !tasks.find(old => old.id === t.id && old.status === 'review')
      );
      newReviewTasks.forEach(task => {
        showNotification(`New task in Review: ${task.title}`);
      });
    }
    
    setTasks(tasksData);
    setAnalytics(analyticsData);
  }

  async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    } else if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }

  function showNotification(message: string) {
    if (notificationsEnabled && 'Notification' in window) {
      new Notification('Mission Control - Task Board', {
        body: message,
        icon: '/favicon.ico',
      });
    }
  }

  async function handleApprove(task: Task) {
    try {
      await approveTask(task.id);
      await loadData();
      showNotification(`Task approved: ${task.title}`);
    } catch (error) {
      console.error('Failed to approve task:', error);
    }
  }

  function handleRejectClick(task: Task) {
    setTaskToReject(task);
    setRejectionReason('');
    setRejectModalOpen(true);
  }

  async function handleRejectSubmit() {
    if (!taskToReject || !rejectionReason.trim()) return;
    
    try {
      await rejectTask(taskToReject.id, rejectionReason);
      setRejectModalOpen(false);
      setTaskToReject(null);
      setRejectionReason('');
      await loadData();
      showNotification(`Task rejected: ${taskToReject.title}`);
    } catch (error) {
      console.error('Failed to reject task:', error);
    }
  }

  function getFilteredTasks() {
    return tasks.filter(task => {
      if (filterAgent !== 'all' && task.assignee !== filterAgent) return false;
      if (filterDept !== 'All' && task.department !== filterDept) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      
      if (viewMode === 'myReview') {
        return task.status === 'review';
      } else if (viewMode === 'overdue') {
        return task.deadline && new Date(task.deadline) < new Date();
      }
      
      return true;
    });
  }

  function groupTasksByStatus() {
    const filtered = getFilteredTasks();
    return {
      backlog: filtered.filter(t => t.status === 'backlog'),
      'in-progress': filtered.filter(t => t.status === 'in-progress'),
      review: filtered.filter(t => t.status === 'review'),
      done: filtered.filter(t => t.status === 'done'),
    };
  }

  const columns = [
    { id: 'backlog', label: 'Backlog' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' },
  ];

  const tasksByStatus = groupTasksByStatus();

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
          Mission Control › Task Board
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Task Board</h1>
        <p className="text-sm text-zinc-500 mt-1">Track and manage tasks across your fleet</p>
      </div>

      {/* Analytics Header */}
      {analytics && (
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            icon={<Clock className="w-5 h-5 text-blue-400" />}
            label="Tasks Today"
            value={analytics.tasksToday}
            bgColor="bg-blue-500/10"
          />
          <MetricCard
            icon={<TrendingUp className="w-5 h-5 text-green-400" />}
            label="This Week"
            value={analytics.tasksThisWeek}
            bgColor="bg-green-500/10"
          />
          <MetricCard
            icon={<CheckCircle2 className="w-5 h-5 text-purple-400" />}
            label="Completion Rate"
            value={`${analytics.completionRate}%`}
            bgColor="bg-purple-500/10"
          />
          <MetricCard
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            label="Avg Time in Review"
            value={`${analytics.avgTimeInReview}h`}
            bgColor="bg-amber-500/10"
          />
        </div>
      )}

      {/* Blocked Tasks Alert */}
      {analytics && analytics.blockedTasks > 0 && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">
              {analytics.blockedTasks} blocked task{analytics.blockedTasks !== 1 ? 's' : ''} need attention
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-400">Filters:</span>
        </div>
        
        <Select value={filterAgent} onValueChange={setFilterAgent}>
          <SelectTrigger className="w-[180px] bg-[#18181b] border-[#27272a]">
            <SelectValue placeholder="All Agents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {agents.map(agent => (
              <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-[180px] bg-[#18181b] border-[#27272a]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[180px] bg-[#18181b] border-[#27272a]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 ml-auto">
          <Button
            variant={viewMode === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('all')}
          >
            All
          </Button>
          <Button
            variant={viewMode === 'myReview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('myReview')}
          >
            My Review Queue
          </Button>
          <Button
            variant={viewMode === 'overdue' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('overdue')}
          >
            Overdue
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-6">
        {columns.map((col) => (
          <div key={col.id} className="space-y-3">
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 mb-4">
              <div className="flex items-center gap-2.5">
                <h3 className="text-[13px] font-semibold text-zinc-300">{col.label}</h3>
                <span className="text-[11px] w-5 h-5 rounded-md bg-[#27272a] text-zinc-400 font-medium flex items-center justify-center">
                  {tasksByStatus[col.id as keyof typeof tasksByStatus].length}
                </span>
              </div>
            </div>

            {/* Task Cards */}
            <div className="space-y-3">
              {tasksByStatus[col.id as keyof typeof tasksByStatus].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  agents={agents}
                  onApprove={col.id === 'review' ? handleApprove : undefined}
                  onReject={col.id === 'review' ? handleRejectClick : undefined}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rejection Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="bg-[#18181b] border-[#27272a]">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Task</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Please explain why you're rejecting "{taskToReject?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-zinc-300">Reason for rejection</Label>
              <Textarea
                id="reason"
                placeholder="Explain what needs to be changed..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[120px] bg-[#09090b] border-[#27272a] text-white placeholder:text-zinc-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={!rejectionReason.trim()}
            >
              Submit Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          agents={agents}
          onClose={() => setSelectedTask(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
}

function MetricCard({ icon, label, value, bgColor }: MetricCardProps) {
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 hover:border-[#3f3f46] transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-zinc-500">{label}</p>
          <p className="text-2xl font-semibold text-white mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  agents: Agent[];
  onApprove?: (task: Task) => void;
  onReject?: (task: Task) => void;
  onClick: () => void;
}

function TaskCard({ task, agents, onApprove, onReject, onClick }: TaskCardProps) {
  const agent = agents.find(a => a.id === task.assignee);
  const priority = priorityConfig[task.priority];

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 hover:border-[#3f3f46] hover:bg-[#1f1f23] transition-colors group">
      {/* Priority + Title */}
      <div 
        className="flex items-start gap-2.5 mb-2.5 cursor-pointer"
        onClick={onClick}
      >
        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${priority.color}`}></span>
        <h4 className="text-[13px] font-semibold text-white leading-snug">{task.title}</h4>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-500 mb-4 leading-relaxed pl-4 cursor-pointer" onClick={onClick}>
        {task.description}
      </p>

      {/* Approve/Reject Buttons (Review column only) */}
      {onApprove && onReject && (
        <div className="flex gap-2 mb-3 pl-4">
          <Button
            size="sm"
            className="flex-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20"
            onClick={(e) => {
              e.stopPropagation();
              onApprove(task);
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
            onClick={(e) => {
              e.stopPropagation();
              onReject(task);
            }}
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            Reject
          </Button>
        </div>
      )}

      {/* Footer: Tag + Assignee */}
      <div className="flex items-center justify-between pl-4">
        <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${priority.labelBg} ${priority.labelText}`}>
          {task.tag}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
            {agent?.name}
          </span>
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: agent?.color || '#6b7280' }}
          >
            <span className="text-white text-[10px] font-semibold">{agent?.initial}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TaskDetailsModalProps {
  task: Task;
  agents: Agent[];
  onClose: () => void;
  onUpdate: () => void;
}

function TaskDetailsModal({ task, agents, onClose, onUpdate }: TaskDetailsModalProps) {
  const [comment, setComment] = useState('');
  const agent = agents.find(a => a.id === task.assignee);

  async function handleAddComment() {
    if (!comment.trim()) return;
    try {
      await addComment(task.id, comment);
      setComment('');
      await onUpdate();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#18181b] border-[#27272a] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{task.title}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Created {new Date(task.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Description</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">{task.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-zinc-500 mb-1">Assignee</h4>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: agent?.color || '#6b7280' }}
                >
                  <span className="text-white text-[10px] font-semibold">{agent?.initial}</span>
                </div>
                <span className="text-sm text-white">{agent?.name}</span>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-zinc-500 mb-1">Priority</h4>
              <span className={`text-xs px-2 py-1 rounded-md font-medium ${priorityConfig[task.priority].labelBg} ${priorityConfig[task.priority].labelText}`}>
                {priorityConfig[task.priority].label}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-medium text-zinc-500 mb-1">Status</h4>
              <span className="text-sm text-white capitalize">{task.status.replace('-', ' ')}</span>
            </div>
            {task.deadline && (
              <div>
                <h4 className="text-xs font-medium text-zinc-500 mb-1">Deadline</h4>
                <span className="text-sm text-white">
                  {new Date(task.deadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* History */}
          {task.history && task.history.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-zinc-300 mb-3">History</h4>
              <div className="space-y-2">
                {task.history.map(entry => (
                  <div key={entry.id} className="flex gap-3 text-xs">
                    <span className="text-zinc-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                    <span className="text-zinc-400">{entry.action}</span>
                    <span className="text-zinc-500">by {entry.user}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {task.files && task.files.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-zinc-300 mb-3">Files</h4>
              <div className="space-y-2">
                {task.files.map(file => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    {file.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Comments</h4>
            <div className="space-y-3 mb-4">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map(c => (
                  <div key={c.id} className="bg-[#09090b] border border-[#27272a] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-zinc-300">{c.author}</span>
                      <span className="text-xs text-zinc-500">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400">{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 italic">No comments yet</p>
              )}
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bg-[#09090b] border-[#27272a] text-white placeholder:text-zinc-600"
              />
              <Button onClick={handleAddComment} disabled={!comment.trim()}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Quick Actions</h4>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline">
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
              <Button size="sm" variant="outline">
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Reassign
              </Button>
              <Button size="sm" variant="outline">
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                Set Deadline
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
