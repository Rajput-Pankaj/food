import { useEffect, useState } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
import { promosApi } from '../../api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const emptyForm = {
  code: '',
  discountType: 'percent',
  discountValue: 10,
  minOrder: 0,
  maxUses: 0,
  expiresAt: '',
};

export default function AdminPromos() {
  useDocumentTitle('Promo Codes');
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setError('');
    try {
      const data = await promosApi.list();
      setPromos(data);
    } catch (err) {
      setError(err.message || 'Could not load promo codes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };
      await promosApi.create(payload);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.message || 'Could not create promo.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (promo) => {
    setError('');
    try {
      await promosApi.update(promo.id, { active: !promo.active });
      await load();
    } catch (err) {
      setError(err.message || 'Could not update promo.');
    }
  };

  const handleDelete = async (promo) => {
    if (!window.confirm(`Delete promo code "${promo.code}"?`)) return;
    setError('');
    try {
      await promosApi.remove(promo.id);
      await load();
    } catch (err) {
      setError(err.message || 'Could not delete promo.');
    }
  };

  const startEdit = (promo) => {
    setEditingId(promo.id);
    setEditForm({
      discountType: promo.discountType || 'percent',
      discountValue: promo.discountValue ?? 0,
      minOrder: promo.minOrder ?? 0,
      maxUses: promo.maxUses ?? 0,
      expiresAt: promo.expiresAt ? promo.expiresAt.slice(0, 16) : '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = async (promoId) => {
    if (!editForm) return;
    setSaving(true);
    setError('');
    try {
      await promosApi.update(promoId, {
        discountType: editForm.discountType,
        discountValue: Number(editForm.discountValue),
        minOrder: Number(editForm.minOrder),
        maxUses: Number(editForm.maxUses),
        expiresAt: editForm.expiresAt ? new Date(editForm.expiresAt).toISOString() : null,
      });
      cancelEdit();
      await load();
    } catch (err) {
      setError(err.message || 'Could not save promo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading promo codes...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
      )}

      <form
        onSubmit={handleCreate}
        className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        <input
          placeholder="CODE"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          required
        />
        <select
          value={form.discountType}
          onChange={(e) => setForm({ ...form, discountType: e.target.value })}
          className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="percent">Percent off</option>
          <option value="fixed">Fixed amount</option>
          <option value="free_delivery">Free delivery</option>
        </select>
        <input
          type="number"
          placeholder="Discount value"
          value={form.discountValue}
          onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
          className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          min="0"
        />
        <input
          type="number"
          placeholder="Min order (₹)"
          value={form.minOrder}
          onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })}
          className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          min="0"
        />
        <input
          type="number"
          placeholder="Max uses (0 = unlimited)"
          value={form.maxUses}
          onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
          className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          min="0"
        />
        <input
          type="datetime-local"
          value={form.expiresAt}
          onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
        />
        <button
          type="submit"
          disabled={saving}
          className="sm:col-span-2 lg:col-span-3 bg-green-600 text-white py-2 rounded-lg font-semibold disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Create Promo'}
        </button>
      </form>

      <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 divide-y dark:divide-gray-800">
        {promos.length === 0 && (
          <p className="p-4 text-sm text-gray-500">No promo codes yet.</p>
        )}
        {promos.map((p) => (
          <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-gray-100">{p.code}</p>
              {editingId === p.id && editForm ? (
                <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <select
                    value={editForm.discountType}
                    onChange={(e) => setEditForm({ ...editForm, discountType: e.target.value })}
                    className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed</option>
                    <option value="free_delivery">Free delivery</option>
                  </select>
                  <input
                    type="number"
                    value={editForm.discountValue}
                    onChange={(e) => setEditForm({ ...editForm, discountValue: e.target.value })}
                    className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                    min="0"
                    placeholder="Value"
                  />
                  <input
                    type="number"
                    value={editForm.minOrder}
                    onChange={(e) => setEditForm({ ...editForm, minOrder: e.target.value })}
                    className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                    min="0"
                    placeholder="Min order"
                  />
                  <input
                    type="number"
                    value={editForm.maxUses}
                    onChange={(e) => setEditForm({ ...editForm, maxUses: e.target.value })}
                    className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                    min="0"
                    placeholder="Max uses"
                  />
                  <input
                    type="datetime-local"
                    value={editForm.expiresAt}
                    onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                    className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(p.id)}
                      disabled={saving}
                      className="text-green-600 text-xs font-semibold hover:underline"
                    >
                      Save
                    </button>
                    <button type="button" onClick={cancelEdit} className="text-gray-500 text-xs hover:underline">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {p.discountType} · {p.discountValue}
                  {p.minOrder ? ` · min ₹${p.minOrder}` : ''}
                  {' · used '}
                  {p.usedCount || 0}
                  {p.maxUses ? ` / ${p.maxUses}` : ''}
                  {p.expiresAt ? ` · expires ${new Date(p.expiresAt).toLocaleDateString()}` : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleActive(p)}
                className={`text-xs font-bold px-2 py-1 rounded ${
                  p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {p.active ? 'Active' : 'Inactive'}
              </button>
              {editingId !== p.id && (
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                  aria-label={`Edit ${p.code}`}
                >
                  <MdEdit className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(p)}
                className="inline-flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                aria-label={`Delete ${p.code}`}
              >
                <MdDelete className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
