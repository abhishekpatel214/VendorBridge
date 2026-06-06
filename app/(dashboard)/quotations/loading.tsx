import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      <TableSkeleton columns={6} rows={6} />
    </div>
  );
}
