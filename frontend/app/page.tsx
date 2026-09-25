import HealthStatus from "@/components/HealthStatus";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Zoom Clone Skeleton
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
          Next.js 14 App Router + Tailwind CSS + FastAPI
        </p>

        <HealthStatus />
      </div>
    </main>
  );
}
