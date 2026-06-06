import { getRFQById } from "@/lib/queries/rfqs";
import { notFound } from "next/navigation";
import QuotationForm from "./QuotationForm";

export default async function SubmitQuotationPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const rfqId = Number(params.id);
  const rfq = await getRFQById(rfqId);

  if (!rfq || rfq.status !== "OPEN") {
    notFound();
  }

  return <QuotationForm rfq={rfq} />;
}
