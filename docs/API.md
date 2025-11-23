# HDIMS Backend API Documentation

## Base URL
```
https://[your-project].supabase.co
```

## Authentication
All requests require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Core Endpoints

### 1. Submit Performance Data
**Endpoint:** `POST /rest/v1/rpc/submit_performance_data` 

**Description:** Submit multiple performance metrics for a facility in a single request.

**Request Body:**
```json
{
  "p_facility_id": "770e8400-e29b-41d4-a716-446655440001",
  "p_reporting_start": "2024-01-01",
  "p_reporting_end": "2024-01-31",
  "p_program_name": "OPD Services",
  "p_metrics": [
    {
      "metric_key": "total_patients",
      "metric_value": 2500,
      "target_value": 2000,
      "unit": "count"
    },
    {
      "metric_key": "emergency_cases",
      "metric_value": 150,
      "target_value": 100,
      "unit": "count"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "inserted_ids": ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"],
  "message": "Performance data submitted successfully"
}
```

**Edge Function Alternative:** `POST /functions/v1/submit-performance`

---

### 2. Submit Scheme Data
**Endpoint:** `POST /rest/v1/rpc/submit_scheme_data` 

**Description:** Submit healthcare scheme tracking data including beneficiaries and fund utilization.

**Request Body:**
```json
{
  "p_facility_id": "770e8400-e29b-41d4-a716-446655440001",
  "p_scheme_name": "PM-JAY",
  "p_scheme_category": "Central",
  "p_reporting_start": "2024-01-01",
  "p_reporting_end": "2024-03-31",
  "p_beneficiary_count": 350,
  "p_target_beneficiaries": 400,
  "p_funds_allocated": 5000000,
  "p_funds_utilized": 4250000,
  "p_activities": [
    {
      "activity": "Surgeries performed",
      "date": "2024-01-15",
      "beneficiaries": 120
    },
    {
      "activity": "Diagnostic tests",
      "date": "2024-02-10", 
      "beneficiaries": 230
    }
  ],
  "p_doc_ids": ["doc-uuid-1", "doc-uuid-2"]
}
```

**Response:**
```json
{
  "success": true,
  "scheme_id": "660e8400-e29b-41d4-a716-446655440001",
  "message": "Scheme data submitted successfully"
}
```

**Edge Function Alternative:** `POST /functions/v1/submit-scheme`

---

### 3. Review Submission
**Endpoint:** `POST /rest/v1/rpc/review_submission` 

**Description:** Approve, reject, or send back submissions for review (District Admin only).

**Request Body:**
```json
{
  "p_entity_type": "performance_data",
  "p_entity_id": "550e8400-e29b-41d4-a716-446655440001",
  "p_new_status": "approved",
  "p_comments": "Data verified and approved",
  "p_rejection_reason": null
}
```

**Status Options:** `approved`, `rejected`, `sent_back`, `under_review` 

**Response:**
```json
{
  "success": true,
  "new_status": "approved",
  "message": "Submission approved successfully"
}
```

**Edge Function Alternative:** `POST /functions/v1/review-submission`

---

### 4. Get Facility Dashboard
**Endpoint:** `GET /rest/v1/rpc/get_facility_dashboard?p_facility_id={uuid}&p_start_date={date}&p_end_date={date}` 

**Description:** Get comprehensive dashboard data for a specific facility.

**Query Parameters:**
- `p_facility_id` (optional): Facility UUID, defaults to user's facility
- `p_start_date` (optional): Filter start date (YYYY-MM-DD)
- `p_end_date` (optional): Filter end date (YYYY-MM-DD)

**Response:**
```json
{
  "facility": {
    "id": "770e8400-e29b-41d4-a716-446655440001",
    "name": "Mumbai Central Hospital",
    "facility_type": "DH",
    "address": "Mumbai Central, Mumbai"
  },
  "performance_metrics": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "program_name": "OPD Services",
      "metric_key": "total_patients",
      "metric_value": 2500,
      "target_value": 2000,
      "status": "approved"
    }
  ],
  "scheme_data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "scheme_name": "PM-JAY",
      "beneficiary_count": 350,
      "funds_utilized": 4250000,
      "status": "approved"
    }
  ],
  "status_summary": {
    "performance": {
      "submitted": 2,
      "approved": 8,
      "rejected": 1,
      "sent_back": 0
    },
    "schemes": {
      "submitted": 1,
      "approved": 3,
      "rejected": 0
    }
  }
}
```

