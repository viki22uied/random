import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function: District Analytics
 * 
 * Provides district-level analytics and dashboard data including
 * facility summaries, pending reviews, and performance metrics.
 * 
 * @param req - HTTP request with optional district_id parameter
 * @returns Response with district analytics data
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with user's auth context
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Parse URL parameters
    const url = new URL(req.url);
    const district_id = url.searchParams.get("district_id");
    
    // Parse additional query parameters for filtering
    const start_date = url.searchParams.get("start_date");
    const end_date = url.searchParams.get("end_date");
    const include_facilities = url.searchParams.get("include_facilities") === 'true';

    // Validate UUID format if district_id is provided
    if (district_id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(district_id)) {
        throw new Error("Invalid district_id format. Must be a valid UUID");
      }
    }

    // Validate date formats if provided
    if (start_date && isNaN(Date.parse(start_date))) {
      throw new Error("Invalid start_date format. Use YYYY-MM-DD format");
    }
    
    if (end_date && isNaN(Date.parse(end_date))) {
      throw new Error("Invalid end_date format. Use YYYY-MM-DD format");
    }

    // Call RPC function to get district dashboard data
    const { data, error } = await supabase.rpc("get_district_dashboard", {
      p_district_id: district_id,
    });

    if (error) {
      console.error("RPC Error:", error);
      throw new Error(error.message || "Failed to fetch district analytics");
    }

    // Get additional analytics if requested
    let additionalAnalytics = null;
    
    if (data?.district) {
      try {
        // Fetch recent performance trends for the district
        const { data: trendsData } = await supabase
          .from('performance_data')
          .select('reporting_period_start, metric_key, metric_value, target_value, status')
          .eq('status', 'approved')
          .in('facility_id', (
            await supabase
              .from('facilities')
              .select('id')
              .eq('district_id', data.district.id)
              .eq('is_active', true)
          ).data?.map(f => f.id) || [])
          .order('reporting_period_start', { ascending: false })
          .limit(100);

        // Fetch scheme utilization data
        const { data: schemeData } = await supabase
          .from('scheme_tracking')
          .select('scheme_name, beneficiary_count, funds_utilized, status')
          .eq('status', 'approved')
          .in('facility_id', (
            await supabase
              .from('facilities')
              .select('id')
              .eq('district_id', data.district.id)
              .eq('is_active', true)
          ).data?.map(f => f.id) || [])
          .order('created_at', { ascending: false })
          .limit(50);

        additionalAnalytics = {
          recent_trends: trendsData || [],
          scheme_summary: schemeData || []
        };
      } catch (analyticsError) {
        console.warn("Failed to fetch additional analytics:", analyticsError);
        // Continue without additional analytics
      }
    }

    // Get user information for context
    const { data: { user } } = await supabase.auth.getUser();

    // Log successful analytics request
    console.log(`District analytics fetched: ${district_id || 'user_district'} by ${user?.email}`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        dashboard: data,
        additional_analytics: additionalAnalytics,
        requested_by: user?.email,
        filters_applied: {
          start_date,
          end_date,
          include_facilities
        }
      },
      message: "District analytics retrieved successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("District Analytics Error:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || "Internal server error",
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error.message.includes("Unauthorized") ? 403 : 400,
    });
  }
});
