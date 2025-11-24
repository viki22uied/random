import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function: State Analytics
 * 
 * Provides state-level analytics and dashboard data including
 * district summaries, facility counts, and cross-district comparisons.
 * 
 * @param req - HTTP request with optional state_id parameter
 * @returns Response with state analytics data
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
    const state_id = url.searchParams.get("state_id");
    
    // Parse additional query parameters for filtering and aggregation
    const start_date = url.searchParams.get("start_date");
    const end_date = url.searchParams.get("end_date");
    const include_districts = url.searchParams.get("include_districts") === 'true';
    const program_filter = url.searchParams.get("program_filter");

    // Validate UUID format if state_id is provided
    if (state_id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(state_id)) {
        throw new Error("Invalid state_id format. Must be a valid UUID");
      }
    }

    // Validate date formats if provided
    if (start_date && isNaN(Date.parse(start_date))) {
      throw new Error("Invalid start_date format. Use YYYY-MM-DD format");
    }
    
    if (end_date && isNaN(Date.parse(end_date))) {
      throw new Error("Invalid end_date format. Use YYYY-MM-DD format");
    }

    // Call RPC function to get state dashboard data
    const { data, error } = await supabase.rpc("get_state_dashboard", {
      p_state_id: state_id,
    });

    if (error) {
      console.error("RPC Error:", error);
      throw new Error(error.message || "Failed to fetch state analytics");
    }

    // Get comprehensive analytics for the state
    let comprehensiveAnalytics = null;
    
    if (data?.state) {
      try {
        // Fetch district KPI summaries from materialized view
        const { data: districtKpis } = await supabase
          .from('district_kpi_summary')
          .select('*')
          .eq('state_id', data.state.id)
          .order('approval_rate', { ascending: false });

        // Fetch program-wise performance across the state
        let programQuery = supabase
          .from('program_performance')
          .select('*')
          .eq('state_name', data.state.name);

        if (program_filter) {
          programQuery = programQuery.eq('program_name', program_filter);
        }

        const { data: programData } = await programQuery
          .order('achievement_percentage', { ascending: false })
          .limit(50);

        // Fetch scheme utilization data
        const { data: schemeData } = await supabase
          .from('scheme_utilization')
          .select('*')
          .eq('state_name', data.state.name)
          .order('fund_utilization_percentage', { ascending: false })
          .limit(30);

        // Get top performing facilities
        const { data: topFacilities } = await supabase
          .from('performance_data')
          .select(`
            facility_id,
            facilities!inner(name, facility_type, district_id, districts!inner(name)),
            metric_value,
            target_value,
            program_name
          `)
          .eq('status', 'approved')
          .in('facility_id', (
            await supabase
              .from('facilities')
              .select('id')
              .in('district_id', (
                await supabase
                  .from('districts')
                  .select('id')
                  .eq('state_id', data.state.id)
                  .eq('is_active', true)
              ).data?.map(d => d.id) || [])
              .eq('is_active', true)
          ).data?.map(f => f.id) || [])
          .order('metric_value', { ascending: false })
          .limit(20);

        // Calculate state-wide metrics
        const { data: stateMetrics } = await supabase
          .from('performance_data')
          .select('metric_key, metric_value, target_value')
          .eq('status', 'approved')
          .in('facility_id', (
            await supabase
              .from('facilities')
              .select('id')
              .in('district_id', (
                await supabase
                  .from('districts')
                  .select('id')
                  .eq('state_id', data.state.id)
                  .eq('is_active', true)
              ).data?.map(d => d.id) || [])
              .eq('is_active', true)
          ).data?.map(f => f.id) || []);

        comprehensiveAnalytics = {
          district_kpis: districtKpis || [],
          program_performance: programData || [],
          scheme_utilization: schemeData || [],
          top_facilities: topFacilities || [],
          state_metrics_summary: stateMetrics || []
        };
      } catch (analyticsError) {
        console.warn("Failed to fetch comprehensive analytics:", analyticsError);
        // Continue without comprehensive analytics
      }
    }

    // Get user information for context
    const { data: { user } } = await supabase.auth.getUser();

    // Log successful analytics request
    console.log(`State analytics fetched: ${state_id || 'user_state'} by ${user?.email}`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        dashboard: data,
        comprehensive_analytics: comprehensiveAnalytics,
        requested_by: user?.email,
        filters_applied: {
          start_date,
          end_date,
          include_districts,
          program_filter
        },
        generated_at: new Date().toISOString()
      },
      message: "State analytics retrieved successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("State Analytics Error:", error);
    
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
