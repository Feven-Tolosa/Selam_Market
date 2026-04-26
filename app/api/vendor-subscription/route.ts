import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vendorId, email } = body;

    // ✅ Validation
    if (!vendorId) {
      return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // ✅ Subscription config
    const amount = 29;
    const currency = "ETB";
    const tx_ref = `sub-${vendorId}-${Date.now()}`;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // ✅ Chapa request
    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount,
        currency,
        email,
        tx_ref,

        callback_url: `${baseUrl}/api/verify-subscription`,
        return_url: `${baseUrl}/vendor/dashboard/subscription?status=success`,

        customization: {
          title: "Selam Market - Vendor Subscription",
          description: "Premium vendor monthly subscription",
        },

        metadata: {
          vendorId,
          type: "subscription",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    );

    // ✅ Safe response handling
    const checkoutUrl = response?.data?.data?.checkout_url;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 },
      );
    }

    return NextResponse.json({ checkout_url: checkoutUrl });
  } catch (error: any) {
    console.error(
      "Subscription checkout error:",
      error?.response?.data || error,
    );

    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 },
    );
  }
}
