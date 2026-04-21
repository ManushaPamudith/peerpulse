import { useState, useEffect } from 'react';

const labelCls = 'block text-xs font-medium text-slate-600 mb-1.5';
const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm bg-white';
const selectCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm';

export default function AdvancedFilterPanel({ filters, onFiltersChange, isOpen, onClose }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      skill: '',
      level: '',
      verified: false,
      minRating: 0,
      maxRating: 5,
      availability: false,
      sortBy: 'match',
      responseTime: 'all'
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onClose();
  };

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Advanced Filters</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="p-5 space-y-5">
          {/* Skill Search */}
          <div>
            <label className={labelCls}>Skill Name</label>
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. Python, React..."
              value={localFilters.skill}
              onChange={(e) => handleChange('skill', e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1">Search by skill name or keyword</p>
          </div>

          {/* Level */}
          <div>
            <label className={labelCls}>Proficiency Level</label>
            <select
              className={selectCls}
              value={localFilters.level}
              onChange={(e) => handleChange('level', e.target.value)}
            >
              <option value="">Any Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.verified}
                onChange={(e) => handleChange('verified', e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Verified Tutors Only</span>
            </label>
            <p className="text-xs text-slate-400 mt-1">Only show tutors with verified skills</p>
          </div>

          {/* Rating Filter */}
          <div>
            <label className={labelCls}>Minimum Rating</label>
            <div className="flex items-center gap-3">
              <select
                className={selectCls + ' flex-1'}
                value={localFilters.minRating}
                onChange={(e) => handleChange('minRating', parseFloat(e.target.value))}
              >
                <option value={0}>All Ratings</option>
                <option value={3}>3.0★ and above</option>
                <option value={3.5}>3.5★ and above</option>
                <option value={4}>4.0★ and above</option>
                <option value={4.5}>4.5★ and above</option>
              </select>
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.availability}
                onChange={(e) => handleChange('availability', e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Match My Availability</span>
            </label>
            <p className="text-xs text-slate-400 mt-1">Only show tutors with compatible schedules</p>
          </div>

          {/* Response Time */}
          <div>
            <label className={labelCls}>Response Speed</label>
            <select
              className={selectCls}
              value={localFilters.responseTime}
              onChange={(e) => handleChange('responseTime', e.target.value)}
            >
              <option value="all">All Response Times</option>
              <option value="fast">Fast ⚡ (&lt;2 hours)</option>
              <option value="responsive">Responsive (2-8 hours)</option>
              <option value="any">Any</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className={labelCls}>Sort By</label>
            <select
              className={selectCls}
              value={localFilters.sortBy}
              onChange={(e) => handleChange('sortBy', e.target.value)}
            >
              <option value="match">Best Match Score</option>
              <option value="rating">Highest Rating</option>
              <option value="newest">Newest First</option>
              <option value="demand">Most In-Demand</option>
              <option value="responsive">Most Responsive</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white flex gap-2 p-5 border-t border-slate-100">
          <button
            onClick={handleReset}
            className="flex-1 border-2 border-slate-200 text-slate-600 font-semibold py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
