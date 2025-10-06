import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  User,
  LayoutDashboard,
  Users,
  FileText,
  BarChart,
  ChevronDown,
  ChevronUp,
  Database,
  BarChart4,
  UserPlus,
  UserCheck,
  LineChart,
} from "lucide-react";

const Sidebar = () => {
  const [dashboardHovered, setDashboardHovered] = useState(false);
  const [userHovered, setUserHovered] = useState(false);

  const links = [
    { name: "Description", path: "/admin/description", icon: FileText },
    { name: "Report", path: "/admin/report", icon: BarChart },
    { name: "Model Performance", path: "/admin/model-performance", icon: LineChart },
    { name: "Profile", path: "/admin/profile", icon: User },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-primary px-4 py-6 space-y-4 shadow-lg z-50 text-black text-2xl">
      <h1 className="text-3xl font-extrabold mb-6 tracking-wide">STPrediction</h1>
      <nav className="flex flex-col space-y-3 ">

        {/* Dashboard Dropdown */}
        <div
          onMouseEnter={() => setDashboardHovered(true)}
          onMouseLeave={() => setDashboardHovered(false)}
        >
          <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-primary/70 transition cursor-pointer">
            <NavLink
              to="/admin/admindash"
              className="flex items-center gap-3 text-black font-medium"
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="">Dashboard</span>
            </NavLink>
            {dashboardHovered ? (
              <ChevronUp className="w-5 h-5 text-black" />
            ) : (
              <ChevronDown className="w-5 h-5 text-black" />
            )}
          </div>

          {dashboardHovered && (
            <div className="ml-6 mt-1 space-y-1">
              <NavLink
                to="/admin/admindash"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg  ${isActive
                    ? "bg-white text-primary font-semibold"
                    : "hover:bg-primary/70 text-black"
                  }`
                }
              >
                <LayoutDashboard className="w-5 h-5" />
                Admin Dash
              </NavLink>
              <NavLink
                to="/admin/dataset-chart"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg  ${isActive
                    ? "bg-white text-primary font-semibold"
                    : "hover:bg-primary/70 text-black"
                  }`
                }
              >
                <Database className="w-5 h-5" />
                Dataset Chart
              </NavLink>
              <NavLink
                to="/admin/system-chart"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg  ${isActive
                    ? "bg-white text-primary font-semibold"
                    : "hover:bg-primary/70 text-black"
                  }`
                }
              >
                <BarChart4 className="w-5 h-5" />
                System Chart
              </NavLink>
            </div>
          )}
        </div>

        {/* Static Links */}
        {links.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg  font-medium ${isActive
                ? "bg-white text-primary font-semibold"
                : "hover:bg-primary/70 text-black"
              }`
            }
          >
            <Icon className="w-6 h-6" />
            {name}
          </NavLink>
        ))}

        {/* User Management Dropdown */}
        <div
          onMouseEnter={() => setUserHovered(true)}
          onMouseLeave={() => setUserHovered(false)}
        >
          <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-primary/70 transition cursor-pointer">
            <span className="flex items-center gap-3  font-medium">
              <Users className="w-6 h-6" />
              User Management
            </span>
            {userHovered ? (
              <ChevronUp className="w-5 h-5 text-black" />
            ) : (
              <ChevronDown className="w-5 h-5 text-black" />
            )}
          </div>

          {userHovered && (
            <div className="ml-6 mt-1 space-y-1">
              <NavLink
                to="/admin/adduser"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg  ${isActive
                    ? "bg-white text-primary font-semibold"
                    : "hover:bg-primary/70 text-black"
                  }`
                }
              >
                <UserPlus className="w-5 h-5" />
                Add User
              </NavLink>
              <NavLink
                to="/admin/viewUsers"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg  ${isActive
                    ? "bg-white text-primary font-semibold"
                    : "hover:bg-primary/70 text-black"
                  }`
                }
              >
                <UserCheck className="w-5 h-5" />
                View Users
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
