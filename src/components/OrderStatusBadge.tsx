import { OrderStatus } from "@/lib/orders";
import { CheckCircle2, Clock3 } from "lucide-react";

export default function OrderStatusBadge({
  status,
  text,
}: {
  status: OrderStatus | "PENDING" | "CONFIRMED" | "DELIVERED" | string;
  text: string;
}) {
  const isPending =
    status === "AWAITING_CUSTOMER_CONFIRMATION" || status === "PENDING";
  const styles = isPending
    ? "bg-red-100 text-red-600 border-red-300"
    : "bg-green-100 text-green-700 border-green-300";
  return (
    <div
      className={`rounded-2xl border px-3 py-3 flex items-center gap-2 ${styles}`}
    >
      {isPending ? (
        <Clock3 size={18} className="shrink-0" />
      ) : (
        <CheckCircle2 size={18} className="shrink-0" />
      )}
      <span className="font-semibold">{text}</span>
    </div>
  );
}
