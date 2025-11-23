# HDIMS Backend - Health Data Information & Management System

Production-ready Supabase backend for multi-level healthcare data management with comprehensive security, analytics, and audit capabilities.

## 🎯 Overview

HDIMS Backend is a complete, production-grade healthcare data management system built on Supabase (PostgreSQL + Auth + Storage + Edge Functions). It provides secure, scalable infrastructure for healthcare organizations to collect, review, and analyze health performance metrics and scheme tracking data across multiple administrative levels.

### Key Features

- **🏥 Multi-tenant Architecture**: Facility → District → State → National hierarchy
- **🔐 Role-Based Access Control**: 4 distinct roles with fine-grained permissions
- **🛡️ Row-Level Security**: Automatic data isolation based on user role and geography
- **📊 Real-time Analytics**: Pre-built aggregations, KPIs, and performance trends
- **📁 Document Management**: Secure file upload/download with access controls
- **📋 Complete Audit Trail**: Comprehensive logging of all data modifications
- **🚀 RESTful APIs**: Standard REST endpoints + RPC functions for complex operations
- **⚡ High Performance**: Optimized queries, indexes, and materialized views
- **🔄 Real-time Updates**: WebSocket subscriptions for live data changes

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │
└────────┬────────┘
         │
         ├─── REST API (Supabase Auto-generated)
         ├─── RPC Functions (Custom business logic)
         ├─── Storage API (File uploads)
         └─── Realtime (WebSocket subscriptions)
         │
┌────────┴────────┐
│  Supabase Edge  │
│    Functions    │
└────────┬────────┘
         │
┌────────┴────────┐
│   PostgreSQL    │
│   + RLS Policies│
└─────────────────┘
```

## 📦 Tech Stack

- **Database**: PostgreSQL 15+ (via Supabase)
- **Authentication**: Supabase Auth (JWT-based)
- **Storage**: Supabase Storage (S3-compatible)
- **Functions**: Deno-based Edge Functions
- **Real-time**: Supabase Realtime (WebSockets)
- **API**: REST + RPC functions
- **Security**: Row-Level Security (RLS) + JWT

## 🎭 User Roles & Permissions

| Role | Access Level | Key Permissions |
|------|-------------|----------------|
| **HOSPITAL_USER** | Facility | • Submit performance & scheme data<br>• View own facility data<br>• Update own submissions<br>• Upload documents |
| **DISTRICT_ADMIN** | District | • Review/approve submissions<br>• View district analytics<br>• Add feedback/comments<br>• Access all district facilities |
| **STATE_ADMIN** | State | • View state-wide data<br>• Access analytics dashboards<br>• Export reports<br>• Cross-district comparisons |
| **SUPER_ADMIN** | National | • Full system access<br>• User management<br>• System configuration<br>• Audit logs access |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase CLI: `npm install -g supabase`
- PostgreSQL client (psql) - optional
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd hdims-backend
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

Required environment variables:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Link to Supabase Project

```bash
supabase login
supabase link --project-ref your-project-ref
```

### 4. Run Database Migrations

```bash
# Apply all migrations in sequence
supabase db push

# Or apply individually
psql $DATABASE_URL < supabase/migrations/001_initial_schema.sql
psql $DATABASE_URL < supabase/migrations/002_rls_policies.sql
psql $DATABASE_URL < supabase/migrations/003_rpc_functions.sql
psql $DATABASE_URL < supabase/migrations/004_storage_setup.sql
psql $DATABASE_URL < supabase/migrations/005_analytics_views.sql
```

### 5. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy submit-performance
supabase functions deploy submit-scheme
supabase functions deploy review-submission
supabase functions deploy analytics-district
supabase functions deploy analytics-state
supabase functions deploy upload-document

# Or deploy all at once
for func in supabase/functions/*/; do
  supabase functions deploy $(basename $func)
done
```

### 6. Seed Test Data (Optional)

```bash
psql $DATABASE_URL < supabase/seed.sql
```

### 7. Create First Super Admin

```sql
-- In Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@hdims.gov.in', crypt('SecurePassword123', gen_salt('bf')), NOW());

-- Get the user ID
SELECT id FROM auth.users WHERE email = 'admin@hdims.gov.in';

-- Add to users table (replace with actual user ID)
INSERT INTO users (id, full_name, email, role, is_active)
VALUES ('<user-id>', 'System Administrator', 'admin@hdims.gov.in', 'super_admin', true);
```

### 8. Verify Deployment

```bash
# Test RPC endpoint
curl -X POST 'https://your-project.supabase.co/rest/v1/rpc/get_superadmin_overview' \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json"

# Test Edge Function
curl -X POST 'https://your-project.supabase.co/functions/v1/submit-performance' \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"facility_id": "uuid", ...}'
```

