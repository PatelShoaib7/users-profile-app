import { useState } from 'react';
import { FiBookOpen, FiCheckSquare, FiPlus, FiTarget, FiTrash2 } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { assignUserItem, removeUserItem } from '../../store/slices/userSlice';
import { ButtonSpinner } from '../loaders/Spinner';
import { formatDate } from '../../utils/formatters';

const currentMonthDefault = () =>
  new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export const UserAssignmentsPanel = ({ user }) => {
  const dispatch = useAppDispatch();
  const { submitting } = useAppSelector((state) => state.users);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showAddForm, setShowAddForm] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });

  const [trainingForm, setTrainingForm] = useState({
    courseTitle: '',
    provider: 'Internal Academy',
    instructor: 'PeoplePulse Learning Faculty',
    category: 'Technical',
    durationHours: 4,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    pdfUrl: '/materials/react-redux-architecture.pdf',
    pdfTitle: 'React_Redux_Architecture_Guide.pdf',
    dueDate: '',
  });

  const [targetForm, setTargetForm] = useState({
    title: '',
    month: currentMonthDefault(),
    targetValue: 5,
    unit: 'items',
    notes: '',
  });

  const handleAssignTask = async (e) => {
    e.preventDefault();
    const res = await dispatch(
      assignUserItem({
        userId: user._id,
        kind: 'task',
        data: taskForm,
      })
    );
    if (assignUserItem.fulfilled.match(res)) {
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
      setShowAddForm(false);
    }
  };

  const handleAssignTraining = async (e) => {
    e.preventDefault();
    const res = await dispatch(
      assignUserItem({
        userId: user._id,
        kind: 'training',
        data: { ...trainingForm, durationHours: Number(trainingForm.durationHours) || 4 },
      })
    );
    if (assignUserItem.fulfilled.match(res)) {
      setTrainingForm({
        courseTitle: '',
        provider: 'Internal Academy',
        instructor: 'PeoplePulse Learning Faculty',
        category: 'Technical',
        durationHours: 4,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        pdfUrl: '/materials/react-redux-architecture.pdf',
        pdfTitle: 'React_Redux_Architecture_Guide.pdf',
        dueDate: '',
      });
      setShowAddForm(false);
    }
  };

  const handleAssignTarget = async (e) => {
    e.preventDefault();
    const res = await dispatch(
      assignUserItem({
        userId: user._id,
        kind: 'target',
        data: { ...targetForm, targetValue: Number(targetForm.targetValue) || 1 },
      })
    );
    if (assignUserItem.fulfilled.match(res)) {
      setTargetForm({
        title: '',
        month: currentMonthDefault(),
        targetValue: 5,
        unit: 'items',
        notes: '',
      });
      setShowAddForm(false);
    }
  };

  const tabs = [
    { id: 'tasks', label: `Tasks (${user.tasks?.length || 0})`, icon: FiCheckSquare },
    {
      id: 'trainings',
      label: `Trainings (${user.trainings?.length || 0})`,
      icon: FiBookOpen,
    },
    {
      id: 'targets',
      label: `Monthly Targets (${user.monthlyTargets?.length || 0})`,
      icon: FiTarget,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTab(id);
                setShowAddForm(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === id
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-200 bg-brand-50 text-brand-700 text-xs font-semibold hover:bg-brand-100"
        >
          <FiPlus className="h-3.5 w-3.5" />
          {showAddForm ? 'Cancel' : `Assign ${activeTab === 'tasks' ? 'Task' : activeTab === 'trainings' ? 'Course' : 'Target'}`}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && activeTab === 'tasks' && (
        <form onSubmit={handleAssignTask} className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Task title *"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="sm:col-span-2 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            />
            <select
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Short description (optional)"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="sm:col-span-2 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            />
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
          >
            {submitting ? <ButtonSpinner label="Assigning..." /> : 'Save Task'}
          </button>
        </form>
      )}

      {showAddForm && activeTab === 'trainings' && (
        <form onSubmit={handleAssignTraining} className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Course title *"
              value={trainingForm.courseTitle}
              onChange={(e) => setTrainingForm({ ...trainingForm, courseTitle: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            />
            <input
              type="text"
              placeholder="Provider (e.g., Udemy Business)"
              value={trainingForm.provider}
              onChange={(e) => setTrainingForm({ ...trainingForm, provider: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={trainingForm.category}
              onChange={(e) => setTrainingForm({ ...trainingForm, category: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="Technical">Technical</option>
              <option value="Compliance">Compliance</option>
              <option value="Leadership">Leadership</option>
              <option value="Product">Product</option>
              <option value="Soft Skills">Soft Skills</option>
            </select>
            <input
              type="number"
              min={1}
              placeholder="Duration (hours)"
              value={trainingForm.durationHours}
              onChange={(e) => setTrainingForm({ ...trainingForm, durationHours: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            />
            <input
              type="date"
              value={trainingForm.dueDate}
              onChange={(e) => setTrainingForm({ ...trainingForm, dueDate: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="url"
              placeholder="Video URL (.mp4 or YouTube)"
              value={trainingForm.videoUrl}
              onChange={(e) => setTrainingForm({ ...trainingForm, videoUrl: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            />
            <select
              value={trainingForm.pdfUrl}
              onChange={(e) => {
                const map = {
                  '/materials/design-systems-handbook.pdf': 'Design_Systems_Handbook.pdf',
                  '/materials/react-redux-architecture.pdf': 'React_Redux_Architecture_Guide.pdf',
                  '/materials/security-compliance-guide.pdf': 'Security_Compliance_Guide.pdf',
                  '/materials/product-metrics-playbook.pdf': 'Product_Metrics_Playbook.pdf',
                  '/materials/leadership-onboarding-handbook.pdf': 'Leadership_Agile_Playbook.pdf',
                };
                setTrainingForm({
                  ...trainingForm,
                  pdfUrl: e.target.value,
                  pdfTitle: map[e.target.value] || 'Training_Handbook.pdf',
                });
              }}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="/materials/react-redux-architecture.pdf">
                PDF: React &amp; Redux Architecture Guide
              </option>
              <option value="/materials/design-systems-handbook.pdf">
                PDF: Design Systems Handbook
              </option>
              <option value="/materials/security-compliance-guide.pdf">
                PDF: Security &amp; Compliance Guide
              </option>
              <option value="/materials/product-metrics-playbook.pdf">
                PDF: Product Metrics Playbook
              </option>
              <option value="/materials/leadership-onboarding-handbook.pdf">
                PDF: Leadership &amp; Agile Playbook
              </option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
          >
            {submitting ? <ButtonSpinner label="Enrolling..." /> : 'Enroll Course'}
          </button>
        </form>
      )}

      {showAddForm && activeTab === 'targets' && (
        <form onSubmit={handleAssignTarget} className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Monthly target title *"
              value={targetForm.title}
              onChange={(e) => setTargetForm({ ...targetForm, title: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            />
            <input
              type="text"
              required
              placeholder="Month (e.g., November 2026)"
              value={targetForm.month}
              onChange={(e) => setTargetForm({ ...targetForm, month: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="number"
              min={1}
              required
              placeholder="Target value"
              value={targetForm.targetValue}
              onChange={(e) => setTargetForm({ ...targetForm, targetValue: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            />
            <input
              type="text"
              placeholder="Unit (e.g., PRs, sessions, %)"
              value={targetForm.unit}
              onChange={(e) => setTargetForm({ ...targetForm, unit: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            />
            <input
              type="text"
              placeholder="Notes"
              value={targetForm.notes}
              onChange={(e) => setTargetForm({ ...targetForm, notes: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
          >
            {submitting ? <ButtonSpinner label="Saving..." /> : 'Assign Target'}
          </button>
        </form>
      )}

      {/* List Content */}
      <div className="divide-y divide-slate-100">
        {activeTab === 'tasks' &&
          ((user.tasks || []).length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No tasks assigned to this employee.</p>
          ) : (
            user.tasks.map((task) => (
              <div key={task._id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    Status: {task.status.replace('_', ' ')} • Priority: {task.priority} • Due:{' '}
                    {formatDate(task.dueDate)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    dispatch(removeUserItem({ userId: user._id, kind: 'task', itemId: task._id }))
                  }
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Remove task"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          ))}

        {activeTab === 'trainings' &&
          ((user.trainings || []).length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No training courses assigned.</p>
          ) : (
            user.trainings.map((course) => (
              <div key={course._id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{course.courseTitle}</p>
                  <p className="text-xs text-slate-500">
                    {course.provider} • {course.category} • Progress: {course.progress}%
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      removeUserItem({ userId: user._id, kind: 'training', itemId: course._id })
                    )
                  }
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Remove course"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          ))}

        {activeTab === 'targets' &&
          ((user.monthlyTargets || []).length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No monthly targets assigned.</p>
          ) : (
            user.monthlyTargets.map((target) => (
              <div key={target._id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{target.title}</p>
                  <p className="text-xs text-slate-500">
                    {target.month} • Achieved: {target.achievedValue}/{target.targetValue}{' '}
                    {target.unit} ({target.status.replace('_', ' ')})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      removeUserItem({ userId: user._id, kind: 'target', itemId: target._id })
                    )
                  }
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Remove target"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          ))}
      </div>
    </div>
  );
};
