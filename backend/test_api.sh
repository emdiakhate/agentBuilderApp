#!/bin/bash

# API Testing Script for Agent Builder Backend
# Make sure the backend is running before executing this script

BASE_URL="http://localhost:8000"
TOKEN=""

echo "=========================================="
echo "Agent Builder API Test Script"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -s $BASE_URL/health | jq
echo ""

# Test 2: Register User
echo "2. Registering a new user..."
SIGNUP_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
  }')
echo $SIGNUP_RESPONSE | jq
echo ""

# Test 3: Login
echo "3. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=testpass123")
echo $LOGIN_RESPONSE | jq

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo "Token: $TOKEN"
echo ""

# Test 4: Get Current User
echo "4. Getting current user info..."
curl -s -X GET $BASE_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# Test 5: Create Agent
echo "5. Creating an agent..."
AGENT_RESPONSE=$(curl -s -X POST $BASE_URL/api/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Customer Support Bot",
    "description": "Helps customers with their questions",
    "type": "Customer Service",
    "llm_provider": "openai",
    "model": "gpt-4o-mini",
    "status": "active"
  }')
echo $AGENT_RESPONSE | jq

AGENT_ID=$(echo $AGENT_RESPONSE | jq -r '.id')
echo "Agent ID: $AGENT_ID"
echo ""

# Test 6: List Agents
echo "6. Listing all agents..."
curl -s -X GET $BASE_URL/api/agents \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# Test 7: Get Specific Agent
echo "7. Getting specific agent..."
curl -s -X GET $BASE_URL/api/agents/$AGENT_ID \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# Test 8: Update Agent
echo "8. Updating agent..."
curl -s -X PATCH $BASE_URL/api/agents/$AGENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Updated description - Advanced customer support AI",
    "temperature": 0.8
  }' | jq
echo ""

# Test 9: Chat with Agent
echo "9. Sending a message to agent..."
curl -s -X POST $BASE_URL/api/chat/$AGENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Hello, can you help me?"
  }' | jq
echo ""

echo "=========================================="
echo "All tests completed!"
echo "=========================================="
