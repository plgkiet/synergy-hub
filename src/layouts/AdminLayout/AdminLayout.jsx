import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/img/whiteLogo.png";
import NotificationBell from "@/components/Notifications/NotificationBell";
import { authStorage } from "@/api/authStorage";
import { logout as logoutApi } from "@/api/auth";
import { usePermissions } from "@/auth/usePermissions";
import { hasModule } from "@/utils/permissions";
import "@/styles/admin-ui.css";
import "./AdminLayout.css";

const MENU_SECTIONS = [
  {
    title: "Management",
    items: [
      {
        to: "/admin/dashboard",
        label: "Dashboard",
        icon: "fa-chart-pie",
        end: false,
        module: "AdminPage",
      },
      {
        to: "/admin/users",
        label: "Users",
        icon: "fa-users",
        end: false,
        module: "User",
      },
      {
        to: "/admin/jobs",
        label: "Jobs",
        icon: "fa-briefcase",
        end: false,
        module: "Job",
      },
    ],
  },
];

function filterMenuSections(permissions) {
  return MENU_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => hasModule(permissions, item.module)),
  })).filter((section) => section.items.length > 0);
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authStorage.getUser();
  const { permissions } = usePermissions();
  const menuSections = filterMenuSections(permissions);

  useEffect(() => {
    document.documentElement.classList.add("admin-route");
    return () => document.documentElement.classList.remove("admin-route");
  }, []);

  const handleLogout = () => {
    logoutApi();
    navigate("/login", { replace: true });
  };

  const pageTitle =
    menuSections
      .flatMap((s) => s.items)
      .find((item) => location.pathname.startsWith(item.to))?.label ??
    "Administration";

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">
            <img src={logo} alt="Synergy Hub" />
          </div>
          <div className="admin-sidebar-brand-text">
            <strong>Synergy Hub</strong>
            <span>Admin panel</span>
          </div>
        </div>

        <div className="admin-sidebar-body">
          {menuSections.map((section) => (
            <div key={section.title} className="admin-sidebar-section">
              <p className="admin-sidebar-section-title">{section.title}</p>
              <nav className="admin-sidebar-nav">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `admin-sidebar-link${isActive ? " is-active" : ""}`
                    }
                  >
                    <span className="admin-sidebar-icon">
                      <i className={`fa-solid ${item.icon}`} aria-hidden />
                    </span>
                    <span className="admin-sidebar-label">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-sidebar-link admin-sidebar-link--muted"
            onClick={() => navigate("/dashboard")}
          >
            <span className="admin-sidebar-icon">
              <i className="fa-solid fa-house" aria-hidden />
            </span>
            <span className="admin-sidebar-label">Back to app</span>
          </button>
        </div>
      </aside>

      <div className="admin-shell">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <h1 className="admin-topbar-title">{pageTitle}</h1>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-user-chip">
              <i className="fa-solid fa-user" aria-hidden />
              {user?.username || "User"}
            </span>
            <NotificationBell />
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </header>

        <main className="admin-content">
          <div className="admin-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
