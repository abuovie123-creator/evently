import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { tierId, amount, userId, email } = await req.json();

        // 1. Secret Key Check
        const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
        if (!secretKey) {
            // For Sandbox/Demo mode if key is missing, mock success
            console.warn("FLUTTERWAVE_SECRET_KEY not found. Operating in mock mode.");
            return NextResponse.json({
                authorizationUrl: `${new URL(req.url).origin}/payout/success?gateway=flutterwave&tier=${tierId}`
            });
        }

        const tx_ref = `tx-${userId}-${Date.now()}`;

        const params = JSON.stringify({
            tx_ref,
            amount: amount.toString(),
            currency: "NGN",
            redirect_url: `${new URL(req.url).origin}/api/webhooks/flutterwave`,
            customer: {
                email,
                name: "Evently Planner"
            },
            meta: {
                profile_id: userId,
                tier_id: tierId
            },
            customizations: {
                title: "Evently Premium Subscription",
                description: "Platform monetization access",
                logo: "https://evently.com/logo.png"
            }
        });

        const response = await fetch('https://api.flutterwave.com/v3/payments', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            },
            body: params
        });

        const data = await response.json();

        if (data.status !== "success") {
            throw new Error(data.message);
        }

        return NextResponse.json({ authorizationUrl: data.data.link });

    } catch (error: any) {
        console.error("Flutterwave Init Error:", error);
        return NextResponse.json({ error: error.message || "Failed to initialize standard checkout block" }, { status: 500 });
    }
}
