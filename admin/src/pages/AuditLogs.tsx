import { useEffect, useState } from "react";
import { Loader2, Search, History, ShieldCheck, MapPin, Trash2, UserCheck } from "lucide-react";
import { getAuditLogs, AuditLog } from "../services/api";

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const fetchLogs = async () => {
    try {
      const { data } = await getAuditLogs();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("login")) {
      return (
        <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold">
          <UserCheck className="h-3 w-3 mr-1" />
          {action}
        </span>
      );
    }
    if (act.includes("signup") || act.includes("verified")) {
      return (
        <span className="inline-flex items-center text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full text-xs font-semibold">
          <ShieldCheck className="h-3 w-3 mr-1" />
          {action}
        </span>
      );
    }
    if (act.includes("create") || act.includes("save") || act.includes("approval")) {
      return (
        <span className="inline-flex items-center text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full text-xs font-semibold">
          <MapPin className="h-3 w-3 mr-1" />
          {action}
        </span>
      );
    }
    if (act.includes("delete") || act.includes("reject")) {
      return (
        <span className="inline-flex items-center text-red-700 bg-red-50 px-2.5 py-1 rounded-full text-xs font-semibold">
          <Trash2 className="h-3 w-3 mr-1" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full text-xs font-semibold">
        <History className="h-3 w-3 mr-1" />
        {action}
      </span>
    );
  };

  const uniqueActions = ["All", ...Array.from(new Set(logs.map(log => log.action).filter(Boolean)))];

  const filteredLogs = logs
    .filter((log) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        (log.user_email || "").toLowerCase().includes(query) ||
        (log.action || "").toLowerCase().includes(query) ||
        (log.details || "").toLowerCase().includes(query) ||
        (log.ip_address || "").toLowerCase().includes(query);

      const matchesAction = actionFilter === "All" || log.action === actionFilter;

      return matchesSearch && matchesAction;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      if (sortBy === "newest") {
        return dateB - dateA;
      }
      if (sortBy === "oldest") {
        return dateA - dateB;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary-500 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Audit Logs</h1>
          <p className="text-slate-500 text-sm mt-1">
            Track user activities and actions in the native app and admin panel.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search logs by email, action, details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="w-1/2 md:w-48">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium text-slate-700 transition-colors"
            >
              <option value="All">All Actions</option>
              {uniqueActions.filter(a => a !== "All").map((action) => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          <div className="w-1/2 md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium text-slate-700 transition-colors"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">User Email</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Details</th>
                <th className="px-6 py-4 font-semibold">IP Address</th>
                <th className="px-6 py-4 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No logs matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {log.user_email}
                    </td>
                    <td className="px-6 py-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {log.ip_address || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-right">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
