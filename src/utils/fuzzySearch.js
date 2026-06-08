function normalize(text = '') {
  return text.toLowerCase().trim();
}

function fuzzyScore(query, text) {
  const q = normalize(query);
  const t = normalize(text);

  if (!q || !t) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 92;
  if (t.includes(q)) return 78;

  const words = t.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(q)) return 70;
    if (word.includes(q)) return 62;
  }

  let queryIndex = 0;
  let score = 0;
  let streak = 0;

  for (let i = 0; i < t.length && queryIndex < q.length; i += 1) {
    if (t[i] === q[queryIndex]) {
      score += 8 + streak * 4;
      streak += 1;
      queryIndex += 1;
    } else {
      streak = 0;
    }
  }

  if (queryIndex === q.length) {
    return 35 + Math.min(score, 30);
  }

  return 0;
}

function tokenOverlapScore(query, text) {
  const queryTokens = normalize(query).split(/\s+/).filter(Boolean);
  const targetTokens = normalize(text).split(/\s+/).filter(Boolean);
  if (!queryTokens.length) return 0;

  let matched = 0;
  for (const token of queryTokens) {
    const hit = targetTokens.some(
      (target) => target.startsWith(token) || fuzzyScore(token, target) >= 40
    );
    if (hit) matched += 1;
  }

  return (matched / queryTokens.length) * 55;
}

export function searchMenuItems(items, query, limit = 8) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 1) return [];

  const scored = [];

  for (const item of items) {
    const fields = [
      { text: item.food_name, weight: 1 },
      { text: item.food_category, weight: 0.55 },
      { text: item.description || '', weight: 0.35 },
      { text: item.details || '', weight: 0.3 },
      { text: item.ingredients || '', weight: 0.25 },
      { text: item.food_type === 'veg' ? 'vegetarian veg' : 'non veg non-vegetarian', weight: 0.2 },
    ];

    let score = 0;
    for (const field of fields) {
      score = Math.max(score, fuzzyScore(trimmed, field.text) * field.weight);
      score = Math.max(score, tokenOverlapScore(trimmed, field.text) * field.weight);
    }

    if (score >= 28) {
      scored.push({ item, score });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function filterMenuByFuzzyQuery(items, query, { category = 'All', dietary = 'all' } = {}) {
  const trimmed = query.trim();
  let matchedItems = items;

  if (trimmed) {
    const ids = new Set(searchMenuItems(items, trimmed, items.length).map((item) => item.id));
    matchedItems = items.filter((item) => ids.has(item.id));
  }

  const matchesCategory = (item) => category === 'All' || item.food_category === category;
  const matchesDietary = (item) =>
    !dietary || dietary === 'all' || item.food_type === dietary;

  return matchedItems.filter((item) => matchesCategory(item) && matchesDietary(item));
}

export function highlightMatch(text = '', query = '') {
  const q = normalize(query);
  const source = text || '';
  if (!q) return [{ text: source, match: false }];

  const lower = source.toLowerCase();
  const index = lower.indexOf(q);

  if (index === -1) {
    return [{ text: source, match: false }];
  }

  return [
    { text: source.slice(0, index), match: false },
    { text: source.slice(index, index + q.length), match: true },
    { text: source.slice(index + q.length), match: false },
  ].filter((part) => part.text);
}
