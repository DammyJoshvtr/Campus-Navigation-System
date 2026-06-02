import {
    ArrowDownCircle,
    ArrowUpCircle,
    Loader2,
    Search,
    Shield,
    Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import { deleteUser, getUsers, updateUserRole, User } from "../services/api";

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  const fetchUsers = async () => {
    try {
      const { data } = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Failed to delete user");
      }
    }
  };

  const handleRoleChange = async (id: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (
      window.confirm(`Are you sure you want to make this user an ${newRole}?`)
    ) {
      try {
        await updateUserRole(id, newRole);
        fetchUsers();
      } catch (error: any) {
        console.error("Failed to update role", error);
        alert(error.response?.data?.message || "Failed to update user role");
      }
    }
  };

  const filteredUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === "email-asc") {
        return a.email.localeCompare(b.email);
      }
      if (sortBy === "role-desc") {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (a.role !== "admin" && b.role === "admin") return 1;
        return a.name.localeCompare(b.name);
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
          <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
          <p className="text-slate-500 text-sm mt-1">
            View and manage registered users.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium text-slate-700 transition-colors"
            >
              <option value="name-asc">Sort: Name A-Z</option>
              <option value="name-desc">Sort: Name Z-A</option>
              <option value="email-asc">Sort: Email A-Z</option>
              <option value="role-desc">Sort: Admin First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    {searchTerm
                      ? "No users found matching search."
                      : "No users registered yet."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-primary-700 font-bold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {user.role === "admin" ? (
                          <span className="inline-flex items-center text-primary-700 bg-primary-50 px-2 py-1 rounded-md text-xs font-semibold">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </span>
                        ) : (
                          <span className="text-slate-600 capitalize">
                            {user.role || "User"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_verified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleRoleChange(user.id, user.role)}
                        className={`p-2 rounded-lg transition-colors flex items-center ${
                          user.role === "admin"
                            ? "text-amber-600 hover:bg-amber-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={
                          user.role === "admin"
                            ? "Demote to User"
                            : "Promote to Admin"
                        }
                      >
                        {user.role === "admin" ? (
                          <ArrowDownCircle className="h-4 w-4" />
                        ) : (
                          <ArrowUpCircle className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={user.role === "admin"}
                        className={`p-2 rounded-lg transition-colors ${
                          user.role === "admin"
                            ? "text-slate-300 cursor-not-allowed"
                            : "text-red-600 hover:bg-red-50"
                        }`}
                        title={
                          user.role === "admin"
                            ? "Cannot delete admin"
                            : "Delete"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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

export default Users;
