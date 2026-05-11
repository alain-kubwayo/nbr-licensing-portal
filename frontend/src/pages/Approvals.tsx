import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { ApplicationAuditTrailDialog } from "@/components/ApplicationAuditTrailDialog";

type Application = {
  id: string;
  status: string;
  institutionName: string;
  licenseType: string;
  createdAt: string;
  submittedAt: string | null;
  applicant?: { email: string } | null;
  reviewedBy?: { email: string } | null;
};

export default function Approvals() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState<null | { id: string; mode: "approve" | "reject" }>(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditAppId, setAuditAppId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: Application[] }>("/applications");
      setApps(res.data.data ?? []);
    } catch {
      setError("Failed to load applications awaiting approval");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => void load());
  }, []);

  const awaiting = useMemo(() => {
    return apps
      .filter((app) => app.status === "REVIEW_COMPLETED")
      .slice()
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }, [apps]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Awaiting Approval</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${awaiting.length} application${awaiting.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
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
            <TableHead>Applicant</TableHead>
            <TableHead>Reviewer</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6}>Loading...</TableCell>
            </TableRow>
          ) : awaiting.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>No applications awaiting approval.</TableCell>
            </TableRow>
          ) : (
            awaiting.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{app.institutionName}</TableCell>
                <TableCell>{app.licenseType}</TableCell>
                <TableCell>{app.applicant?.email ?? "-"}</TableCell>
                <TableCell>{app.reviewedBy?.email ?? "-"}</TableCell>
                <TableCell>{app.submittedAt ? new Date(app.submittedAt).toLocaleString() : "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAuditAppId(app.id);
                        setAuditOpen(true);
                      }}
                    >
                      Audit trail
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDecisionNote("");
                        setOpen({ id: app.id, mode: "approve" });
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setDecisionNote("");
                        setOpen({ id: app.id, mode: "reject" });
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ApplicationAuditTrailDialog
        applicationId={auditAppId}
        open={auditOpen}
        onOpenChange={(next) => {
          setAuditOpen(next);
          if (!next) setAuditAppId(null);
        }}
      />

      <AlertDialog open={Boolean(open)} onOpenChange={() => setOpen(null)}>
        <AlertDialogContent className="max-w-sm!">
          <AlertDialogHeader>
            <AlertDialogTitle>{open?.mode === "reject" ? "Reject application" : "Approve application"}</AlertDialogTitle>
            <AlertDialogDescription>Decision note is required.</AlertDialogDescription>
          </AlertDialogHeader>

          <textarea
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            className="min-h-24 w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            placeholder="Decision note…"
          />

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={submitting || !open?.id || !decisionNote.trim()}
              onClick={async () => {
                if (!open?.id) return;
                setSubmitting(true);
                try {
                  const endpoint = open.mode === "reject" ? "reject" : "approve";
                  await api.patch(`/applications/${open.id}/${endpoint}`, {
                    decisionNote: decisionNote.trim(),
                  });
                  setOpen(null);
                  await load();
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

