import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock3,
  MessageSquare,
  Send,
  Shield,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api, errorMessage } from "../services/api.js";
import {
  Avatar,
  ErrorState,
  PriorityBadge,
  Spinner,
  StatusBadge,
} from "../components/Ui.jsx";

const statuses = [
  "Open",
  "In Progress",
  "Waiting for Customer",
  "Resolved",
  "Closed",
];

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();
  async function load() {
    try {
      const { data } = await api.get(`/tickets/${id}`);
      setRecord(data.data);
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  useEffect(() => {
    load();
    if (user.role === "admin")
      api
        .get("/users")
        .then(({ data }) =>
          setAgents(data.data.filter((x) => x.role === "agent" && x.isActive)),
        )
        .catch(() => {});
  }, [id]);
  if (error) return <ErrorState message={error} />;
  if (!record) return <Spinner label="Loading conversation" />;
  const { ticket, comments, activities = [] } = record;
  const isCustomer = user.role === "customer";
  async function update(path, body) {
    setBusy(true);
    setError("");
    try {
      await api.patch(`/tickets/${id}${path}`, body);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function send(values) {
    setError("");
    try {
      await api.post(`/tickets/${id}/comments`, values);
      reset();
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <>
      <Link className="back-link page-back" to="/tickets">
        <ArrowLeft size={15} /> All tickets
      </Link>
      <div className="detail-heading">
        <div>
          <span className="ticket-number">{ticket.ticketNumber}</span>
          <h1>{ticket.title}</h1>
          <div className="detail-subtitle">
            <span>
              <UserRound size={14} /> {ticket.creator.name}
            </span>
            <span>
              <Clock3 size={14} /> Created{" "}
              {new Date(ticket.createdAt).toLocaleString()}
            </span>
            <span>{ticket.category.name}</span>
          </div>
        </div>
        <div className="detail-actions">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>
      {error && <ErrorState message={error} />}
      <div className="detail-layout">
        <div className="conversation-column">
          <section className="panel description-card">
            <div className="message-author">
              <Avatar name={ticket.creator.name} size="small" />
              <div>
                <strong>{ticket.creator.name}</strong>
                <small>
                  Ticket description ·{" "}
                  {new Date(ticket.createdAt).toLocaleString()}
                </small>
              </div>
            </div>
            <p className="description-text">{ticket.description}</p>
          </section>
          <section className="panel conversation-card">
            <div className="panel-heading">
              <div>
                <h2>Conversation</h2>
                <p>
                  {comments.length} message{comments.length === 1 ? "" : "s"} on
                  this ticket
                </p>
              </div>
              <MessageSquare size={18} className="muted-icon" />
            </div>
            {comments.length ? (
              <div className="thread">
                {comments.map((comment) => (
                  <article
                    className={`thread-message ${comment.isInternal ? "internal-message" : ""}`}
                    key={comment._id}
                  >
                    <Avatar name={comment.author.name} size="small" />
                    <div className="thread-body">
                      <div className="thread-meta">
                        <strong>{comment.author.name}</strong>
                        <span className={`role-label ${comment.author.role}`}>
                          {comment.isInternal ? (
                            <>
                              <Shield size={12} /> Internal note
                            </>
                          ) : (
                            comment.author.role
                          )}
                        </span>
                        <time>
                          {new Date(comment.createdAt).toLocaleString()}
                        </time>
                      </div>
                      <p>{comment.message}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="thread-empty">
                No replies yet. Start the conversation below.
              </div>
            )}
            {ticket.status !== "Closed" && (
              <form className="reply-form" onSubmit={handleSubmit(send)}>
                <textarea
                  rows="4"
                  placeholder={
                    isCustomer
                      ? "Write a reply to the support team…"
                      : "Write a reply to the customer…"
                  }
                  {...register("message", { required: true })}
                />
                <div className="reply-controls">
                  {!isCustomer && (
                    <label className="checkbox-label">
                      <input type="checkbox" {...register("isInternal")} />
                      <Shield size={14} /> Add as internal note
                    </label>
                  )}
                  <button
                    className="button primary small"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending…" : "Send reply"}{" "}
                    <Send size={14} />
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
        <aside className="detail-sidebar">
          <section className="panel properties-card">
            <div className="panel-heading">
              <div>
                <h2>Ticket details</h2>
                <p>Request properties</p>
              </div>
            </div>
            <div className="property">
              <span>Status</span>
              {isCustomer ? (
                ticket.status === "Resolved" ? (
                  <button
                    className="button small secondary"
                    disabled={busy}
                    onClick={() => update("/status", { status: "Open" })}
                  >
                    Reopen ticket
                  </button>
                ) : (
                  <StatusBadge status={ticket.status} />
                )
              ) : (
                <select
                  value={ticket.status}
                  disabled={busy}
                  onChange={(e) =>
                    update("/status", { status: e.target.value })
                  }
                >
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="property">
              <span>Priority</span>
              {isCustomer ? (
                <PriorityBadge priority={ticket.priority} />
              ) : (
                <select
                  value={ticket.priority}
                  disabled={busy}
                  onChange={(e) =>
                    api
                      .patch(`/tickets/${id}`, { priority: e.target.value })
                      .then(load)
                      .catch((e) => setError(errorMessage(e)))
                  }
                >
                  {["Low", "Medium", "High", "Critical"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="property">
              <span>Category</span>
              <strong>{ticket.category.name}</strong>
            </div>
            <div className="property">
              <span>Assigned to</span>
              {ticket.assignedAgent ? (
                <strong>{ticket.assignedAgent.name}</strong>
              ) : (
                <span className="unassigned">Unassigned</span>
              )}
            </div>
            {user.role === "admin" && (
              <div className="property assign-property">
                <span>Assign agent</span>
                <select
                  value={ticket.assignedAgent?._id || ""}
                  onChange={(e) =>
                    update("/assign", { assignedAgent: e.target.value || null })
                  }
                >
                  <option value="">Unassigned</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="property">
              <span>Last updated</span>
              <strong>{new Date(ticket.updatedAt).toLocaleDateString()}</strong>
            </div>
          </section>
          {activities.length > 0 && (
            <section className="panel activity-card">
              <div className="panel-heading">
                <div>
                  <h2>Activity</h2>
                  <p>Ticket history</p>
                </div>
              </div>
              {activities.slice(0, 8).map((item) => (
                <div className="activity-item" key={item._id}>
                  <span className="activity-check">
                    <Check size={12} />
                  </span>
                  <div>
                    <strong>{item.action.replaceAll("_", " ")}</strong>
                    <small>
                      {item.actor?.name} ·{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))}
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
