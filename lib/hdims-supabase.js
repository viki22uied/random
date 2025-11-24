// ============================================
// HDIMS Supabase Client for Next.js Frontend
// ============================================

'use client';

import { createClient } from '@supabase/supabase-js';
import hdimsConfig from './hdims-config.js';

// Regular client (for normal operations)
export const supabase = createClient(
  hdimsConfig.supabase.url,
  hdimsConfig.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
  }
);

// Admin client (for admin operations like user management)
// Note: In production, this should be handled by backend API endpoints
// For now, we'll use a workaround with regular auth
export const supabaseAdmin = {
  // Create user using regular auth signup (bypass admin restrictions)
  createUser: async ({ email, password, user_metadata = {} }) => {
    try {
      // Use regular signup to create the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: user_metadata,
        },
      });
      
      if (error) {
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  },
  
  // Delete user (simplified - would need proper service role in production)
  deleteUser: async (userId) => {
    console.warn('Delete user functionality requires service role key');
    return { error: { message: 'Delete user not available in demo mode' } };
  }
};

// Auth helper functions
export const auth = {
  // Sign up new user
  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  },

  // Sign in user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database helper functions
export const db = {
  // Generic select
  select: async (table, options = {}) => {
    let query = supabase.from(table).select(options.select || '*');
    
    if (options.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    if (options.neq) {
      Object.entries(options.neq).forEach(([key, value]) => {
        query = query.neq(key, value);
      });
    }
    
    if (options.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending });
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Generic insert
  insert: async (table, data) => {
    const { data: result, error } = await supabase.from(table).insert(data);
    return { data: result, error };
  },

  // Generic update
  update: async (table, data, filters) => {
    let query = supabase.from(table).update(data);
    
    if (filters.eq) {
      Object.entries(filters.eq).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data: result, error } = await query;
    return { data: result, error };
  },

  // Generic delete
  delete: async (table, filters) => {
    let query = supabase.from(table).delete();
    
    if (filters.eq) {
      Object.entries(filters.eq).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;
    return { data, error };
  },
};

// RPC function helper
export const rpc = {
  // Submit performance data
  submitPerformanceData: async (params) => {
    const { data, error } = await supabase.rpc(hdimsConfig.rpc.submitPerformanceData, params);
    return { data, error };
  },

  // Submit scheme data
  submitSchemeData: async (params) => {
    const { data, error } = await supabase.rpc(hdimsConfig.rpc.submitSchemeData, params);
    return { data, error };
  },

  // Review submission
  reviewSubmission: async (params) => {
    const { data, error } = await supabase.rpc(hdimsConfig.rpc.reviewSubmission, params);
    return { data, error };
  },

  // Get facility dashboard
  getFacilityDashboard: async (facilityId, startDate, endDate) => {
    const { data, error } = await supabase.rpc(hdimsConfig.rpc.getFacilityDashboard, {
      p_facility_id: facilityId,
      p_start_date: startDate,
      p_end_date: endDate,
    });
    return { data, error };
  },

  // Get district dashboard
  getDistrictDashboard: async (districtId) => {
    const { data, error } = await supabase.rpc(hdimsConfig.rpc.getDistrictDashboard, {
      p_district_id: districtId,
    });
    return { data, error };
  },

  // Get state dashboard
  getStateDashboard: async (stateId) => {
    const { data, error } = await supabase.rpc(hdimsConfig.rpc.getStateDashboard, {
      p_state_id: stateId,
    });
    return { data, error };
  },

  // Get performance trends
  getPerformanceTrends: async (facilityId, metricKey, months) => {
    const { data, error } = await supabase.rpc(hdimsConfig.rpc.getPerformanceTrends, {
      p_facility_id: facilityId,
      p_metric_key: metricKey,
      p_months: months,
    });
    return { data, error };
  },

  // Get superadmin overview
  getSuperadminOverview: async () => {
    const { data, error } = await supabase.rpc(hdimsConfig.rpc.getSuperadminOverview);
    return { data, error };
  },
};

// Edge Functions helper
export const edgeFunctions = {
  // Submit performance data via Edge Function
  submitPerformance: async (data) => {
    const session = await supabase.auth.getSession();
    const response = await fetch(hdimsConfig.functions.submitPerformance, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.data.session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Submit scheme data via Edge Function
  submitScheme: async (data) => {
    const session = await supabase.auth.getSession();
    const response = await fetch(hdimsConfig.functions.submitScheme, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.data.session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Review submission via Edge Function
  reviewSubmission: async (data) => {
    const session = await supabase.auth.getSession();
    const response = await fetch(hdimsConfig.functions.reviewSubmission, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.data.session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get district analytics via Edge Function
  getDistrictAnalytics: async (districtId, options = {}) => {
    const session = await supabase.auth.getSession();
    const url = new URL(hdimsConfig.functions.analyticsDistrict);
    if (districtId) url.searchParams.set('district_id', districtId);
    if (options.startDate) url.searchParams.set('start_date', options.startDate);
    if (options.endDate) url.searchParams.set('end_date', options.endDate);
    if (options.includeFacilities) url.searchParams.set('include_facilities', 'true');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.data.session?.access_token}`,
      },
    });
    return response.json();
  },

  // Get state analytics via Edge Function
  getStateAnalytics: async (stateId, options = {}) => {
    const session = await supabase.auth.getSession();
    const url = new URL(hdimsConfig.functions.analyticsState);
    if (stateId) url.searchParams.set('state_id', stateId);
    if (options.startDate) url.searchParams.set('start_date', options.startDate);
    if (options.endDate) url.searchParams.set('end_date', options.endDate);
    if (options.includeDistricts) url.searchParams.set('include_districts', 'true');
    if (options.programFilter) url.searchParams.set('program_filter', options.programFilter);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.data.session?.access_token}`,
      },
    });
    return response.json();
  },

  // Upload document via Edge Function
  uploadDocument: async (file, metadata) => {
    const session = await supabase.auth.getSession();
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch(hdimsConfig.functions.uploadDocument, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.data.session?.access_token}`,
      },
      body: formData,
    });
    return response.json();
  },
};

// Storage helper
export const storage = {
  // Upload file
  uploadFile: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  },

  // Get public URL
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // Create signed URL
  createSignedUrl: async (bucket, path, expiresIn = 60) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    return { data, error };
  },

  // Delete file
  deleteFile: async (bucket, path) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return { data, error };
  },
};

// Realtime subscriptions
export const realtime = {
  // Subscribe to table changes
  subscribeToTable: (table, callback, filter = '*') => {
    return supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table, filter: filter },
        callback
      )
      .subscribe();
  },

  // Subscribe to performance data changes
  subscribeToPerformanceData: (callback, facilityId = null) => {
    const filter = facilityId ? `facility_id=eq.${facilityId}` : '*';
    return realtime.subscribeToTable('performance_data', callback, filter);
  },

  // Subscribe to scheme data changes
  subscribeToSchemeData: (callback, facilityId = null) => {
    const filter = facilityId ? `facility_id=eq.${facilityId}` : '*';
    return realtime.subscribeToTable('scheme_tracking', callback, filter);
  },

  // Unsubscribe from channel
  unsubscribe: (subscription) => {
    supabase.removeChannel(subscription);
  },
};

export default { supabase, auth, db, rpc, edgeFunctions, storage, realtime };
