import { getVendorById } from "@/lib/queries/vendors";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { Building, Mail, Phone, MapPin, Globe } from "lucide-react";
import { DeleteVendorButton } from "../DeleteVendorButton";

export default async function VendorDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const vendor = await getVendorById(Number(params.id));

  if (!vendor) {
    notFound();
  }

  return (
    <div>
      <PageHeader 
        title={vendor.name} 
        description={`Vendor Details • Category: ${vendor.category}`} 
        action={
          <div className="flex items-center space-x-3">
            <StatusBadge status={vendor.status} />
            <DeleteVendorButton vendorId={vendor.id} redirectAfter={true} />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              {vendor.email}
            </div>
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              {vendor.phone || "N/A"}
            </div>
            <div className="flex items-start text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
              <span>{vendor.address || "N/A"}</span>
            </div>
            <div className="flex items-center text-sm">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              {vendor.country || "N/A"}
            </div>
            <div className="flex items-center text-sm">
              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
              GST: {vendor.gst_number || "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Vendor has a rating of {vendor.rating} / 5.0. RFQ and Quotation history will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
