import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/auth/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApplicationAuditTrailDialog } from "@/components/ApplicationAuditTrailDialog";

type Application = {
  id: string;
  status: string;
  institutionName?: string;
  licenseType?: string;
  createdAt?: string;
  reviewedBy?: { id: string } | null;
};

type UserSummary = {
  id: string;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [infoRequestNote, setInfoRequestNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditAppId, setAuditAppId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const requests: Promise<unknown>[] = [
        api.get<{ data: Application[] }>("/applications"),
      ];
      if (user?.role === "ADMIN") requests.push(api.get<{ data: UserSummary[] }>("/users"));

      const [appsRes, usersRes] = await Promise.all(requests);

      setApps((appsRes as { data: { data?: Application[] } }).data.data ?? []);

      if (user?.role === "ADMIN") {
        const u = usersRes as { data: { data?: UserSummary[] } };
        setTotalUsers((u.data.data ?? []).length);
      } else {
        setTotalUsers(null);
      }
    } catch {
      setError("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (
      user?.role !== "APPLICANT" &&
      user?.role !== "ADMIN" &&
      user?.role !== "REVIEWER" &&
      user?.role !== "APPROVER"
    ) return;
    Promise.resolve().then(() => void load());
  }, [user?.role, load]);

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

      {user?.role === "ADMIN" && (
        <>
          <div className="text-sm text-muted-foreground">
            {loading ? "Loading…" : "Platform overview"}
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Applications</p>
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

          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{loading ? "-" : (totalUsers ?? "-")}</p>
          </div>
        </>
      )}

      {user?.role === "APPROVER" && (
        <>
          <div className="text-sm text-muted-foreground">
            {loading ? "Loading…" : "Approvals overview"}
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Applications</h2>
            <p className="text-sm text-muted-foreground">
              Review applications and request additional information.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>Loading...</TableCell>
                </TableRow>
              ) : apps.filter((a) => a.status !== "DRAFT").length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>No applications.</TableCell>
                </TableRow>
              ) : (
                apps
                  .filter((a) => a.status !== "DRAFT")
                  .slice()
                  .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
                  .map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.institutionName ?? "-"}</TableCell>
                      <TableCell>{a.licenseType ?? "-"}</TableCell>
                      <TableCell>{a.status}</TableCell>
                      <TableCell>{a.createdAt ? new Date(a.createdAt).toLocaleString() : "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              submitting ||
                              Boolean(a.reviewedBy) ||
                              (a.status !== "SUBMITTED" && a.status !== "RESUBMITTED")
                            }
                            onClick={async () => {
                              setSubmitting(true);
                              try {
                                await api.patch(`/applications/${a.id}/start-review`);
                                await load();
                              } finally {
                                setSubmitting(false);
                              }
                            }}
                          >
                            Start review
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={submitting || !a.reviewedBy || a.reviewedBy.id !== user?.id}
                            onClick={() => {
                              setSelectedAppId(a.id);
                              setInfoRequestNote("");
                              setRequestInfoOpen(true);
                            }}
                          >
                            Request info
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              submitting ||
                              !a.reviewedBy ||
                              a.reviewedBy.id !== user?.id ||
                              a.status !== "UNDER_REVIEW"
                            }
                            onClick={async () => {
                              setSubmitting(true);
                              try {
                                await api.patch(`/applications/${a.id}/complete-review`);
                                await load();
                              } finally {
                                setSubmitting(false);
                              }
                            }}
                          >
                            Complete review
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAuditAppId(a.id);
                              setAuditOpen(true);
                            }}
                          >
                            Audit trail
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>

          <AlertDialog open={requestInfoOpen} onOpenChange={setRequestInfoOpen}>
            <AlertDialogContent className="max-w-sm!">
              <AlertDialogHeader>
                <AlertDialogTitle>Request additional info</AlertDialogTitle>
                <AlertDialogDescription>
                  Write a note to the applicant describing what you need.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <textarea
                value={infoRequestNote}
                onChange={(e) => setInfoRequestNote(e.target.value)}
                className="min-h-24 w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Info request note…"
              />

              <AlertDialogFooter>
                <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={submitting || !selectedAppId || !infoRequestNote.trim()}
                  onClick={async () => {
                    if (!selectedAppId) return;
                    setSubmitting(true);
                    try {
                      await api.patch(`/applications/${selectedAppId}/request-info`, {
                        infoRequestNote: infoRequestNote.trim(),
                      });
                      setRequestInfoOpen(false);
                      await load();
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  Send
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <ApplicationAuditTrailDialog
            applicationId={auditAppId}
            open={auditOpen}
            onOpenChange={(next) => {
              setAuditOpen(next);
              if (!next) setAuditAppId(null);
            }}
          />
        </div>
      )}

    </div>
  )
}

export default Dashboard