## 📚 API Documentation

### Core RPC Functions

#### Submit Performance Data
```bash
POST /rest/v1/rpc/submit_performance_data
```

```json
{
  "p_facility_id": "uuid",
  "p_reporting_start": "2024-01-01",
  "p_reporting_end": "2024-01-31",
  "p_program_name": "OPD Services",
  "p_metrics": [
    {
      "metric_key": "total_patients",
      "metric_value": 2500,
      "target_value": 2000,
      "unit": "count"
    }
  ]
}
```

#### Review Submission
```bash
POST /rest/v1/rpc/review_submission
```

```json
{
  "p_entity_type": "performance_data",
  "p_entity_id": "uuid",
  "p_new_status": "approved",
  "p_comments": "Data verified and approved"
}
```

#### Get Dashboard Data
```bash
# Facility Dashboard
GET /rest/v1/rpc/get_facility_dashboard?p_facility_id={uuid}

# District Dashboard
GET /rest/v1/rpc/get_district_dashboard?p_district_id={uuid}

# State Dashboard
GET /rest/v1/rpc/get_state_dashboard?p_state_id={uuid}
```

### Edge Functions

#### Submit Performance Data
```bash
POST /functions/v1/submit-performance
```

#### Upload Document
```bash
POST /functions/v1/upload-document
Content-Type: multipart/form-data
```

### Direct Table Access

```bash
# Query with filters
GET /rest/v1/performance_data?facility_id=eq.uuid&status=eq.approved

# Update (if RLS permits)
PATCH /rest/v1/performance_data?id=eq.uuid
```

For complete API documentation, see [docs/API.md](docs/API.md).

## 🧪 Testing

### Run All Tests

```bash
# Database tests
psql $DATABASE_URL < tests/rls.test.sql
psql $DATABASE_URL < tests/rpc.test.sql

# Integration tests
npm test
```

### Test Categories

- **RLS Policy Tests**: Verify row-level security works correctly
- **RPC Function Tests**: Test all database functions
- **Integration Tests**: End-to-end API testing
- **Performance Tests**: Load testing for high-traffic endpoints

### Test Results

All tests should pass with:
- ✅ Authentication and authorization working
- ✅ Data isolation between organizational boundaries
- ✅ Business logic validation
- ✅ Error handling and edge cases

## 📊 Database Schema

### Core Tables

- **states**: State-level administrative divisions
- **districts**: District-level administrative divisions
- **facilities**: Healthcare facilities (PHC, CHC, DH, etc.)
- **users**: User profiles extending Supabase Auth
- **performance_data**: Health performance metrics
- **scheme_tracking**: Healthcare scheme implementation data
- **uploads**: Document management metadata
- **audit_logs**: Complete audit trail

### Key Features

- **Enums**: Standardized role, status, and facility types
- **Constraints**: Data validation and integrity
- **Indexes**: Optimized for common query patterns
- **Triggers**: Automatic timestamp updates
- **Materialized Views**: Pre-computed analytics

For detailed schema information, see [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md).

## 🔒 Security

### Authentication & Authorization

- **JWT-based Authentication**: Via Supabase Auth
- **Row-Level Security**: All tables protected with RLS policies
- **Role-based Access**: 4 distinct roles with specific permissions
- **Session Management**: Automatic token refresh and validation

### Data Protection

- **Zero Data Leakage**: Strict isolation between organizational boundaries
- **Audit Logging**: Complete trail of all data modifications
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries throughout

### Storage Security

- **Access Control**: Files restricted by facility ownership
- **Signed URLs**: Temporary, secure download links
- **File Type Validation**: Only allowed file types accepted
- **Size Limits**: Configurable file size restrictions

## 📈 Performance & Scalability

### Database Optimization

- **Strategic Indexes**: Optimized for common query patterns
- **Materialized Views**: Pre-computed analytics for fast reporting
- **Connection Pooling**: Via Supabase (PgBouncer)
- **Query Optimization**: EXPLAIN ANALYZE for slow queries

### Caching Strategy

- **Materialized Views**: Refreshed periodically for analytics
- **Edge Function Caching**: Response caching where appropriate
- **CDN Integration**: For static assets and file downloads

### Monitoring

- **Query Performance**: Monitor slow queries via Supabase Dashboard
- **Resource Usage**: Track database connections and storage
- **Error Tracking**: Comprehensive error logging and alerting

## 🔄 Deployment

### Automated Deployment

```bash
# Setup (run once)
./scripts/setup.sh

# Deploy to production
ENVIRONMENT=production ./scripts/deploy.sh

# Deploy to staging
ENVIRONMENT=staging ./scripts/deploy.sh
```

