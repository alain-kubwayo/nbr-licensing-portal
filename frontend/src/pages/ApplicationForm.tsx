import { useState, type FormEvent } from "react";
import FormWrapper from "../components/FormWrapper";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
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
  subject: string;
  institutionType: string;
  applicationType: string;
  supportingDocuments: File[];
};

const INITIAL_DATA: ApplicationData = {
  subject: "",
  institutionType: "",
  applicationType: "",
  supportingDocuments: [],
};

type ApplicationFormProps = ApplicationData & {
  onCancel: () => void;
  mode?: "create" | "edit";
  // updateFields: (fields: Partial<ApplicationData>) => void;
  initialApplicationData: Partial<ApplicationData>;
};

const institutionTypes = [
  { label: "Commercial Bank", value: "Commercial Bank" },
  { label: "Microfinance Institution", value: "Microfinance Institution" },
  { label: "SACCO", value: "SACCO" },
  { label: "Insurance Company", value: "Insurance Company" },
  { label: "Forex Bureau", value: "Forex Bureau" },
  { label: "FinTech", value: "FinTech" },
];

const applicationTypes = [
  { label: "New License", value: "New License" },
  { label: "Renewal", value: "Renewal" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ApplicationForm = ({ 
  onCancel, 
  mode = "create",
  initialApplicationData 
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

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    const newErrors: string[] = [];

    if (!data.subject.trim()) newErrors.push("Subject is required");
    if (!data.institutionType) newErrors.push("Institution type is required");
    if (!data.applicationType) newErrors.push("Application type is required");

    if (mode === "create" && data.supportingDocuments.length === 0) {
      newErrors.push("At least one document is required");
    }

    data.supportingDocuments.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push(`${file.name} exceeds 5MB limit`);
      }
    });

    setErrors(newErrors);

    if (newErrors.length > 0) return;

    const formData = new FormData();

    formData.append("subject", data.subject);
    formData.append("institutionType", data.institutionType);
    formData.append("applicationType", data.applicationType);

    data.supportingDocuments.forEach((file, index) => {
      formData.append(`supportingDocuments[${index}]`, file);
    });

    //   const response = await fetch("/api/applications", {
    //     method: "POST",
    //     body: formData,
    //   })

    //   const result = await response.json()

    //   console.log(result)

    // POST data to login into the account account
    console.log("Successful application submission", data);
  }

  return (
    <div className="relative bg-white border border-black p-4 m-4 rounded-2xl w-full !max-w-2xl mx-auto">
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
            value={data.subject}
            onChange={(e) => updateFields({ subject: e.target.value })}
          />
          <label>Institution Type</label>
          <Select
            items={institutionTypes}
            value={data.institutionType}
            onValueChange={(value) => updateFields({ institutionType: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Institution Type</SelectLabel>
                {institutionTypes.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <label>Application Type</label>
          <Select
            items={applicationTypes}
            value={data.applicationType}
            onValueChange={(value) => updateFields({ applicationType: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Application Type</SelectLabel>
                {applicationTypes.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <label>Supporting Documents</label>
          <Input
            type="file"
            multiple
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
