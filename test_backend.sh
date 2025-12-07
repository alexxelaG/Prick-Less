#!/bin/bash

echo "🧪 Testing Prick-Less Backend Endpoints..."
echo "=========================================="

echo "1. Testing root endpoint..."
curl -s http://localhost:3001/ | jq '.'

echo -e "\n2. Testing /api/test endpoint..."
curl -s http://localhost:3001/api/test | jq '.'

echo -e "\n3. Testing glucose readings endpoint..."
curl -s http://localhost:3001/api/glucose/readings/1?limit=5 | jq '.'

echo -e "\n4. Testing latest reading endpoint..."
curl -s http://localhost:3001/api/glucose/latest/1 | jq '.'

echo -e "\n5. Testing user stats endpoint..."
curl -s http://localhost:3001/api/glucose/stats/1 | jq '.'

echo -e "\n✅ Backend testing complete!"