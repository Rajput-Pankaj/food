import { useState } from 'react';
import { MdRefresh, MdRestore, MdStorage } from 'react-icons/md';
import { MENU_SEED_COUNT, MENU_SEED_VERSION } from '../../data/menuSeed';
import {
  getSeedMeta,
  isApplicationSeeded,
  resetMenuStorage,
  seedApplicationData,
} from '../../utils/seedData';

export default function SeedDataPanel({ onSeeded }) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const meta = getSeedMeta();
  const seeded = isApplicationSeeded();

  const runSeed = async (options) => {
    setLoading(true);
    setStatus('');
    try {
      const result = await seedApplicationData(options);
      setStatus(`Demo data seeded successfully at ${new Date(result.seededAt).toLocaleString()}.`);
      onSeeded?.();
    } catch (error) {
      setStatus(error?.message || 'Failed to seed demo data.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetMenuOnly = async () => {
    if (!window.confirm('Reset menu to the built-in 50-item seed? Admin edits and custom items will be removed.')) {
      return;
    }
    setLoading(true);
    try {
      await resetMenuStorage();
      setStatus('Menu reset to built-in seed defaults.');
      onSeeded?.();
    } catch (error) {
      setStatus(error?.message || 'Failed to reset menu.');
    } finally {
      setLoading(false);
    }
  };

  const handleFullSeed = () => {
    if (
      !window.confirm(
        'Seed full demo data? This clears cart, orders, reviews, and menu overrides, then restores demo users, menu, profile, and sample reviews.'
      )
    ) {
      return;
    }
    runSeed({ reset: true, includeReviews: true, includeCustomerProfile: true });
  };

  return (
    <section className="bg-gradient-to-br from-slate-50 to-green-50 border border-green-100 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 inline-flex items-center gap-2">
            <MdStorage className="w-5 h-5 text-green-600" />
            Demo Data & Seed
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Built-in menu has {MENU_SEED_COUNT} items (seed v{MENU_SEED_VERSION}) with full nutrition,
            ingredients, and gallery data. Use seed on a fresh setup for instant testing.
          </p>
        </div>
        <span
          className={`inline-flex items-center self-start px-2.5 py-1 rounded-full text-xs font-semibold ${
            seeded ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {seeded ? 'Seeded' : 'Not seeded'}
        </span>
      </div>

      {meta?.seededAt && (
        <p className="text-xs text-gray-500">
          Last seed: {new Date(meta.seededAt).toLocaleString()} · Menu count: {meta.menuCount}
        </p>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        <button
          type="button"
          onClick={handleFullSeed}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
        >
          <MdRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Seed All Demo Data
        </button>
        <button
          type="button"
          onClick={handleResetMenuOnly}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:border-green-500 hover:text-green-700 disabled:opacity-60"
        >
          <MdRestore className="w-4 h-4" />
          Reset Menu Only
        </button>
      </div>

      {status && (
        <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2">
          {status}
        </p>
      )}
    </section>
  );
}
