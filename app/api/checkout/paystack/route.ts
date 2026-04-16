import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { tierId, amount, userId, email } = await req.json();

        // 1. Secret Key Check
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey) {
            // For Sandbox/Demo mode if key is missing, mock success
            console.warn("PAYSTACK_SECRET_KEY not found. Operating in mock mode.");
            return NextResponse.json({
                authorizationUrl: `${new URL(req.url).origin}/payout/success?gateway=paystack&tier=${tierId}`
            });
        }

        const params = JSON.stringify({
            email,
            amount: amount * 100, // Paystack operates in kobo
            callback_url: `${new URL(req.url).origin}/api/webhooks/paystack`,
            metadata: {
                custom_fields: [
                    {
                        display_name: "Planner Profile ID",
                        variable_name: "profile_id",
                        value: userId
                    },
                    {
                        display_name: "Tier Upgrade ID",
                        variable_name: "tier_id",
                        value: tierId
                    }
                ]
            }
        });

        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            },
            body: params
        });

        const data = await response.json();

        if (!data.status) {
            throw new Error(data.message);
        }

        return NextResponse.json({ authorizationUrl: data.data.authorization_url });

    } catch (error: any) {
        console.error("Paystack Init Error:", error);
        return NextResponse.json({ error: error.message || "Failed to initialize standard checkout block" }, { status: 500 });
    }
}
