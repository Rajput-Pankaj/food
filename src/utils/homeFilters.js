/**
 * @param {{ dietary?: 'veg' | 'non_veg' | 'all', imageDietary?: 'veg' | 'non_veg' }} item
 * @param {'veg' | 'non_veg' | 'all'} preference
 */
export function matchesDietaryPreference(item, preference = 'all') {
  if (!preference || preference === 'all') return true;

  const dietary = item.dietary || 'all';
  const imageDietary = item.imageDietary || dietary;

  if (preference === 'veg') {
    if (dietary === 'non_veg' || imageDietary === 'non_veg') return false;
    return true;
  }

  if (preference === 'non_veg') {
    if (dietary === 'veg' && imageDietary === 'veg') return true;
    if (dietary === 'non_veg' || imageDietary === 'non_veg') return true;
    return dietary === 'all';
  }

  return true;
}

export function filterHomeContent(items, preference = 'all') {
  const filtered = items.filter((item) => matchesDietaryPreference(item, preference));
  return filtered.length ? filtered : items.filter((item) => (item.dietary || 'all') === 'all');
}
