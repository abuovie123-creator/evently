import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        const { error } = await supabase
            .from('newsletter_subscribers')
            .insert([{ email }]);

        if (error) {
            // Handle unique constraint violation (already subscribed)
            if (error.code === '23505') {
                return NextResponse.json({ message: 'You are already subscribed!' }, { status: 200 });
            }
            console.error('Supabase insert error:', error);
            return NextResponse.json({ error: 'Failed to subscribe. Please try again later.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Successfully subscribed to the newsletter!' }, { status: 201 });
    } catch (error) {
        console.error('Newsletter POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
