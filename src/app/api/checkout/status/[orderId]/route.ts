import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verificar se o usuário é o dono do pedido
    if (order.user.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verificar status do pagamento
    const isPaid =
      order.status === "CONFIRMED" ||
      order.status === "SHIPPED" ||
      order.status === "DELIVERED";

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      paid: isPaid,
      paymentMethod: order.paymentMethod,
    });
  } catch (error) {
    console.error("Erro ao verificar status do pagamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
