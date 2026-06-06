import { getApprovalById } from "@/lib/queries/approvals";
import { notFound } from "next/navigation";
import ApprovalReviewForm from "./ApprovalReviewForm";

export default async function ApprovalDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const approvalId = Number(params.id);
  const approval = await getApprovalById(approvalId);

  if (!approval) {
    notFound();
  }

  return <ApprovalReviewForm approval={approval} />;
}
