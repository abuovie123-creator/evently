-- EVENTLY COMPREHENSIVE CHAT & ANALYTICS SCHEMA

-- 0. Meta updates
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 1. Profile Views (for Planner Dashboard stats)
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can record profile views" ON public.profile_views;
CREATE POLICY "Public can record profile views" ON public.profile_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Planners can view their own profile stats" ON public.profile_views;
CREATE POLICY "Planners can view their own profile stats" ON public.profile_views FOR SELECT USING (auth.uid() = profile_id);

-- 2. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    planner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, planner_id)
);

-- 3. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. Conversations Policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations" 
    ON public.conversations FOR SELECT 
    USING (
        (auth.uid() = client_id OR auth.uid() = planner_id)
        AND EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE client_id = conversations.client_id 
            AND planner_id = conversations.planner_id 
            AND status = 'approved'
        )
    );

DROP POLICY IF EXISTS "Users can initiate conversations" ON public.conversations;
CREATE POLICY "Users can initiate conversations" 
    ON public.conversations FOR INSERT 
    WITH CHECK (
        (auth.uid() = client_id OR auth.uid() = planner_id)
        AND EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE client_id = conversations.client_id 
            AND planner_id = conversations.planner_id 
            AND status = 'approved'
        )
    );

-- 6. Messages Policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" 
    ON public.messages FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = messages.conversation_id 
        AND (client_id = auth.uid() OR planner_id = auth.uid())
        -- Implicitly checks booking approval via the conversation policy
    ));

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
CREATE POLICY "Users can send messages to their conversations" 
    ON public.messages FOR INSERT 
    WITH CHECK (
        auth.uid() = sender_id AND 
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = messages.conversation_id 
            AND (client_id = auth.uid() OR planner_id = auth.uid())
        )
    );

-- 7. Trigger to Update Conversation Last Message
CREATE OR REPLACE FUNCTION public.handle_new_message() 
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message = NEW.content,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_message_sent ON public.messages;
CREATE TRIGGER on_message_sent
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- 8. Auto-create conversation on Booking Approval
CREATE OR REPLACE FUNCTION public.maybe_create_conversation() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        INSERT INTO public.conversations (client_id, planner_id)
        VALUES (NEW.client_id, NEW.planner_id)
        ON CONFLICT (client_id, planner_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_booking_approved_trigger ON public.bookings;
CREATE TRIGGER on_booking_approved_trigger
    AFTER UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.maybe_create_conversation();
