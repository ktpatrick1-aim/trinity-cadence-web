// Netlify Edge Function: Track visitor IP and resolve company via ipinfo.io
// Runs on every HTML page request, non-blocking (doesn't slow page load)

const SUPABASE_URL = 'https://qypdlkdxdkqvcocqxirr.supabase.co';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const IPINFO_TOKEN = Deno.env.get('IPINFO_TOKEN');
const SITE_NAME = 'cadence';

export default async function handler(request, context) {
  // Let the page load immediately — tracking happens in the background
  const response = await context.next();

  // Only track HTML page requests (not CSS, JS, images, etc.)
  const url = new URL(request.url);
  const path = url.pathname;

  // Skip non-page requests
  if (
    path.includes('.css') ||
    path.includes('.js') ||
    path.includes('.png') ||
    path.includes('.jpg') ||
    path.includes('.svg') ||
    path.includes('.ico') ||
    path.includes('.xml') ||
    path.includes('.json') ||
    path.includes('.txt') ||
    path.includes('.woff') ||
    path.includes('.woff2')
  ) {
    return response;
  }

  // Get visitor IP
  const ip = context.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  if (!ip || !SUPABASE_SERVICE_KEY) {
    return response;
  }

  // Skip private/internal IPs
  if (ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.') || ip === '::1') {
    return response;
  }

  // Fire-and-forget: don't await, don't block the response
  trackVisitor(ip, path, request.headers).catch(() => {});

  return response;
}

async function trackVisitor(ip, pagePath, headers) {
  try {
    // Look up company info from ipinfo.io
    let companyName = null;
    let companyDomain = null;
    let country = null;
    let countryCode = null;
    let continent = null;
    let asn = null;

    if (IPINFO_TOKEN) {
      const ipResponse = await fetch(`https://api.ipinfo.io/lite/${ip}?token=${IPINFO_TOKEN}`);
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        companyName = ipData.as_name || null;
        companyDomain = ipData.as_domain || null;
        country = ipData.country || null;
        countryCode = ipData.country_code || null;
        continent = ipData.continent || null;
        asn = ipData.asn || null;
      }
    }

    // Write to Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/site_visitors`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        ip_address: ip,
        site: SITE_NAME,
        page_path: pagePath,
        referrer: headers.get('referer') || null,
        user_agent: headers.get('user-agent') || null,
        company_name: companyName,
        company_domain: companyDomain,
        country: country,
        country_code: countryCode,
        continent: continent,
        asn: asn,
      }),
    });
  } catch (err) {
    // Silent fail — never break the page load for tracking
    console.error('Visitor tracking error:', err.message);
  }
}

// Configure which paths this edge function runs on
export const config = {
  path: '/*',
};
