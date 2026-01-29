#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "🎬 MOVIE APP - API INTEGRATION TESTS"
echo "========================================="
echo ""

# Test 1: Cloudflare Stream API
echo -e "${YELLOW}1. Testing Cloudflare Stream API${NC}"
echo "   Endpoint: https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/stream?limit=1"
CLOUDFLARE_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/40c0413b311ad2186f643011bee07ea5/stream?limit=1" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}")

if echo "$CLOUDFLARE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Cloudflare Stream API: Connected${NC}"
  echo "   Videos found: $(echo "$CLOUDFLARE_RESPONSE" | jq '.result | length')"
else
  echo -e "${RED}❌ Cloudflare Stream API: Failed${NC}"
  echo "   Response: $(echo "$CLOUDFLARE_RESPONSE" | jq '.errors[0].message' 2>/dev/null || echo "$CLOUDFLARE_RESPONSE" | jq '.')"
fi
echo ""

# Test 2: OMDb API
echo -e "${YELLOW}2. Testing OMDb API${NC}"
echo "   Endpoint: https://www.omdbapi.com/?s=inception&apikey={KEY}"
OMDB_RESPONSE=$(curl -s "https://www.omdbapi.com/?s=inception&apikey=8ed84ac0")

if echo "$OMDB_RESPONSE" | jq -e '.Search' > /dev/null 2>&1; then
  OMDB_RESULTS=$(echo "$OMDB_RESPONSE" | jq '.Search | length')
  echo -e "${GREEN}✅ OMDb API: Connected${NC}"
  echo "   Search results for 'inception': $OMDB_RESULTS movies found"
else
  echo -e "${RED}❌ OMDb API: Failed${NC}"
  echo "   Response: $(echo "$OMDB_RESPONSE" | jq '.Error')"
fi
echo ""

# Test 3: OMDb Details Fetch
echo -e "${YELLOW}3. Testing OMDb Movie Details${NC}"
echo "   Fetching: Inception (tt3896198)"
OMDB_DETAILS=$(curl -s "https://www.omdbapi.com/?i=tt3896198&apikey=8ed84ac0")

if echo "$OMDB_DETAILS" | jq -e '.Title' > /dev/null 2>&1; then
  TITLE=$(echo "$OMDB_DETAILS" | jq -r '.Title')
  RATING=$(echo "$OMDB_DETAILS" | jq -r '.imdbRating')
  DIRECTOR=$(echo "$OMDB_DETAILS" | jq -r '.Director')
  echo -e "${GREEN}✅ OMDb Details: Connected${NC}"
  echo "   Title: $TITLE"
  echo "   Rating: $RATING/10"
  echo "   Director: $DIRECTOR"
else
  echo -e "${RED}❌ OMDb Details: Failed${NC}"
fi
echo ""

# Test 4: Backend Health (no auth needed)
echo -e "${YELLOW}4. Testing Backend Connectivity${NC}"
echo "   Endpoint: https://movie-app-backend-ecru.vercel.app/api/health (if exists)"
BACKEND_RESPONSE=$(curl -s -w "\n%{http_code}" https://movie-app-backend-ecru.vercel.app/api/health)
HTTP_CODE=$(echo "$BACKEND_RESPONSE" | tail -n1)
if [[ "$HTTP_CODE" == "200" ]]; then
  echo -e "${GREEN}✅ Backend: Online (HTTP $HTTP_CODE)${NC}"
else
  echo -e "${YELLOW}⚠️  Backend health endpoint not available (HTTP $HTTP_CODE)${NC}"
  echo "   (This is normal if /health endpoint doesn't exist)"
fi
echo ""

# Test 5: Cloudflare Upload URL Generation
echo -e "${YELLOW}5. Testing Cloudflare Upload URL Generation${NC}"
echo "   This requires admin authentication"
echo -e "${YELLOW}   ⚠️  Skipping (requires valid JWT token)${NC}"
echo ""

echo "========================================="
echo "✅ API Check Summary:"
echo "========================================="
echo "- Cloudflare Stream: $(echo "$CLOUDFLARE_RESPONSE" | jq -e '.success' > /dev/null && echo '✅ OK' || echo '❌ FAILED')"
echo "- OMDb Search: $(echo "$OMDB_RESPONSE" | jq -e '.Search' > /dev/null && echo '✅ OK' || echo '❌ FAILED')"
echo "- OMDb Details: $(echo "$OMDB_DETAILS" | jq -e '.Title' > /dev/null && echo '✅ OK' || echo '❌ FAILED')"
echo ""
echo "Next Steps:"
echo "1. ✅ Add OMDB_API_KEY=8ed84ac0 to Vercel environment"
echo "2. ✅ Verify CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in Vercel"
echo "3. 🎬 Test IMDB search in admin panel"
echo "========================================="
