import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BookOpenCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  Compass,
  ClipboardList,
  BookOpenText,
  FileText,
  GraduationCap,
  Home,
  LibraryBig,
  Images,
  Newspaper,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../state/auth.jsx";
import { BrandLogo } from "./brand-logo.jsx";

const roleLinks = {
  ADMIN: [
    { to: "/admin/dashboard", label: "Overview", icon: Home },
    { to: "/users", label: "User management", icon: Users },
    { to: "/preparedness", label: "Institutions & drills", icon: Building2 },
    { to: "/academy", label: "Learning curriculum", icon: GraduationCap },
    { to: "/learning/disasters", label: "Disaster Learning Hub", icon: BookOpenText },
    { to: "/visuals", label: "Visual learning", icon: Images },
    { to: "/articles", label: "Disaster articles", icon: Newspaper },
    { to: "/quizzes", label: "Institution quizzes", icon: ClipboardList },
    { to: "/intelligence", label: "Hazard intelligence", icon: Activity },
    { to: "/admin/audit", label: "Audit log", icon: FileText },
    { to: "/resources", label: "Resource library", icon: LibraryBig },
  ],
  INSTRUCTOR: [
    { to: "/instructor/dashboard", label: "Overview", icon: Home },
    { to: "/users", label: "Students", icon: Users },
    { to: "/academy", label: "Learning modules", icon: GraduationCap },
    { to: "/learning/disasters", label: "Disaster Learning Hub", icon: BookOpenText },
    { to: "/visuals", label: "Visual learning", icon: Images },
    { to: "/disaster-updates", label: "Disaster articles", icon: Newspaper },
    { to: "/quizzes", label: "Quizzes & assessments", icon: ClipboardList },
    { to: "/simulations", label: "Crisis simulations", icon: Compass },
    { to: "/preparedness", label: "Checklists & drills", icon: ShieldCheck },
    { to: "/resources", label: "Teaching resources", icon: LibraryBig },
  ],
  STUDENT: [
    { to: "/student/dashboard", label: "My dashboard", icon: Home },
    { to: "/academy", label: "Learn about hazards", icon: BookOpenCheck },
    { to: "/learning/disasters", label: "Disaster Learning Hub", icon: BookOpenText },
    { to: "/visuals", label: "Visual learning", icon: Images },
    { to: "/disaster-updates", label: "Disaster articles", icon: Newspaper },
    { to: "/quizzes", label: "Assigned quizzes", icon: ClipboardList },
    { to: "/simulations", label: "Practice scenarios", icon: Compass },
    { to: "/preparedness", label: "Institution readiness", icon: ShieldCheck },
    { to: "/resources", label: "Safety resources", icon: LibraryBig },
  ],
};

function Brand({ light = false, to = "/" }) {
  return (
    <Link to={to} className={`brand ${light ? "brand-light" : ""}`} aria-label="AtmosWatch home">
      <BrandLogo variant="compact" />
      <BrandLogo variant="symbol" decorative />
    </Link>
  );
}

function WorkspaceLayout({ role }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const links = roleLinks[role] || roleLinks.STUDENT;
  const activeLink = links.find(
    (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
  );
  async function signOut() {
    await logout();
    navigate("/login", { replace: true });
  }
  return (
    <div className={`app-shell role-${role.toLowerCase()} ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <Brand light to={links[0].to} />
          <button
            className="icon-button sidebar-collapse"
            title={collapsed ? "Expand navigation" : "Collapse navigation"}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
          <button
            className="icon-button mobile-close"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="nav-caption">
          {role === "ADMIN"
            ? "ADMINISTRATION"
            : role === "INSTRUCTOR"
              ? "TEACHING WORKSPACE"
              : "MY LEARNING"}
        </div>
        <nav aria-label={`${role.toLowerCase()} navigation`}>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `nav-item ${isActive || (to !== links[0].to && location.pathname.startsWith(`${to}/`)) ? "active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link className="nav-item sidebar-public-link" to="/about">
            <LibraryBig size={17} />
            <span>Public information</span>
          </Link>
          <button className="nav-item logout-action" onClick={signOut}>
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="main-column">
        <header className="top-header">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="top-context">
            <span>{activeLink?.label || "Workspace"}</span>
            <span className="breadcrumb-divider">/</span>
            <span>{role}</span>
          </div>
          <div className="header-right">
            <span className="safety-indicator">
              <span /> Educational preparedness
            </span>
            {user && (
              <div className="user-chip">
                <span>{user.name.slice(0, 1).toUpperCase()}</span>
                {user.name}
              </div>
            )}
          </div>
        </header>
        <main id="main-content" className="main-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>AtmosWatch · Learn. Prepare. Protect.</span>
          <span>For emergencies, follow local authorities and approved institutional plans.</span>
        </footer>
      </div>
    </div>
  );
}

export function AdminLayout() {
  return <WorkspaceLayout role="ADMIN" />;
}
export function InstructorLayout() {
  return <WorkspaceLayout role="INSTRUCTOR" />;
}
export function StudentLayout() {
  return <WorkspaceLayout role="STUDENT" />;
}

export function PublicNavigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className={`public-header ${mobileOpen ? "public-nav-open" : ""}`}>
      <Brand />
      <button
        type="button"
        className="icon-button public-mobile-menu"
        aria-label={mobileOpen ? "Close public navigation" : "Open public navigation"}
        onClick={() => setMobileOpen((value) => !value)}
      >
        {mobileOpen ? <X size={19} /> : <Menu size={19} />}
      </button>
      <nav aria-label="Public information" id="public-navigation">
        <Link onClick={() => setMobileOpen(false)} to="/about">
          About
        </Link>
        <Link onClick={() => setMobileOpen(false)} to="/how-it-works">
          How it works
        </Link>
        <Link onClick={() => setMobileOpen(false)} to="/disaster-guides">
          Disaster guides
        </Link>
        <Link onClick={() => setMobileOpen(false)} to="/disaster-updates">
          Disaster Watch
        </Link>
        <Link onClick={() => setMobileOpen(false)} to="/resources">
          Resources
        </Link>
        <Link onClick={() => setMobileOpen(false)} to="/data-sources">
          Data sources
        </Link>
      </nav>
      <div className="public-header-actions">
        <Link className="button button-outline public-signin" to="/login">
          Sign in <ChevronRight size={15} />
        </Link>
      </div>
    </header>
  );
}

export function PublicLayout() {
  return (
    <div className="public-layout">
      <PublicNavigation />
      <Outlet />
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <header className="auth-topbar">
        <Brand />
        <div className="auth-public-links">
          <Link to="/disaster-updates">Latest disaster stories</Link>
          <Link to="/about">Public information</Link>
          <Link to="/resources">
            Safety resources <ChevronRight size={15} />
          </Link>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
