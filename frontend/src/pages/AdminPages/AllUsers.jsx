import axios from "axios";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [admin, setAdmin] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAdmin(res.data))
      .catch((err) => console.error("Error loading profile", err));
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase()) ||
        (user.username && user.username.toLowerCase().includes(search.toLowerCase()));
      const userMonth = new Date(user.createdAt).getMonth() + 1;
      const matchesMonth = month ? userMonth === parseInt(month) : true;
      return matchesSearch && matchesMonth;
    });
    setFilteredUsers(filtered);
  }, [search, month, users]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      alert("User deleted successfully");
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        selectedUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("User updated");
      setShowModal(false);
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      alert("Update failed");
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-800 text-black dark:text-white md:ml-64">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 shadow-md">
        <h1 className="text-2xl font-bold text-primary">User - Users View</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-gray-600 transition"
            title="Toggle Theme"
          >
            {darkMode ? (
              <Sun className="text-yellow-400 w-6 h-6" />
            ) : (
              <Moon className="text-gray-800 dark:text-white w-6 h-6" />
            )}
          </button>
          <div className="flex items-center border border-primary rounded-full px-2 py-1">
            <div className="mr-4 text-sm">
              <div className="text-sm font-bold">{admin.username?.split(" ")[0]}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">Admin</div>
            </div>
            <img
              src={`http://localhost:5000/uploads/${admin.profilePicture || "default.png"}`}
              className="w-10 h-10 rounded-full border object-cover"
              alt="Admin"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxNkMyMy4zIDEzIDI2IDEzIDI2IDIyQzI2IDI2IDIzLjMgMjggMjAgMjhDMTYuNyAyOCAxNCAyNiAxNCAyMkMxNCAxOSAxNi43IDE2IDIwIDE2WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTIgMzJDMTIgMjggMTUgMjUgMTkgMjVIMjFDMjUgMjUgMjggMjggMjggMzJWMzZIMTJWMzJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
              }}
            />
          </div>
        </div>
      </header>

      {/* Filters */}
      <main className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name, email or role"
            className="w-full md:w-1/3 px-4 py-2 border rounded bg-white dark:bg-neutral-700 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="w-full md:w-1/4 px-4 py-2 border rounded bg-white dark:bg-neutral-700 dark:text-white"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">Filter by Month</option>
            {[...Array(12).keys()].map((m) => (
              <option key={m} value={m + 1}>
                {new Date(0, m).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <a 
            href="/admin/adduser" 
            className="w-full md:w-auto px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark flex items-center justify-center"
          >
            Add New User
          </a>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white dark:bg-neutral-900 rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th className="text-left py-2 px-4 border-b">#</th>
                <th className="text-left py-2 px-4 border-b">Profile</th>
                <th className="text-left py-2 px-4 border-b">User</th>
                <th className="text-left py-2 px-4 border-b">Email</th>
                <th className="text-left py-2 px-4 border-b">Role</th>
                <th className="text-left py-2 px-4 border-b">Status</th>
                <th className="text-left py-2 px-4 border-b">Created At</th>
                <th className="text-left py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-2 px-4 border-b">{index + 1}</td>
                    <td className="py-2 px-4 border-b">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                        <img
                          src={user.profilePicture ? `http://localhost:5000/uploads/${user.profilePicture}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxNkMyMy4zIDEzIDI2IDEzIDI2IDIyQzI2IDI2IDIzLjMgMjggMjAgMjhDMTYuNyAyOCAxNCAyNiAxNCAyMkMxNCAxOSAxNi43IDE2IDIwIDE2WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTIgMzJDMTIgMjggMTUgMjUgMTkgMjVIMjFDMjUgMjUgMjggMjggMjggMzJWMzZIMTJWMzJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='}
                          alt={`${user.username || 'User'} Profile`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const isDark = document.documentElement.classList.contains('dark');
                            e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" fill="${isDark ? '#374151' : '#F3F4F6'}"/>
                                <path d="M20 16C23.3 16.4 26 19.04 26 22.4C26 25.76 23.3 28.4 20 28.4C16.7 28.4 14 25.76 14 22.4C14 19.04 16.7 16.4 20 16Z" fill="${isDark ? '#9CA3AF' : '#6B7280'}"/>
                                <path d="M12 32C12 28.16 15.16 25 19 25H21C24.84 25 28 28.16 28 32V36H12V32Z" fill="${isDark ? '#9CA3AF' : '#6B7280'}"/>
                              </svg>
                            `)}`;
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b font-medium">{user.username || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td className="py-2 px-4 border-b capitalize">{user.role}</td>
                    <td className="py-2 px-4 border-b capitalize">{user.status || "active"}</td>
                    <td className="py-2 px-4 border-b">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 flex backdrop-blur-sm items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-primary">Edit User</h2>

            <label className="block mb-2">Username</label>
            <input
              type="text"
              className="w-full p-2 border rounded mb-4 dark:bg-neutral-700 dark:text-white"
              value={selectedUser.username}
              onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
            />

            <label className="block mb-2">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded mb-4 dark:bg-neutral-700 dark:text-white"
              value={selectedUser.email}
              onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
            />

            <label className="block mb-2">Phone</label>
            <input
              type="text"
              className="w-full p-2 border rounded mb-4 dark:bg-neutral-700 dark:text-white"
              value={selectedUser.phone}
              onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
            />

            <label className="block mb-2">Role</label>
            <select
              className="w-full p-2 border rounded mb-4 dark:bg-neutral-700 dark:text-white"
              value={selectedUser.role}
              onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <label className="block mb-2">Status</label>
            <select
              className="w-full p-2 border rounded mb-4 dark:bg-neutral-700 dark:text-white"
              value={selectedUser.status || "active"}
              onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
