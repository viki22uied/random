import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function: Submit Performance Data
 * 
 * Handles submission of performance metrics from healthcare facilities.
 * Validates user permissions and data integrity before inserting into database.
 * 
 * @param req - HTTP request with performance data payload
 * @returns Response with success/error status and details
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

    // Parse and validate request body
    const { facility_id, reporting_start, reporting_end, program_name, metrics } = await req.json();

    // Input validation
    if (!facility_id || !reporting_start || !reporting_end || !program_name || !metrics) {
      throw new Error("Missing required fields: facility_id, reporting_start, reporting_end, program_name, metrics");
    }

    if (!Array.isArray(metrics) || metrics.length === 0) {
      throw new Error("Metrics must be a non-empty array");
    }

    // Validate each metric structure
    for (const metric of metrics) {
      if (!metric.metric_key || metric.metric_value === undefined) {
        throw new Error("Each metric must have metric_key and metric_value");
      }
      
      if (typeof metric.metric_value !== 'number' || metric.metric_value < 0) {
        throw new Error("metric_value must be a non-negative number");
      }
    }

    // Validate date range
    const startDate = new Date(reporting_start);
    const endDate = new Date(reporting_end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format. Use YYYY-MM-DD format");
    }
    
    if (endDate < startDate) {
      throw new Error("End date must be after start date");
    }

    // Call RPC function to submit data
    const { data, error } = await supabase.rpc("submit_performance_data", {
      p_facility_id: facility_id,
      p_reporting_start: reporting_start,
      p_reporting_end: reporting_end,
      p_program_name: program_name,
      p_metrics: metrics,
    });

    if (error) {
      console.error("RPC Error:", error);
      throw new Error(error.message || "Failed to submit performance data");
    }

    // Log successful submission
    console.log(`Performance data submitted successfully for facility ${facility_id}`);

    return new Response(JSON.stringify({
      success: true,
      data: data,
      message: "Performance data submitted successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Submit Performance Error:", error);
    
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
