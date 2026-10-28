import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";
import { Button, ErrorState, Field, PageHeader, Panel, StatusBadge } from "../components/ui.jsx";

const roles = ["ADMIN", "INSTRUCTOR", "STUDENT"];

export function UserManagementPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activationLink, setActivationLink] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25" });
      if (query) params.set("q", query);
      if (roleFilter) params.set("role", roleFilter);
      if (activeFilter) params.set("active", activeFilter);
      const data = await api(`/users?${params}`);
      setRows(data.items);
      setPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [query, roleFilter, activeFilter, page]);
  useEffect(() => {
    if (isAdmin)
      api("/preparedness/institutions")
        .then((data) => setInstitutions(data.items || []))
        .catch(() => {});
  }, [isAdmin]);

  async function createUser(event) {
    event.preventDefault();
    setBusy(true);
    setActivationLink("");
    setError("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    if (!body.institutionId) delete body.institutionId;
    try {
      const data = await api("/users", { method: "POST", body: JSON.stringify(body) });
      setActivationLink(
        `${window.location.origin}/activate?token=${encodeURIComponent(data.activationToken)}`
      );
      event.currentTarget.reset();
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function updateUser(row, patch) {
    if (
      (patch.role || patch.active !== undefined) &&
      !window.confirm(`Apply this account change to ${row.name}?`)
    )
      return;
    try {
      await api(`/users/${row.id}`, { method: "PATCH", body: JSON.stringify(patch) });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={isAdmin ? "Platform administration" : "Institution workspace"}
        title={isAdmin ? "User management" : "Assigned students"}
        description={
          isAdmin
            ? "Manage platform accounts, roles, activation, and institution assignments."
            : "Manage student accounts in your assigned institution."
        }
      />
      {error && <ErrorState message={error} />}
      {activationLink && (
        <Panel>
          <strong>One-time activation link</strong>
          <p>
            Share this link securely with the new account holder. It expires in 24 hours and can
            only be used once.
          </p>
          <input readOnly value={activationLink} onFocus={(event) => event.target.select()} />
        </Panel>
      )}
      <Panel className="user-create-panel">
        <h2>Create account</h2>
        <form className="user-create-form" onSubmit={createUser}>
          <Field
            id="new-name"
            label="Full name"
            name="name"
            minLength="2"
            maxLength="80"
            required
          />
          <Field id="new-email" label="Email address" name="email" type="email" required />
          <label className="field" htmlFor="new-role">
            <span>Role</span>
            <select id="new-role" name="role" defaultValue={isAdmin ? "STUDENT" : "STUDENT"}>
              {(isAdmin ? roles : ["STUDENT"]).map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
          <label className="field" htmlFor="new-level">
            <span>Learning level</span>
            <select id="new-level" name="educationLevel" defaultValue="secondary">
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="college">College</option>
              <option value="adult">Adult</option>
            </select>
          </label>
          {isAdmin && (
            <label className="field" htmlFor="new-institution">
              <span>Institution</span>
              <select id="new-institution" name="institutionId" defaultValue="">
                <option value="">No institution</option>
                {institutions.map((item) => (
                  <option value={item._id} key={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Button disabled={busy} type="submit">
            {busy ? "Creating…" : "Create account"}
          </Button>
        </form>
      </Panel>
      <Panel>
        <div className="user-filters">
          <Field
            id="user-search"
            label="Search users"
            value={query}
            onChange={(event) => {
              setPage(1);
              setQuery(event.target.value);
            }}
            placeholder="Name or email"
          />
          <label className="field" htmlFor="role-filter">
            <span>Role</span>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(event) => {
                setPage(1);
                setRoleFilter(event.target.value);
              }}
            >
              <option value="">All roles</option>
              {roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
          <label className="field" htmlFor="status-filter">
            <span>Account status</span>
            <select
              id="status-filter"
              value={activeFilter}
              onChange={(event) => {
                setPage(1);
                setActiveFilter(event.target.value);
              }}
            >
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Pending / inactive</option>
            </select>
          </label>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Institution</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading accounts…</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <UserRow
                    key={row.id}
                    row={row}
                    isAdmin={isAdmin}
                    onUpdate={updateUser}
                    institutions={institutions}
                  />
                ))
              )}
              {!loading && !rows.length && (
                <tr>
                  <td colSpan="6">No accounts match these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="user-pagination">
          <span>
            Page {page} of {pages}
          </span>
          <div>
            <button
              className="text-button"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </button>
            <button
              className="text-button"
              disabled={page >= pages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </Panel>
      {isAdmin && (
        <p className="user-audit-link">
          <Link to="/admin/audit">Review privileged account activity</Link>
        </p>
      )}
    </>
  );
}

function UserRow({ row, isAdmin, onUpdate, institutions }) {
  const [role, setRole] = useState(row.role);
  const [institutionId, setInstitutionId] = useState(row.institutionId || "");
  return (
    <tr>
      <td>{row.name}</td>
      <td>{row.email}</td>
      <td>
        {isAdmin ? (
          <select
            aria-label={`Role for ${row.name}`}
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            {roles.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        ) : (
          <StatusBadge>{row.role}</StatusBadge>
        )}
      </td>
      <td>
        {isAdmin ? (
          <select
            aria-label={`Institution for ${row.name}`}
            value={institutionId}
            onChange={(event) => setInstitutionId(event.target.value)}
          >
            <option value="">Unassigned</option>
            {institutions.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        ) : row.institutionId ? (
          "Assigned institution"
        ) : (
          "Unassigned"
        )}
      </td>
      <td>
        <StatusBadge tone={row.active ? "green" : "neutral"}>
          {row.active ? "Active" : "Pending / inactive"}
        </StatusBadge>
      </td>
      <td className="table-actions">
        {isAdmin && (
          <button
            className="text-button"
            onClick={() => onUpdate(row, { role, institutionId: institutionId || null })}
          >
            Save
          </button>
        )}
        {isAdmin && (
          <button className="text-button" onClick={() => onUpdate(row, { active: !row.active })}>
            {row.active ? "Deactivate" : "Activate"}
          </button>
        )}
      </td>
    </tr>
  );
}

export function ActivateAccountPage() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const password = new FormData(event.currentTarget).get("password");
    try {
      const data = await api("/auth/activate", {
        method: "POST",
        body: JSON.stringify({ token: params.get("token"), password }),
      });
      await login({ email: data.user.email, password });
      window.location.assign("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Activate account</h1>
        <p>Choose a password to finish setting up your account.</p>
        <form className="form-stack" onSubmit={submit}>
          <Field
            id="activation-password"
            name="password"
            label="New password"
            type="password"
            minLength="12"
            autoComplete="new-password"
            required
          />
          {error && <ErrorState message={error} />}
          <Button disabled={busy} type="submit">
            {busy ? "Activating…" : "Set password"}
          </Button>
        </form>
      </section>
    </main>
  );
}

export function AuditLogPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/users/audit")
      .then((data) => setEvents(data.items || []))
      .catch((err) => setError(err.message));
  }, []);
  return (
    <>
      <PageHeader
        eyebrow="Platform administration"
        title="Security audit log"
        description="Read-only history of privileged account and role changes."
      />
      {error && <ErrorState message={error} />}
      <Panel>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Target</th>
                <th>Changes</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id}>
                  <td>{new Date(event.createdAt).toLocaleString()}</td>
                  <td>{event.action}</td>
                  <td>{event.actorId?.name || "Unavailable"}</td>
                  <td>{event.targetId?._id || event.targetId || "Unavailable"}</td>
                  <td>
                    <code>{JSON.stringify(event.changes || {})}</code>
                  </td>
                </tr>
              ))}
              {!events.length && !error && (
                <tr>
                  <td colSpan="5">No audit events recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
