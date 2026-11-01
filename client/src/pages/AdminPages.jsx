import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, UserRoundCog } from "lucide-react";
import { api, errorMessage } from "../services/api.js";
import {
  Avatar,
  EmptyState,
  ErrorState,
  PageHeading,
  Spinner,
} from "../components/Ui.jsx";

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    try {
      const { data } = await api.get("/users", { params: { limit: 100 } });
      setUsers(data.data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function patch(id, path, body) {
    setError("");
    try {
      await api.patch(`/users/${id}/${path}`, body);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="ADMINISTRATION"
        title="People"
        description="Manage who can access your support workspace."
      />
      <section className="panel management-panel">
        <div className="panel-heading">
          <div>
            <h2>Workspace members</h2>
            <p>Role changes take effect immediately.</p>
          </div>
          <span className="count-chip">
            <UserRoundCog size={14} /> {users.length} people
          </span>
        </div>
        {error && <ErrorState message={error} />}
        {loading ? (
          <Spinner />
        ) : users.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Access</th>
                </tr>
              </thead>
              <tbody>
                {users.map((person) => (
                  <tr key={person._id}>
                    <td>
                      <div className="person-cell">
                        <Avatar name={person.name} size="small" />
                        <div>
                          <strong>{person.name}</strong>
                          <small>{person.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        className="role-select"
                        value={person.role}
                        onChange={(e) =>
                          patch(person._id, "role", { role: e.target.value })
                        }
                      >
                        <option value="customer">Customer</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span
                        className={`member-status ${person.isActive ? "active" : "inactive"}`}
                      >
                        <i />
                        {person.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(person.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className={`button small ${person.isActive ? "danger-outline" : "secondary"}`}
                        onClick={() =>
                          patch(person._id, "status", {
                            isActive: !person.isActive,
                          })
                        }
                      >
                        {person.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No users found" />
        )}
      </section>
    </>
  );
}

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();
  async function load() {
    try {
      const { data } = await api.get("/categories");
      setCategories(data.data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function add(values) {
    setError("");
    try {
      await api.post("/categories", values);
      reset();
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  async function toggle(category) {
    try {
      await api.patch(`/categories/${category._id}`, {
        name: category.name,
        description: category.description,
        isActive: !category.isActive,
      });
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  async function remove(category) {
    if (
      !window.confirm(
        `Remove “${category.name}”? Categories already used on tickets will be archived.`,
      )
    )
      return;
    try {
      await api.delete(`/categories/${category._id}`);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="ADMINISTRATION"
        title="Categories"
        description="Keep support requests organized with clear topics."
      />
      <div className="category-layout">
        <section className="panel management-panel">
          <div className="panel-heading">
            <div>
              <h2>Ticket categories</h2>
              <p>Active categories are available when creating tickets.</p>
            </div>
          </div>
          {error && <ErrorState message={error} />}
          {loading ? (
            <Spinner />
          ) : categories.length ? (
            <div className="category-list">
              {categories.map((category) => (
                <article className="category-row" key={category._id}>
                  <div className="category-color">
                    <span>{category.name[0]}</span>
                  </div>
                  <div className="category-copy">
                    <strong>{category.name}</strong>
                    <small>{category.description || "No description"}</small>
                  </div>
                  <span
                    className={`member-status ${category.isActive ? "active" : "inactive"}`}
                  >
                    <i />
                    {category.isActive ? "Active" : "Archived"}
                  </span>
                  <button
                    className="button small secondary"
                    onClick={() => toggle(category)}
                  >
                    {category.isActive ? "Archive" : "Restore"}
                  </button>
                  <button
                    className="icon-button remove-button"
                    onClick={() => remove(category)}
                    aria-label={`Delete ${category.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No categories yet"
              text="Create the first category using the form."
            />
          )}
        </section>
        <section className="panel category-add">
          <span className="add-icon">
            <Plus size={18} />
          </span>
          <h2>Add a category</h2>
          <p>Make it easy for people to get their request to the right team.</p>
          <form className="form-stack" onSubmit={handleSubmit(add)}>
            <label>
              Category name
              <input
                placeholder="e.g. Account access"
                {...register("name", { required: true, minLength: 2 })}
              />
            </label>
            <label>
              Description <span className="optional">Optional</span>
              <textarea
                rows="3"
                placeholder="A brief description of this category"
                {...register("description")}
              />
            </label>
            <button className="button primary full" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create category"}{" "}
              <Plus size={15} />
            </button>
          </form>
        </section>
      </div>
    </>
  );
}

export function ProfilePage({ user }) {
  return (
    <>
      <PageHeading
        eyebrow="YOUR ACCOUNT"
        title="Profile"
        description="Your account details and workspace access."
      />
      <section className="panel profile-card">
        <div className="profile-cover">
          <div className="profile-large-avatar">
            <Avatar name={user.name} />
          </div>
        </div>
        <div className="profile-details">
          <div className="profile-title">
            <div>
              <h2>{user.name}</h2>
              <span className="profile-email">{user.email}</span>
            </div>
            <span className="role-chip">{user.role}</span>
          </div>
          <div className="profile-info-grid">
            <div>
              <small>ACCOUNT TYPE</small>
              <strong>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </strong>
            </div>
            <div>
              <small>ACCOUNT STATUS</small>
              <strong className="account-active">
                <i /> Active
              </strong>
            </div>
            <div>
              <small>WORKSPACE</small>
              <strong>HelpDesk support</strong>
            </div>
          </div>
          <div className="profile-security">
            <div className="security-shield">✓</div>
            <div>
              <strong>Your account is protected</strong>
              <span>
                Sign-in is secured with encrypted sessions and role-based
                access.
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
