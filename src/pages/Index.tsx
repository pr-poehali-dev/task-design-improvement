import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TaskStatus = 'pending' | 'in-progress' | 'completed';

interface Tag {
  id: string;
  name: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  tags: string[];
  subtasks: Subtask[];
  expanded: boolean;
}

const statusConfig = {
  pending: { label: 'В ожидании', icon: 'Circle', color: 'text-muted-foreground' },
  'in-progress': { label: 'В работе', icon: 'CircleDot', color: 'text-foreground' },
  completed: { label: 'Завершено', icon: 'CheckCircle2', color: 'text-foreground' },
};

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Разработать дизайн-систему',
      status: 'in-progress',
      tags: ['дизайн', 'срочно'],
      subtasks: [
        { id: '1-1', title: 'Выбрать цветовую палитру', completed: true },
        { id: '1-2', title: 'Создать компоненты', completed: false },
        { id: '1-3', title: 'Написать документацию', completed: false },
      ],
      expanded: true,
    },
    {
      id: '2',
      title: 'Настроить CI/CD',
      status: 'pending',
      tags: ['разработка'],
      subtasks: [
        { id: '2-1', title: 'Настроить GitHub Actions', completed: false },
        { id: '2-2', title: 'Добавить тесты', completed: false },
      ],
      expanded: false,
    },
  ]);

  const [availableTags] = useState<Tag[]>([
    { id: '1', name: 'дизайн' },
    { id: '2', name: 'разработка' },
    { id: '3', name: 'срочно' },
    { id: '4', name: 'документация' },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: 'pending',
      tags: [],
      subtasks: [],
      expanded: false,
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const toggleTaskExpanded = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, expanded: !task.expanded } : task
      )
    );
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            ),
          };
        }
        return task;
      })
    );
  };

  const addSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: [
              ...task.subtasks,
              {
                id: `${taskId}-${Date.now()}`,
                title,
                completed: false,
              },
            ],
          };
        }
        return task;
      })
    );
  };

  const toggleTag = (taskId: string, tagName: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const hasTag = task.tags.includes(tagName);
          return {
            ...task,
            tags: hasTag
              ? task.tags.filter((t) => t !== tagName)
              : [...task.tags, tagName],
          };
        }
        return task;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
          };
        }
        return task;
      })
    );
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesTag = filterTag === 'all' || task.tags.includes(filterTag);
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesTag && matchesStatus;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Задачи
          </h1>
          <div className="flex gap-3 text-sm text-muted-foreground">
            <span>Всего: {stats.total}</span>
            <span>•</span>
            <span>В работе: {stats.inProgress}</span>
            <span>•</span>
            <span>Завершено: {stats.completed}</span>
          </div>
        </header>

        <Card className="p-4 space-y-4 border shadow-sm">
          <div className="flex gap-2">
            <Input
              placeholder="Новая задача..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              className="flex-1"
            />
            <Button onClick={addTask} size="icon" variant="default">
              <Icon name="Plus" size={18} />
            </Button>
          </div>

          <div className="flex gap-2">
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Все теги" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все теги</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.name}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">В ожидании</SelectItem>
                <SelectItem value="in-progress">В работе</SelectItem>
                <SelectItem value="completed">Завершено</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              availableTags={availableTags}
              onToggleExpanded={() => toggleTaskExpanded(task.id)}
              onUpdateStatus={(status) => updateTaskStatus(task.id, status)}
              onToggleSubtask={(subtaskId) =>
                toggleSubtask(task.id, subtaskId)
              }
              onAddSubtask={(title) => addSubtask(task.id, title)}
              onToggleTag={(tagName) => toggleTag(task.id, tagName)}
              onDelete={() => deleteTask(task.id)}
              onDeleteSubtask={(subtaskId) => deleteSubtask(task.id, subtaskId)}
            />
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="Inbox" size={48} className="mx-auto mb-3 opacity-30" />
              <p>Нет задач</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  availableTags: Tag[];
  onToggleExpanded: () => void;
  onUpdateStatus: (status: TaskStatus) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onAddSubtask: (title: string) => void;
  onToggleTag: (tagName: string) => void;
  onDelete: () => void;
  onDeleteSubtask: (subtaskId: string) => void;
}

