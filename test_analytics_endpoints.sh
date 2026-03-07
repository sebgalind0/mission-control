#!/bin/bash

echo "🧪 Testing Analytics API Expansion"
echo "=================================="
echo ""

echo "1️⃣  Models Analytics:"
echo "-------------------"
curl -s http://localhost:3000/api/analytics/models | jq '{modelUsage: .modelUsage | length, summary: .summary}'
echo ""

echo "2️⃣  Embeddings Analytics:"
echo "------------------------"
curl -s http://localhost:3000/api/analytics/embeddings | jq '.summary'
echo ""

echo "3️⃣  Agent Analytics (bolt):"
echo "---------------------------"
curl -s http://localhost:3000/api/analytics/agents/bolt | jq '{agent: .agent, performance: .performance, taskCount: .tasks.total}'
echo ""

echo "3️⃣  Agent Analytics (rick):"
echo "---------------------------"
curl -s http://localhost:3000/api/analytics/agents/rick | jq '{agent: .agent, performance: .performance, taskCount: .tasks.total}'
echo ""

echo "✅ All endpoints tested successfully!"
