/** Client-side filters & sorting for /requests/discover results (skill request / matching). */

export function applyDiscoverFilters(tutors, appliedFilters) {
  return (tutors || []).filter((tutor) => {
    const rating = tutor.averageRating || 0;
    const minRating = appliedFilters.minRating || 0;
    const maxRating = appliedFilters.maxRating ?? 5;
    const ratingMatch = rating >= minRating && rating <= maxRating;

    const rt = appliedFilters.responseTime;
    const label = tutor.responseRateLabel || '';
    const responseTimeMatch =
      rt === 'all' ||
      rt === 'any' ||
      (rt === 'fast' && label.includes('Fast')) ||
      (rt === 'responsive' && (label.includes('Responsive') || label.includes('Fast')));

    return ratingMatch && responseTimeMatch;
  });
}

export function sortDiscoverTutors(list, sortBy) {
  const sorted = [...list];
  if (sortBy === 'rating') {
    sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
  } else if (sortBy === 'responsive') {
    const rank = (l) => (l?.includes('Fast') ? 0 : l?.includes('Responsive') ? 1 : 2);
    sorted.sort((a, b) => rank(a.responseRateLabel) - rank(b.responseRateLabel));
  } else if (sortBy === 'demand') {
    const rank = (t) => (t?.includes('High') ? 0 : t?.includes('Growing') ? 1 : 2);
    sorted.sort((a, b) => rank(a.demandTag) - rank(b.demandTag));
  } else if (sortBy === 'newest') {
    sorted.sort(
      (a, b) =>
        new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
  } else {
    sorted.sort((a, b) => (b.matchingScore || 0) - (a.matchingScore || 0));
  }
  return sorted;
}

export function discoverSortLabel(sortBy) {
  const map = {
    match: 'Matching score',
    rating: 'Highest rating',
    responsive: 'Response speed',
    demand: 'Market demand',
    newest: 'Recently active',
  };
  return map[sortBy] || map.match;
}

/** Prefer the skill that matches the search box for sidebar analytics. */
export function pickSkillForDetails(tutor, searchSkill) {
  const skills = tutor?.skills || [];
  const q = (searchSkill || '').trim().toLowerCase();
  if (!q) return skills[0] || null;
  const hit = skills.find((s) => s.skill && s.skill.toLowerCase().includes(q));
  return hit || skills[0] || null;
}

export function getTopRecommendedTutors(tutors, limit = 5) {
  return [...(tutors || [])]
    .sort((a, b) => (b.matchingScore || 0) - (a.matchingScore || 0))
    .slice(0, limit);
}

export function buildAlternativeSkillSuggestions(tutors, activeSkill) {
  const current = (activeSkill || '').trim().toLowerCase();
  const counts = {};

  (tutors || []).forEach((tutor) => {
    (tutor.skills || []).forEach((s) => {
      const skillName = (s.skill || '').trim();
      const key = skillName.toLowerCase();
      if (!skillName || (current && key === current)) return;
      counts[key] = { skill: skillName, count: (counts[key]?.count || 0) + 1 };
    });
  });

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}
