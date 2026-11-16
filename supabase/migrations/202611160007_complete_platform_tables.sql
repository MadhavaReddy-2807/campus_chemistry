-- Migration: 202611160007_complete_platform_tables.sql
-- Description: Storage buckets, support tickets, IIT BHU domain alias, admin roles, and mutual match triggers

-- 1. Add missing IIT BHU official student domain alias
INSERT INTO public.institute_domains (institute_id, domain, source_url, is_active)
VALUES (
  '00000000-0000-0000-0001-000000000016',
  'itbhu.ac.in',
  'https://www.iitbhu.ac.in',
  true
)
ON CONFLICT (institute_id, domain) DO NOTHING;

-- 2. Configure Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('posts', 'posts', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('dating-photos', 'dating-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('verifications', 'verifications', false, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('support-attachments', 'support-attachments', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS policies for storage.objects
DO $$
BEGIN
  -- Public read for public buckets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public bucket objects are readable by all'
  ) THEN
    CREATE POLICY "Public bucket objects are readable by all"
      ON storage.objects FOR SELECT
      USING (bucket_id IN ('posts', 'avatars', 'dating-photos'));
  END IF;

  -- Authenticated users can upload to public buckets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload media'
  ) THEN
    CREATE POLICY "Authenticated users can upload media"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id IN ('posts', 'avatars', 'dating-photos', 'verifications', 'support-attachments'));
  END IF;

  -- Users can update and delete their own uploads
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update their own storage objects'
  ) THEN
    CREATE POLICY "Users can update their own storage objects"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (auth.uid() = owner);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete their own storage objects'
  ) THEN
    CREATE POLICY "Users can delete their own storage objects"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (auth.uid() = owner);
  END IF;
END $$;

-- 3. Support Tickets System
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number serial,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL, -- 'feedback', 'bug', 'question', 'harassment', 'content', 'account', 'other'
  subject text NOT NULL,
  description text NOT NULL,
  screenshot_url text,
  status text NOT NULL DEFAULT 'open', -- 'open', 'in_review', 'waiting_for_user', 'resolved', 'closed'
  priority text NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_admin_reply boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user an admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  );
$$;

-- Support tickets RLS policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'Users can view own support tickets') THEN
    CREATE POLICY "Users can view own support tickets"
      ON public.support_tickets FOR SELECT
      TO authenticated
      USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'Users can create own support tickets') THEN
    CREATE POLICY "Users can create own support tickets"
      ON public.support_tickets FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'Users and admins can update tickets') THEN
    CREATE POLICY "Users and admins can update tickets"
      ON public.support_tickets FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_ticket_messages' AND policyname = 'Users can view messages for own tickets') THEN
    CREATE POLICY "Users can view messages for own tickets"
      ON public.support_ticket_messages FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.support_tickets st
          WHERE st.id = ticket_id AND (st.user_id = auth.uid() OR public.is_admin(auth.uid()))
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_ticket_messages' AND policyname = 'Users and admins can add messages to tickets') THEN
    CREATE POLICY "Users and admins can add messages to tickets"
      ON public.support_ticket_messages FOR INSERT
      TO authenticated
      WITH CHECK (
        sender_id = auth.uid() AND (
          EXISTS (
            SELECT 1 FROM public.support_tickets st
            WHERE st.id = ticket_id AND (st.user_id = auth.uid() OR public.is_admin(auth.uid()))
          )
        )
      );
  END IF;
END $$;

-- 4. Grant Admin Role to platform admin
INSERT INTO public.user_roles (user_id, role, created_at)
VALUES ('9d02f95d-a7d1-4df4-9f3f-61531fb0daa0', 'admin', now())
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- 5. Mutual Dating Matching Function & Trigger
CREATE OR REPLACE FUNCTION public.handle_mutual_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reciprocal_action text;
  v_user1 uuid;
  v_user2 uuid;
  v_match_id uuid;
  v_conv_id uuid;
BEGIN
  -- Only process 'like' actions
  IF NEW.action <> 'like' THEN
    RETURN NEW;
  END IF;

  -- Check if target user has already liked actor
  SELECT action INTO v_reciprocal_action
  FROM public.discovery_actions
  WHERE actor_id = NEW.target_id
    AND target_id = NEW.actor_id
    AND action = 'like';

  IF v_reciprocal_action = 'like' THEN
    -- Deterministic ordering of user_a and user_b to satisfy user_a < user_b constraint
    IF NEW.actor_id < NEW.target_id THEN
      v_user1 := NEW.actor_id;
      v_user2 := NEW.target_id;
    ELSE
      v_user1 := NEW.target_id;
      v_user2 := NEW.actor_id;
    END IF;

    -- Create match if not exists
    INSERT INTO public.matches (user_a, user_b, status, created_at)
    VALUES (v_user1, v_user2, 'active', now())
    ON CONFLICT (user_a, user_b) DO NOTHING
    RETURNING id INTO v_match_id;

    -- Ensure a conversation exists for the match
    IF NOT EXISTS (
      SELECT 1 FROM public.conversation_members cm1
      JOIN public.conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id
      WHERE cm1.user_id = v_user1 AND cm2.user_id = v_user2
    ) THEN
      INSERT INTO public.conversations (type, created_at, updated_at)
      VALUES ('direct', now(), now())
      RETURNING id INTO v_conv_id;

      INSERT INTO public.conversation_members (conversation_id, user_id, joined_at)
      VALUES
        (v_conv_id, v_user1, now()),
        (v_conv_id, v_user2, now());
    END IF;

    -- Create match notification for both users
    INSERT INTO public.notifications (user_id, actor_id, type, title, body, href, created_at)
    VALUES
      (NEW.target_id, NEW.actor_id, 'match', 'New Match!', 'You matched on Campus Chemistry dating!', '/messages', now()),
      (NEW.actor_id, NEW.target_id, 'match', 'New Match!', 'You matched on Campus Chemistry dating!', '/messages', now());
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_mutual_match ON public.discovery_actions;
CREATE TRIGGER trigger_mutual_match
AFTER INSERT OR UPDATE ON public.discovery_actions
FOR EACH ROW
EXECUTE FUNCTION public.handle_mutual_match();
