(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/hdims-config.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============================================
// HDIMS Backend Configuration for Frontend
// ============================================
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "hdimsConfig",
    ()=>hdimsConfig
]);
const hdimsConfig = {
    // Supabase Configuration (from your backend .env)
    supabase: {
        url: 'https://dkukdrpfbqdfbvptwhuz.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdWtkcnBmYnFkZmJ2cHR3aHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ2OTAsImV4cCI6MjA3OTQ2MDY5MH0.ByjkkUazAh4KM7nQi0UpjqUc6u2K2xEPRjzyRt5sJ6Q'
    },
    // API Endpoints
    api: {
        rest: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/rest/v1/',
        functions: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/',
        auth: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/auth/v1/',
        storage: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/storage/v1/'
    },
    // Edge Functions
    functions: {
        submitPerformance: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/submit-performance',
        submitScheme: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/submit-scheme',
        reviewSubmission: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/review-submission',
        analyticsDistrict: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/analytics-district',
        analyticsState: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/analytics-state',
        uploadDocument: 'https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/upload-document'
    },
    // RPC Functions
    rpc: {
        submitPerformanceData: 'submit_performance_data',
        submitSchemeData: 'submit_scheme_data',
        reviewSubmission: 'review_submission',
        getFacilityDashboard: 'get_facility_dashboard',
        getDistrictDashboard: 'get_district_dashboard',
        getStateDashboard: 'get_state_dashboard',
        getPerformanceTrends: 'get_performance_trends',
        getSuperadminOverview: 'get_superadmin_overview'
    },
    // User Roles
    roles: {
        HOSPITAL_USER: 'hospital_user',
        DISTRICT_ADMIN: 'district_admin',
        STATE_ADMIN: 'state_admin',
        SUPER_ADMIN: 'super_admin'
    },
    // Status Options
    status: {
        SUBMITTED: 'submitted',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        SENT_BACK: 'sent_back',
        UNDER_REVIEW: 'under_review'
    }
};
const __TURBOPACK__default__export__ = hdimsConfig;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/hdims-supabase.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============================================
// HDIMS Supabase Client for Next.js Frontend
// ============================================
__turbopack_context__.s([
    "auth",
    ()=>auth,
    "db",
    ()=>db,
    "default",
    ()=>__TURBOPACK__default__export__,
    "edgeFunctions",
    ()=>edgeFunctions,
    "realtime",
    ()=>realtime,
    "rpc",
    ()=>rpc,
    "storage",
    ()=>storage,
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/hdims-config.js [app-client] (ecmascript)");
'use client';
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].supabase.url, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].supabase.anonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    realtime: {
        params: {
            eventsPerSecond: 2
        }
    }
});
const auth = {
    // Sign up new user
    signUp: async (email, password, metadata = {})=>{
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        return {
            data,
            error
        };
    },
    // Sign in user
    signIn: async (email, password)=>{
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return {
            data,
            error
        };
    },
    // Sign out user
    signOut: async ()=>{
        const { error } = await supabase.auth.signOut();
        return {
            error
        };
    },
    // Get current user
    getCurrentUser: async ()=>{
        const { data: { user }, error } = await supabase.auth.getUser();
        return {
            user,
            error
        };
    },
    // Get session
    getSession: async ()=>{
        const { data: { session }, error } = await supabase.auth.getSession();
        return {
            session,
            error
        };
    },
    // Listen to auth changes
    onAuthStateChange: (callback)=>{
        return supabase.auth.onAuthStateChange(callback);
    }
};
const db = {
    // Generic select
    select: async (table, options = {})=>{
        let query = supabase.from(table).select(options.select || '*');
        if (options.eq) {
            Object.entries(options.eq).forEach(([key, value])=>{
                query = query.eq(key, value);
            });
        }
        if (options.neq) {
            Object.entries(options.neq).forEach(([key, value])=>{
                query = query.neq(key, value);
            });
        }
        if (options.order) {
            query = query.order(options.order.column, {
                ascending: options.order.ascending
            });
        }
        if (options.limit) {
            query = query.limit(options.limit);
        }
        const { data, error } = await query;
        return {
            data,
            error
        };
    },
    // Generic insert
    insert: async (table, data)=>{
        const { data: result, error } = await supabase.from(table).insert(data);
        return {
            data: result,
            error
        };
    },
    // Generic update
    update: async (table, data, filters)=>{
        let query = supabase.from(table).update(data);
        if (filters.eq) {
            Object.entries(filters.eq).forEach(([key, value])=>{
                query = query.eq(key, value);
            });
        }
        const { data: result, error } = await query;
        return {
            data: result,
            error
        };
    },
    // Generic delete
    delete: async (table, filters)=>{
        let query = supabase.from(table).delete();
        if (filters.eq) {
            Object.entries(filters.eq).forEach(([key, value])=>{
                query = query.eq(key, value);
            });
        }
        const { data, error } = await query;
        return {
            data,
            error
        };
    }
};
const rpc = {
    // Submit performance data
    submitPerformanceData: async (params)=>{
        const { data, error } = await supabase.rpc(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].rpc.submitPerformanceData, params);
        return {
            data,
            error
        };
    },
    // Submit scheme data
    submitSchemeData: async (params)=>{
        const { data, error } = await supabase.rpc(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].rpc.submitSchemeData, params);
        return {
            data,
            error
        };
    },
    // Review submission
    reviewSubmission: async (params)=>{
        const { data, error } = await supabase.rpc(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].rpc.reviewSubmission, params);
        return {
            data,
            error
        };
    },
    // Get facility dashboard
    getFacilityDashboard: async (facilityId, startDate, endDate)=>{
        const { data, error } = await supabase.rpc(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].rpc.getFacilityDashboard, {
            p_facility_id: facilityId,
            p_start_date: startDate,
            p_end_date: endDate
        });
        return {
            data,
            error
        };
    },
    // Get district dashboard
    getDistrictDashboard: async (districtId)=>{
        const { data, error } = await supabase.rpc(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].rpc.getDistrictDashboard, {
            p_district_id: districtId
        });
        return {
            data,
            error
        };
    },
    // Get state dashboard
    getStateDashboard: async (stateId)=>{
        const { data, error } = await supabase.rpc(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].rpc.getStateDashboard, {
            p_state_id: stateId
        });
        return {
            data,
            error
        };
    },
    // Get performance trends
    getPerformanceTrends: async (facilityId, metricKey, months)=>{
        const { data, error } = await supabase.rpc(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].rpc.getPerformanceTrends, {
            p_facility_id: facilityId,
            p_metric_key: metricKey,
            p_months: months
        });
        return {
            data,
            error
        };
    },
    // Get superadmin overview
    getSuperadminOverview: async ()=>{
        const { data, error } = await supabase.rpc(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].rpc.getSuperadminOverview);
        return {
            data,
            error
        };
    }
};
const edgeFunctions = {
    // Submit performance data via Edge Function
    submitPerformance: async (data)=>{
        const session = await supabase.auth.getSession();
        const response = await fetch(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].functions.submitPerformance, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.data.session?.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    // Submit scheme data via Edge Function
    submitScheme: async (data)=>{
        const session = await supabase.auth.getSession();
        const response = await fetch(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].functions.submitScheme, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.data.session?.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    // Review submission via Edge Function
    reviewSubmission: async (data)=>{
        const session = await supabase.auth.getSession();
        const response = await fetch(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].functions.reviewSubmission, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.data.session?.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    // Get district analytics via Edge Function
    getDistrictAnalytics: async (districtId, options = {})=>{
        const session = await supabase.auth.getSession();
        const url = new URL(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].functions.analyticsDistrict);
        if (districtId) url.searchParams.set('district_id', districtId);
        if (options.startDate) url.searchParams.set('start_date', options.startDate);
        if (options.endDate) url.searchParams.set('end_date', options.endDate);
        if (options.includeFacilities) url.searchParams.set('include_facilities', 'true');
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.data.session?.access_token}`
            }
        });
        return response.json();
    },
    // Get state analytics via Edge Function
    getStateAnalytics: async (stateId, options = {})=>{
        const session = await supabase.auth.getSession();
        const url = new URL(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].functions.analyticsState);
        if (stateId) url.searchParams.set('state_id', stateId);
        if (options.startDate) url.searchParams.set('start_date', options.startDate);
        if (options.endDate) url.searchParams.set('end_date', options.endDate);
        if (options.includeDistricts) url.searchParams.set('include_districts', 'true');
        if (options.programFilter) url.searchParams.set('program_filter', options.programFilter);
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.data.session?.access_token}`
            }
        });
        return response.json();
    },
    // Upload document via Edge Function
    uploadDocument: async (file, metadata)=>{
        const session = await supabase.auth.getSession();
        const formData = new FormData();
        formData.append('file', file);
        Object.entries(metadata).forEach(([key, value])=>{
            formData.append(key, value);
        });
        const response = await fetch(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].functions.uploadDocument, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.data.session?.access_token}`
            },
            body: formData
        });
        return response.json();
    }
};
const storage = {
    // Upload file
    uploadFile: async (bucket, path, file)=>{
        const { data, error } = await supabase.storage.from(bucket).upload(path, file);
        return {
            data,
            error
        };
    },
    // Get public URL
    getPublicUrl: (bucket, path)=>{
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    },
    // Create signed URL
    createSignedUrl: async (bucket, path, expiresIn = 60)=>{
        const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
        return {
            data,
            error
        };
    },
    // Delete file
    deleteFile: async (bucket, path)=>{
        const { data, error } = await supabase.storage.from(bucket).remove([
            path
        ]);
        return {
            data,
            error
        };
    }
};
const realtime = {
    // Subscribe to table changes
    subscribeToTable: (table, callback, filter = '*')=>{
        return supabase.channel(`${table}-changes`).on('postgres_changes', {
            event: '*',
            schema: 'public',
            table,
            filter: filter
        }, callback).subscribe();
    },
    // Subscribe to performance data changes
    subscribeToPerformanceData: (callback, facilityId = null)=>{
        const filter = facilityId ? `facility_id=eq.${facilityId}` : '*';
        return realtime.subscribeToTable('performance_data', callback, filter);
    },
    // Subscribe to scheme data changes
    subscribeToSchemeData: (callback, facilityId = null)=>{
        const filter = facilityId ? `facility_id=eq.${facilityId}` : '*';
        return realtime.subscribeToTable('scheme_tracking', callback, filter);
    },
    // Unsubscribe from channel
    unsubscribe: (subscription)=>{
        supabase.removeChannel(subscription);
    }
};
const __TURBOPACK__default__export__ = {
    supabase,
    auth,
    db,
    rpc,
    edgeFunctions,
    storage,
    realtime
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/auth-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/hdims-supabase.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
// Role mapping between frontend and backend
const roleMapping = {
    hospital: "hospital_user",
    district: "district_admin",
    state: "state_admin",
    admin: "super_admin"
};
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Check for existing session on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const checkSession = {
                "AuthProvider.useEffect.checkSession": async ()=>{
                    const { data: { session } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
                    if (session?.user) {
                        // Get user profile from users table
                        const { data: userData } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('*').eq('id', session.user.id).single();
                        if (userData) {
                            // Convert backend role to frontend role
                            const backendToFrontendRole = {
                                "hospital_user": "hospital",
                                "district_admin": "district",
                                "state_admin": "state",
                                "super_admin": "admin"
                            };
                            const frontendRole = backendToFrontendRole[userData.role] || "hospital";
                            setUser({
                                id: userData.id,
                                email: userData.email,
                                name: userData.full_name,
                                roles: [
                                    frontendRole
                                ],
                                currentRole: frontendRole,
                                facilityId: userData.facility_id,
                                districtId: userData.district_id,
                                stateId: userData.state_id
                            });
                        }
                    }
                }
            }["AuthProvider.useEffect.checkSession"];
            checkSession();
            // Listen to auth changes
            const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange({
                "AuthProvider.useEffect": (_event, session)=>{
                    if (!session) {
                        setUser(null);
                        sessionStorage.removeItem("auth_user");
                    }
                }
            }["AuthProvider.useEffect"]);
            return ({
                "AuthProvider.useEffect": ()=>subscription.unsubscribe()
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], []);
    const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[login]": async (email, password, role)=>{
            setIsLoading(true);
            try {
                // For hospital staff, try to login first
                if (role === 'hospital') {
                    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signInWithPassword({
                        email,
                        password
                    });
                    if (error) {
                        // Login failed - user needs to sign up
                        throw new Error("User account not found. Please sign up first.");
                    }
                    if (!data.user) {
                        throw new Error("Login failed");
                    }
                    // Get user profile from users table - use user ID instead of email for reliability
                    const { data: userData } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('*').eq('id', data.user.id).single();
                    if (!userData) {
                        throw new Error("User profile not found");
                    }
                    // Verify the user role matches
                    if (userData.role !== 'hospital_user') {
                        throw new Error("User role mismatch. Please contact administrator.");
                    }
                    const userObj = {
                        id: userData.id,
                        email: userData.email,
                        name: userData.full_name,
                        roles: [
                            role
                        ],
                        currentRole: role,
                        facilityId: userData.facility_id,
                        districtId: userData.district_id,
                        stateId: userData.state_id
                    };
                    setUser(userObj);
                    sessionStorage.setItem("auth_user", JSON.stringify(userObj));
                    return;
                }
                // For other roles (admin, state, district), use existing logic
                const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signInWithPassword({
                    email,
                    password
                });
                if (error) {
                    throw error;
                }
                if (!data.user) {
                    throw new Error("Login failed");
                }
                // Get user profile from users table
                const { data: userData, error: userError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('*').eq('id', data.user.id).single();
                if (userError || !userData) {
                    throw new Error("User profile not found");
                }
                // Verify role matches
                const backendToFrontendRole = {
                    "hospital_user": "hospital",
                    "district_admin": "district",
                    "state_admin": "state",
                    "super_admin": "admin"
                };
                const expectedRole = backendToFrontendRole[userData.role];
                if (expectedRole !== role) {
                    throw new Error(`Role mismatch. Expected ${role}, but user is ${expectedRole}`);
                }
                const userObj = {
                    id: userData.id,
                    email: userData.email,
                    name: userData.full_name,
                    roles: [
                        role
                    ],
                    currentRole: role,
                    facilityId: userData.facility_id,
                    districtId: userData.district_id,
                    stateId: userData.state_id
                };
                setUser(userObj);
                sessionStorage.setItem("auth_user", JSON.stringify(userObj));
            } finally{
                setIsLoading(false);
            }
        }
    }["AuthProvider.useCallback[login]"], []);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[logout]": async ()=>{
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hdims$2d$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
            setUser(null);
            sessionStorage.removeItem("auth_user");
        }
    }["AuthProvider.useCallback[logout]"], []);
    const switchRole = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[switchRole]": (role)=>{
            if (user?.roles.includes(role)) {
                const updated = {
                    ...user,
                    currentRole: role
                };
                setUser(updated);
                sessionStorage.setItem("auth_user", JSON.stringify(updated));
            }
        }
    }["AuthProvider.useCallback[switchRole]"], [
        user
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isLoading,
            login,
            logout,
            switchRole
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/auth-context.tsx",
        lineNumber: 216,
        columnNumber: 10
    }, this);
}
_s(AuthProvider, "TA9FxHrGLXAOb467ClGqc5ONjFw=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth-context.tsx [app-client] (ecmascript)");
"use client";
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/app/providers.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_96eae923._.js.map