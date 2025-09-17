-- Security Hardening: Add proper RLS policies for exposed tables

-- Enable RLS on tables that don't have it
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docs ENABLE ROW LEVEL SECURITY;

-- Create secure policies for reports table
CREATE POLICY "Users can view all reports" ON public.reports
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reports" ON public.reports
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update reports" ON public.reports
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create secure policies for agent_tasks table
CREATE POLICY "Users can view all agent tasks" ON public.agent_tasks
FOR SELECT USING (true);

CREATE POLICY "System can manage agent tasks" ON public.agent_tasks
FOR ALL USING (auth.uid() IS NOT NULL);

-- Restrict access to configuration tables
CREATE POLICY "Only admins can view app config" ON public.app_config
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can view app settings" ON public.app_settings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Secure family_agents table
CREATE POLICY "Users can view family agents" ON public.family_agents
FOR SELECT USING (true);

-- Secure domains_map table
CREATE POLICY "Users can view domains map" ON public.domains_map
FOR SELECT USING (true);

-- Secure governance_events table
CREATE POLICY "Only admins can view governance events" ON public.governance_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Secure tasks table
CREATE POLICY "Users can view all tasks" ON public.tasks
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage tasks" ON public.tasks
FOR ALL USING (auth.uid() IS NOT NULL);

-- Secure docs table
CREATE POLICY "Users can view published docs" ON public.docs
FOR SELECT USING (is_current = true);

CREATE POLICY "Authenticated users can create docs" ON public.docs
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Doc authors can update their docs" ON public.docs
FOR UPDATE USING (author = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Add user roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can assign roles" ON public.user_roles
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);