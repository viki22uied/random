import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function: Review Submission
 * 
 * Handles approval/rejection of performance data and scheme tracking submissions
 * by district administrators. Updates status and logs review actions.
 * 
 * @param req - HTTP request with review details
 * @returns Response with success/error status and updated submission details
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

    const { entity_type, entity_id, new_status, comments, rejection_reason } = await req.json();

    // Validate required fields
    if (!entity_type || !entity_id || !new_status) {
      throw new Error("Missing required fields: entity_type, entity_id, new_status");
    }

    // Validate entity_type
    const validEntityTypes = ['performance_data', 'scheme_tracking'];
    if (!validEntityTypes.includes(entity_type)) {
      throw new Error(`Invalid entity_type. Must be one of: ${validEntityTypes.join(', ')}`);
    }

    // Validate new_status
    const validStatuses = ['approved', 'rejected', 'sent_back', 'under_review'];
    if (!validStatuses.includes(new_status)) {
      throw new Error(`Invalid new_status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate UUID format for entity_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(entity_id)) {
      throw new Error("Invalid entity_id format. Must be a valid UUID");
    }

    // Additional validation for rejection
    if (new_status === 'rejected' && !rejection_reason) {
      throw new Error("rejection_reason is required when status is 'rejected'");
    }

    // Additional validation for send_back
    if (new_status === 'sent_back' && !comments) {
      throw new Error("comments are required when status is 'sent_back'");
    }

    // Get current user info for logging
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Failed to authenticate user");
    }

    // Call RPC function to review submission
    const { data, error } = await supabase.rpc("review_submission", {
      p_entity_type: entity_type,
      p_entity_id: entity_id,
      p_new_status: new_status,
      p_comments: comments || null,
      p_rejection_reason: rejection_reason || null,
    });

    if (error) {
      console.error("RPC Error:", error);
      throw new Error(error.message || "Failed to review submission");
    }

    // Log successful review
    console.log(`Submission reviewed: ${entity_type}:${entity_id} -> ${new_status} by ${user.email}`);

    // Get updated submission details for response
    let submissionDetails = null;
    try {
      const { data: updatedData } = await supabase
        .from(entity_type)
        .select('*')
        .eq('id', entity_id)
        .single();
      
      submissionDetails = updatedData;
    } catch (fetchError) {
      console.warn("Failed to fetch updated submission details:", fetchError);
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        review_result: data,
        submission_details: submissionDetails
      },
      message: `Submission ${new_status} successfully`,
      reviewed_by: user.email,
      reviewed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Review Submission Error:", error);
    
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
