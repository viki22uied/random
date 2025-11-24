# ============================================
# HDIMS Frontend + Backend Setup Guide
# ============================================

## 🚀 Quick Start - Run Both Frontend & Backend

### **For Windows Users (Recommended):**

#### **Terminal 1: Start Backend**
```powershell
cd e:\health-performance-dashboard
.\scripts\start-backend.ps1
```

#### **Terminal 2: Start Frontend**
```powershell
cd e:\health-performance-dashboard
.\scripts\start-frontend.ps1
```

---

### **For Linux/Mac Users:**

#### **Terminal 1: Start Backend**
```bash
cd e:/health-performance-dashboard
./scripts/start-backend.sh
```

#### **Terminal 2: Start Frontend**
```bash
cd e:/health-performance-dashboard
./scripts/start-frontend.sh
```

---

## 📋 Prerequisites

### **Backend Requirements:**
- ✅ Supabase CLI installed (`npm install supabase`)
- ✅ Node.js 18+ installed
- ✅ Environment variables configured in `.env`
- ✅ Database migrations applied
- ✅ Edge Functions deployed

### **Frontend Requirements:**
- ✅ Node.js 18+ installed
- ✅ Frontend framework (React, Vue, Angular, etc.)
- ✅ @supabase/supabase-js installed

---

## 🔧 Manual Setup (If Scripts Don't Work)

### **Backend Setup:**

1. **Navigate to Backend Directory**
```bash
cd e:\health-performance-dashboard
```

2. **Load Environment Variables**
```powershell
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}
```

3. **Check Backend Status**
```bash
npx supabase status
```

4. **Test Backend Connection**
```bash
curl -X POST "https://dkukdrpfbqdfbvptwhuz.supabase.co/rest/v1/rpc/get_superadmin_overview" `
     -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdWtkcnBmYnFkZmJ2cHR3aHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ2OTAsImV4cCI6MjA3OTQ2MDY5MH0.ByjkkUazAh4KM7nQi0UpjqUc6u2K2xEPRjzyRt5sJ6Q"
```

### **Frontend Setup:**

1. **Navigate to Frontend Directory**
```bash
cd ../frontend  # or cd frontend if it's in the same directory
```

2. **Install Dependencies**
```bash
npm install
npm install @supabase/supabase-js
```

3. **Copy Configuration Files**
```bash
# If frontend is in ../frontend
cp ../backend/frontend-config.js src/config/
cp ../backend/frontend-supabase-client.js src/lib/

# If frontend is in ./frontend
cp backend/frontend-config.js src/config/
cp backend/frontend-supabase-client.js src/lib/
```

4. **Start Frontend**
```bash
npm run dev
```

---

## 🌐 Access Points

### **Backend URLs:**
- **REST API**: `https://dkukdrpfbqdfbvptwhuz.supabase.co/rest/v1/`
- **Edge Functions**: `https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/`
- **Authentication**: `https://dkukdrpfbqdfbvptwhuz.supabase.co/auth/v1/`
- **Storage**: `https://dkukdrpfbqdfbvptwhuz.supabase.co/storage/v1/`

### **Frontend URL:**
- **Development**: `http://localhost:3000` (or as configured in your frontend)

---

## 🔗 Frontend Integration Examples

### **Import Supabase Client**
```javascript
import { supabase, auth, db, rpc, edgeFunctions } from './src/lib/supabase.js';
```

### **Authentication**
```javascript
// Sign in
const { data, error } = await auth.signIn('user@example.com', 'password');

// Get current user
const { user } = await auth.getCurrentUser();

// Sign out
await auth.signOut();
```

### **Database Operations**
```javascript
// Select data
const { data, error } = await db.select('performance_data', {
  eq: { facility_id: 'your-facility-id' }
});

// Insert data
const { data, error } = await db.insert('performance_data', {
  facility_id: 'uuid',
  program_name: 'Test Program',
  metric_value: 100
});
```

### **RPC Functions**
```javascript
// Submit performance data
const { data, error } = await rpc.submitPerformanceData({
  p_facility_id: 'uuid',
  p_program_name: 'Test Program',
  p_metrics: [{ metric_key: 'test', metric_value: 100 }]
});

// Get dashboard data
const { data, error } = await rpc.getFacilityDashboard('facility-uuid');
```

### **Edge Functions**
```javascript
// Get analytics
const analytics = await edgeFunctions.getDistrictAnalytics('district-uuid', {
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});

// Upload document
const result = await edgeFunctions.uploadDocument(file, {
  facility_id: 'uuid',
  category: 'reports'
});
```

### **Real-time Subscriptions**
```javascript
// Subscribe to performance data changes
const subscription = realtime.subscribeToPerformanceData((payload) => {
  console.log('Performance data changed:', payload);
});

// Unsubscribe later
realtime.unsubscribe(subscription);
```

---

## 🧪 Testing the Connection

### **Test Backend API**
```bash
curl -X POST "https://dkukdrpfbqdfbvptwhuz.supabase.co/rest/v1/rpc/get_superadmin_overview" \
     -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdWtkcnBmYnFkZmJ2cHR3aHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ2OTAsImV4cCI6MjA3OTQ2MDY5MH0.ByjkkUazAh4KM7nQi0UpjqUc6u2K2xEPRjzyRt5sJ6Q" \
     -H "Content-Type: application/json"
```

### **Test Edge Function**
```bash
curl -X GET "https://dkukdrpfbqdfbvptwhuz.supabase.co/functions/v1/analytics-district" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🛠️ Troubleshooting

### **Common Issues:**

1. **CORS Errors**
   - Ensure your frontend URL is in `ALLOWED_ORIGINS` in `.env`
   - Check Edge Functions have proper CORS headers

2. **Authentication Issues**
   - Verify JWT token is valid
   - Check user exists in both `auth.users` and `users` tables

3. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Check if migrations were applied: `npx supabase db status`

4. **Frontend Build Errors**
   - Ensure `@supabase/supabase-js` is installed
   - Check import paths are correct

### **Debug Commands:**
```bash
# Check backend status
npx supabase status

# View Edge Function logs
npx supabase functions logs

# Test database connection
npx supabase db shell

# Check environment variables
Get-ChildItem Env: | Where-Object Name -like "*SUPABASE*"
```

---

## 📚 Next Steps

1. **Create First Admin User**
   - Go to Supabase Dashboard → Authentication
   - Create user with `super_admin` role
   - Add to `users` table

2. **Build Your Frontend**
   - Use the provided configuration files
   - Implement authentication flows
   - Connect to HDIMS API endpoints

3. **Test Full Workflow**
   - User registration/login
   - Data submission
   - Review process
   - Analytics dashboard

---

## 🎯 Success Indicators

✅ **Backend Running**: All API endpoints responding  
✅ **Frontend Running**: Development server accessible  
✅ **Connection Working**: Frontend can call backend APIs  
✅ **Authentication Working**: Users can sign in/out  
✅ **Data Flow Working**: CRUD operations successful  

Your HDIMS system is now fully operational! 🎉
