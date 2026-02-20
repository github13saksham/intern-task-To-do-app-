import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertCircle } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['todo', 'in-progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
});

const TaskModal = ({ isOpen, onClose, onSubmit, task, loading }) => {
  const isEdit = !!task;
  const firstInputRef = useRef(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        task
          ? {
              title: task.title,
              description: task.description || '',
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            }
          : { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' }
      );
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, task, reset]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">{isEdit ? 'Edit Task' : 'Create Task'}</h2>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                {...register('title')}
                ref={e => { register('title').ref(e); firstInputRef.current = e; }}
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="e.g. Fix login bug"
              />
              {errors.title && <span className="form-error"><AlertCircle size={12} />{errors.title.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                {...register('description')}
                className="form-input"
                placeholder="Optional details..."
                rows={3}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status</label>
                <select {...register('status')} className="form-input">
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Priority</label>
                <select {...register('priority')} className="form-input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Due Date</label>
              <input {...register('dueDate')} type="date" className="form-input" />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : null}
              {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
