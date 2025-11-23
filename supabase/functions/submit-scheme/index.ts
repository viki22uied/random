import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function: Submit Scheme Data
 * 
 * Handles submission of healthcare scheme tracking data including
 * beneficiary counts, fund utilization, and supporting activities.
 * 
 * @param req - HTTP request with scheme data payload
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

    const payload = await req.json();

    // Destructure and validate required fields
    const {
      facility_id,
      scheme_name,
      scheme_category,
      reporting_start,
      reporting_end,
      beneficiary_count,
      target_beneficiaries,
      funds_allocated,
      funds_utilized,
      activities,
      doc_ids
    } = payload;

    // Required field validation
    const requiredFields = [
      'facility_id', 'scheme_name', 'reporting_start', 'reporting_end',
      'beneficiary_count', 'funds_utilized'
    ];

    for (const field of requiredFields) {
      if (!payload[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Data type and value validation
    if (typeof beneficiary_count !== 'number' || beneficiary_count < 0) {
      throw new Error("beneficiary_count must be a non-negative number");
    }

    if (target_beneficiaries && (typeof target_beneficiaries !== 'number' || target_beneficiaries < 0)) {
      throw new Error("target_beneficiaries must be a non-negative number");
    }

    if (typeof funds_utilized !== 'number' || funds_utilized < 0) {
      throw new Error("funds_utilized must be a non-negative number");
    }

    if (funds_allocated && (typeof funds_allocated !== 'number' || funds_allocated < 0)) {
      throw new Error("funds_allocated must be a non-negative number");
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

    // Validate activities array if provided
    if (activities && !Array.isArray(activities)) {
      throw new Error("activities must be an array");
    }

    // Validate document IDs array if provided
    if (doc_ids && (!Array.isArray(doc_ids) || !doc_ids.every(id => typeof id === 'string'))) {
      throw new Error("doc_ids must be an array of strings");
    }

    // Call RPC function to submit scheme data
    const { data, error } = await supabase.rpc("submit_scheme_data", {
      p_facility_id: facility_id,
      p_scheme_name: scheme_name,
      p_scheme_category: scheme_category || null,
      p_reporting_start: reporting_start,
      p_reporting_end: reporting_end,
      p_beneficiary_count: beneficiary_count,
      p_target_beneficiaries: target_beneficiaries || null,
      p_funds_allocated: funds_allocated || null,
      p_funds_utilized: funds_utilized,
      p_activities: activities || [],
      p_doc_ids: doc_ids || [],
    });

    if (error) {
      console.error("RPC Error:", error);
      throw new Error(error.message || "Failed to submit scheme data");
    }

    // Log successful submission
    console.log(`Scheme data submitted successfully: ${scheme_name} for facility ${facility_id}`);

    return new Response(JSON.stringify({
      success: true,
      data: data,
      message: "Scheme data submitted successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Submit Scheme Error:", error);
    
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
