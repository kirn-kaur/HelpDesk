import { Link } from "react-router-dom";
import { CircleAlert, Inbox, LoaderCircle } from "lucide-react";

export function Spinner({ label = "Loading" }) {
  return (
    <div className="loading">
      <LoaderCircle className="spin" size={20} /> {label}
    </div>
  );
}
export function ErrorState({ message }) {
  return (
    <div className="notice error">
      <CircleAlert size={18} />
      {message || "Something went wrong."}
    </div>
  );
}
export function EmptyState({
  title = "Nothing here yet",
  text = "When there is something to show, it will appear here.",
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Inbox size={22} />
      </span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function StatusBadge({ status }) {
  return (
    <span
      className={`badge status-${String(status).toLowerCase().replaceAll(" ", "-")}`}
    >
      {status}
    </span>
  );
}
export function PriorityBadge({ priority }) {
  return (
    <span className={`priority priority-${String(priority).toLowerCase()}`}>
      <i />
      {priority}
    </span>
  );
}
export function Avatar({ name = "HelpDesk", size = "normal" }) {
  return (
    <span className={`avatar ${size}`}>
      {name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()}
    </span>
  );
}
export function TicketTable({ tickets = [] }) {
  if (!tickets.length)
    return (
      <EmptyState
        title="No tickets found"
        text="Try changing your filters, or create a ticket to get started."
      />
    );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Customer</th>
            <th>Category</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket._id}>
              <td>
                <Link className="ticket-link" to={`/tickets/${ticket._id}`}>
                  <span>{ticket.title}</span>
                  <small>{ticket.ticketNumber}</small>
                </Link>
              </td>
              <td>{ticket.creator?.name || "—"}</td>
              <td>{ticket.category?.name || "—"}</td>
              <td>
                <StatusBadge status={ticket.status} />
              </td>
              <td>
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td>{new Date(ticket.updatedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
