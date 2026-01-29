#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Testing Login Endpoint ===${NC}\n"

# Test 1: Invalid email format
echo -e "${YELLOW}Test 1: Invalid email format${NC}"
curl -X POST https://movie-app-backend-ecru.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": "Test@12345"}' \
  -s | jq . || echo "Failed to parse response"
echo ""

# Test 2: Missing password
echo -e "${YELLOW}Test 2: Missing password${NC}"
curl -X POST https://movie-app-backend-ecru.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}' \
  -s | jq . || echo "Failed to parse response"
echo ""

# Test 3: User doesn't exist
echo -e "${YELLOW}Test 3: User doesn't exist${NC}"
curl -X POST https://movie-app-backend-ecru.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@example.com", "password": "Test@12345"}' \
  -s | jq . || echo "Failed to parse response"
echo ""

# Test 4: Register a new user first
echo -e "${YELLOW}Test 4: Register a new user${NC}"
REGISTER_RESPONSE=$(curl -X POST https://movie-app-backend-ecru.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testlogin@example.com",
    "password": "Test@12345",
    "profileName": "Test Profile"
  }' \
  -s)
echo "$REGISTER_RESPONSE" | jq .
echo ""

# Test 5: Login with correct credentials
echo -e "${YELLOW}Test 5: Login with correct credentials${NC}"
LOGIN_RESPONSE=$(curl -X POST https://movie-app-backend-ecru.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testlogin@example.com", "password": "Test@12345"}' \
  -s)
echo "$LOGIN_RESPONSE" | jq .
echo ""

# Test 6: Login with wrong password
echo -e "${YELLOW}Test 6: Login with wrong password${NC}"
curl -X POST https://movie-app-backend-ecru.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testlogin@example.com", "password": "WrongPassword@123"}' \
  -s | jq . || echo "Failed to parse response"
echo ""

echo -e "${GREEN}=== Tests Complete ===${NC}"
