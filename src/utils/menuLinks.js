export function getMenuCategoryUrl(category) {
  if (!category || category === 'All') return '/menu';
  return `/menu?category=${encodeURIComponent(category)}`;
}

export function buildMenuSearchParams(
  { category, query } = {},
  existing = new URLSearchParams()
) {
  const params = new URLSearchParams(existing);

  if (category !== undefined) {
    if (category && category !== 'All') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
  }

  if (query !== undefined) {
    const trimmed = query?.trim() || '';
    if (trimmed) {
      params.set('q', trimmed);
    } else {
      params.delete('q');
    }
  }

  return params;
}

export function getMenuUrl(params) {
  const query = params.toString();
  return query ? `/menu?${query}` : '/menu';
}

export function parseMenuCategory(searchParams, validCategories = []) {
  const category = searchParams.get('category');
  if (!category) return 'All';
  if (validCategories.length && !validCategories.includes(category)) return 'All';
  return category;
}
