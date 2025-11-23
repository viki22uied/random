#!/bin/bash

# ============================================
# HDIMS Backend Setup Script
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    log_info "Checking requirements..."
    
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI is not installed. Please run: npm install -g supabase"
        exit 1
    fi
    
    if ! command -v psql &> /dev/null; then
        log_warning "psql is not installed. Some database operations may not work."
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    log_success "All requirements met"
}

# Check if user is logged into Supabase
check_supabase_auth() {
    log_info "Checking Supabase authentication..."
    
    if ! supabase projects list &> /dev/null; then
        log_error "Not logged into Supabase. Please run: supabase login"
        exit 1
    fi
    
    log_success "Supabase authentication verified"
}

# Initialize Supabase project
init_project() {
    log_info "Initializing Supabase project..."
    
    if [ ! -f "supabase/config.toml" ]; then
        supabase init
        log_success "Supabase project initialized"
    else
        log_info "Supabase project already initialized"
    fi
}

# Link to existing Supabase project
link_project() {
    if [ -z "$SUPABASE_PROJECT_REF" ]; then
        log_warning "SUPABASE_PROJECT_REF environment variable not set"
        read -p "Enter your Supabase project reference: " project_ref
        SUPABASE_PROJECT_REF=$project_ref
    fi
    
    log_info "Linking to Supabase project: $SUPABASE_PROJECT_REF"
    
    if supabase link --project-ref "$SUPABASE_PROJECT_REF"; then
        log_success "Successfully linked to Supabase project"
    else
        log_error "Failed to link to Supabase project"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Check if migrations folder exists
    if [ ! -d "supabase/migrations" ]; then
        log_error "Migrations folder not found"
        exit 1
    fi
    
    # Apply migrations in order
    for migration in supabase/migrations/*.sql; do
        if [ -f "$migration" ]; then
            log_info "Applying migration: $(basename "$migration")"
            if supabase db push; then
                log_success "Migration applied successfully"
            else
                log_error "Failed to apply migration: $(basename "$migration")"
                exit 1
            fi
        fi
    done
    
    log_success "All migrations applied successfully"
}

# Seed database with test data
seed_database() {
    log_info "Seeding database with test data..."
    
    if [ -f "supabase/seed.sql" ]; then
        # Get database URL from Supabase
        DB_URL=$(supabase status --output json | grep -o '"db_url":"[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$DB_URL" ]; then
            if psql "$DB_URL" < supabase/seed.sql; then
                log_success "Database seeded successfully"
            else
                log_warning "Failed to seed database. You may need to seed manually."
            fi
        else
            log_warning "Could not get database URL. Please seed manually."
        fi
    else
        log_info "No seed file found, skipping database seeding"
    fi
}

# Deploy Edge Functions
deploy_functions() {
    log_info "Deploying Edge Functions..."
    
    if [ ! -d "supabase/functions" ]; then
        log_warning "No functions folder found, skipping function deployment"
        return
    fi
    
    # Deploy each function
    for function_dir in supabase/functions/*/; do
        if [ -d "$function_dir" ]; then
            function_name=$(basename "$function_dir")
            log_info "Deploying function: $function_name"
            
            if supabase functions deploy "$function_name" --no-verify-jwt; then
                log_success "Function deployed: $function_name"
            else
                log_error "Failed to deploy function: $function_name"
                exit 1
            fi
        fi
    done
    
    log_success "All Edge Functions deployed successfully"
}

# Set up storage buckets
setup_storage() {
    log_info "Setting up storage buckets..."
    
    # Storage is set up via migration 004_storage_setup.sql
    # Just verify it exists
    if supabase storage list | grep -q "facility-documents"; then
        log_success "Storage bucket verified"
    else
        log_warning "Storage bucket not found. Please check migration 004_storage_setup.sql"
    fi
}

# Create environment file
create_env_file() {
    log_info "Creating environment file..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_success "Environment file created from .env.example"
            log_warning "Please update .env with your actual values"
        else
            log_warning "No .env.example file found"
        fi
    else
        log_info "Environment file already exists"
    fi
}

# Verify setup
verify_setup() {
    log_info "Verifying setup..."
    
    # Check if we can access the database
    if supabase db status &> /dev/null; then
        log_success "Database connection verified"
    else
        log_error "Database connection failed"
        exit 1
    fi
    
    # Check if functions are deployed
    if supabase functions list &> /dev/null; then
        log_success "Edge Functions verified"
    else
        log_warning "Edge Functions verification failed"
    fi
    
    # Check if storage is accessible
    if supabase storage list &> /dev/null; then
        log_success "Storage verified"
    else
        log_warning "Storage verification failed"
    fi
}

# Create first super admin user
create_admin_user() {
    log_info "Creating super admin user..."
    
    read -p "Enter admin email: " admin_email
    read -s -p "Enter admin password: " admin_password
    echo
    
    # Create user in Supabase Auth
    admin_user_id=$(curl -s -X POST "https://$SUPABASE_PROJECT_REF.supabase.co/auth/v1/admin/users" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$admin_email\",\"password\":\"$admin_password\",\"email_confirm\":true}" | \
        grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$admin_user_id" ]; then
        # Add to users table
        DB_URL=$(supabase status --output json | grep -o '"db_url":"[^"]*"' | cut -d'"' -f4)
        
        psql "$DB_URL" -c "
            INSERT INTO users (id, full_name, email, role, is_active) 
            VALUES ('$admin_user_id', 'System Administrator', '$admin_email', 'super_admin', true);
        "
        
        log_success "Super admin user created: $admin_email"
    else
        log_error "Failed to create admin user"
    fi
}

# Main setup flow
main() {
    echo "=========================================="
    echo "HDIMS Backend Setup Script"
    echo "=========================================="
    echo
    
    # Check requirements
    check_requirements
    
    # Check authentication
    check_supabase_auth
    
    # Initialize project
    init_project
    
    # Link project
    link_project
    
    # Run migrations
    run_migrations
    
    # Seed database
    seed_database
    
    # Deploy functions
    deploy_functions
    
    # Setup storage
    setup_storage
    
    # Create environment file
    create_env_file
    
    # Verify setup
    verify_setup
    
    echo
    echo "=========================================="
    log_success "Setup completed successfully!"
    echo "=========================================="
    echo
    log_info "Next steps:"
    echo "1. Update your .env file with actual values"
    echo "2. Create a super admin user by running: ./setup.sh --create-admin"
    echo "3. Test the API endpoints"
    echo "4. Configure your frontend application"
    echo
}

# Command line arguments
case "${1:-}" in
    --create-admin)
        check_requirements
        check_supabase_auth
        create_admin_user
        ;;
    --verify)
        verify_setup
        ;;
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo
        echo "Options:"
        echo "  --create-admin    Create a super admin user"
        echo "  --verify         Verify the setup"
        echo "  --help, -h       Show this help message"
        echo
        echo "Environment Variables:"
        echo "  SUPABASE_PROJECT_REF    Supabase project reference"
        echo "  SUPABASE_SERVICE_ROLE_KEY    Supabase service role key"
        ;;
    *)
        main
        ;;
esac
