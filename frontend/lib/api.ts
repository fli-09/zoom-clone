const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface HealthCheckResponse {
  status: string;
  message: string;
}

export async function fetchHealthCheck(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_URL}/api/health`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch health check: ${response.statusText}`);
  }
  return response.json();
}
