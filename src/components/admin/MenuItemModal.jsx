import { useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { FOOD_CATEGORIES, FOOD_TYPES, MENU_PLACEHOLDER_IMAGE } from '../../constants/menu';
import { NUTRITION_FIELDS } from '../../constants/nutrition';

const emptyForm = {
  food_name: '',
  food_category: FOOD_CATEGORIES[0],
  food_type: 'veg',
  price: '',
  description: '',
  details: '',
  ingredients: '',
  allergens: '',
  prepTime: '',
  servingSize: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  fiber: '',
  sugar: '',
  sodium: '',
  food_image_url: '',
  galleryImagesText: '',
  available: true,
};

function itemToForm(item) {
  if (!item) return emptyForm;

  const nutrition = item.nutrition || {};

  return {
    food_name: item.food_name,
    food_category: item.food_category,
    food_type: item.food_type,
    price: String(item.price),
    description: item.description || '',
    details: item.details || '',
    ingredients: item.ingredients || '',
    allergens: item.allergens || '',
    prepTime: item.prepTime ?? '',
    servingSize: nutrition.servingSize || '',
    calories: nutrition.calories ?? '',
    protein: nutrition.protein ?? '',
    carbs: nutrition.carbs ?? '',
    fat: nutrition.fat ?? '',
    fiber: nutrition.fiber ?? '',
    sugar: nutrition.sugar ?? '',
    sodium: nutrition.sodium ?? '',
    food_image_url:
      typeof item.food_image === 'string' && item.food_image.startsWith('http')
        ? item.food_image
        : '',
    galleryImagesText: (item.galleryImages || [])
      .filter((url) => url && url !== item.food_image)
      .join('\n'),
    available: item.available,
  };
}

export default function MenuItemModal({ item, onClose, onSave }) {
  const isEdit = Boolean(item);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(itemToForm(item));
    setError('');
  }, [item]);

  const previewImage = form.food_image_url.trim() || MENU_PLACEHOLDER_IMAGE;

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const price = Number(form.price);
    if (!form.food_name.trim()) {
      setError('Item name is required.');
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      setError('Enter a valid price.');
      return;
    }

    onSave({
      ...form,
      price,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative bg-white w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl">
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Menu Item' : 'Add Menu Item'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </p>
          )}

          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Basic Info</h4>

            <div className="flex gap-4">
              <img
                src={previewImage}
                alt="Preview"
                className="w-20 h-20 rounded-lg object-cover border border-gray-200 shrink-0"
                onError={(event) => {
                  event.currentTarget.src = MENU_PLACEHOLDER_IMAGE;
                }}
              />
              <div className="flex-1 min-w-0">
                <label htmlFor="menu-image-url" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  id="menu-image-url"
                  type="url"
                  value={form.food_image_url}
                  onChange={(event) => setForm({ ...form, food_image_url: event.target.value })}
                  placeholder="https://example.com/food.jpg"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="menu-name" className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                id="menu-name"
                type="text"
                value={form.food_name}
                onChange={(event) => setForm({ ...form, food_name: event.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="menu-category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="menu-category"
                  value={form.food_category}
                  onChange={(event) => setForm({ ...form, food_category: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500 bg-white"
                >
                  {FOOD_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="menu-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="menu-type"
                  value={form.food_type}
                  onChange={(event) => setForm({ ...form, food_type: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500 bg-white"
                >
                  {FOOD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="menu-price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (Rs.) *
                </label>
                <input
                  id="menu-price"
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="menu-description" className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <textarea
                id="menu-description"
                rows={2}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Brief summary shown on menu cards..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="menu-gallery" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Gallery Images
              </label>
              <textarea
                id="menu-gallery"
                rows={3}
                value={form.galleryImagesText}
                onChange={(event) => setForm({ ...form, galleryImagesText: event.target.value })}
                placeholder={'One image URL per line\nhttps://example.com/image-2.jpg'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">
                Optional extra photos for the food detail page gallery. Primary image URL is above.
              </p>
            </div>

            <div>
              <label htmlFor="menu-details" className="block text-sm font-medium text-gray-700 mb-1">
                Full Details
              </label>
              <textarea
                id="menu-details"
                rows={4}
                value={form.details}
                onChange={(event) => setForm({ ...form, details: event.target.value })}
                placeholder="Complete description for the food detail page..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
              />
            </div>
          </section>

          <section className="space-y-4 border-t border-gray-100 pt-6">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              Nutrition & Calories
            </h4>
            <p className="text-xs text-gray-500">
              Customers can view these values on the food detail page to track calories.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="menu-calories" className="block text-sm font-medium text-gray-700 mb-1">
                  Calories (kcal)
                </label>
                <input
                  id="menu-calories"
                  type="number"
                  min="0"
                  value={form.calories}
                  onChange={(event) => setForm({ ...form, calories: event.target.value })}
                  placeholder="e.g. 450"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="menu-serving" className="block text-sm font-medium text-gray-700 mb-1">
                  Serving Size
                </label>
                <input
                  id="menu-serving"
                  type="text"
                  value={form.servingSize}
                  onChange={(event) => setForm({ ...form, servingSize: event.target.value })}
                  placeholder="e.g. 1 plate / 250g"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {NUTRITION_FIELDS.map((field) => (
                <div key={field.key}>
                  <label htmlFor={`menu-${field.key}`} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} ({field.unit})
                  </label>
                  <input
                    id={`menu-${field.key}`}
                    type="number"
                    min="0"
                    step="0.1"
                    value={form[field.key]}
                    onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4 border-t border-gray-100 pt-6">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              Additional Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="menu-prep-time" className="block text-sm font-medium text-gray-700 mb-1">
                  Prep Time (minutes)
                </label>
                <input
                  id="menu-prep-time"
                  type="number"
                  min="0"
                  value={form.prepTime}
                  onChange={(event) => setForm({ ...form, prepTime: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="menu-ingredients" className="block text-sm font-medium text-gray-700 mb-1">
                Ingredients
              </label>
              <textarea
                id="menu-ingredients"
                rows={3}
                value={form.ingredients}
                onChange={(event) => setForm({ ...form, ingredients: event.target.value })}
                placeholder="List main ingredients..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="menu-allergens" className="block text-sm font-medium text-gray-700 mb-1">
                Allergens
              </label>
              <textarea
                id="menu-allergens"
                rows={2}
                value={form.allergens}
                onChange={(event) => setForm({ ...form, allergens: event.target.value })}
                placeholder="e.g. Contains gluten, dairy, nuts..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
              />
            </div>
          </section>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(event) => setForm({ ...form, available: event.target.checked })}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            Available on storefront menu
          </label>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700"
            >
              {isEdit ? 'Save Changes' : 'Add Item'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
