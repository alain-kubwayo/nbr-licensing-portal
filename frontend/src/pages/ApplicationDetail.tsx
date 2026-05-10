import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FileText, Download, ArrowLeft } from "lucide-react";

const documents = [
  { name: "Business License.pdf", url: "#" },
  { name: "ID Copy.pdf", url: "#" },
  { name: "Financial Statement.pdf", url: "#" },
];

const ApplicationDetail = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subject Line</span>
            <span className="font-medium">BK License Application</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Institution Type</span>
            <span className="font-medium">Microfinance</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Application Type</span>
            <span className="font-medium">New License</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">Under review</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between border rounded-lg p-3"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>{doc.name}</span>
              </div>

              <Link to={doc.url} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  View
                </Button>
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Link to="/dashboard/applications">
          <Button variant="outline" className="gap-2 bg-blue-700 text-white">
            <ArrowLeft className="w-4 h-4" />
            Back to Applications
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ApplicationDetail;
