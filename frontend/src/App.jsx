
import { useEffect, useState } from "react";
import {
  Truck,
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  MapPin,
  X,
} from "lucide-react";
import { api } from "./api";
import "./index.css";

const emptyAgent = {
  fullName: "",
  phone: "",
  email: "",
  serviceArea: "",
  status: "active",
};

export default function App() {
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [form, setForm] = useState(emptyAgent);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [agentResponse, statsResponse] = await Promise.all([
        api.list({ search, status }),
        api.stats(),
      ]);

      setAgents(agentResponse.data || []);
      setStats(statsResponse.data || {
        total: 0,
        active: 0,
        inactive: 0,
      });
    } catch (err) {
      setError(err.message || "Unable to load agents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [search, status]);

  function openAddForm() {
    setEditingAgent(null);
    setForm(emptyAgent);
    setModalOpen(true);
  }

  function openEditForm(agent) {
    setEditingAgent(agent);
    setForm({
      fullName: agent.fullName || "",
      phone: agent.phone || "",
      email: agent.email || "",
      serviceArea: agent.serviceArea || "",
      status: agent.status || "active",
    });
    setModalOpen(true);
  }

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingAgent) {
        await api.update(editingAgent.id, form);
      } else {
        await api.create(form);
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to save agent");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(agent) {
    const confirmed = window.confirm(
      `Delete ${agent.fullName}?`
    );

    if (!confirmed) return;

    try {
      await api.remove(agent.id);
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to delete agent");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Truck size={22} />
          </div>

          <div>
            <strong>Fleet<span>Desk</span></strong>
            <small>DELIVERY OPERATIONS</small>
          </div>
        </div>

        <p className="workspace-label">WORKSPACE</p>

        <nav className="side-nav">
          <a href="#overview" className="nav-item">
            Dashboard
          </a>

          <a href="#agents" className="nav-item active">
            <Users size={18} />
            Delivery Agents
          </a>
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-profile">
          <div className="profile-avatar">AD</div>
          <div className="profile-info">
            <strong>Admin</strong>
            <span>Fleet Administrator</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            Workspace / <strong>Delivery Agents</strong>
          </div>

          <button
            className="button button-quiet"
            onClick={loadData}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </header>

        <div className="content" id="agents">
          <div className="page-intro">
            <div>
              <div className="eyebrow">FLEET MANAGEMENT</div>
              <h1>Delivery Agents.</h1>
              <p>Manage your delivery team in one place.</p>
            </div>

            <button
              className="button button-primary"
              onClick={openAddForm}
            >
              <Plus size={18} />
              Add Agent
            </button>
          </div>

          {error && (
            <div className="error-banner">
              {error}
              <button onClick={loadData}>Retry</button>
            </div>
          )}

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon violet">
                <Users size={20} />
              </div>
              <div className="stat-label">Total Agents</div>
              <div className="stat-value">{stats.total}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <Truck size={20} />
              </div>
              <div className="stat-label">Active Agents</div>
              <div className="stat-value">{stats.active}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon amber">
                <Users size={20} />
              </div>
              <div className="stat-label">Inactive Agents</div>
              <div className="stat-value">{stats.inactive}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">
                <Truck size={20} />
              </div>
              <div className="stat-label">Fleet Readiness</div>
              <div className="stat-value">
                {stats.total
                  ? Math.round(
                      (stats.active / stats.total) * 100
                    )
                  : 0}%
              </div>
            </div>
          </section>

          <section className="directory-card">
            <div className="directory-head">
              <div>
                <h2>Agent Directory</h2>
                <p>View and manage delivery agents.</p>
              </div>
            </div>

            <div className="toolbar">
              <div className="search-box">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search agents..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>

              <div className="filter-wrap">
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>AGENT</th>
                    <th>CONTACT</th>
                    <th>SERVICE AREA</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5">Loading agents...</td>
                    </tr>
                  ) : agents.length === 0 ? (
                    <tr>
                      <td colSpan="5">No agents found.</td>
                    </tr>
                  ) : (
                    agents.map((agent) => (
                      <tr key={agent.id}>
                        <td>
                          <div className="agent-cell">
                            <div className="agent-avatar">
                              {(agent.fullName || "DA")
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>

                            <div className="agent-identity">
                              <strong>{agent.fullName}</strong>
                              <span>ID: {agent.id}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="contact-cell">
                            <span>{agent.email}</span>
                            <small>{agent.phone}</small>
                          </div>
                        </td>

                        <td>
                          <div className="area-cell">
                            <MapPin size={15} />
                            {agent.serviceArea}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`status-pill ${agent.status}`}
                          >
                            {agent.status}
                          </span>
                        </td>

                        <td>
                          <div className="row-actions">
                            <button
                              className="row-action"
                              title="Edit"
                              onClick={() => openEditForm(agent)}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="row-action danger-action"
                              title="Delete"
                              onClick={() => handleDelete(agent)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {modalOpen && (
        <div className="modal-backdrop">
          <section className="modal">
            <div className="modal-head">
              <h2>
                {editingAgent ? "Edit Agent" : "Add Agent"}
              </h2>

              <button
                className="icon-button"
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form className="agent-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label className="field wide">
                  <span>Full Name</span>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                  />
                </label>

                <label className="field">
                  <span>Phone</span>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter phone number"
                  />
                </label>

                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email"
                  />
                </label>

                <label className="field wide">
                  <span>Service Area</span>
                  <input
                    name="serviceArea"
                    value={form.serviceArea}
                    onChange={handleChange}
                    required
                    placeholder="Enter service area"
                  />
                </label>

                <label className="field wide">
                  <span>Status</span>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-quiet"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="button button-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingAgent
                    ? "Update Agent"
                    : "Create Agent"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
