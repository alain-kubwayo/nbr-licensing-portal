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
import ApplicationForm from "./ApplicationForm";
import { useState } from "react";

const ApplicationList = () => {
    const [open, setOpen] = useState(false)
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

        <AlertDialogContent>
          <ApplicationForm onCancel={() => setOpen(false)} />
        </AlertDialogContent>
      </AlertDialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject Line</TableHead>
            <TableHead>Institution Type</TableHead>
            <TableHead>Application Type</TableHead>
            <TableHead>Submitted At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">
              BK License Application
            </TableCell>
            <TableCell className="font-medium">SACCO</TableCell>
            <TableCell className="font-medium">Renewal</TableCell>
            <TableCell>May 5, 2026 at 9:32PM</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontalIcon />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View</DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default ApplicationList;
