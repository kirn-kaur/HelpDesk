import { useEffect, useState } from "react";
import { Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api, errorMessage } from "../services/api.js";
import {
  ErrorState,
  PageHeading,
  Spinner,
  TicketTable,
} from "../components/Ui.jsx";

export default function TicketList() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const query = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page") || 1);
  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data.data))
      .catch(() => {});
  }, []);
  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/tickets", {
        params: { q: query, status, priority, category, sort, page, limit: 10 },
      })
      .then(({ data }) => {
        setTickets(data.data);
        setPagination(data.pagination);
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [query, status, priority, category, sort, page]);
  function update(key, value) {
    const next = new URLSearchParams(searchParams);
    value ? next.set(key, value) : next.delete(key);
    next.delete("page");
    setSearchParams(next);
  }
  return (
    <>
      <PageHeading
        eyebrow="SUPPORT"
        title="Tickets"
        description={
          user.role === "customer"
            ? "Track your support requests and conversations."
            : "Find, filter, and respond to support requests."
        }
        action={
          user.role === "customer" && (
            <Link className="button primary" to="/tickets/new">
              <Plus size={17} /> New ticket
            </Link>
          )
        }
      />
      <section className="panel list-panel">
        <div className="filters">
          <label className="search-field">
            <Search size={17} />
            <input
              aria-label="Search tickets"
              placeholder="Search by title or ticket number"
              value={query}
              onChange={(e) => update("q", e.target.value)}
            />
          </label>
          <span className="filter-label">
            <SlidersHorizontal size={15} /> Filters
          </span>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => update("status", e.target.value)}
          >
            <option value="">All statuses</option>
            {[
              "Open",
              "In Progress",
              "Waiting for Customer",
              "Resolved",
              "Closed",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            aria-label="Filter by priority"
            value={priority}
            onChange={(e) => update("priority", e.target.value)}
          >
            <option value="">All priorities</option>
            {["Low", "Medium", "High", "Critical"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((x) => (
              <option key={x._id} value={x._id}>
                {x.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Sort tickets"
            value={sort}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="newest">Recently updated</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">Priority</option>
          </select>
        </div>
        {error ? (
          <ErrorState message={error} />
        ) : loading ? (
          <Spinner label="Loading tickets" />
        ) : (
          <TicketTable tickets={tickets} />
        )}
        <div className="pagination">
          <span>
            {pagination.total} ticket{pagination.total === 1 ? "" : "s"}
          </span>
          <div>
            <button
              className="button small secondary"
              disabled={page <= 1}
              onClick={() => update("page", String(page - 1))}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {Math.max(1, pagination.pages)}
            </span>
            <button
              className="button small secondary"
              disabled={page >= pagination.pages}
              onClick={() => update("page", String(page + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
