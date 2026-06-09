import { useRef, useState } from 'react';
import { MdClose, MdCloudUpload, MdImage } from 'react-icons/md';
import { useMedia } from '../../hooks/useMedia';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif';

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  multiple = false,
  selectedUrls = [],
  title = 'Choose Image',
}) {
  const fileInputRef = useRef(null);
  const { items, loading, error, upload, remove } = useMedia();
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState('');

  if (!open) return null;

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setLocalError('');

    try {
      for (const file of files) {
        await upload(file, { folder: 'uploads' });
      }
    } catch (err) {
      setLocalError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const toggleSelect = (url) => {
    if (multiple) {
      const next = selectedUrls.includes(url)
        ? selectedUrls.filter((item) => item !== url)
        : [...selectedUrls, url];
      onSelect(next);
      return;
    }
    onSelect(url);
    onClose();
  };

  const handleDelete = async (item, event) => {
    event.stopPropagation();
    if (item.protected) return;
    if (!window.confirm(`Delete "${item.originalName}"?`)) return;
    try {
      await remove(item.id);
    } catch (err) {
      setLocalError(err.message || 'Delete failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button type="button" className="absolute inset-0 bg-black/50" onClick={onClose} aria-label="Close" />
      <div className="relative bg-white w-full sm:max-w-4xl max-h-[92vh] overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Upload or select from your media library</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close">
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-3 border-b bg-gray-50 flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
          >
            <MdCloudUpload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <span className="text-xs text-gray-500">JPEG, PNG, WebP, GIF, AVIF — max 5MB</span>
        </div>

        {(error || localError) && (
          <p className="mx-4 sm:mx-6 mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {localError || error}
          </p>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-10">Loading media...</p>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MdImage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No images yet. Upload your first image.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((item) => {
                const url = item.url;
                const selected = selectedUrls.includes(url);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSelect(url)}
                    className={`group relative aspect-square rounded-xl overflow-hidden border-2 text-left transition-all ${
                      selected ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <img
                      src={resolveMediaUrl(url)}
                      alt={item.originalName || 'Media'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-[10px] text-white truncate">{item.originalName}</p>
                    </div>
                    {!item.protected && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleDelete(item, e)}
                        onKeyDown={(e) => e.key === 'Enter' && handleDelete(item, e)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-600 text-white text-[10px] px-2 py-1 rounded-md"
                      >
                        Delete
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {multiple && (
          <div className="border-t px-4 sm:px-6 py-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
            >
              Done ({selectedUrls.length} selected)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
