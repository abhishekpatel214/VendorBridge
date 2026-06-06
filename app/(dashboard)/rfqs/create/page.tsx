import { getVendors } from "@/lib/queries/vendors";
import RFQCreateForm from "./RFQCreateForm";

export default async function CreateRFQPage() {
  const vendors = await getVendors("", "", "ACTIVE");
  
  return (
    <RFQCreateForm vendors={vendors} />
  );
}
