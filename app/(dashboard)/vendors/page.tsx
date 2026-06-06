import { getVendors } from "@/lib/queries/vendors";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DeleteVendorButton } from "./DeleteVendorButton";
import { auth } from "@/lib/auth";

export default async function VendorsPage(
  props: { searchParams: Promise<{ search?: string }> }
) {
  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";
  const vendors = await getVendors(search);
  const session = await auth();
  const role = session?.user?.role;

  return (
    <div>
      <PageHeader 
        title="Vendors" 
        description="Manage supplier profiles and registrations"
        action={
          (role === "ADMIN" || role === "MANAGER") && (
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/vendors/new"><Plus className="mr-2 h-4 w-4" /> Add Vendor</Link>
            </Button>
          )
        }
      />

      <div className="bg-card p-4 rounded-md shadow-sm border mb-6 flex gap-4 items-center">
        <form className="flex-1 max-w-md flex gap-2">
          <Input 
            name="search" 
            placeholder="Search vendors by name, email, or GST..." 
            defaultValue={search}
          />
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      <div className="bg-card rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>GST Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">{vendor.name}</TableCell>
                <TableCell>{vendor.category}</TableCell>
                <TableCell>
                  <div className="text-sm">{vendor.email}</div>
                  <div className="text-xs text-muted-foreground">{vendor.phone}</div>
                </TableCell>
                <TableCell>{vendor.gst_number}</TableCell>
                <TableCell>
                  <StatusBadge status={vendor.status} />
                </TableCell>
                <TableCell>{vendor.rating} / 5.0</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/vendors/${vendor.id}`}>View</Link>
                  </Button>
                  {(role === "ADMIN" || role === "MANAGER") && (
                    <DeleteVendorButton vendorId={vendor.id} />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {vendors.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No vendors found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
