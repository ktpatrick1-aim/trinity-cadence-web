-- Run this in Supabase SQL Editor (Studio > SQL Editor > New query)
-- Creates the site_visitors table for tracking visitors across all Trinity properties

CREATE TABLE IF NOT EXISTS public.site_visitors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  site text NOT NULL,           -- e.g., 'cadence', 'forge', 'calibrate', 'trinity-one', 'dream-dividend'
  page_path text NOT NULL,      -- e.g., '/pricing.html', '/blog/the-human-machine-equation.html'
  referrer text,                -- where they came from
  user_agent text,              -- browser/device info
  company_name text,            -- from ipinfo.io lookup (as_name)
  company_domain text,          -- from ipinfo.io lookup (as_domain)
  country text,                 -- from ipinfo.io
  country_code text,            -- from ipinfo.io
  continent text,               -- from ipinfo.io
  asn text,                     -- autonomous system number
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Index for querying by site and date
CREATE INDEX IF NOT EXISTS idx_site_visitors_site_date ON public.site_visitors (site, created_at DESC);

-- Index for querying by company
CREATE INDEX IF NOT EXISTS idx_site_visitors_company ON public.site_visitors (company_name, created_at DESC);

-- Index for querying by IP (to check if we've seen this visitor before)
CREATE INDEX IF NOT EXISTS idx_site_visitors_ip ON public.site_visitors (ip_address, site);

-- Enable RLS but allow service_role full access
ALTER TABLE public.site_visitors ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (our Edge Function uses this)
CREATE POLICY "Service role full access" ON public.site_visitors
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create a view for the dashboard showing company-level aggregates
CREATE OR REPLACE VIEW public.visitor_companies AS
SELECT
  company_name,
  company_domain,
  site,
  country,
  COUNT(*) as visit_count,
  COUNT(DISTINCT page_path) as unique_pages,
  COUNT(DISTINCT ip_address) as unique_ips,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen,
  ARRAY_AGG(DISTINCT page_path ORDER BY page_path) as pages_visited
FROM public.site_visitors
WHERE company_name IS NOT NULL
  AND company_name NOT IN ('Comcast Cable Communications, LLC', 'AT&T Corp.', 'Verizon Business', 'Charter Communications Inc', 'Cox Communications Inc.', 'T-Mobile USA, Inc.')  -- Filter residential ISPs
GROUP BY company_name, company_domain, site, country
ORDER BY last_seen DESC;
