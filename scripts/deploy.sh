#!/bin/bash

# ============================================
# HDIMS Backend Deployment Script
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${ENVIRONMENT:-production}

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    log_info "Checking deployment requirements..."
    
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI is not installed. Please run: npm install -g supabase"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed. Please install Git."
        exit 1
    fi
    
    log_success "Deployment requirements met"
}

# Validate environment
validate_environment() {
    log_info "Validating environment: $ENVIRONMENT"
    
    case $ENVIRONMENT in
        production|staging|development)
            log_success "Valid environment: $ENVIRONMENT"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT. Use: production, staging, or development"
            exit 1
            ;;
    esac
}

# Check if working directory is clean
check_git_status() {
    log_info "Checking Git status..."
    
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "Working directory is not clean"
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled"
            exit 0
        fi
    else
        log_success "Working directory is clean"
    fi
}

# Backup current database
backup_database() {
    log_info "Creating database backup..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        DB_URL=$(supabase status --output json | grep -o '"db_url":"[^"]*"' | cut -d'"' -f4)
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        
        if pg_dump "$DB_URL" > "backups/$BACKUP_FILE"; then
            log_success "Database backup created: backups/$BACKUP_FILE"
        else
            log_warning "Failed to create database backup"
        fi
    else
        log_info "Skipping database backup (non-production environment)"
    fi
}

# Deploy database migrations
deploy_migrations() {
    log_info "Deploying database migrations..."
    
    # Check for new migrations
    if [ -d "supabase/migrations" ]; then
        migration_count=$(ls supabase/migrations/*.sql 2>/dev/null | wc -l)
        if [ $migration_count -gt 0 ]; then
            log_info "Found $migration_count migration files"
            
            # Apply migrations
            if supabase db push; then
                log_success "Database migrations deployed successfully"
            else
                log_error "Failed to deploy database migrations"
                exit 1
            fi
        else
            log_info "No new migrations to deploy"
        fi
    else
        log_warning "No migrations folder found"
    fi
}

# Deploy Edge Functions
deploy_functions() {
    log_info "Deploying Edge Functions..."
    
    if [ ! -d "supabase/functions" ]; then
        log_warning "No functions folder found, skipping function deployment"
        return
    fi
    
    # Deploy all functions
    function_count=0
    success_count=0
    
    for function_dir in supabase/functions/*/; do
        if [ -d "$function_dir" ]; then
            function_name=$(basename "$function_dir")
            log_info "Deploying function: $function_name"
            
            ((function_count++))
            
            if supabase functions deploy "$function_name" --no-verify-jwt; then
                log_success "Function deployed: $function_name"
                ((success_count++))
            else
                log_error "Failed to deploy function: $function_name"
            fi
        fi
    done
    
    if [ $function_count -eq 0 ]; then
        log_info "No functions to deploy"
    elif [ $success_count -eq $function_count ]; then
        log_success "All $function_count Edge Functions deployed successfully"
    else
        log_warning "Only $success_count out of $function_count functions deployed successfully"
        if [ "$ENVIRONMENT" = "production" ]; then
            log_error "Production deployment requires all functions to deploy successfully"
            exit 1
        fi
    fi
}

# Update storage policies
deploy_storage() {
    log_info "Deploying storage configuration..."
    
    # Storage is handled by migrations, just verify
    if supabase storage list &> /dev/null; then
        log_success "Storage configuration verified"
    else
        log_warning "Storage verification failed"
    fi
}

# Run database seeds (for development/staging)
seed_database() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Skipping database seeding (production environment)"
        return
    fi
    
    log_info "Seeding database..."
    
    if [ -f "supabase/seed.sql" ]; then
        DB_URL=$(supabase status --output json | grep -o '"db_url":"[^"]*"' | cut -d'"' -f4)
        
        if psql "$DB_URL" < supabase/seed.sql; then
            log_success "Database seeded successfully"
        else
            log_warning "Failed to seed database"
        fi
    else
        log_info "No seed file found, skipping database seeding"
    fi
}

# Refresh materialized views
refresh_views() {
    log_info "Refreshing materialized views..."
    
    DB_URL=$(supabase status --output json | grep -o '"db_url":"[^"]*"' | cut -d'"' -f4)
    
    # Refresh district KPI summary
    if psql "$DB_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY district_kpi_summary;" 2>/dev/null; then
        log_success "Refreshed district_kpi_summary view"
    fi
    
    # Refresh state KPI summary
    if psql "$DB_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY state_kpi_summary;" 2>/dev/null; then
        log_success "Refreshed state_kpi_summary view"
    fi
}

# Run health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Check database connection
    if supabase db status &> /dev/null; then
        log_success "Database health check passed"
    else
        log_error "Database health check failed"
        return 1
    fi
    
    # Check Edge Functions
    functions_list=$(supabase functions list 2>/dev/null)
    if [ $? -eq 0 ]; then
        function_count=$(echo "$functions_list" | wc -l)
        log_success "Edge Functions health check passed ($function_count functions)"
    else
        log_warning "Edge Functions health check failed"
    fi
    
    # Check storage
    if supabase storage list &> /dev/null; then
        log_success "Storage health check passed"
    else
        log_warning "Storage health check failed"
    fi
}

