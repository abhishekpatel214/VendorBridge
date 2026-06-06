import { getRFQById } from "@/lib/queries/rfqs";
import { getQuotationsByRfq } from "@/lib/queries/quotations";
import { notFound } from "next/navigation";
import CompareView from "./CompareView";

export default async function CompareQuotationsPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const rfqId = Number(params.id);
  
  const rfq = await getRFQById(rfqId);
  if (!rfq) notFound();

  const quotations = await getQuotationsByRfq(rfqId);

  return <CompareView rfq={rfq} quotations={quotations} />;
}
