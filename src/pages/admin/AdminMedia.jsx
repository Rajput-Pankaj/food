import { useRef, useState } from 'react';
import { MdCloudUpload, MdDelete, MdImage } from 'react-icons/md';
import { useMedia } from '../../hooks/useMedia';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif';

export default function AdminMedia() {
  const fileInputRef = useRef(null);
  const { items, loading, error, upload, remove } = useMedia();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setMessage('');

    try {
      for (const file of files) {
        await upload(file, { folder: 'uploads' });
      }
      setMessage(`${files.length} image(s) uploaded successfully.`);
    } catch (err) {
      setMessage(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async (item) => {
    if (item.protected) return;
    if (!window.confirm(`Delete "${item.originalName}"?`)) return;
    try {
      await remove(item.id);
      setMessage('Image deleted.');
    } catch (err) {
      setMessage(err.message || 'Delete failed.');
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage('Image URL copied.');
    } catch {
      setMessage('Could not copy URL.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Media Library</h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload, browse, and manage images used across menu items and blog posts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
        >
          <MdCloudUpload className="w-5 h-5" />
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
        <input ref={fileInputRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={handleUpload} />
      </div>

      {message && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">{message}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        {loading ? (
          <p className="text-sm text-gray-500 py-10 text-center">Loading media library...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <MdImage className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p>No images uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <div className="aspect-[4/3] bg-white">
                  <img
                    src={resolveMediaUrl(item.url)}
                    alt={item.originalName || 'Media'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs font-medium text-gray-800 truncate" title={item.originalName}>
                    {item.originalName}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate" title={item.url}>
                    {item.url}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => copyUrl(item.url)}
                      className="flex-1 text-xs py-1.5 rounded-lg border border-gray-300 hover:bg-white"
                    >
                      Copy URL
                    </button>
                    {!item.protected && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                        aria-label="Delete"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
