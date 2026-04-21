import { useEffect, useRef, useState } from 'react';
import api from '../../../core/services/api';
import SkillCard from '../components/SkillCard';
import VerificationModal from '../components/VerificationModal';
import { useAuth } from '../../../core/context/AuthContext';

const inputCls = 'w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm';
const selectCls = 'w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

const editModeStyles = `
  @keyframes borderFadeIn {
    from { border-left-color: transparent; }
    to   { border-left-color: #a855f7; }
  }
  .edit-mode-card {
    border-left: 4px solid #a855f7;
    animation: borderFadeIn 0.3s ease forwards;
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .slide-down { animation: slideDown 0.25s ease forwards; }

  @keyframes toastIn {
    from { opacity: 0; transform: translateX(110%); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes toastOut {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(110%); }
  }
  .toast-enter { animation: toastIn  0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .toast-exit  { animation: toastOut 0.3s ease forwards; }
`;

// improved validation
function ToastNotification({ toasts, onDismiss }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none" style={{ minWidth: 300, maxWidth: 360 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-xl border text-sm font-medium
            ${t.exiting ? 'toast-exit' : 'toast-enter'}
            ${t.type === 'error'
              ? 'bg-white border-red-200 text-red-700'
              : 'bg-white border-emerald-200 text-slate-800'}`}
        >
          {/* icon */}
          <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
            ${t.type === 'error' ? 'bg-red-100' : 'bg-emerald-100'}`}>
            {t.type === 'error'
              ? <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              : <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            }
          </div>

          {/* text */}
          <div className="flex-1 pt-0.5">
            <p className={`font-semibold text-xs uppercase tracking-wide mb-0.5 ${t.type === 'error' ? 'text-red-400' : 'text-emerald-500'}`}>
              {t.type === 'error' ? 'Error' : 'Success'}
            </p>
            <p className="text-slate-700 text-sm leading-snug">{t.message}</p>
          </div>

          {/* close */}
          <button
            onClick={() => onDismiss(t.id)}
            className="shrink-0 mt-0.5 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileRef   = useRef();
  const skillFormRef = useRef();

  const [profileForm, setProfileForm] = useState({ name: '', university: '', bio: '', phone: '' });
  const [skillForm,   setSkillForm]   = useState({ skill: '', level: 'Beginner', type: 'Technical Skill', categoryKey: '', moduleCode: '' });
  const [skillErrors, setSkillErrors] = useState({});
  const [editingSkill, setEditingSkill] = useState(null); // skill object | null

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [mcqScores, setMcqScores] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [skillLoading,   setSkillLoading]   = useState(false);
  const [verifyModal, setVerifyModal] = useState(null);

  useEffect(() => {
    if (user) setProfileForm({ name: user.name || '', university: user.university || '', bio: user.bio || '', phone: user.phone || '' });
  }, [user]);

  const notify = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message: msg, type, exiting: false }]);
    // start exit animation after 2.7s, remove after 3s
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
    }, 2700);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { notify('Image must be under 2 MB', 'error'); return; }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { notify('Only JPEG, PNG, or WebP images are allowed', 'error'); return; }
    setAvatarPreview(URL.createObjectURL(file));
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await api.post('/users/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshUser();
      notify('Profile picture updated');
    } catch (err) {
      setAvatarPreview(null);
      notify(err.response?.data?.message || 'Upload failed', 'error');
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await api.delete('/users/profile/picture');
      setAvatarPreview(null);
      await refreshUser();
      notify('Profile picture removed');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to remove picture', 'error');
    }
  };

  const phoneError = profileForm.phone && !/^0[0-9]{9}$/.test(profileForm.phone)
    ? 'Phone must be 10 digits starting with 0 (e.g. 0771234567)'
    : '';

  const updateProfile = async (e) => {
    e.preventDefault();
    if (phoneError) return;
    setProfileLoading(true);
    try {
      await api.put('/users/profile', profileForm);
      await refreshUser();
      notify('Profile updated successfully');
    } catch (err) {
      notify(err.response?.data?.message || 'Profile update failed', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // ── skill form validation ──
  const validateSkillForm = () => {
    const errs = {};
    if (!skillForm.skill.trim()) errs.skill = 'Skill name is required';
    else if (!editingSkill) {
      const dup = (user?.skills || []).some(
        (s) => s.skill.toLowerCase() === skillForm.skill.trim().toLowerCase()
      );
      if (dup) errs.skill = 'You already have a skill with this name';
    } else {
      const dup = (user?.skills || []).some(
        (s) => s._id !== editingSkill._id && s.skill.toLowerCase() === skillForm.skill.trim().toLowerCase()
      );
      if (dup) errs.skill = 'Another skill with that name already exists';
    }
    if (!skillForm.level) errs.level = 'Please select a level';
    if (skillForm.type === 'Technical Skill' && !skillForm.categoryKey)
      errs.categoryKey = 'Please select a category for this technical skill';
    if (skillForm.type === 'Academic Module' && !skillForm.moduleCode)
      errs.moduleCode = 'Please select an academic module from the list';
    return errs;
  };

  const handleSkillFormChange = (field, value) => {
    // When skill type changes, reset the type-specific fields to avoid stale data
    if (field === 'type') {
      setSkillForm((prev) => ({
        ...prev,
        type:        value,
        skill:       value === 'Academic Module' ? '' : prev.skill,
        categoryKey: value === 'Academic Module' ? '' : prev.categoryKey,
        moduleCode:  value === 'Technical Skill' ? '' : prev.moduleCode,
      }));
      setSkillErrors({});
      return;
    }
    setSkillForm((prev) => ({ ...prev, [field]: value }));
    if (skillErrors[field]) setSkillErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // ── start editing a skill ──
  const startEdit = (skill) => {
    const vs = skill.verificationStatus || (skill.verified ? 'verified' : 'unverified');
    if (vs === 'pending') {
      notify('This skill is under admin review. Changes are temporarily disabled.', 'error');
      return;
    }
    if (vs === 'verified') {
      notify('Verified skills cannot be edited.', 'error');
      return;
    }
    setEditingSkill(skill);
    setSkillForm({
      skill:       skill.skill,
      level:       skill.level,
      type:        skill.type,
      categoryKey: skill.categoryKey || '',
      moduleCode:  skill.moduleCode  || '',
    });
    setSkillErrors({});
    skillFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cancelEdit = () => {
    setEditingSkill(null);
    setSkillForm({ skill: '', level: 'Beginner', type: 'Technical Skill', categoryKey: '', moduleCode: '' });
    setSkillErrors({});
  };

  // ── add or update skill ──
  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    const errs = validateSkillForm();
    if (Object.keys(errs).length) { setSkillErrors(errs); return; }
    setSkillLoading(true);
    try {
      if (editingSkill) {
        await api.put(`/users/skills/${editingSkill._id}`, skillForm);
        await refreshUser();
        notify('Skill updated successfully');
        cancelEdit();
      } else {
        await api.post('/users/skills', skillForm);
        setSkillForm({ skill: '', level: 'Beginner', type: 'Technical Skill', categoryKey: '', moduleCode: '' });
        await refreshUser();
        notify('Skill added successfully');
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Skill save failed', 'error');
    } finally {
      setSkillLoading(false);
    }
  };

  const verifySkill = async (skillId, method) => {
    try {
      const payload = method === 'mcq' ? { method, score: Number(mcqScores[skillId] || 0) } : { method };
      await api.patch(`/users/skills/${skillId}/verify`, payload);
      await refreshUser();
      notify('Skill verified');
    } catch (err) {
      notify(err.response?.data?.message || 'Verification failed', 'error');
    }
  };

  const deleteSkill = async (skillId, skillName) => {
    const skill = (user?.skills || []).find(s => s._id === skillId || s._id?.toString() === skillId);
    const vs = skill?.verificationStatus || (skill?.verified ? 'verified' : 'unverified');
    if (vs === 'pending') {
      notify('This skill is under admin review. Deletion is temporarily disabled.', 'error');
      return;
    }
    if (vs === 'verified') {
      notify('Verified skills cannot be deleted.', 'error');
      return;
    }
    if (!window.confirm(`Delete "${skillName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/skills/${skillId}`);
      if (editingSkill?._id === skillId) cancelEdit();
      await refreshUser();
      notify('Skill deleted');
    } catch (err) {
      notify(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleVerificationSubmit = async (payload) => {
    const { skillId, passed, method, percentage } = payload;

    // For technical skills, if the user failed — submit to backend to record the attempt for cooldown
    if (method === 'mcq' && !passed) {
      try {
        await api.post('/verifications/submit', {
          skillId,
          skillName:      payload.skillName,
          skillType:      payload.skillType,
          categoryKey:    payload.categoryKey    || '',
          categoryLabel:  payload.categoryLabel  || '',
          quizAnswers:    payload.quizAnswers    || [],
          score:          payload.score          || 0,
          totalQuestions: payload.totalQuestions || 0,
          percentage:     percentage             || 0,
          evidenceFile:   '',
          passed: false,
        });
      } catch {
        // ignore — backend records the failed attempt
      }
      notify('Quiz score too low. Minimum 70% required. You may retry after 30 minutes.', 'error');
      return;
    }

    try {
      await api.post('/verifications/submit', {
        skillId,
        skillName:      payload.skillName,
        skillType:      payload.skillType,
        categoryKey:    payload.categoryKey    || '',
        categoryLabel:  payload.categoryLabel  || '',
        moduleCode:     payload.moduleCode     || '',
        moduleTitle:    payload.moduleTitle    || '',
        quizAnswers:    payload.quizAnswers    || [],
        score:          payload.score          || 0,
        totalQuestions: payload.totalQuestions || 0,
        percentage:     percentage             || 0,
        evidenceFile:   payload.evidenceFile   || '',
        passed,
      });
      await refreshUser();
      notify('Verification submitted — pending admin review');
    } catch (err) {
      notify(err.response?.data?.message || 'Submission failed', 'error');
    }
  };

  const handleOpenVerifyModal = async (skill) => {
    // Only apply cooldown to technical skills
    if (skill.type !== 'Technical Skill') {
      setVerifyModal(skill);
      return;
    }
    try {
      const { data } = await api.get(`/verifications/cooldown/${skill._id}`);
      if (data.onCooldown) {
        notify(
          `You must wait ${data.minutesLeft} more minute${data.minutesLeft !== 1 ? 's' : ''} before retaking this quiz.`,
          'error'
        );
        return;
      }
    } catch {
      // If check fails, allow opening — backend will enforce anyway
    }
    setVerifyModal(skill);
  };

  const skills = user?.skills || [];
  const verifiedCount = skills.filter((s) => s.verified).length;

  return (
    <>
      <style>{editModeStyles}</style>
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
      <div className="min-h-screen bg-slate-50">

        {/* hero */}
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4338ca 50%, #6d28d9 75%, #7c3aed 100%)' }}>
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="profile-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1.5" fill="white" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#profile-grid)" />
          </svg>
          <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }} />

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">

              {/* avatar */}
              <div className="relative shrink-0">
                <div className="relative group cursor-pointer" onClick={() => fileRef.current.click()}>
                  <div className="w-24 h-24 rounded-3xl border-4 border-white/30 shadow-2xl flex items-center justify-center text-4xl font-black text-white overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))' }}>
                    {avatarPreview
                      ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                      : user?.profilePicture
                        ? <img src={user.profilePicture} alt="avatar" className="w-full h-full object-cover" />
                        : (user?.name?.charAt(0).toUpperCase() || 'S')}
                  </div>
                  <div className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                {(avatarPreview || user?.profilePicture) && (
                  <button
                    onClick={handleDeleteAvatar}
                    title="Remove profile picture"
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full border-2 border-white flex items-center justify-center transition-colors"
                  >
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* name + meta */}
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">{user?.name || 'Student'}</h1>
                <p className="text-indigo-200 text-sm mt-1">{user?.email}</p>
                {profileForm.phone && <p className="text-indigo-300 text-sm mt-0.5">📞 {profileForm.phone}</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full border border-indigo-400 text-indigo-100">{user?.university || 'SLIIT'}</span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full border border-violet-400 text-violet-100">{user?.role === 'admin' ? '🛡️ Admin' : '🎓 Student'}</span>
                  {verifiedCount > 0 && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500 text-white">✓ {verifiedCount} Verified Skill{verifiedCount > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>

              {/* mini stats */}
              <div className="flex gap-4 shrink-0">
                {[{ label: 'Skills', value: skills.length }, { label: 'Verified', value: verifiedCount }].map(({ label, value }) => (
                  <div key={label} className="text-center px-4 py-2 rounded-2xl border border-white/20" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="text-xs text-indigo-200 font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10">
              <path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40 Z" fill="#f8fafc" />
            </svg>
          </div>
        </div>

        {/* content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* summary card */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-6 flex flex-wrap gap-6">
            {[
              { icon: '👤', label: 'Name',   value: user?.name },
              { icon: '📧', label: 'Email',  value: user?.email },
              { icon: '🏫', label: 'Campus', value: user?.university || 'SLIIT' },
              { icon: '📞', label: 'Phone',  value: profileForm.phone || '—' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 min-w-[180px]">
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-base shrink-0">{icon}</div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* left column */}
            <div className="space-y-6">

              {/* edit profile form */}
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
                  <span className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-sm">✏️</span>
                  Edit Profile
                </h2>
                <form onSubmit={updateProfile} className="space-y-4">
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input className={inputCls} value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Full name" />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input className={`${inputCls} bg-slate-50 text-slate-400 cursor-not-allowed`} value={user?.email || ''} disabled />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number</label>
                    <input
                      className={`${inputCls} ${phoneError ? 'border-red-400 focus:ring-red-400' : ''}`}
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="e.g. 0771234567"
                      maxLength={10}
                      inputMode="numeric"
                    />
                    {phoneError && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        {phoneError}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Campus</label>
                    <select className={selectCls} value={profileForm.university} onChange={(e) => setProfileForm({ ...profileForm, university: e.target.value })}>
                      <option value="">Select campus</option>
                      <option value="SLIIT Malabe">SLIIT Malabe</option>
                      <option value="SLIIT Kandy">SLIIT Kandy</option>
                      <option value="SLIIT Matara">SLIIT Matara</option>
                      <option value="SLIIT Kurunegala">SLIIT Kurunegala</option>
                      <option value="SLIIT">SLIIT (Main)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Bio</label>
                    <textarea className={`${inputCls} resize-none`} rows={3} value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Short bio about yourself" />
                  </div>
                  <button type="submit" disabled={profileLoading || !!phoneError} className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm">
                    {profileLoading ? 'Saving...' : 'Update Profile'}
                  </button>
                </form>
              </div>

              {/* add / edit skill form */}
              <div ref={skillFormRef} className={`bg-white border border-slate-100 rounded-2xl shadow-sm p-6 transition-all duration-300 ${editingSkill ? 'edit-mode-card' : ''}`}>
                <h2 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                  <span className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-sm">
                    {editingSkill ? '✏️' : '🧠'}
                  </span>
                  {editingSkill ? 'Edit Skill' : 'Add New Skill'}
                </h2>

                {/* edit mode badge */}
                {editingSkill && (
                  <div className="mb-4 mt-2 slide-down">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border"
                      style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', borderColor: 'rgba(168,85,247,0.3)' }}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Editing: {editingSkill.skill}
                    </span>
                  </div>
                )}

                <form onSubmit={handleSkillSubmit} className="space-y-4 mt-4">

                  {/* ── Skill Type — always first so the form adapts immediately ── */}
                  <div>
                    <label className={labelCls}>Skill Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Technical Skill', 'Academic Module'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleSkillFormChange('type', t)}
                          className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-150 text-left flex items-center gap-2
                            ${skillForm.type === t
                              ? t === 'Technical Skill'
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                        >
                          <span>{t === 'Technical Skill' ? '🧠' : '🎓'}</span>
                          <span>{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ══════════════════════════════════════════
                      TECHNICAL SKILL FIELDS
                  ══════════════════════════════════════════ */}
                  {skillForm.type === 'Technical Skill' && (
                    <>
                      {/* Skill Name */}
                      <div>
                        <label className={labelCls}>Skill Name</label>
                        <input
                          className={`${inputCls} ${skillErrors.skill ? 'border-red-400 focus:ring-red-400' : ''}`}
                          value={skillForm.skill}
                          onChange={(e) => handleSkillFormChange('skill', e.target.value)}
                          placeholder="e.g. React, Java, Machine Learning"
                        />
                        {skillErrors.skill
                          ? <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{skillErrors.skill}</p>
                          : <p className="mt-1 text-xs text-slate-400">Enter the name of the technical skill you want to add.</p>
                        }
                      </div>

                      {/* Proficiency Level */}
                      <div>
                        <label className={labelCls}>Proficiency Level</label>
                        <select
                          className={`${selectCls} ${skillErrors.level ? 'border-red-400 focus:ring-red-400' : ''}`}
                          value={skillForm.level}
                          onChange={(e) => handleSkillFormChange('level', e.target.value)}
                        >
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                          <option>Expert</option>
                        </select>
                        {skillErrors.level && <p className="mt-1.5 text-xs text-red-500">{skillErrors.level}</p>}
                      </div>

                      {/* Technical Category */}
                      <div>
                        <label className={labelCls}>Technical Category</label>
                        <select
                          className={`${selectCls} ${skillErrors.categoryKey ? 'border-red-400 focus:ring-red-400' : ''}`}
                          value={skillForm.categoryKey}
                          onChange={(e) => handleSkillFormChange('categoryKey', e.target.value)}
                        >
                          <option value="">— Select a category —</option>
                          <option value="programming_fundamentals">💻 Programming Fundamentals</option>
                          <option value="web_development">🌐 Web Development</option>
                          <option value="database">🗄️ Database</option>
                          <option value="object_oriented_programming">🧩 Object Oriented Programming</option>
                          <option value="networking">🔗 Networking</option>
                          <option value="software_engineering">⚙️ Software Engineering</option>
                        </select>
                        {skillErrors.categoryKey
                          ? <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{skillErrors.categoryKey}</p>
                          : <p className="mt-1 text-xs text-slate-400">Select the category that best matches your skill. This determines which quiz you will take during verification.</p>
                        }
                      </div>
                    </>
                  )}

                  {/* ══════════════════════════════════════════
                      ACADEMIC MODULE FIELDS
                  ══════════════════════════════════════════ */}
                  {skillForm.type === 'Academic Module' && (
                    <>
                      {/* Academic Module dropdown — no free-text input */}
                      <div>
                        <label className={labelCls}>Academic Module</label>
                        <select
                          className={`${selectCls} ${skillErrors.moduleCode ? 'border-red-400 focus:ring-red-400' : ''}`}
                          value={skillForm.moduleCode}
                          onChange={(e) => {
                            const code = e.target.value;
                            // Auto-fill skill name from the selected module label
                            const labels = {
                              IT3030: 'Programming Applications and Frameworks',
                              IT3020: 'Database Systems',
                              IT3010: 'Network Design and Management',
                              IT2070: 'Data Structures & Algorithms',
                              IT2010: 'Mobile Application Development',
                              IT2110: 'Probability & Statistics',
                            };
                            setSkillForm((prev) => ({
                              ...prev,
                              moduleCode: code,
                              skill: code ? `${code} – ${labels[code]}` : '',
                            }));
                            if (skillErrors.moduleCode) setSkillErrors((prev) => ({ ...prev, moduleCode: '' }));
                            if (skillErrors.skill)      setSkillErrors((prev) => ({ ...prev, skill: '' }));
                          }}
                        >
                          <option value="">— Select a module —</option>
                          <option value="IT3030">IT3030 – Programming Applications and Frameworks</option>
                          <option value="IT3020">IT3020 – Database Systems</option>
                          <option value="IT3010">IT3010 – Network Design and Management</option>
                          <option value="IT2070">IT2070 – Data Structures &amp; Algorithms</option>
                          <option value="IT2010">IT2010 – Mobile Application Development</option>
                          <option value="IT2110">IT2110 – Probability &amp; Statistics</option>
                        </select>
                        {skillErrors.moduleCode
                          ? <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{skillErrors.moduleCode}</p>
                          : <p className="mt-1 text-xs text-slate-400">Select the academic module you want to verify. The module name will be saved automatically.</p>
                        }
                      </div>

                      {/* Proficiency Level */}
                      <div>
                        <label className={labelCls}>Proficiency Level</label>
                        <select
                          className={`${selectCls} ${skillErrors.level ? 'border-red-400 focus:ring-red-400' : ''}`}
                          value={skillForm.level}
                          onChange={(e) => handleSkillFormChange('level', e.target.value)}
                        >
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                          <option>Expert</option>
                        </select>
                        {skillErrors.level && <p className="mt-1.5 text-xs text-red-500">{skillErrors.level}</p>}
                      </div>

                      {/* Read-only preview of what will be saved */}
                      {skillForm.moduleCode && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-3">
                          <span className="text-xl shrink-0 mt-0.5">🎓</span>
                          <div>
                            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">{skillForm.moduleCode}</p>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">{skillForm.skill.replace(`${skillForm.moduleCode} – `, '')}</p>
                            <p className="text-xs text-slate-400 mt-1">This module will be saved to your profile and used for verification.</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ── Submit / Cancel ── */}
                  <div className={`flex gap-3 ${editingSkill ? 'flex-col sm:flex-row' : ''}`}>
                    <button
                      type="submit"
                      disabled={skillLoading}
                      className={`flex-1 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm
                        ${skillForm.type === 'Academic Module'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                      {skillLoading
                        ? (editingSkill ? 'Updating...' : 'Adding...')
                        : (editingSkill ? 'Update Skill' : `Add ${skillForm.type === 'Academic Module' ? 'Module' : 'Skill'}`)}
                    </button>
                    {editingSkill && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex-1 border-2 border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* right column — skills list */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-5 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-sm">📋</span>
                  My Skills
                </span>
                <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                  {skills.length} skill{skills.length !== 1 ? 's' : ''}
                </span>
              </h2>

              {skills.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-3">🧠</div>
                  <p className="text-sm">No skills added yet. Add your first skill to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {skills.map((skill) => {
                    const vs          = skill.verificationStatus || (skill.verified ? 'verified' : 'unverified');
                    const isPending   = vs === 'pending';
                    const isVerified  = vs === 'verified';
                    const isRejected  = vs === 'rejected';
                    const isLocked    = isPending || isVerified;
                    const isBeingEdited = editingSkill?._id === skill._id;
                    return (
                      <div key={skill._id}
                        className={`rounded-xl transition-all duration-200 ${isBeingEdited ? 'ring-2 ring-purple-400/50' : ''}`}>
                        <div className="flex items-start gap-2">
                          <div className="flex-1 scale-[1.0] hover:scale-[1.02] transition-all duration-200">
                            <SkillCard {...skill} pendingVerification={isPending} />
                          </div>
                          <div className="flex flex-col gap-1 mt-1 shrink-0">
                            {/* Edit button — disabled when pending or verified */}
                            <button
                              onClick={() => !isLocked && startEdit(skill)}
                              disabled={isLocked}
                              className={`p-1.5 rounded-lg transition-colors duration-200
                                ${isLocked
                                  ? 'text-slate-200 cursor-not-allowed'
                                  : 'text-slate-400 hover:text-purple-500 hover:bg-purple-50'}`}
                              title={isPending ? 'Locked — pending admin review' : isVerified ? 'Locked — skill is verified' : 'Edit skill'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {/* Delete button — disabled when pending or verified */}
                            <button
                              onClick={() => !isLocked && deleteSkill(skill._id, skill.skill)}
                              disabled={isLocked}
                              className={`p-1.5 rounded-lg transition-colors duration-200
                                ${isLocked
                                  ? 'text-slate-200 cursor-not-allowed'
                                  : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                              title={isPending ? 'Locked — pending admin review' : isVerified ? 'Locked — skill is verified' : 'Delete skill'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* ── Status-based action row ── */}

                        {/* Unverified — show verify button */}
                        {!isVerified && !isPending && !isRejected && (
                          <div className="mt-2 mb-1 pl-1">
                            <button
                              onClick={() => handleOpenVerifyModal(skill)}
                              className="text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                              {skill.type === 'Academic Module' ? '🎓 Submit for Verification' : '🧠 Take Verification Quiz'}
                            </button>
                          </div>
                        )}

                        {/* Pending — locked notice */}
                        {isPending && (
                          <div className="mt-2 mb-1 pl-1 flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg">
                              🕐 Pending Admin Review
                            </span>
                            <span className="text-xs text-slate-400">Verification in progress. Changes are temporarily disabled.</span>
                          </div>
                        )}

                        {/* Verified — locked notice */}
                        {isVerified && (
                          <div className="mt-2 mb-1 pl-1">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg">
                              ✓ Verified
                            </span>
                          </div>
                        )}

                        {/* Rejected — allow retry and editing */}
                        {isRejected && (
                          <div className="mt-2 mb-1 pl-1 flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg">
                              ✗ Verification Rejected
                            </span>
                            <button
                              onClick={() => handleOpenVerifyModal(skill)}
                              className="text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                              Retake Quiz
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {verifyModal && (
          <VerificationModal
            skill={verifyModal}
            onClose={() => setVerifyModal(null)}
            onSubmit={handleVerificationSubmit}
          />
        )}
      </div>
    </>
  );
}
