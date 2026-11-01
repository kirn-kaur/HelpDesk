import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ChartNoAxesCombined,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings2,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Avatar } from "./Ui.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const links = [
    { to: "/", label: "Overview", icon: LayoutDashboard },
    { to: "/tickets", label: "Tickets", icon: Ticket },
    ...(user?.role === "customer"
      ? [{ to: "/tickets/new", label: "Create ticket", icon: Plus }]
      : []),
    ...(user?.role === "admin"
      ? [
          { to: "/users", label: "People", icon: Users },
          { to: "/categories", label: "Categories", icon: Settings2 },
          { to: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
        ]
      : []),
  ];
  async function signOut() {
    await logout();
    navigate("/login");
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <CircleHelp size={20} />
          </span>
          <span>
            help<span className="brand-light">desk</span>
          </span>
          <button
            className="mobile-close icon-button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              end={to === "/"}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Tickets" && (
                <span className="nav-pill">
                  {user?.role === "customer" ? "Mine" : "Queue"}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card">
            <div className="support-icon">
              <CircleHelp size={17} />
            </div>
            <strong>Need a hand?</strong>
            <span>Our team is here to help.</span>
            <NavLink
              to={user?.role === "customer" ? "/tickets/new" : "/tickets"}
            >
              Contact support <span>↗</span>
            </NavLink>
          </div>
          <div className="profile-button">
            <Avatar name={user?.name} />
            <button
              className="profile-copy"
              onClick={() => navigate("/profile")}
            >
              <strong>{user?.name}</strong>
              <small>{user?.role}</small>
            </button>
            <button
              className="logout-icon"
              onClick={signOut}
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <section className="main-shell">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={19} />
          </button>
          <div className="breadcrumb">
            Workspace <span>/</span>{" "}
            <strong>
              {user?.role === "admin"
                ? "Administration"
                : user?.role === "agent"
                  ? "Support desk"
                  : "My helpdesk"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="online">
              <i /> All systems operational
            </span>
            <button
              className="icon-button notification-button"
              onClick={() => navigate("/tickets")}
              aria-label="Open tickets"
            >
              <Ticket size={17} />
            </button>
            <button
              className="topbar-avatar"
              onClick={() => navigate("/profile")}
            >
              <Avatar name={user?.name} size="small" />
            </button>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>
            HelpDesk <span>·</span> Support that moves you forward
          </span>
          <span>Made for better conversations</span>
        </footer>
      </section>
    </div>
  );
}
