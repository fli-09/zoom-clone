"use client";

import { useEffect, useState } from "react";
import { fetchHealthCheck, HealthCheckResponse } from "@/lib/api";

export default function HealthStatus() {
  const [data, setData] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchHealthCheck();
      setData(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not connect to backend server.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="p-6 max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-md space-y-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Backend Connectivity
        </h2>
        <span
          className={`inline-block w-3 h-3 rounded-full ${
            loading
              ? "bg-amber-400 animate-pulse"
              : data?.status === "ok"
              ? "bg-emerald-500"
              : "bg-rose-500"
          }`}
        />
      </div>

      {loading && (
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Checking connection to FastAPI server...
        </p>
      )}

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-sm rounded-lg">
          <p className="font-semibold">Connection Error</p>
          <p>{error}</p>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              {data.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Message:</span>
            <span>{data.message}</span>
          </div>
        </div>
      )}

      <button
        onClick={checkHealth}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
      >
        Re-check Health
      </button>
    </div>
  );
}
