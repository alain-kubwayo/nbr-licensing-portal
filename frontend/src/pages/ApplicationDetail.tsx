import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";
import { api } from "@/services/api";

type Application = {
  id: string;
  status: string;
  institutionName: string;
  licenseType: string;
  notes: string | null;
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
  const [app, setApp] = useState<Application | null>(null);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/dashboard/applications">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <Button variant="outline" onClick={() => window.location.reload()} disabled={loading}>
          Refresh
        </Button>
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
            <span className="text-muted-foreground">Created At</span>
            <span className="font-medium">{createdAt}</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Submitted At</span>
            <span className="font-medium">
              {submittedAt}
            </span>
          </div>

          <Separator />

          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Notes</span>
            <span className="font-medium whitespace-pre-wrap wrap-break-word">{app.notes || "-"}</span>
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
    </div>
  );
};

export default ApplicationDetail;