### Manual Deployment

1. **Database Migrations**: Apply SQL migrations in order
2. **Edge Functions**: Deploy all TypeScript functions
3. **Storage Setup**: Create buckets and policies
4. **Seed Data**: Load initial data (non-production)
5. **Health Checks**: Verify all components working

### Rollback

```bash
./scripts/deploy.sh --rollback
```

### Environment Management

- **Development**: Local development with hot reload
- **Staging**: Production-like environment for testing
- **Production**: Live environment with full monitoring

## 📁 Project Structure

```
hdims-backend/
├── supabase/
│   ├── migrations/           # Database schema migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_rpc_functions.sql
│   │   ├── 004_storage_setup.sql
│   │   └── 005_analytics_views.sql
│   ├── functions/            # Edge Functions
│   │   ├── submit-performance/
│   │   ├── submit-scheme/
│   │   ├── review-submission/
│   │   ├── analytics-district/
│   │   ├── analytics-state/
│   │   └── upload-document/
│   └── seed.sql              # Test data
├── docs/                     # Documentation
│   ├── API.md
│   ├── DATABASE_SCHEMA.md
│   ├── RLS_POLICIES.md
│   └── DEPLOYMENT.md
├── scripts/                  # Deployment and utility scripts
│   ├── setup.sh
│   └── deploy.sh
├── tests/                    # Test suites
│   ├── rls.test.sql
│   ├── rpc.test.sql
│   └── integration.test.ts
├── .env.example              # Environment template
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Application
NODE_ENV=production
LOG_LEVEL=info

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Supabase Configuration

- **Database**: PostgreSQL 15+ with required extensions
- **Auth**: Email/password authentication with JWT
- **Storage**: Private bucket for facility documents
- **Edge Functions**: Deno runtime with environment variables

## 🚨 Troubleshooting

### Common Issues

#### Authentication Failures
```bash
# Check user exists and is active
SELECT * FROM users WHERE email = 'user@example.com';

# Check auth user
SELECT * FROM auth.users WHERE email = 'user@example.com';
```

#### RLS Policy Violations
```bash
# Check user role and assignments
SELECT role, facility_id, district_id, state_id FROM users WHERE id = 'user-uuid';

# Test RLS policies
SET LOCAL request.jwt.claim.sub TO 'user-uuid';
SELECT * FROM performance_data LIMIT 1;
```

#### Edge Function Errors
```bash
# Check function logs in Supabase Dashboard
# Verify environment variables
# Test function locally with supabase functions serve
```

#### Performance Issues
```bash
# Check slow queries
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC;

# Refresh materialized views
SELECT refresh_district_kpi();
```

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug ./scripts/deploy.sh
```

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature-name`
3. **Make** changes with tests
4. **Test** locally: `npm test`
5. **Deploy** to staging: `ENVIRONMENT=staging ./scripts/deploy.sh`
6. **Submit** pull request

### Code Standards

- **SQL**: Follow PostgreSQL conventions, use transactions
- **TypeScript**: Use strict mode, add JSDoc comments
- **Tests**: Cover all critical paths, test error cases
- **Documentation**: Update API docs for changes

### Review Process

- **Security Review**: All changes to RLS policies
- **Performance Review**: Database schema changes
- **API Review**: Breaking changes to endpoints
- **Testing Review**: Coverage and test quality

## 📄 License

Government of India - Ministry of Health & Family Welfare

## 📞 Support

### Getting Help

- **Documentation**: [docs/](docs/) folder
- **API Reference**: [docs/API.md](docs/API.md)
- **Issues**: Create GitHub issue with detailed description
- **Security**: Report security issues privately

### Contact Information

- **Email**: support@hdims.gov.in
- **Documentation**: https://docs.hdims.gov.in
- **Status Page**: https://status.hdims.gov.in

### Community

- **Discussions**: GitHub Discussions
- **Updates**: Follow releases on GitHub
- **Contributors**: See CONTRIBUTING.md

---

## 🎯 Production Readiness Checklist

- [ ] **Database**: All migrations applied, indexes created
- [ ] **Security**: RLS policies tested, users created
- [ ] **Functions**: All Edge Functions deployed and tested
- [ ] **Storage**: Buckets created, policies configured
- [ ] **Monitoring**: Logging enabled, alerts configured
- [ ] **Backup**: Automated backups configured
- [ ] **Performance**: Queries optimized, caching enabled
- [ ] **Documentation**: API docs updated, README complete
- [ ] **Testing**: All test suites passing
- [ ] **Deployment**: Scripts tested, rollback procedure verified

---

**HDIMS Backend** - A comprehensive, secure, and scalable healthcare data management system built for the future of digital health governance.
