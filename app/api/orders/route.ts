import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "RETAILER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { items, totalAmount, source, aiRawInput } = await req.json();
    const userId = session.user?.name ? (session.user as any).id : null; 
    // Get the retailer ID
    const user = await prisma.user.findUnique({
      where: { phone: (session.user as any).phone },
      include: { retailer: true }
    });

    if (!user?.retailer) throw new Error("Retailer not found");

    // Create the order
    const order = await prisma.order.create({
      data: {
        retailerId: user.retailer.id,
        status: "PENDING",
        source: source || "MANUAL",
        aiRawInput: aiRawInput || null,
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            skuId: item.skuId,
            quantity: item.quantity,
            unitPrice: item.dealerPrice,
            freeQty: item.freeQty || 0,
            discountPct: item.discountPct || 0,
          }))
        }
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}