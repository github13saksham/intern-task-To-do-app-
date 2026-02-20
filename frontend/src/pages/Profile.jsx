import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmNewPassword: z.string(),
}).refine(d => d.newPassword === d.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: pe, isSubmitting: profileSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' },
  });

  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, formState: { errors: pwe, isSubmitting: pwdSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const onProfileSubmit = async (data) => {
    setProfileError('');
    try {
      const res = await api.put('/user/profile', data);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Update failed');
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordError('');
    try {
      await api.put('/user/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully!');
      resetPwd();
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your personal information</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card-grid card-grid-2">
          {/* Profile Info */}
          <div className="card animate-fade-up">
            <div className="profile-header" style={{ marginBottom: '20px' }}>
              <div className="avatar avatar-lg">{initials}</div>
              <div className="profile-meta">
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--border-light)', marginBottom: '20px' }} />

            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-secondary)' }}>
              <User size={15} style={{ display: 'inline', marginRight: '6px' }} />
              Edit Information
            </h3>

            {profileError && (
              <div className="alert alert-error"><AlertCircle size={14} />{profileError}</div>
            )}

            <form onSubmit={handleProfile(onProfileSubmit)}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  {...regProfile('name')}
                  className={`form-input ${pe.name ? 'error' : ''}`}
                  placeholder="Your name"
                  id="profile-name-input"
                />
                {pe.name && <span className="form-error"><AlertCircle size={12} />{pe.name.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="form-input"
                  disabled
                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  <Mail size={11} style={{ display: 'inline', marginRight: '4px' }} />
                  Email cannot be changed
                </span>
              </div>

              <button type="submit" className="btn btn-primary" disabled={profileSubmitting} id="save-profile-btn">
                {profileSubmitting ? <div className="spinner" /> : <Save size={15} />}
                {profileSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card animate-fade-up" style={{ animationDelay: '80ms' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-secondary)' }}>
              <Lock size={15} style={{ display: 'inline', marginRight: '6px' }} />
              Change Password
            </h3>

            {passwordError && (
              <div className="alert alert-error"><AlertCircle size={14} />{passwordError}</div>
            )}

            <form onSubmit={handlePwd(onPasswordSubmit)}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  {...regPwd('currentPassword')}
                  type="password"
                  className={`form-input ${pwe.currentPassword ? 'error' : ''}`}
                  placeholder="Enter current password"
                  id="current-password-input"
                />
                {pwe.currentPassword && <span className="form-error"><AlertCircle size={12} />{pwe.currentPassword.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  {...regPwd('newPassword')}
                  type="password"
                  className={`form-input ${pwe.newPassword ? 'error' : ''}`}
                  placeholder="Min. 6 characters"
                  id="new-password-input"
                />
                {pwe.newPassword && <span className="form-error"><AlertCircle size={12} />{pwe.newPassword.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  {...regPwd('confirmNewPassword')}
                  type="password"
                  className={`form-input ${pwe.confirmNewPassword ? 'error' : ''}`}
                  placeholder="Repeat new password"
                  id="confirm-new-password-input"
                />
                {pwe.confirmNewPassword && <span className="form-error"><AlertCircle size={12} />{pwe.confirmNewPassword.message}</span>}
              </div>

              <button type="submit" className="btn btn-primary" disabled={pwdSubmitting} id="change-password-btn">
                {pwdSubmitting ? <div className="spinner" /> : <Lock size={15} />}
                {pwdSubmitting ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
