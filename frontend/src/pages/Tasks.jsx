import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Search, Pencil, Trash2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import TaskModal from '../components/dashboard/TaskModal';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>
    {status === 'in-progress' ? 'In Progress' : status === 'todo' ? 'To Do' : 'Done'}
  </span>
);

const PriorityBadge = ({ priority }) => (
  <span className={`badge badge-${priority}`}>{priority}</span>
);

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Search & filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const searchTimeout = useRef(null);

  const fetchTasks = useCallback(async (q = search, status = statusFilter, priority = priorityFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      if (priority) params.set('priority', priority);
      const { data } = await api.get(`/tasks?${params}`);
      setTasks(data.tasks);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => { fetchTasks(); }, []);

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setSearch(v);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchTasks(v, statusFilter, priorityFilter), 400);
  };

  const handleStatusFilter = (e) => {
    const v = e.target.value;
    setStatusFilter(v);
    fetchTasks(search, v, priorityFilter);
  };

  const handlePriorityFilter = (e) => {
    const v = e.target.value;
    setPriorityFilter(v);
    fetchTasks(search, statusFilter, v);
  };

  const openCreate = () => { setEditingTask(null); setModalOpen(true); };
  const openEdit = (task) => { setEditingTask(task); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingTask(null); };

  const handleModalSubmit = async (formData) => {
    setModalLoading(true);
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, formData);
        toast.success('Task updated!');
      } else {
        await api.post('/tasks', formData);
        toast.success('Task created!');
      }
      closeModal();
      fetchTasks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      setDeleteConfirm(null);
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">Manage and track your work items</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="create-task-btn">
          <Plus size={18} />
          New Task
        </button>
      </div>

      <div className="page-body">
        {/* Filter Bar */}
        <div className="filter-bar" style={{ marginBottom: '24px' }}>
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks..."
              value={search}
              onChange={handleSearchChange}
              id="task-search"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              className="form-input"
              style={{ width: 'auto', minWidth: '130px' }}
              value={statusFilter}
              onChange={handleStatusFilter}
              id="status-filter"
            >
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              className="form-input"
              style={{ width: 'auto', minWidth: '130px' }}
              value={priorityFilter}
              onChange={handlePriorityFilter}
              id="priority-filter"
            >
              {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
              <div className="spinner spinner-large" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No tasks found</h3>
              <p>
                {search || statusFilter || priorityFilter
                  ? 'Try adjusting your search or filters.'
                  : 'Create your first task to get started!'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task._id}>
                      <td>
                        <div className="task-title">{task.title}</div>
                        {task.description && <div className="task-desc">{task.description}</div>}
                      </td>
                      <td data-label="Status"><StatusBadge status={task.status} /></td>
                      <td data-label="Priority"><PriorityBadge priority={task.priority} /></td>
                      <td data-label="Due Date" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                      </td>
                      <td data-label="Created" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {new Date(task.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openEdit(task)}
                            title="Edit task"
                            id={`edit-task-${task._id}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteConfirm(task._id)}
                            title="Delete task"
                            id={`delete-task-${task._id}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Task Create/Edit Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        task={editingTask}
        loading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Task</h2>
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)} id="confirm-delete-btn">
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tasks;
