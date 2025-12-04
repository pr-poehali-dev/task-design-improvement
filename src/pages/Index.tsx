import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type TaskStatus = 'pending' | 'in-progress' | 'completed';

interface Tag {
  id: string;
  name: string;
}

interface Subtask {
  id: string;
  title: string;
  status: TaskStatus;
  subtasks: Subtask[];
}

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  tags: string[];
  subtasks: Subtask[];
}

const statusConfig = {
  pending: { label: 'В ожидании', icon: 'Circle', bgColor: 'bg-slate-800', borderColor: 'border-purple-500/50', iconColor: 'text-purple-400' },
  'in-progress': { label: 'В работе', icon: 'Circle', bgColor: 'bg-purple-600', borderColor: 'border-purple-500', iconColor: 'text-white' },
  completed: { label: 'Завершено', icon: 'Check', bgColor: 'bg-emerald-600', borderColor: 'border-emerald-500', iconColor: 'text-white' },
};

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'MOSCOW',
      status: 'completed',
      tags: ['дизайн'],
      subtasks: [
        {
          id: '1-1',
          title: 'aa',
          status: 'completed',
          subtasks: [
            { id: '1-1-1', title: 'fgsfgsfg', status: 'pending', subtasks: [] },
          ],
        },
        {
          id: '1-2',
          title: 'fgfsfg',
          status: 'pending',
          subtasks: [
            { id: '1-2-1', title: 'gfg', status: 'pending', subtasks: [] },
            { id: '1-2-2', title: 'fgfgfg', status: 'pending', subtasks: [] },
          ],
        },
        {
          id: '1-3',
          title: 'gfgdfg',
          status: 'pending',
          subtasks: [],
        },
        {
          id: '1-4',
          title: 'fggfefefef',
          status: 'pending',
          subtasks: [],
        },
      ],
    },
  ]);

  const [availableTags] = useState<Tag[]>([
    { id: '1', name: 'дизайн' },
    { id: '2', name: 'разработка' },
    { id: '3', name: 'срочно' },
  ]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const updateSubtaskStatus = (taskId: string, path: number[], status: TaskStatus) => {
    setTasks(tasks.map(task => {
      if (task.id !== taskId) return task;
      
      const updateNested = (items: Subtask[], pathIndex: number): Subtask[] => {
        if (pathIndex >= path.length) return items;
        
        return items.map((item, idx) => {
          if (idx === path[pathIndex]) {
            if (pathIndex === path.length - 1) {
              return { ...item, status };
            }
            return { ...item, subtasks: updateNested(item.subtasks, pathIndex + 1) };
          }
          return item;
        });
      };
      
      return { ...task, subtasks: updateNested(task.subtasks, 0) };
    }));
  };

  const addSubtask = (taskId: string, path: number[], title: string) => {
    if (!title.trim()) return;
    
    setTasks(tasks.map(task => {
      if (task.id !== taskId) return task;
      
      const newSubtask: Subtask = {
        id: `${taskId}-${Date.now()}`,
        title,
        status: 'pending',
        subtasks: [],
      };
      
      const addNested = (items: Subtask[], pathIndex: number): Subtask[] => {
        if (pathIndex >= path.length) {
          return [...items, newSubtask];
        }
        
        return items.map((item, idx) => {
          if (idx === path[pathIndex]) {
            return { ...item, subtasks: addNested(item.subtasks, pathIndex + 1) };
          }
          return item;
        });
      };
      
      return { ...task, subtasks: addNested(task.subtasks, 0) };
    }));
  };

  const addNewTask = () => {
    const title = prompt('Название задачи:');
    if (!title?.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      status: 'pending',
      tags: [],
      subtasks: [],
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-white">Задачи</h1>
          <Button onClick={addNewTask} className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30">
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить задачу
          </Button>
        </header>

        <div className="space-y-16">
          {tasks.map((task) => (
            <div key={task.id} className="relative pl-8">
              <TaskTreeNode
                task={task}
                node={{ id: task.id, title: task.title, status: task.status, subtasks: task.subtasks }}
                path={[]}
                onStatusChange={(path, status) => {
                  if (path.length === 0) {
                    setTasks(tasks.map(t => t.id === task.id ? { ...t, status } : t));
                  } else {
                    updateSubtaskStatus(task.id, path, status);
                  }
                }}
                onAddSubtask={(path, title) => addSubtask(task.id, path, title)}
                onNodeClick={() => setSelectedTask(task)}
                isRoot
              />
            </div>
          ))}
        </div>

        {selectedTask && (
          <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Детали задачи</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Название</label>
                  <p className="text-lg mt-1">{selectedTask.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Статус</label>
                  <Select 
                    value={selectedTask.status} 
                    onValueChange={(v) => {
                      setTasks(tasks.map(t => 
                        t.id === selectedTask.id ? { ...t, status: v as TaskStatus } : t
                      ));
                      setSelectedTask({ ...selectedTask, status: v as TaskStatus });
                    }}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Теги</label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {selectedTask.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

interface TreeNodeProps {
  task: Task;
  node: { id: string; title: string; status: TaskStatus; subtasks: Subtask[] };
  path: number[];
  onStatusChange: (path: number[], status: TaskStatus) => void;
  onAddSubtask: (path: number[], title: string) => void;
  onNodeClick: () => void;
  isRoot?: boolean;
}

const TaskTreeNode = ({ 
  task,
  node, 
  path, 
  onStatusChange, 
  onAddSubtask,
  onNodeClick,
  isRoot = false 
}: TreeNodeProps) => {
  const [showAddInput, setShowAddInput] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  const statusInfo = statusConfig[node.status];
  const hasSubtasks = node.subtasks.length > 0;

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(path, newSubtaskTitle);
      setNewSubtaskTitle('');
      setShowAddInput(false);
    }
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const statuses: TaskStatus[] = ['pending', 'in-progress', 'completed'];
    const currentIndex = statuses.indexOf(node.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    onStatusChange(path, nextStatus);
  };

  return (
    <div className="relative flex items-start gap-12">
      <div className="flex flex-col items-center gap-3 relative z-10">
        <button
          onClick={handleStatusClick}
          className={`w-16 h-16 rounded-full border-4 ${statusInfo.bgColor} ${statusInfo.borderColor} flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 cursor-pointer`}
        >
          {node.status === 'completed' ? (
            <Icon name="Check" size={28} className={statusInfo.iconColor} />
          ) : node.status === 'in-progress' ? (
            <div className="w-5 h-5 rounded-full bg-white" />
          ) : (
            <Icon name="Plus" size={28} className={statusInfo.iconColor} />
          )}
        </button>
        
        <button
          onClick={onNodeClick}
          className="bg-slate-800 border-2 border-purple-500/30 rounded-full px-5 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700 hover:border-purple-500/50 transition-all shadow-lg shadow-purple-500/10 min-w-[100px]"
        >
          {node.title}
        </button>

        {!showAddInput && (
          <button
            onClick={() => setShowAddInput(true)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            + подзадача
          </button>
        )}

        {showAddInput && (
          <div className="flex flex-col gap-2 items-center">
            <Input
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSubtask();
                if (e.key === 'Escape') setShowAddInput(false);
              }}
              placeholder="Название..."
              className="h-8 text-xs w-36"
              autoFocus
            />
            <div className="flex gap-1">
              <Button size="sm" onClick={handleAddSubtask} className="h-7 px-3 bg-purple-600 hover:bg-purple-700">
                <Icon name="Check" size={14} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowAddInput(false)}
                className="h-7 px-3"
              >
                <Icon name="X" size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {hasSubtasks && (
        <div className="flex-1 space-y-8 pt-6">
          {node.subtasks.map((subtask, index) => (
            <div key={subtask.id} className="relative">
              <svg
                className="absolute pointer-events-none"
                style={{ 
                  width: '140px', 
                  height: '100px',
                  left: '-140px',
                  top: '-20px',
                }}
              >
                <defs>
                  <linearGradient id={`gradient-${node.id}-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#A78BFA', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 0.6 }} />
                  </linearGradient>
                </defs>
                <path
                  d="M 20 30 Q 70 30, 100 60"
                  fill="none"
                  stroke={`url(#gradient-${node.id}-${index})`}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <line
                  x1="100"
                  y1="60"
                  x2="140"
                  y2="60"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  opacity="0.4"
                  strokeDasharray="6,4"
                />
                <circle cx="140" cy="60" r="5" fill="#A78BFA" opacity="0.8" />
              </svg>

              <TaskTreeNode
                task={task}
                node={subtask}
                path={[...path, index]}
                onStatusChange={onStatusChange}
                onAddSubtask={onAddSubtask}
                onNodeClick={onNodeClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;