---

### 5. Get District Dashboard
**Endpoint:** `GET /rest/v1/rpc/get_district_dashboard?p_district_id={uuid}` 

**Description:** Get district-level analytics and facility summaries.

**Response:**
```json
{
  "district": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Mumbai",
    "state_id": "550e8400-e29b-41d4-a716-446655440001"
  },
  "facilities_summary": {
    "total": 15,
    "by_type": {
      "PHC": 8,
      "CHC": 4,
      "DH": 2,
      "MEDICAL_COLLEGE": 1
    }
  },
  "pending_reviews": 12,
  "facilities": [
    {
      "facility": {
        "id": "770e8400-e29b-41d4-a716-446655440001",
        "name": "Mumbai Central Hospital",
        "facility_type": "DH"
      },
      "pending_count": 3
    }
  ]
}
```

**Edge Function Alternative:** `GET /functions/v1/analytics-district?district_id={uuid}`

---

### 6. Get State Dashboard
**Endpoint:** `GET /rest/v1/rpc/get_state_dashboard?p_state_id={uuid}` 

**Description:** Get state-wide analytics and district comparisons.

**Response:**
```json
{
  "state": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Maharashtra",
    "code": "MH"
  },
  "districts_count": 36,
  "facilities_count": 850,
  "district_performance": [
    {
      "district": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Mumbai"
      },
      "facilities_count": 15,
      "approved_submissions": 120
    }
  ]
}
```

**Edge Function Alternative:** `GET /functions/v1/analytics-state?state_id={uuid}`

---

### 7. Get Performance Trends
**Endpoint:** `GET /rest/v1/rpc/get_performance_trends?p_facility_id={uuid}&p_metric_key={string}&p_months={integer}` 

**Description:** Get historical performance trends for a specific metric.

**Query Parameters:**
- `p_facility_id`: Facility UUID (required)
- `p_metric_key`: Metric key (required)
- `p_months`: Number of months to look back (default: 12)

**Response:**
```json
[
  {
    "period": "2024-01-01",
    "value": 2500,
    "target": 2000,
    "status": "approved"
  },
  {
    "period": "2024-02-01",
    "value": 2600,
    "target": 2000,
    "status": "approved"
  }
]
```

---

### 8. Get Super Admin Overview
**Endpoint:** `GET /rest/v1/rpc/get_superadmin_overview()` 

**Description:** Get system-wide overview (Super Admin only).

**Response:**
```json
{
  "states_count": 29,
  "districts_count": 750,
  "facilities_count": 12500,
  "users_count": 45000,
  "pending_reviews": 125,
  "recent_activity": [
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "action": "insert",
      "entity": "performance_data",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "facilities_by_type": {
    "PHC": 8000,
    "CHC": 3000,
    "DH": 1200,
    "MEDICAL_COLLEGE": 300
  }
}
```

---

## Document Management

### 9. Upload Document
**Endpoint:** `POST /functions/v1/upload-document` 

**Description:** Upload documents to facility folder with access control.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file`: File data (required)
- `facility_id`: Facility UUID (required)
- `category`: Document category (optional)
- `description`: Document description (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "upload_record": {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "file_name": "report.pdf",
      "file_size": 2048576,
      "category": "monthly_report"
    },
    "download_url": "https://...",
    "expires_at": "2024-01-16T10:30:00Z"
  },
  "message": "Document uploaded successfully"
}
```

### 10. Get Download URL
**Endpoint:** `POST /storage/v1/object/sign/facility-documents/{path}` 

**Description:** Generate signed URL for secure file download.

**Request Body:**
```json
{
  "expiresIn": 3600
}
```

