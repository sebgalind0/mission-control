#!/bin/bash

echo "=== Testing Command Center APIs ==="

echo -e "\n1. Testing Activity Stream API (POST - create event):"
curl -s -X POST http://localhost:3000/api/activity/stream \
  -H "Content-Type: application/json" \
  -d '{"agent":"Bolt","action":"api_created","metadata":{"endpoints":["activity","command","work"]}}' | jq

echo -e "\n2. Testing Activity Stream API (GET):"
curl -s http://localhost:3000/api/activity/stream | jq

echo -e "\n3. Testing Command Processing API:"
curl -s -X POST http://localhost:3000/api/command/execute \
  -H "Content-Type: application/json" \
  -d '{"command":"Deploy the backend API to production"}' | jq

echo -e "\n4. Testing Active Work API (POST - create work):"
curl -s -X POST http://localhost:3000/api/work/active \
  -H "Content-Type: application/json" \
  -d '{"agent":"Bolt","task":"Building Command Center API","status":"running","progress":100}' | jq

echo -e "\n5. Testing Active Work API (GET):"
curl -s http://localhost:3000/api/work/active | jq

echo -e "\n=== Tests Complete ==="
