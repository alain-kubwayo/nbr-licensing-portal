import { MoreHorizontalIcon, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ApplicationAuditTrailDialog } from "@/components/ApplicationAuditTrailDialog";
import ApplicationForm from "./ApplicationForm";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { api } from "@/services/api";
import { useAuth } from "@/auth/useAuth";

type Application = {
  id: string;
  status: string;
  institutionName: string;
  licenseType: string;
  createdAt: string;
  submittedAt: string | null;
};

const ApplicationList = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditAppId, setAuditAppId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: Application[] }>("/applications");
      setItems(res.data.data ?? []);
    } catch {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => void load());
  }, []);

  const rows = useMemo(() => {
    return [...items].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }, [items]);

  const canSeeAuditTrail =
    user?.role === "REVIEWER" || user?.role === "APPROVER" || user?.role === "ADMIN";

  const openAuditTrail = (applicationId: string) => {
    setAuditAppId(applicationId);
    setAuditOpen(true);
  };

  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <div className="flex justify-end gap-2 items-center">
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <div className="flex gap-2 items-center">
                <PlusCircle />
                <p>New Application</p>
              </div>
            </Button>
          </AlertDialogTrigger>
        </div>

        <AlertDialogContent className="max-w-2xl!">
          <ApplicationForm
            onCancel={() => setOpen(false)}
            onCreated={() => void load()}
          />
        </AlertDialogContent>
      </AlertDialog>
      <div className="py-4 text-sm text-muted-foreground">
        {loading ? "Loading…" : `${rows.length} application${rows.length === 1 ? "" : "s"}`}
      </div>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Institution</TableHead>
            <TableHead>License Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5}>Loading...</TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>No applications yet.</TableCell>
            </TableRow>
          ) : (
            rows.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{app.institutionName}</TableCell>
                <TableCell className="font-medium">{app.licenseType}</TableCell>
                <TableCell className="font-medium">{app.status}</TableCell>
                <TableCell>{app.createdAt ? new Date(app.createdAt).toLocaleString() : "-"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontalIcon />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <Link to={`/dashboard/applications/${app.id}`}>
                        <DropdownMenuItem>View</DropdownMenuItem>
                      </Link>
                      {canSeeAuditTrail && (
                        <DropdownMenuItem onSelect={() => openAuditTrail(app.id)}>
                          Audit trail
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" disabled>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
    </div>
  );
};

export default ApplicationList;