**Response:**
```json
{
  "signedUrl": "https://storage.googleapis.com/...",
  "expiresAt": "2024-01-16T10:30:00Z"
}
```

---

## Direct Table Access (with RLS)

### Query Performance Data
```
GET /rest/v1/performance_data?facility_id=eq.uuid&select=*
```

### Query with Filters
```
GET /rest/v1/performance_data?status=eq.submitted&order=created_at.desc&limit=10
```

### Update Performance Data (if allowed by RLS)
```
PATCH /rest/v1/performance_data?id=eq.uuid
Content-Type: application/json

{
  "metric_value": 2600,
  "comments": "Updated after verification"
}
```

### Query Scheme Data
```
GET /rest/v1/scheme_tracking?facility_id=eq.uuid&status=eq.approved&select=*
```

### Query User Profile
```
GET /rest/v1/users?id=eq.uuid&select=*
```

---

## Analytics Views

### District KPI Summary
```
GET /rest/v1/district_kpi_summary?district_id=eq.uuid
```

### Program Performance
```
GET /rest/v1/program_performance?state_name=eq.Maharashtra
```

### Scheme Utilization
```
GET /rest/v1/scheme_utilization?district_name=eq.Mumbai
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Invalid authentication credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions to access this resource"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required field: facility_id",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Database constraint violation",
  "details": "..."
}
```

---

## Rate Limits

- **Performance Data Submission**: 100 requests/hour per facility
- **Scheme Data Submission**: 50 requests/hour per facility
- **Document Upload**: 20 uploads/hour per facility
- **Analytics Queries**: 1000 requests/hour per user
- **Review Actions**: 200 requests/hour per district admin

---

## WebSocket Real-time Subscriptions

### Subscribe to Performance Data Changes
```javascript
const subscription = supabase
  .channel('performance_data')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'performance_data',
      filter: 'facility_id=eq.your-facility-id'
    }, 
    (payload) => console.log(payload)
  )
  .subscribe()
```

### Subscribe to Scheme Data Changes
```javascript
const subscription = supabase
  .channel('scheme_tracking')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'scheme_tracking',
      filter: 'facility_id=eq.your-facility-id'
    }, 
    (payload) => console.log(payload)
  )
  .subscribe()
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Submit performance data
const { data, error } = await supabase.rpc('submit_performance_data', {
  p_facility_id: 'your-facility-id',
  p_reporting_start: '2024-01-01',
  p_reporting_end: '2024-01-31',
  p_program_name: 'OPD Services',
  p_metrics: [{
    metric_key: 'total_patients',
    metric_value: 2500,
    target_value: 2000,
    unit: 'count'
  }]
});
```

### Python
```python
import requests
import json

url = "https://your-project.supabase.co/rest/v1/rpc/submit_performance_data"
headers = {
    "Authorization": f"Bearer {jwt_token}",
    "Content-Type": "application/json"
}

payload = {
    "p_facility_id": "your-facility-id",
    "p_reporting_start": "2024-01-01",
    "p_reporting_end": "2024-01-31",
    "p_program_name": "OPD Services",
    "p_metrics": [{
        "metric_key": "total_patients",
        "metric_value": 2500,
        "target_value": 2000,
        "unit": "count"
    }]
}

response = requests.post(url, headers=headers, json=payload)
```

---

## Testing

### Test Authentication
```bash
curl -X POST 'https://your-project.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{"email": "user@example.com", "password": "password"}'
```

### Test API Endpoint
```bash
curl -X GET 'https://your-project.supabase.co/rest/v1/rpc/get_facility_dashboard' \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json"
```

### Test Edge Function
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/submit-performance' \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"facility_id": "uuid", ...}'
```

---

## API Versioning

- **Current Version**: v1
- **Version in URL**: `/rest/v1/` for REST endpoints
- **Backward Compatibility**: Maintained for 6 months
- **Deprecation Notices**: Sent via email and in API responses

---

## Support

For API support and questions:
- Email: api-support@hdims.gov.in
- Documentation: https://docs.hdims.gov.in/api
- Status Page: https://status.hdims.gov.in