const TaskCard = ({
  task,
  availableTags,
  onToggleExpanded,
  onUpdateStatus,
  onToggleSubtask,
  onAddSubtask,
  onToggleTag,
  onDelete,
  onDeleteSubtask,
}: TaskCardProps) => {
  const [subtaskInput, setSubtaskInput] = useState('');
  const [showTagMenu, setShowTagMenu] = useState(false);

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      onAddSubtask(subtaskInput);
      setSubtaskInput('');
    }
  };

  const statusInfo = statusConfig[task.status];
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <div className="space-y-0">
      <Card className="p-5 border-2 shadow-sm hover:shadow-md transition-all bg-card">
        <div className="flex items-start gap-4">
          <button
            onClick={onToggleExpanded}
            className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <Icon
              name={task.expanded ? 'ChevronDown' : 'ChevronRight'}
              size={22}
            />
          </button>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg font-semibold text-foreground leading-tight">
                  {task.title}
                </h3>
                <div className="text-xs text-muted-foreground">
                  Основная задача {totalSubtasks > 0 && `• ${completedSubtasks}/${totalSubtasks} выполнено`}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                onClick={onDelete}
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Select value={task.status} onValueChange={(v) => onUpdateStatus(v as TaskStatus)}>
                <SelectTrigger className="w-[150px] h-9 text-sm border-2">
                  <div className="flex items-center gap-2">
                    <Icon name={statusInfo.icon} size={16} className={statusInfo.color} />
                    <span>{statusInfo.label}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon name={config.icon} size={16} className={config.color} />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1.5 flex-wrap">
                {task.tags.map((tagName) => (
                  <Badge
                    key={tagName}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-accent px-2.5 py-1"
                    onClick={() => onToggleTag(tagName)}
                  >
                    {tagName}
                    <Icon name="X" size={12} className="ml-1.5" />
                  </Badge>
                ))}
                
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setShowTagMenu(!showTagMenu)}
                  >
                    <Icon name="Tag" size={14} className="mr-1" />
                    Добавить тег
                  </Button>
                  
                  {showTagMenu && (
                    <Card className="absolute top-full left-0 mt-1 p-2 space-y-1 z-10 min-w-[160px] shadow-lg border-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => {
                            onToggleTag(tag.name);
                            setShowTagMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                        >
                          {tag.name}
                        </button>
                      ))}
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {task.expanded && task.subtasks.length > 0 && (
        <div className="ml-10 mt-2 space-y-1 animate-accordion-down">
          {task.subtasks.map((subtask, index) => (
            <div
              key={subtask.id}
              className="relative"
            >
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border" style={{ left: '11px' }} />
              <div className="absolute left-0 top-1/2 w-6 h-0.5 bg-border" style={{ left: '11px' }} />
              
              <Card className="ml-6 p-3 bg-muted/30 border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 group">
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => onToggleSubtask(subtask.id)}
                    className="shrink-0"
                  />
                  <span
                    className={`text-sm flex-1 ${
                      subtask.completed
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {subtask.title}
                  </span>
                  <span className="text-xs text-muted-foreground mr-1">
                    Подзадача {index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => onDeleteSubtask(subtask.id)}
                  >
                    <Icon name="X" size={14} />
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {task.expanded && (
        <div className="ml-10 mt-2">
          <div className="ml-6 flex gap-2">
            <Input
              placeholder="Добавить подзадачу..."
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
              className="h-9 text-sm bg-background"
            />
            <Button
              onClick={handleAddSubtask}
              size="sm"
              variant="ghost"
              className="h-9 px-3"
            >
              <Icon name="Plus" size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
