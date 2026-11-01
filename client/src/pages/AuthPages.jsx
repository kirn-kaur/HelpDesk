import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CircleHelp, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { errorMessage } from "../services/api.js";
import { Spinner } from "../components/Ui.jsx";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
const registerSchema = z.object({
  name: z.string().min(2, "Use at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { user, login, register, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const schema = isRegister ? registerSchema : loginSchema;
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });
  if (loading) return <Spinner />;
  if (user) return <Navigate to="/" replace />;
  async function submit(values) {
    setError("");
    try {
      const account = isRegister ? await register(values) : await login(values);
      navigate(account.role === "admin" ? "/analytics" : "/", {
        replace: true,
      });
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-mark">
            <CircleHelp size={20} />
          </span>
          help<span>desk</span>
        </div>
        <div className="auth-promo">
          <span className="promo-chip">
            <Sparkles size={14} /> A better way to get help
          </span>
          <h1>
            Support that
            <br />
            <em>moves you forward.</em>
          </h1>
          <p>
            One place for thoughtful answers, helpful people, and the peace of
            mind that comes with being heard.
          </p>
          <div className="promo-quote">
            <div className="quote-mark">“</div>
            <p>
              Great support is not just solving a problem. It is making sure you
              never feel alone while doing it.
            </p>
            <span>— The HelpDesk team</span>
          </div>
        </div>
        <span className="auth-copyright">
          © 2026 HelpDesk. Built for better conversations.
        </span>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrap">
          <Link className="back-link" to="/">
            <ArrowLeft size={15} /> Back to home
          </Link>
          <div className="auth-heading">
            <span className="eyebrow">
              {isRegister ? "GET STARTED" : "WELCOME BACK"}
            </span>
            <h2>
              {isRegister ? "Create your account" : "Sign in to your account"}
            </h2>
            <p>
              {isRegister
                ? "A little context helps us support you better."
                : "Enter your details and pick up where you left off."}
            </p>
          </div>
          {error && <div className="form-error">{error}</div>}
          <form className="form-stack" onSubmit={handleSubmit(submit)}>
            {isRegister && (
              <label>
                Full name
                <input
                  placeholder="Jordan Lee"
                  autoComplete="name"
                  {...field("name")}
                />
                {errors.name && (
                  <small className="field-error">{errors.name.message}</small>
                )}
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                {...field("email")}
              />
              {errors.email && (
                <small className="field-error">{errors.email.message}</small>
              )}
            </label>
            <label>
              Password
              <input
                type="password"
                placeholder={
                  isRegister ? "At least 8 characters" : "Enter your password"
                }
                autoComplete={isRegister ? "new-password" : "current-password"}
                {...field("password")}
              />
              {errors.password && (
                <small className="field-error">{errors.password.message}</small>
              )}
            </label>
            <button className="button primary full" disabled={isSubmitting}>
              {isSubmitting
                ? "Please wait…"
                : isRegister
                  ? "Create account"
                  : "Sign in"}{" "}
              <ArrowRight size={16} />
            </button>
          </form>
          <div className="auth-switch">
            {isRegister ? "Already have an account?" : "New to HelpDesk?"}{" "}
            <Link to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </div>
          <div className="auth-security">
            <span className="security-check">✓</span> Your account is protected
            with secure sign-in
          </div>
        </div>
      </div>
    </div>
  );
}
