import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/services/api";

type AuditLog = {
  id: string;
  createdAt: string;
  action: string;
  previousStatus: string | null;
  newStatus: string;
  actor?: { email: string } | null;
  metadata: Record<string, unknown> | null;
};

type ApplicationAuditTrailDialogProps = {
  applicationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ApplicationAuditTrailDialog({
  applicationId,
  open,
  onOpenChange,
}: ApplicationAuditTrailDialogProps) {
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (!open || !applicationId) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setAuditLoading(true);
      setAuditError(null);
      setAuditLogs([]);
      void api
        .get<{ data: AuditLog[] }>(`/applications/${applicationId}/audit-trail`)
        .then((res) => {
          if (!cancelled) setAuditLogs(res.data.data ?? []);
        })
        .catch(() => {
          if (!cancelled) setAuditError("Failed to load audit trail");
        })
        .finally(() => {
          if (!cancelled) setAuditLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [open, applicationId]);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setAuditLogs([]);
          setAuditError(null);
          setAuditLoading(false);
        }
      }}
    >
      <AlertDialogContent className="max-w-sm!">
        <AlertDialogHeader>
          <AlertDialogTitle>Audit trail</AlertDialogTitle>
          <AlertDialogDescription>{applicationId ?? ""}</AlertDialogDescription>
        </AlertDialogHeader>

        {auditError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {auditError}
          </div>
        )}

        <div className="max-h-80 overflow-auto rounded-md border">
          {auditLoading ? (
            <div className="p-3 text-sm text-muted-foreground">Loading...</div>
          ) : auditLogs.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">No audit entries.</div>
          ) : (
            <div className="divide-y">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{log.action}</div>
                    <div className="text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    {log.actor?.email ?? "-"} • {log.previousStatus ?? "-"} → {log.newStatus}
                  </div>
                  {log.metadata && (
                    <pre className="mt-2 max-w-full overflow-auto rounded bg-muted/40 p-2 text-xs">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
