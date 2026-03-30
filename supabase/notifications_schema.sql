-- NOTIFICATIONS SCHEMA
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'booking_new', 'booking_update', 'message_new', 'subscription_update', 'platform_update'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 1. Trigger for New Booking (Notify Planner)
CREATE OR REPLACE FUNCTION public.handle_new_booking_notification() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, type, title, message, link_url)
    VALUES (
        NEW.planner_id, 
        'booking_new', 
        'New Booking Request', 
        'You have received a new booking request for a ' || NEW.event_type || '.',
        '/dashboard/planner#bookings'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_booking_created_notification ON public.bookings;
CREATE TRIGGER on_booking_created_notification
    AFTER INSERT ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_booking_notification();

-- 2. Trigger for Booking Status Update (Notify Client)
CREATE OR REPLACE FUNCTION public.handle_booking_status_notification() 
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status != NEW.status) THEN
        INSERT INTO public.notifications (user_id, type, title, message, link_url)
        VALUES (
            NEW.client_id, 
            'booking_update', 
            'Booking Status Update', 
            'Your booking for ' || NEW.event_type || ' has been ' || NEW.status || '.',
            '/dashboard/client#bookings'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_booking_updated_notification ON public.bookings;
CREATE TRIGGER on_booking_updated_notification
    AFTER UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.handle_booking_status_notification();

-- 3. Trigger for New Message (Notify Recipient)
CREATE OR REPLACE FUNCTION public.handle_new_message_notification() 
RETURNS TRIGGER AS $$
DECLARE
    recipient_id UUID;
BEGIN
    -- Find recipient from conversation
    SELECT 
        CASE 
            WHEN client_id = NEW.sender_id THEN planner_id 
            ELSE client_id 
        END INTO recipient_id
    FROM public.conversations 
    WHERE id = NEW.conversation_id;

    IF recipient_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, link_url)
        VALUES (
            recipient_id, 
            'message_new', 
            'New Message', 
            'You have received a new message.',
            '/dashboard/messages'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_message_sent_notification ON public.messages;
CREATE TRIGGER on_message_sent_notification
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_message_notification();

-- 4. Trigger for Subscription Management (Notify User)
CREATE OR REPLACE FUNCTION public.handle_subscription_notification() 
RETURNS TRIGGER AS $$
BEGIN
    -- Notify on plan change
    IF (OLD.plan_id IS NULL AND NEW.plan_id IS NOT NULL) OR (OLD.plan_id != NEW.plan_id) THEN
        INSERT INTO public.notifications (user_id, type, title, message, link_url)
        VALUES (
            NEW.id, 
            'subscription_update', 
            'Subscription Updated', 
            'Your plan has been successfully updated to ' || NEW.plan_id || '.',
            '/dashboard/planner'
        );
    END IF;

    -- Notify when subscription is about to expire (within 3 days)
    -- This would ideally be a cron job, but we can check on login or other updates
    IF (NEW.subscription_end_date IS NOT NULL AND NEW.subscription_end_date < (NOW() + INTERVAL '3 days')) THEN
         -- Check if we already notified recently to avoid spam (simplification for now)
         INSERT INTO public.notifications (user_id, type, title, message, link_url)
         SELECT NEW.id, 'subscription_expiring', 'Subscription Expiring Soon', 
                'Your subscription will expire on ' || NEW.subscription_end_date::date || '. Please renew to keep your features.',
                '/pricing'
         WHERE NOT EXISTS (
             SELECT 1 FROM public.notifications 
             WHERE user_id = NEW.id 
             AND type = 'subscription_expiring' 
             AND created_at > (NOW() - INTERVAL '24 hours')
         );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_subscription_notification ON public.profiles;
CREATE TRIGGER on_profile_subscription_notification
    AFTER UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_subscription_notification();
