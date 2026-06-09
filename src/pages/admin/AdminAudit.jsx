import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { CardSkeleton } from '../../components/Skeleton';

export default function AdminAudit() {
  useDocumentTitle('Audit Log');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.audit(200).then(setLogs).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-semibold">Time</th>
              <th className="text-left p-3 font-semibold">User</th>
              <th className="text-left p-3 font-semibold">Action</th>
              <th className="text-left p-3 font-semibold">Resource</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-3 whitespace-nowrap text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="p-3">{log.user_name || log.user_email || '—'}</td>
                <td className="p-3 font-medium">{log.action}</td>
                <td className="p-3 text-gray-600">{log.resource || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
