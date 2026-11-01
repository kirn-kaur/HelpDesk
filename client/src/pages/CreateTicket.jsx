import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../services/api.js";
import { ErrorState, PageHeading, Spinner } from "../components/Ui.jsx";

const schema = z.object({
  title: z.string().min(4, "Add a short, descriptive title."),
  category: z.string().min(1, "Choose a category."),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  description: z.string().min(10, "Please share a little more detail."),
});

export default function CreateTicket() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { priority: "Medium" },
  });

  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data.data))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  async function submit(values) {
    setError("");
    try {
      const { data } = await api.post("/tickets", values);
      navigate(`/tickets/${data.data._id}`);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  if (loading) return <Spinner label="Loading categories" />;

  return (
    <>
      <Link className="back-link page-back" to="/tickets">
        <ArrowLeft size={15} />
        Back to tickets
      </Link>
      <PageHeading
        eyebrow="NEW REQUEST"
        title="Tell us how we can help."
        description="Share a few details and our support team will take it from there."
      />
      {error && <ErrorState message={error} />}
      <form className="panel ticket-form" onSubmit={handleSubmit(submit)}>
        <div className="form-section-title">
          <span className="form-step">01</span>
          <div>
            <strong>Ticket details</strong>
            <small>Give your request a clear title and category.</small>
          </div>
        </div>
        <div className="form-grid">
          <label className="wide">
            Subject
            <input
              placeholder="e.g. I need help updating my account"
              {...register("title")}
            />
            {errors.title && (
              <small className="field-error">{errors.title.message}</small>
            )}
          </label>
          <label>
            Category
            <select {...register("category")}>
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <small className="field-error">{errors.category.message}</small>
            )}
          </label>
          <label>
            Priority
            <select {...register("priority")}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
            <small className="field-help">
              Choose critical only if your work is blocked.
            </small>
          </label>
          <label className="wide">
            What is happening?
            <textarea
              rows="7"
              placeholder="Tell us what you were trying to do, what happened, and anything else that may help us understand…"
              {...register("description")}
            />
            {errors.description && (
              <small className="field-error">
                {errors.description.message}
              </small>
            )}
          </label>
        </div>
        <div className="form-actions">
          <span>Our team typically responds within one business day.</span>
          <button className="button primary" disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit ticket"} <Send size={15} />
          </button>
        </div>
      </form>
    </>
  );
}
