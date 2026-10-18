"use client";

import { useEffect, useState } from "react";
import { api, ReviewTask, Grade } from "@/lib/api";
import GradeStamp from "@/components/GradeStamp";
import { ShieldAlert, CheckCircle, XCircle, LogIn, Lock, FileSearch, UserCheck, AlertCircle } from "lucide-react";

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

  if (!token) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Reviewer Authentication
          </h1>
          <p className="text-xs text-slate-500">
            Access to the moderation queue is restricted to authorized data reviewers.
            All moderation actions write immutable records to the audit log.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4"
        >
          {loginError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs">
              {loginError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Review Queue</span>
          </button>

          <p className="text-[11px] text-center text-slate-400 pt-1">
            Default reviewer credential in dev seed: <code className="font-mono">admin</code> / <code className="font-mono">adminpass123</code>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Review Queue
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Moderation pipeline for public leads, AI-extracted claims, and contradiction settlements.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          Sign Out
        </button>
      </div>

      {actionError && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Filter State:
        </span>
        {["open", "resolved", "rejected"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStateFilter(st)}
            className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
              stateFilter === st
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {loadingTasks ? (
        <div className="p-12 text-center text-sm text-slate-500 animate-pulse">
          Fetching review tasks and verification payloads…
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No {stateFilter} tasks in the queue
          </p>
          <p className="text-xs text-slate-500">
            All submitted directory leads and claims have been processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    Task #{task.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {task.kind}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(task.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Payload Details */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5 font-mono">
                {Object.entries(task.payload).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-slate-500 w-32 flex-shrink-0">{k}:</span>
                    <span className="text-slate-900 dark:text-slate-100 break-all">
                      {typeof v === "object" ? JSON.stringify(v) : String(v)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Review Actions if task is open */}
              {task.state === "open" ? (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="text"
                      placeholder="Audit justification reason…"
                      value={reasons[task.id] || ""}
                      onChange={(e) =>
                        setReasons((prev) => ({ ...prev, [task.id]: e.target.value }))
                      }
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                    />
                    <select
                      value={grades[task.id] || "C"}
                      onChange={(e) =>
                        setGrades((prev) => ({
                          ...prev,
                          [task.id]: e.target.value as Grade,
                        }))
                      }
                      className="px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-mono"
                    >
                      <option value="A">Grade A (Official)</option>
                      <option value="B">Grade B (Industry)</option>
                      <option value="C">Grade C (Press)</option>
                      <option value="D">Grade D (Unreviewed)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecision(task.id, "approved")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(task.id, "rejected")}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
                  <span className="font-semibold capitalize">Status: {task.decision || task.state}</span>
                  {task.reason && <span>&bull; &ldquo;{task.reason}&rdquo;</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
