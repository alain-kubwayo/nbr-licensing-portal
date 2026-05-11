import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/auth/useAuth";

type Application = {
  id: string;
  status: string;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: Application[] }>("/applications");
      setApps(res.data.data ?? []);
    } catch {
      setError("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== "APPLICANT") return;
    Promise.resolve().then(() => void load());
  }, [user?.role]);

  const stats = useMemo(() => {
    const created = apps.length;
    const approved = apps.filter((a) => a.status === "APPROVED").length;
    const rejected = apps.filter((a) => a.status === "REJECTED").length;
    return { created, approved, rejected };
  }, [apps]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening in your account today
        </p>
      </div>

      {user?.role === "APPLICANT" && (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {loading ? "Loading…" : "Overview"}
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-2xl font-bold">{loading ? "-" : stats.created}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{loading ? "-" : stats.approved}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold">{loading ? "-" : stats.rejected}</p>
            </div>
          </div>
        </>
      )}

      {user?.role === "APPLICANT" && (
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Your Applications</h2>
          <p className="text-sm text-muted-foreground">
            Track your submitted applications and their status.
          </p>
        </div>
      )}

      {user?.role === "REVIEWER" && (
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Pending Reviews</h2>
          <p className="text-sm text-muted-foreground">
            Applications waiting for your review.
          </p>
        </div>
      )}

    </div>
  )
}

export default Dashboard
