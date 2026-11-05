import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ORDER_DESK") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all confirmed or pending orders (for the demo, we export everything)
  const orders = await prisma.order.findMany({
    include: {
      retailer: true,
      items: { include: { sku: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  // Create CSV Header (Standard Tally format for Sales Vouchers)
  let csv = "Date,Voucher Type,Party Name,Item Name,Quantity,Rate,Amount\n";

  // Loop through orders and items to build the rows
  orders.forEach(order => {
    const date = order.createdAt.toISOString().split("T")[0];
    order.items.forEach(item => {
      const amount = item.quantity * item.unitPrice;
      // Escape quotes just in case
      const party = order.retailer.shopName.replace(/,/g, "");
      const itemName = item.sku.name.replace(/,/g, "");
      
      csv += `${date},Sales,${party},${itemName},${item.quantity},${item.unitPrice.toFixed(2)},${amount.toFixed(2)}\n`;
    });
  });

  // Return as a downloadable file
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="tally_export_${new Date().toISOString().split("T")[0]}.csv"`
    }
  });
}