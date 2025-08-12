#!/bin/bash
echo "Starting database migration..."
echo "+" | npm run db:push
echo "Migration completed!"