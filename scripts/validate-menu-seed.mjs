import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, '../src/data/menuSeed.js');
const source = readFileSync(seedPath, 'utf8');

const rowMatches = source.match(/^\s*\[\d+,/gm) || [];
const expected = 50;

if (rowMatches.length !== expected) {
  console.error(`Menu seed validation failed: expected ${expected} items, found ${rowMatches.length}`);
  process.exit(1);
}

const requiredFields = [
  'description',
  'details',
  'ingredients',
  'allergens',
  'prepTime',
  'nutrition',
  'galleryImages',
];

for (const field of requiredFields) {
  if (!source.includes(field)) {
    console.error(`Menu seed validation failed: missing field "${field}" in builder`);
    process.exit(1);
  }
}

console.log(`Menu seed OK: ${rowMatches.length} items with full detail fields.`);
