import { useState } from 'react';

export default function TutorComparisonModal({ tutors, onClose, isOpen }) {

  if (!tutors || tutors.length < 2 || !isOpen) return null;

  const displayTutors = tutors.slice(0, 3); // Show max 3 tutors

  const getVerifiedSkillsCount = (tutor) => {
    return (tutor.skills || []).filter(s => s.verificationStatus === 'verified' || s.verified).length;
  };

  const getSkillDiversity = (tutor) => {
    const skillSet = new Set((tutor.skills || []).map(s => s.skill.toLowerCase()));
    return skillSet.size;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-indigo-50 to-blue-50 flex items-center justify-between p-5 border-b border-indigo-100">
          <h3 className="font-bold text-slate-800">Compare Tutors</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {/* Name Row */}
              <tr className="border-b border-slate-100">
                <td className="px-5 py-3 font-semibold text-slate-700 bg-slate-50 w-32">Name</td>
                {displayTutors.map((tutor) => (
                  <td key={tutor._id} className="px-5 py-3 text-center border-l border-slate-100">
                    <div className="font-bold text-slate-800">{tutor.name}</div>
                    <p className="text-xs text-slate-400">{tutor.university}</p>
                  </td>
                ))}
              </tr>

              {/* Rating Row */}
              <tr className="border-b border-slate-100">
                <td className="px-5 py-3 font-semibold text-slate-700 bg-slate-50">Rating</td>
                {displayTutors.map((tutor) => (
                  <td key={tutor._id} className="px-5 py-3 text-center border-l border-slate-100">
                    <div className="text-lg font-bold text-amber-600">
                      ⭐ {tutor.averageRating?.toFixed(1) || 'N/A'}
                    </div>
                    <p className="text-xs text-slate-400">({tutor.reviewCount || 0} reviews)</p>
                  </td>
                ))}
              </tr>

              {/* Matching Score Row */}
              <tr className="border-b border-slate-100">
                <td className="px-5 py-3 font-semibold text-slate-700 bg-slate-50">Match Score</td>
                {displayTutors.map((tutor) => (
                  <td key={tutor._id} className="px-5 py-3 text-center border-l border-slate-100">
                    <div className="text-xl font-bold text-slate-900">
                      {tutor.matchingScore ?? 0}%
                    </div>
                  </td>
                ))}
              </tr>

              {/* Skill Diversity Row */}
              <tr className="border-b border-slate-100">
                <td className="px-5 py-3 font-semibold text-slate-700 bg-slate-50">Skill Count</td>
                {displayTutors.map((tutor) => (
                  <td key={tutor._id} className="px-5 py-3 text-center border-l border-slate-100">
                    <span className="text-slate-900 text-xs font-semibold">
                      {getSkillDiversity(tutor)} skills
                    </span>
                  </td>
                ))}
              </tr>

              {/* Response Rate Row */}
              <tr className="border-b border-slate-100">
                <td className="px-5 py-3 font-semibold text-slate-700 bg-slate-50">Response Speed</td>
                {displayTutors.map((tutor) => (
                  <td key={tutor._id} className="px-5 py-3 text-center border-l border-slate-100">
                    <span className="text-slate-900 text-xs font-semibold">
                      {tutor.responseRateLabel || 'N/A'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Availability Row */}
              <tr className="border-b border-slate-100">
                <td className="px-5 py-3 font-semibold text-slate-700 bg-slate-50">Availability</td>
                {displayTutors.map((tutor) => (
                  <td key={tutor._id} className="px-5 py-3 text-center border-l border-slate-100 text-xs">
                    <p className="text-slate-600">
                      {tutor.availabilityLabel || 'Not specified'}
                    </p>
                  </td>
                ))}
              </tr>

              {/* Top Skills Row */}
              <tr className="border-b border-slate-100">
                <td className="px-5 py-3 font-semibold text-slate-700 bg-slate-50">Top Skills</td>
                {displayTutors.map((tutor) => (
                  <td key={tutor._id} className="px-5 py-3 border-l border-slate-100">
                    <div className="space-y-1">
                      {(tutor.skills || []).slice(0, 3).map((skill, idx) => (
                        <div key={idx} className="text-xs flex items-center gap-1">
                          {(skill.verificationStatus === 'verified' || skill.verified) && (
                            <span className="text-emerald-600">✓</span>
                          )}
                          <span>{skill.skill}</span>
                          <span className="text-slate-400">({skill.level})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Demand Tag Row */}
              <tr>
                <td className="px-5 py-3 font-semibold text-slate-700 bg-slate-50">Popular</td>
                {displayTutors.map((tutor) => (
                  <td key={tutor._id} className="px-5 py-3 text-center border-l border-slate-100">
                    <span className="text-slate-900 text-xs font-semibold">
                      🔥 {tutor.demandTag || 'Normal'}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-100 p-5 flex gap-2">
          <button
            onClick={onClose}
            className="w-full border-2 border-slate-200 text-slate-600 font-semibold py-2.5 rounded-lg hover:bg-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
