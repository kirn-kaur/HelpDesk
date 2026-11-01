import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CircleCheck,
  Clock3,
  Headphones,
  Plus,
  Ticket,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext.jsx";
import { api, errorMessage } from "../services/api.js";
import {
  ErrorState,
  PageHeading,
  Spinner,
  StatusBadge,
  TicketTable,
} from "../components/Ui.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then(({ data }) => setStats(data.data))
      .catch((e) => setError(errorMessage(e)));
    if (user.role !== "customer")
      api
        .get("/dashboard/trends")
        .then(({ data }) => setTrends(data.data))
        .catch(() => {});
  }, [user.role]);
  if (error) return <ErrorState message={error} />;
  if (!stats) return <Spinner label="Loading your workspace" />;
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";
  const cards =
    user.role === "customer"
      ? [
          {
            label: "Total tickets",
            value: stats.total,
            note: "All time",
            icon: Ticket,
            tone: "blue",
          },
          {
            label: "Open tickets",
            value: stats.open,
            note: "Awaiting support",
            icon: Clock3,
            tone: "amber",
          },
          {
            label: "In progress",
            value: stats.inProgress,
            note: "Being worked on",
            icon: Headphones,
            tone: "violet",
          },
          {
            label: "Resolved",
            value: stats.resolved,
            note: "Ready to go",
            icon: CircleCheck,
            tone: "green",
          },
        ]
      : [
          {
            label:
              user.role === "admin" ? "Total tickets" : "Tickets in my queue",
            value: stats.total,
            note: "Visible in your workspace",
            icon: Ticket,
            tone: "blue",
          },
          {
            label: "Open tickets",
            value: stats.open,
            note: "Need attention",
            icon: Clock3,
            tone: "amber",
          },
          {
            label: "High priority",
            value: stats.highPriority,
            note: "High or critical",
            icon: TrendingUp,
            tone: "red",
          },
          {
            label: "Resolved",
            value: stats.resolved,
            note: "Successfully closed",
            icon: CircleCheck,
            tone: "green",
          },
        ];
  return (
    <div className="dashboard-page">
      <PageHeading
        eyebrow={
          user.role === "admin"
            ? "ADMIN OVERVIEW"
            : user.role === "agent"
              ? "SUPPORT OVERVIEW"
              : "YOUR WORKSPACE"
        }
        title={`${greeting}, ${user.name.split(" ")[0]}.`}
        description={
          user.role === "customer"
            ? "Here is a quick look at your support requests."
            : "Here is what is happening across your support queue."
        }
        action={
          user.role === "customer" ? (
            <Link className="button primary" to="/tickets/new">
              <Plus size={17} /> Create ticket
            </Link>
          ) : (
            <Link className="button secondary" to="/tickets">
              View ticket queue <ArrowUpRight size={16} />
            </Link>
          )
        }
      />
      <div className="stat-grid">
        {cards.map(({ label, value, note, icon: Icon, tone }) => (
          <article className="stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <span className={`stat-icon ${tone}`}>
                <Icon size={18} />
              </span>
            </div>
            <div className="stat-value">{value.toLocaleString()}</div>
            <div className="stat-note">{note}</div>
          </article>
        ))}
      </div>
      {user.role === "admin" && (
        <div className="admin-strip">
          <div className="strip-icon">
            <UsersRound size={20} />
          </div>
          <div>
            <strong>
              {(stats.userCounts?.customer || 0).toLocaleString()} customers
            </strong>
            <span>
              {(stats.userCounts?.agent || 0).toLocaleString()} agents
              supporting your workspace
            </span>
          </div>
          <Link to="/users">
            Manage people <ArrowUpRight size={15} />
          </Link>
        </div>
      )}
      {user.role !== "customer" && (
        <div className="dashboard-lower">
          <section className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <h2>Ticket activity</h2>
                <p>Created and resolved over the last 30 days</p>
              </div>
              <span className="chart-key">
                <i /> Created
              </span>
            </div>
            <div className="trend-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient
                      id="createdFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#6366f1"
                        stopOpacity={0.18}
                      />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#edf0f5" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => value.slice(5)}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#8c96a5", fontSize: 11 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#8c96a5", fontSize: 11 }}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#createdFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stroke="#21a67a"
                    strokeWidth={2}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="panel workload-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  {user.role === "admin" ? "Agent workload" : "Queue snapshot"}
                </h2>
                <p>
                  {user.role === "admin"
                    ? "Assigned tickets per agent"
                    : "A pulse on the current queue"}
                </p>
              </div>
            </div>
            {user.role === "admin" && stats.workload.length ? (
              stats.workload.slice(0, 4).map((agent) => (
                <div className="workload-row" key={agent.name}>
                  <span className="workload-name">{agent.name}</span>
                  <div className="workload-bar">
                    <i
                      style={{ width: `${Math.min(100, agent.count * 12)}%` }}
                    />
                  </div>
                  <strong>{agent.count}</strong>
                </div>
              ))
            ) : user.role === "admin" ? (
              <p className="muted-note">No agent assignments yet.</p>
            ) : (
              <div className="queue-summary">
                <span>
                  <i className="dot amber-dot" />
                  Open
                </span>
                <strong>{stats.open}</strong>
                <span>
                  <i className="dot blue-dot" />
                  In progress
                </span>
                <strong>{stats.inProgress}</strong>
                <span>
                  <i className="dot green-dot" />
                  Resolved
                </span>
                <strong>{stats.resolved}</strong>
              </div>
            )}
          </section>
        </div>
      )}
      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent tickets</h2>
            <p>
              {user.role === "customer"
                ? "Your latest support conversations"
                : "The latest activity from your queue"}
            </p>
          </div>
          <Link className="text-link" to="/tickets">
            View all tickets <ArrowUpRight size={15} />
          </Link>
        </div>
        <TicketTable tickets={stats.recent} />
      </section>
    </div>
  );
}
