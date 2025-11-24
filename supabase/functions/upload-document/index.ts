import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function: Upload Document
 * 
 * Handles document uploads for healthcare facilities with proper
 * access control and file validation. Supports multiple file types
 * and generates secure download URLs.
 * 
 * @param req - HTTP request with file data and metadata
 * @returns Response with upload result and file information
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

    // Get user information for validation
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Failed to authenticate user");
    }

    // Get user's facility for access control
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('facility_id, role')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      throw new Error("Failed to fetch user information");
    }

    // Parse form data for file upload
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const facility_id = formData.get('facility_id') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;

    // Validate file presence
    if (!file) {
      throw new Error("No file provided in upload");
    }

    // Validate facility access
    if (userData.role !== 'super_admin' && userData.facility_id !== facility_id) {
      throw new Error("Unauthorized: Cannot upload files for this facility");
    }

    // Validate UUID format for facility_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(facility_id)) {
      throw new Error("Invalid facility_id format. Must be a valid UUID");
    }

    // File validation
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    if (file.size > maxSize) {
      throw new Error("File size exceeds 10MB limit");
    }

    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    // Generate secure file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `${facility_id}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('facility-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Storage Upload Error:", uploadError);
      throw new Error("Failed to upload file to storage");
    }

    // Get file metadata from storage
    const { data: fileData } = supabase.storage
      .from('facility-documents')
      .getPublicUrl(filePath);

    // Record upload in database
    const { data: uploadRecord, error: recordError } = await supabase
      .from('uploads')
      .insert({
        facility_id: facility_id,
        storage_path: filePath,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        category: category || 'general',
        description: description || null,
        uploaded_by: user.id
      })
      .select()
      .single();

    if (recordError) {
      console.error("Database Record Error:", recordError);
      
      // Attempt to clean up uploaded file
      await supabase.storage
        .from('facility-documents')
        .remove([filePath]);
      
      throw new Error("Failed to record upload in database");
    }

    // Generate signed URL for secure download (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('facility-documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    // Log successful upload
    console.log(`Document uploaded: ${filePath} by ${user.email}`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        upload_record: uploadRecord,
        file_info: {
          original_name: file.name,
          size: file.size,
          type: file.type,
          storage_path: filePath
        },
        download_url: signedUrlData?.signedUrl || fileData.publicUrl,
        expires_at: signedUrlData?.expiresAt || null
      },
      message: "Document uploaded successfully",
      uploaded_by: user.email
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Upload Document Error:", error);
    
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
