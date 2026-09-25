import HealthStatus from "@/components/HealthStatus";

export default function MeetingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-slate-50 dark:bg-slate-900">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
        Zoom Clone
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8 text-center max-w-lg">
        Frontend-backend connectivity setup verified using Next.js App Router and FastAPI.
      </p>

      <HealthStatus />
    </div>
  );
}
