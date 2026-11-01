import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, errorMessage } from "../services/api.js";
import { ErrorState, PageHeading, Spinner } from "../components/Ui.jsx";

const COLORS = ["#5557da", "#20a67a", "#edaa34", "#e77869", "#7b6fe8"];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then(({ data }) => setStats(data.data))
      .catch((e) => setError(errorMessage(e)));
  }, []);
  if (error) return <ErrorState message={error} />;
  if (!stats) return <Spinner label="Loading analytics" />;
  return (
    <>
      <PageHeading
        eyebrow="ADMINISTRATION"
        title="Analytics"
        description="A live view of support activity across your workspace."
      />
      <div className="stat-grid compact-stats">
        {[
          ["All tickets", stats.total],
          ["Open", stats.open],
          ["Resolved", stats.resolved],
          ["All users", stats.totalUsers],
          ["Customers", stats.userCounts.customer || 0],
          ["Agents", stats.userCounts.agent || 0],
        ].map(([label, value]) => (
          <article className="stat-card compact" key={label}>
            <div className="stat-top">
              <span>{label}</span>
            </div>
            <div className="stat-value">{value.toLocaleString()}</div>
          </article>
        ))}
      </div>
      <div className="analytics-grid">
        <section className="panel analytics-panel">
          <div className="panel-heading">
            <div>
              <h2>Ticket status</h2>
              <p>Current ticket distribution</p>
            </div>
          </div>
          {stats.statusDistribution.length ? (
            <div className="analytics-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={94}
                    paddingAngle={4}
                  >
                    {stats.statusDistribution.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-total">
                <strong>{stats.total}</strong>
                <span>Total</span>
              </div>
            </div>
          ) : (
            <div className="chart-empty">No ticket data yet.</div>
          )}
          <div className="legend-list">
            {stats.statusDistribution.map((entry, i) => (
              <div key={entry.name}>
                <span>
                  <i style={{ background: COLORS[i % COLORS.length] }} />
                  {entry.name}
                </span>
                <strong>{entry.value}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="panel analytics-panel">
          <div className="panel-heading">
            <div>
              <h2>Priority distribution</h2>
              <p>Tickets by urgency</p>
            </div>
          </div>
          {stats.priorityDistribution.length ? (
            <div className="priority-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.priorityDistribution}
                  margin={{ top: 8, right: 6, left: -20, bottom: 4 }}
                >
                  <CartesianGrid stroke="#edf0f5" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#7f8997", fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#7f8997", fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" name="Tickets" radius={[5, 5, 0, 0]}>
                    {stats.priorityDistribution.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={
                          ["#95a2b4", "#5557da", "#edae43", "#e56d62"][i % 4]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty">No ticket data yet.</div>
          )}
          <div className="legend-list">
            {stats.priorityDistribution.map((entry, i) => (
              <div key={entry.name}>
                <span>
                  <i
                    style={{
                      background: ["#95a2b4", "#5557da", "#edae43", "#e56d62"][
                        i % 4
                      ],
                    }}
                  />
                  {entry.name}
                </span>
                <strong>{entry.value}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="panel analytics-panel workload-wide">
          <div className="panel-heading">
            <div>
              <h2>Agent workload</h2>
              <p>Assigned tickets per support agent</p>
            </div>
          </div>
          {stats.workload.length ? (
            stats.workload.map((agent) => (
              <div className="workload-row" key={agent.name}>
                <span className="workload-name">{agent.name}</span>
                <div className="workload-bar">
                  <i style={{ width: `${Math.min(100, agent.count * 12)}%` }} />
                </div>
                <strong>{agent.count}</strong>
              </div>
            ))
          ) : (
            <div className="chart-empty">No assigned tickets yet.</div>
          )}
        </section>
      </div>
    </>
  );
}
