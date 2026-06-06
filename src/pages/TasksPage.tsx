import {
  AlertCircle,
  Check,
  CheckCircle,
  Circle,
  Edit2,
  ListTodo,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useTasks } from '../context/TasksContext';
import type { Priority } from '../types/tasks';

export default function TasksPage() {
  const {
    categories,
    tasks,
    newTaskText,
    setNewTaskText,
    newTaskCategory,
    setNewTaskCategory,
    newTaskPriority,
    setNewTaskPriority,
    newTaskDueDate,
    setNewTaskDueDate,
    newCategoryName,
    setNewCategoryName,
    editingCategoryId,
    setEditingCategoryId,
    editCategoryName,
    setEditCategoryName,
    categoryFilter,
    setCategoryFilter,
    categoryError,
    setCategoryError,
    filteredTasks,
    handleAddTask,
    toggleTask,
    deleteTask,
    handleCreateCategory,
    startEditingCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  } = useTasks();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ListTodo className="h-6 w-6 text-indigo-400" /> Tasks
        </h2>
        <p className="text-slate-400 text-sm">Track to-dos, projects, and action items by category and priority.</p>
      </div>

      {categoryError && (
        <div className="w-full p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{categoryError}</span>
          </span>
          <button onClick={() => setCategoryError('')} className="text-slate-400 hover:text-slate-200 font-bold">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/30 rounded-2xl p-6 border border-slate-800/80 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" /> Category Manager
            </h3>

            <form onSubmit={handleCreateCategory} className="flex space-x-2">
              <input
                type="text"
                required
                placeholder="Add dynamic category..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Create
              </button>
            </form>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-900 text-xs">
                  {editingCategoryId === cat.id ? (
                    <div className="flex items-center space-x-1.5 w-full">
                      <input
                        type="text"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded p-1 text-white text-[11px]"
                        value={editCategoryName}
                        onChange={e => setEditCategoryName(e.target.value)}
                      />
                      <button
                        onClick={() => handleUpdateCategory(cat.id)}
                        className="text-emerald-400 hover:text-emerald-300 p-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingCategoryId(null)}
                        className="text-slate-400 hover:text-slate-300 p-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-slate-300">{cat.name}</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => startEditingCategory(cat)}
                          className="text-slate-400 hover:text-indigo-400 p-1 transition-all"
                          title="Edit category"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className={`p-1 transition-all ${categories.length <= 1 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:text-rose-400'}`}
                          title="Delete category"
                          disabled={categories.length <= 1}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/30 rounded-2xl p-6 border border-slate-800/80 space-y-4">
            <h3 className="font-bold text-white text-sm">New Task</h3>
            <form onSubmit={handleAddTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Task Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gym Session, Pay credit card"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none"
                    value={newTaskCategory}
                    onChange={e => setNewTaskCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Priority</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none"
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as Priority)}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Due Date (Optional)</label>
                <input
                  type="date"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                  value={newTaskDueDate}
                  onChange={e => setNewTaskDueDate(e.target.value)}
                />
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all">
                Add Task
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8 bg-slate-900/30 rounded-2xl p-6 border border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-base">Task Queue</h3>
              <p className="text-slate-400 text-xs">{tasks.length} total · {tasks.filter(t => !t.completed).length} pending</p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs max-w-full overflow-x-auto">
              <button
                onClick={() => setCategoryFilter('All')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${categoryFilter === 'All' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.name)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${categoryFilter === cat.name ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                  task.completed
                    ? 'bg-slate-950/40 border-slate-900/50 opacity-60'
                    : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="text-slate-400 hover:text-white transition-all"
                  >
                    {task.completed ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>
                  <div>
                    <p className={`text-xs font-semibold ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {task.text}
                    </p>
                    <div className="flex space-x-2 mt-1 items-center">
                      <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded text-indigo-400 font-medium">
                        {task.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Due: {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                    task.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                    task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="text-center py-8 bg-slate-900/10 rounded-xl border border-dashed border-slate-800">
                <p className="text-sm text-slate-500">No tasks found for this selection.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
