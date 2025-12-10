#!/bin/bash
# Direct PostgreSQL check

OUTPUT="logs/direct-check.txt"
mkdir -p logs

{
    echo "========================================"
    echo "Direct Database Check"
    echo "Date: $(date)"
    echo "========================================"
    echo ""
    
    # Test connection
    echo "Testing connection..."
    if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
        echo "✓ Connection successful"
    else
        echo "✗ Connection failed"
        echo "DATABASE_URL=$DATABASE_URL"
        exit 1
    fi
    
    echo ""
    echo "Tables in database:"
    psql "$DATABASE_URL" -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    
    echo ""
    echo "Checking critical tables..."
    for table in users sessions notifications direct_messages; do
        if psql "$DATABASE_URL" -t -c "SELECT 1 FROM information_schema.tables WHERE table_name = '$table'" 2>/dev/null | grep -q 1; then
            echo "  ✓ $table"
        else
            echo "  ✗ $table MISSING"
        fi
    done
    
    echo ""
    echo "Direct Messages table structure (if exists):"
    psql "$DATABASE_URL" -c "\d direct_messages" 2>/dev/null || echo "  (table not found)"
    
    echo ""
    echo "========================================"
    echo "Check complete at $(date)"
    echo "========================================"
    
} | tee "$OUTPUT"

echo ""
echo "Output saved to: $OUTPUT"