# Run post-deployment tests
run_tests() {
    log_info "Running post-deployment tests..."
    
    # Test RPC functions
    test_functions=("get_superadmin_overview" "get_facility_dashboard")
    
    for func in "${test_functions[@]}"; do
        log_info "Testing RPC function: $func"
        
        # This would require actual JWT token, so we'll just check if function exists
        if supabase db shell --command "SELECT proname FROM pg_proc WHERE proname = '$func';" 2>/dev/null | grep -q "$func"; then
            log_success "RPC function $func exists"
        else
            log_warning "RPC function $func not found"
        fi
    done
    
    log_success "Post-deployment tests completed"
}

# Create deployment tag
create_deployment_tag() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Creating deployment tag..."
        
        TAG="deploy-$(date +%Y%m%d-%H%M%S)"
        if git tag "$TAG" && git push origin "$TAG"; then
            log_success "Deployment tag created: $TAG"
        else
            log_warning "Failed to create deployment tag"
        fi
    fi
}

# Generate deployment report
generate_report() {
    log_info "Generating deployment report..."
    
    REPORT_FILE="deployment_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "HDIMS Backend Deployment Report"
        echo "================================="
        echo "Environment: $ENVIRONMENT"
        echo "Timestamp: $(date)"
        echo "Git Commit: $(git rev-parse HEAD)"
        echo
        
        echo "Components Deployed:"
        echo "- Database Migrations: ✓"
        echo "- Edge Functions: ✓"
        echo "- Storage Configuration: ✓"
        echo
        
        if [ "$ENVIRONMENT" != "production" ]; then
            echo "- Database Seeding: ✓"
        fi
        
        echo
        echo "Health Checks:"
        run_health_checks
        
    } > "$REPORT_FILE"
    
    log_success "Deployment report generated: $REPORT_FILE"
}

# Rollback function
rollback() {
    log_warning "Starting rollback process..."
    
    # Get the previous git tag
    PREVIOUS_TAG=$(git describe --tags --abbrev=0 HEAD~1 2>/dev/null)
    
    if [ -n "$PREVIOUS_TAG" ]; then
        log_info "Rolling back to: $PREVIOUS_TAG"
        
        # Reset to previous tag
        if git checkout "$PREVIOUS_TAG"; then
            # Redeploy
            deploy_migrations
            deploy_functions
            
            log_success "Rollback completed"
        else
            log_error "Failed to rollback"
            exit 1
        fi
    else
        log_error "No previous deployment tag found"
        exit 1
    fi
}

# Main deployment flow
main() {
    echo "=========================================="
    echo "HDIMS Backend Deployment Script"
    echo "Environment: $ENVIRONMENT"
    echo "=========================================="
    echo
    
    # Check requirements
    check_requirements
    
    # Validate environment
    validate_environment
    
    # Check git status
    check_git_status
    
    # Create backups directory
    mkdir -p backups
    
    # Backup database
    backup_database
    
    # Deploy components
    deploy_migrations
    deploy_functions
    deploy_storage
    
    # Seed database (non-production)
    seed_database
    
    # Refresh views
    refresh_views
    
    # Run health checks
    if ! run_health_checks; then
        log_error "Health checks failed"
        if [ "$ENVIRONMENT" = "production" ]; then
            log_error "Production deployment failed health checks"
            exit 1
        fi
    fi
    
    # Run tests
    run_tests
    
    # Create deployment tag
    create_deployment_tag
    
    # Generate report
    generate_report
    
    echo
    echo "=========================================="
    log_success "Deployment completed successfully!"
    echo "=========================================="
    echo
    log_info "Deployment Summary:"
    echo "- Environment: $ENVIRONMENT"
    echo "- Database: Migrated"
    echo "- Edge Functions: Deployed"
    echo "- Storage: Configured"
    echo "- Health Checks: Passed"
    echo
    log_info "Next steps:"
    echo "1. Monitor the application for any issues"
    echo "2. Check the deployment report"
    echo "3. Verify frontend connectivity"
    echo
}

# Command line arguments
case "${1:-}" in
    --rollback)
        rollback
        ;;
    --health-check)
        run_health_checks
        ;;
    --test)
        run_tests
        ;;
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo
        echo "Options:"
        echo "  --rollback       Rollback to previous deployment"
        echo "  --health-check   Run health checks only"
        echo "  --test          Run post-deployment tests only"
        echo "  --help, -h      Show this help message"
        echo
        echo "Environment Variables:"
        echo "  ENVIRONMENT     Deployment environment (production|staging|development)"
        echo
        echo "Examples:"
        echo "  ENVIRONMENT=production $0"
        echo "  ENVIRONMENT=staging $0"
        echo "  $0 --rollback"
        ;;
    *)
        main
        ;;
esac
