import { useMemo, useState } from 'react';
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdLocalFireDepartment,
  MdSearch,
  MdVisibility,
  MdVisibilityOff,
} from 'react-icons/md';
import MenuItemModal from '../../components/admin/MenuItemModal';
import SeedDataPanel from '../../components/admin/SeedDataPanel';
import { FOOD_TYPES, MENU_PLACEHOLDER_IMAGE } from '../../constants/menu';
import { useMenuItems } from '../../hooks/useMenuItems';
import {
  addCustomMenuItem,
  deleteMenuItem,
  resetMenuItem,
  updateMenuItem,
} from '../../utils/menuStorage';

const typeLabel = Object.fromEntries(FOOD_TYPES.map((type) => [type.value, type.label]));

export default function AdminMenu() {
  const { items, refresh, loading } = useMenuItems({ admin: true });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [modalItem, setModalItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = useMemo(() => {
    const categories = [...new Set(items.map((item) => item.food_category))].sort();
    return {
      total: items.length,
      available: items.filter((item) => item.available).length,
      hidden: items.filter((item) => !item.available).length,
      custom: items.filter((item) => item.isCustom).length,
      categoryList: categories,
    };
  }, [items]);

  const categories = useMemo(() => ['all', ...stats.categoryList], [stats.categoryList]);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesSearch = item.food_name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
          categoryFilter === 'all' || item.food_category === categoryFilter;
        const matchesType = typeFilter === 'all' || item.food_type === typeFilter;
        const matchesAvailability =
          availabilityFilter === 'all' ||
          (availabilityFilter === 'available' && item.available) ||
          (availabilityFilter === 'hidden' && !item.available);
        return matchesSearch && matchesCategory && matchesType && matchesAvailability;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'category':
            return a.food_category.localeCompare(b.food_category);
          default:
            return a.food_name.localeCompare(b.food_name);
        }
      });
  }, [items, search, categoryFilter, typeFilter, availabilityFilter, sortBy]);

  const openAddModal = () => {
    setModalItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalItem(null);
  };

  const handleSave = async (formData) => {
    if (modalItem) {
      await updateMenuItem(modalItem.id, formData);
    } else {
      await addCustomMenuItem(formData);
    }
    await refresh();
    closeModal();
  };

  const handleToggleAvailability = async (item) => {
    await updateMenuItem(item.id, { available: !item.available });
    await refresh();
  };

  const handleDelete = async (item) => {
    const message = item.isCustom
      ? `Delete "${item.food_name}" permanently?`
      : `Hide "${item.food_name}" from menu? (You can reset built-in items later.)`;
    if (!window.confirm(message)) return;
    await deleteMenuItem(item.id, item.isCustom);
    await refresh();
  };

  const handleReset = async (item) => {
    if (!window.confirm(`Reset "${item.food_name}" to default settings?`)) return;
    await resetMenuItem(item.id);
    await refresh();
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading menu...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Menu Management</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-0.5">
            Add, edit, price, and control menu visibility
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 shrink-0"
        >
          <MdAdd className="w-5 h-5" />
          Add Item
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Items', value: stats.total },
          { label: 'Available', value: stats.available },
          { label: 'Hidden', value: stats.hidden },
          { label: 'Custom Added', value: stats.custom },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <SeedDataPanel onSeeded={refresh} />

      <div className="bg-white rounded-xl shadow p-3 sm:p-4 space-y-3">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search menu items..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-500"
            aria-label="Filter by category"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-500"
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            {FOOD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(event) => setAvailabilityFilter(event.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-500"
            aria-label="Filter by availability"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="hidden">Hidden</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-500"
            aria-label="Sort items"
          >
            <option value="name">Sort: Name</option>
            <option value="price-low">Sort: Price Low</option>
            <option value="price-high">Sort: Price High</option>
            <option value="category">Sort: Category</option>
          </select>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500 text-sm">
          No menu items match your filters.
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {filteredItems.map((item) => (
            <article key={item.id} className="bg-white rounded-xl shadow p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <img
                  src={item.food_image}
                  alt={item.food_name}
                  className="w-full sm:w-24 h-44 sm:h-24 rounded-lg object-cover shrink-0"
                  onError={(event) => {
                    event.currentTarget.src = MENU_PLACEHOLDER_IMAGE;
                  }}
                />

                <div className="flex-1 min-w-0 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                          {item.food_name}
                        </h3>
                        {item.isCustom && (
                          <span className="text-[10px] font-semibold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Custom
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                            item.available
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.available ? 'Available' : 'Hidden'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        {item.food_category} · {typeLabel[item.food_type] || item.food_type}
                        {item.nutrition?.calories && (
                          <span className="inline-flex items-center gap-0.5 text-orange-600 ml-2">
                            <MdLocalFireDepartment className="w-3.5 h-3.5" />
                            {item.nutrition.calories} kcal
                          </span>
                        )}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <p className="text-lg font-bold text-green-600 shrink-0">Rs.{item.price}/-</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/food/${item.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      Preview
                    </a>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      <MdEdit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium ${
                        item.available
                          ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {item.available ? (
                        <>
                          <MdVisibilityOff className="w-4 h-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <MdVisibility className="w-4 h-4" />
                          Show
                        </>
                      )}
                    </button>
                    {!item.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleReset(item)}
                        className="px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <MdDelete className="w-4 h-4" />
                      {item.isCustom ? 'Delete' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {isModalOpen && (
        <MenuItemModal item={modalItem} onClose={closeModal} onSave={handleSave} />
      )}
    </div>
  );
}
