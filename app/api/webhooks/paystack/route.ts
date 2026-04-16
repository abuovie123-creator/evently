import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        // Setup admin client bypassing Row Level Security for critical updates
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const payload = await req.json();

        // 1. Verify Payment Authenticity
        // For production, this requires verifying the crypto hash signature provided by the gateway 
        // using the crypto library and the secret keys. Assuming the payload is verified here:

        const status = payload.data?.status || payload.status;

        // Ensure successful payment criteria
        if (status === 'success' || status === 'successful') {

            // Extract the metadata attached during checkout initialization
            const profile_id = payload.data?.metadata?.custom_fields?.[0]?.value || payload.data?.meta?.profile_id;
            const tier_id = payload.data?.metadata?.custom_fields?.[1]?.value || payload.data?.meta?.tier_id;
            const amount = payload.data?.amount;

            if (!profile_id || !tier_id) {
                console.error("Webhook missing metadata bounds");
                return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
            }

            // 2. Perform Account Upgrade
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 1); // Mock 1 Month Addition

            // Utilizing Service Role wrapper to penetrate auth policies from the backend
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({
                    plan_id: tier_id,
                    subscription_status: 'active',
                    subscription_end_date: futureDate.toISOString()
                })
                .eq('id', profile_id);

            if (profileError) throw profileError;

            // 3. Log into Bank Transfers ledger for Financial Auditing
            const { error: ledgerError } = await supabaseAdmin
                .from('bank_transfers')
                .insert({
                    profile_id: profile_id,
                    amount: amount ? (amount / 100) : 0, // Converting kobo
                    target_tier: tier_id,
                    status: 'approved', // Auto-approved by gateway
                    screenshot_url: `gateway_auto_generated_${Date.now()}` // Mock receipt identifier
                });

            if (ledgerError) throw ledgerError;

            // Return 200 OK exclusively to prevent gateway retries
            return NextResponse.json({ message: "Webhook successfully executed and plan upgraded" }, { status: 200 });
        }

        return NextResponse.json({ message: "Payment not marked as successful" }, { status: 400 });

    } catch (error: any) {
        console.error("Paystack Webhook Handling Error:", error);
        return NextResponse.json({ error: "Failed digesting webhook payload" }, { status: 500 });
    }
}
