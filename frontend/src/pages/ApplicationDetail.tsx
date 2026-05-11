import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";
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
import { ApplicationAuditTrailDialog } from "@/components/ApplicationAuditTrailDialog";

type Application = {
  id: string;
  status: string;
  institutionName: string;
  licenseType: string;
  notes: string | null;
  infoRequestNote: string | null;
  resubmissionNote: string | null;
  decisionNote: string | null;
  revisionNumber: number;
  version: number;
  updatedAt: string;
  applicant: { email: string };
  reviewedBy: { email: string } | null;
  approvedBy: { email: string } | null;
  createdAt: string;
  submittedAt: string | null;
  finalizedAt: string | null;
};

type DocumentItem = {
  id: string;
  originalName: string;
  uploadedAt: string;
};

const ApplicationDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [app, setApp] = useState<Application | null>(null);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resubmitOpen, setResubmitOpen] = useState(false);
  const [resubmissionNote, setResubmissionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [appRes, docsRes] = await Promise.all([
          api.get<{ data: Application }>(`/applications/${id}`),
          api.get<{ data: DocumentItem[] }>(`/applications/${id}/documents`),
        ]);
        setApp(appRes.data.data);
        setDocs(docsRes.data.data ?? []);
      } catch {
        setError("Failed to load application");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const submittedAt = app?.submittedAt ? new Date(app.submittedAt).toLocaleString() : "-";
  const createdAt = app?.createdAt ? new Date(app.createdAt).toLocaleString() : "-";
  const updatedAt = app?.updatedAt ? new Date(app.updatedAt).toLocaleString() : "-";
  const finalizedAt = app?.finalizedAt ? new Date(app.finalizedAt).toLocaleString() : "-";
  const canSeeAuditTrail =
    user?.role === "REVIEWER" || user?.role === "APPROVER" || user?.role === "ADMIN";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/dashboard/applications">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {canSeeAuditTrail && (
            <Button
              variant="outline"
              disabled={loading || !id}
              onClick={() => {
                if (!id) return;
                setAuditOpen(true);
              }}
            >
              Audit trail
            </Button>
          )}
          {user?.role === "APPLICANT" && app?.status === "INFO_REQUESTED" && (
            <>
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => {
                  setResubmissionNote("");
                  setResubmitOpen(true);
                }}
              >
                Resubmit
              </Button>
              <AlertDialog open={resubmitOpen} onOpenChange={setResubmitOpen}>
                <AlertDialogContent className="max-w-sm!">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Resubmit application</AlertDialogTitle>
                    <AlertDialogDescription>
                      Add a note explaining what you changed / provided.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <textarea
                    value={resubmissionNote}
                    onChange={(e) => setResubmissionNote(e.target.value)}
                    className="min-h-24 w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    placeholder="Resubmission note…"
                  />

                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={submitting || !id || !resubmissionNote.trim()}
                      onClick={async () => {
                        if (!id) return;
                        setSubmitting(true);
                        try {
                          await api.patch(`/applications/${id}/resubmit`, {
                            resubmissionNote: resubmissionNote.trim(),
                          });
                          setResubmitOpen(false);

                          setLoading(true);
                          setError(null);
                          const [appRes, docsRes] = await Promise.all([
                            api.get<{ data: Application }>(`/applications/${id}`),
                            api.get<{ data: DocumentItem[] }>(`/applications/${id}/documents`),
                          ]);
                          setApp(appRes.data.data);
                          setDocs(docsRes.data.data ?? []);
                        } catch {
                          setError("Failed to resubmit application");
                        } finally {
                          setSubmitting(false);
                          setLoading(false);
                        }
                      }}
                    >
                      Send
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {loading ? "Application" : (app?.institutionName ?? "Application")}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading || !app ? (
            <div>Loading...</div>
          ) : (
            <>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Institution</span>
            <span className="font-medium">{app.institutionName}</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Applicant</span>
            <span className="font-medium">{app.applicant?.email ?? "-"}</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Reviewer</span>
            <span className="font-medium">{app.reviewedBy?.email ?? "-"}</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Approver</span>
            <span className="font-medium">{app.approvedBy?.email ?? "-"}</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">License Type</span>
            <span className="font-medium">{app.licenseType}</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">{app.status}</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Revision</span>
            <span className="font-medium">{app.revisionNumber}</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">{app.version}</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Created At</span>
            <span className="font-medium">{createdAt}</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Updated At</span>
            <span className="font-medium">{updatedAt}</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Submitted At</span>
            <span className="font-medium">
              {submittedAt}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Finalized At</span>
            <span className="font-medium">{finalizedAt}</span>
          </div>

          <Separator />

          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Notes</span>
            <span className="font-medium whitespace-pre-wrap wrap-break-word">{app.notes || "-"}</span>
          </div>

          <Separator />

          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Info Request Note</span>
            <span className="font-medium whitespace-pre-wrap wrap-break-word">{app.infoRequestNote || "-"}</span>
          </div>

          <Separator />

          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Resubmission Note</span>
            <span className="font-medium whitespace-pre-wrap wrap-break-word">{app.resubmissionNote || "-"}</span>
          </div>

          <Separator />

          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Decision Note</span>
            <span className="font-medium whitespace-pre-wrap wrap-break-word">{app.decisionNote || "-"}</span>
          </div>
          </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supporting Documents ({docs.length})</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {docs.length === 0 ? (
            <div className="text-muted-foreground">No documents.</div>
          ) : docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between border rounded-lg p-3"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>{doc.originalName}</span>
                  <span className="text-xs text-muted-foreground">
                    Uploaded {new Date(doc.uploadedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <ApplicationAuditTrailDialog
        applicationId={id ?? null}
        open={auditOpen}
        onOpenChange={setAuditOpen}
      />
    </div>
  );
};

export default ApplicationDetail;
