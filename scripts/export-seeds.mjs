/**
 * Export menu & blog seed JSON for the API server.
 * Run: node scripts/export-seeds.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'server', 'seed');

async function main() {
  const vite = await createServer({
    root,
    plugins: [react(), tailwindcss()],
    logLevel: 'error',
  });

  try {
    const menuMod = await vite.ssrLoadModule('/src/data/menuSeed.js');
    const blogMod = await vite.ssrLoadModule('/src/data/blogSeed.js');

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, 'menu-items.json'),
      JSON.stringify(menuMod.food_items, null, 2)
    );
    fs.writeFileSync(
      path.join(outDir, 'blog-posts.json'),
      JSON.stringify(blogMod.blog_posts, null, 2)
    );

    console.log(
      `Exported ${menuMod.food_items.length} menu items and ${blogMod.blog_posts.length} blog posts to server/seed/`
    );
  } finally {
    await vite.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
