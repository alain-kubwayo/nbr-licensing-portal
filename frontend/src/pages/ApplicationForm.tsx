import { useState, type FormEvent } from "react";
import FormWrapper from "../components/FormWrapper";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { api } from "@/services/api";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ApplicationData = {
  institutionName: string;
  licenseType: string;
  notes: string;
  supportingDocuments: File[];
};

const INITIAL_DATA: ApplicationData = {
  institutionName: "",
  licenseType: "",
  notes: "",
  supportingDocuments: [],
};

type ApplicationFormProps = {
  onCancel: () => void;
  mode?: "create" | "edit";
  initialApplicationData?: Partial<ApplicationData>;
  onCreated?: (applicationId: string) => void;
};

const applicationTypes = [
  { label: "New License", value: "New License" },
  { label: "Renewal", value: "Renewal" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);

const ApplicationForm = ({ 
  onCancel, 
  mode = "create",
  initialApplicationData = {},
  onCreated,
}: ApplicationFormProps) => {
  const [data, setData] = useState<ApplicationData>({
    ...INITIAL_DATA,
    ...initialApplicationData,
  });
  const [errors, setErrors] = useState<string[]>([]);
  function updateFields(fields: Partial<ApplicationData>) {
    setData((prev) => {
      return { ...prev, ...fields };
    });
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors: string[] = [];

    if (!data.institutionName.trim()) newErrors.push("Institution name is required");
    if (!data.licenseType) newErrors.push("License type is required");
    if (mode === "create" && data.supportingDocuments.length === 0) {
      newErrors.push("At least one document is required");
    }

    for (const file of data.supportingDocuments) {
      if (file.size > MAX_FILE_SIZE) newErrors.push(`${file.name} exceeds 5MB limit`);
      if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) newErrors.push(`${file.name} must be PDF, DOCX, PNG or JPEG`);
    }

    setErrors(newErrors);

    if (newErrors.length > 0) return;

    try {
      const created = await api.post("/applications", {
        institutionName: data.institutionName,
        licenseType: data.licenseType,
        notes: data.notes,
      });

      const createdData = created.data as unknown;
      const applicationId = (() => {
        if (!createdData || typeof createdData !== "object") return null;
        const d = createdData as Record<string, unknown>;
        if (d.data && typeof d.data === "object") {
          const dd = d.data as Record<string, unknown>;
          if (typeof dd.id === "string") return dd.id;
        }
        if (typeof d.id === "string") return d.id;
        return null;
      })();

      if (mode === "create") {
        if (!applicationId) {
          setErrors(["Application created but missing applicationId in response"]);
          return;
        }

        for (const file of data.supportingDocuments) {
          const form = new FormData();
          form.append("file", file);
          await api.post(`/applications/${applicationId}/documents`, form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }

      if (mode === "create" && applicationId) onCreated?.(applicationId);
      onCancel();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="relative bg-white border border-black p-4 m-4 rounded-2xl w-full max-w-2xl! mx-auto">
      <form onSubmit={onSubmit}>
        {errors.length > 0 && (
          <div className="mb-4 p-3 border border-red-500 bg-red-50 text-red-600 rounded-md">
            <ul className="list-disc pl-5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        <FormWrapper
          title={
            mode === "edit" ? "Edit License Application" : "New License Application"
          }
        >
          <label>Subject Line</label>
          <Input
            autoFocus
            type="text"
            value={data.institutionName}
            onChange={(e) => updateFields({ institutionName: e.target.value })}
          />
          <label>License Type</label>
          <Select
            value={data.licenseType}
            onValueChange={(value) => updateFields({ licenseType: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>License Type</SelectLabel>
                {applicationTypes.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <label>Notes</label>
          <Input
            type="text"
            value={data.notes}
            onChange={(e) => updateFields({ notes: e.target.value })}
          />
          <label>Supporting Documents</label>
          <Input
            type="file"
            multiple
            accept=".pdf,.docx,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
            onChange={(e) =>
              updateFields({
                supportingDocuments: Array.from(e.target.files || []),
              })
            }
          />
          <div></div>
          <div className="mt-4 flex w-full justify-end gap-2 items-center">
            <Button
              type="button"
              className="bg-white border border-black text-black"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button type="submit">
              {mode === "edit" ? "Save changes" : "Submit"}
            </Button>
          </div>
        </FormWrapper>
      </form>
    </div>
  );
};

export default ApplicationForm;
