"use client";

import { useEffect, useState } from "react";
import { api, ReviewTask, Grade } from "@/lib/api";
import GradeStamp from "@/components/GradeStamp";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  LogIn,
  Lock,
  FileSearch,
  UserCheck,
  AlertCircle,
  Layers,
  Inbox,
  LogOut,
  Clock,
  Sparkles
} from "lucide-react";

export default function ReviewPage() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("adminpass123");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [stateFilter, setStateFilter] = useState("open");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Decision inputs for each task
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [grades, setGrades] = useState<Record<number, Grade>>({});

  // Check localStorage for existing token on mount
  useEffect(() => {
    const saved = localStorage.getItem("gcc_reviewer_token");
    if (saved) {
      setToken(saved);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await api.loginReviewer({ username, password });
      setToken(res.access_token);
      localStorage.setItem("gcc_reviewer_token", res.access_token);
    } catch (err: any) {
      setLoginError(err.message || "Invalid reviewer credentials");
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("gcc_reviewer_token");
  };

  const fetchTasks = () => {
    if (!token) return;
    setLoadingTasks(true);
    setActionError(null);
    api
      .getReviewTasks(token, stateFilter)
      .then((data) => {
        setTasks(data);
        setLoadingTasks(false);
      })
      .catch((err) => {
        setActionError(err.message || "Failed to load review tasks");
        setLoadingTasks(false);
        if (err.message?.includes("401") || err.message?.includes("expired")) {
          handleLogout();
        }
      });
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token, stateFilter]);

  const handleDecision = async (taskId: number, decision: "approved" | "rejected") => {
    if (!token) return;
    setActionError(null);
    setActionSuccess(null);
    const reason = reasons[taskId] || (decision === "approved" ? "Evidence verified against source" : "Insufficient documentation");
    const grade = grades[taskId] || "C";

    try {
      await api.submitReviewDecision(token, taskId, {
        decision,
        reason,
        grade,
      });
      setActionSuccess(`Task #${taskId} ${decision} successfully`);
      fetchTasks();
    } catch (err: any) {
      setActionError(err.message || `Failed to ${decision} task #${taskId}`);
    }
  };

  // If not logged in, show Obsidian-styled Authentication Form
  if (!token) {
    return (
      <div className="max-w-md mx-auto py-16 space-y-6 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-container)]/20 border border-[var(--color-primary)]/30 text-[var(--color-primary)] flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-on-surface)]">
            Reviewer Authentication
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
            Access to the moderation queue is restricted to authorized editorial reviewers. All actions generate immutable audit log records.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-4 border border-[var(--color-outline-variant)]/20 shadow-xl bg-[var(--color-surface-container)]">
          {loginError && (
            <div className="p-3 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)] text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="rev-username" className="block text-xs font-semibold text-[var(--color-on-surface)] mb-1">
                Reviewer Username
              </label>
              <Input
                id="rev-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="rev-password" className="block text-xs font-semibold text-[var(--color-on-surface)] mb-1">
                Password
              </label>
              <Input
                id="rev-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 shadow-[0_0_20px_rgba(197,192,255,0.25)]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Review Queue</span>
            </Button>
          </form>

          <div className="pt-2 border-t border-[var(--color-surface-container-high)] text-center">
            <span className="text-[11px] font-mono text-[var(--color-outline)]">
              Dev Seed Credential: <code className="text-[var(--color-primary)]">admin</code> / <code className="text-[var(--color-primary)]">adminpass123</code>
            </span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-[1280px]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[var(--color-outline)]">
              Reference // Editorial Governance
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-outline-variant)]" />
            <Badge variant="primary" size="sm">Active Session</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-on-surface)]">
            Reviewer Workspace
          </h1>
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            Moderation triage pipeline for public directory leads, AI-extracted claims, and contradiction settlements.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-xs self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          Sign Out
        </Button>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-[var(--color-secondary-container)]/20 border border-[var(--color-secondary)]/30 text-[var(--color-secondary)] text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--color-outline)]">
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Triage Queue</span>
            <Inbox className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-[var(--color-primary)]">
              {tasks.length} <span className="text-base font-medium text-[var(--color-on-surface-variant)]">{stateFilter} tasks</span>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Items awaiting editorial review and scoring
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[var(--color-outline)] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
            <span>Public submissions and AI extractions</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--color-outline)]">
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Audit Policy</span>
            <ShieldAlert className="w-5 h-5 text-[var(--color-secondary)]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-[var(--color-secondary)]">
              Dual Proof
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Minimum 2 independent sources required for Grade A
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[var(--color-outline)] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />
            <span>Articles of Association + EPFO</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--color-outline)]">
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Ledger Settlement</span>
            <Clock className="w-5 h-5 text-[var(--color-tertiary)]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-[var(--color-tertiary)]">
              Instant
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Approved records sync directly to live ledger tables
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[var(--color-outline)] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-tertiary)]" />
            <span>Zero manual cache invalidation required</span>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 shadow-sm w-fit">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--color-outline)] px-2">
          State:
        </span>
        {["open", "resolved", "rejected"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStateFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              stateFilter === st
                ? "bg-[var(--color-surface-container-high)] text-[var(--color-primary)] shadow-sm"
                : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loadingTasks ? (
        <div className="p-12 text-center text-sm text-[var(--color-outline)] animate-pulse font-mono">
          Fetching review tasks and verification payloads…
        </div>
      ) : tasks.length === 0 ? (
        <Card className="p-12 text-center space-y-2 border-dashed border-[var(--color-outline-variant)]/30">
          <p className="text-sm font-semibold text-[var(--color-on-surface)]">
            No {stateFilter} tasks in the moderation queue
          </p>
          <p className="text-xs text-[var(--color-outline)]">
            All submitted directory leads and claims have been processed.
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className="p-5 sm:p-6 space-y-4 border border-[var(--color-outline-variant)]/20 shadow-md"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-surface-container-high)]">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--color-surface-container-high)] text-[var(--color-primary)]">
                    Task #{task.id}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {task.kind}
                  </Badge>
                </div>
                <span className="font-mono text-xs text-[var(--color-outline)]">
                  {new Date(task.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Payload Details */}
              <div className="p-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-xs space-y-1.5 font-mono">
                {Object.entries(task.payload).map(([k, v]) => (
                  <div key={k} className="flex flex-col sm:flex-row sm:gap-4">
                    <span className="text-[var(--color-outline)] sm:w-36 shrink-0 font-medium">{k}:</span>
                    <span className="text-[var(--color-on-surface)] break-all">
                      {typeof v === "object" ? JSON.stringify(v) : String(v)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Controls for Open Tasks */}
              {task.state === "open" ? (
                <div className="pt-3 border-t border-[var(--color-surface-container-high)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                    <input
                      type="text"
                      placeholder="Audit justification reason…"
                      aria-label="Audit justification reason"
                      value={reasons[task.id] || ""}
                      onChange={(e) =>
                        setReasons((prev) => ({ ...prev, [task.id]: e.target.value }))
                      }
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] text-xs text-[var(--color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    />
                    <select
                      value={grades[task.id] || "C"}
                      aria-label="Assign grade"
                      onChange={(e) =>
                        setGrades((prev) => ({
                          ...prev,
                          [task.id]: e.target.value as Grade,
                        }))
                      }
                      className="px-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] text-xs text-[var(--color-on-surface)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    >
                      <option value="A">Grade A (Official Gazetted)</option>
                      <option value="B">Grade B (Audited Disclosures)</option>
                      <option value="C">Grade C (Press / Self-Claim)</option>
                      <option value="D">Grade D (Unverified Draft)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDecision(task.id, "approved")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecision(task.id, "rejected")}
                      className="border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)]/10 text-xs font-bold flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 text-xs font-mono text-[var(--color-outline)] flex items-center gap-2">
                  <span className="font-semibold capitalize text-[var(--color-on-surface)]">
                    Decision: {task.decision || task.state}
                  </span>
                  {task.reason && <span>&bull; &ldquo;{task.reason}&rdquo;</span>}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
