#!/bin/bash

# --- Configuration ---
BACKEND_URL="http://localhost:5129"
REGISTER_ENDPOINT="/api/auth/register"
LOGIN_ENDPOINT="/api/auth/login"
BUSINESS_ENDPOINT="/api/business"

# --- Generate unique user credentials ---
TIMESTAMP=$(date +%s)
USER_EMAIL="testuser-${TIMESTAMP}@example.com"
USERNAME="TestUser${TIMESTAMP}"
PASSWORD="SecurePassword123!"
BUSINESS_NAME="My Test Business ${TIMESTAMP}"
ACCOUNTING_START_DATE="2025-04-06"

echo "--- Starting API Simulation Script ---"
echo "Generated Email: $USER_EMAIL"
echo "Generated Username: $USERNAME"

# --- 1. Register a new user ---
echo -e "\n--- Attempting to register user ($REGISTER_ENDPOINT) ---"
REGISTER_PAYLOAD=$(
  cat <<EOF
{
  "email": "$USER_EMAIL",
  "userName": "$USERNAME",
  "password": "$PASSWORD"
}
EOF
)
echo "Request Body: $REGISTER_PAYLOAD"

REGISTER_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$REGISTER_PAYLOAD" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  "${BACKEND_URL}${REGISTER_ENDPOINT}")

REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | sed '$ d') # Remove last line (status)
REGISTER_STATUS=$(echo "$REGISTER_RESPONSE" | tail -n 1 | cut -d':' -f2)

echo "Response Status: $REGISTER_STATUS"
echo "Response Body: $REGISTER_BODY"

# Check if registration was successful (expected 200/201, but backend might return empty body)
if [ "$REGISTER_STATUS" -ge 200 ] && [ "$REGISTER_STATUS" -lt 300 ]; then
  echo "User registration initiated. Backend returned status $REGISTER_STATUS."
  if [ -z "$REGISTER_BODY" ] || [ "$REGISTER_BODY" == "{}" ]; then
    echo "WARNING: Register endpoint returned an empty or nearly empty body. This likely prevents the frontend from getting a token."
  fi
else
  echo "ERROR: User registration failed with status $REGISTER_STATUS."
  echo "Aborting further steps."
  exit 1
fi

# --- 2. Log in the user to get a token ---
# This step is crucial because the Register endpoint is currently returning an empty body.
# We're simulating what the frontend AuthService *should* do after successful registration,
# which is often implicitly handled or followed by a login to get the token.
echo -e "\n--- Attempting to log in user ($LOGIN_ENDPOINT) ---"
LOGIN_PAYLOAD=$(
  cat <<EOF
{
  "email": "$USER_EMAIL",
  "password": "$PASSWORD"
}
EOF
)
echo "Request Body: $LOGIN_PAYLOAD"

LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$LOGIN_PAYLOAD" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  "${BACKEND_URL}${LOGIN_ENDPOINT}")

LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$ d')
LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | tail -n 1 | cut -d':' -f2)

echo "Response Status: $LOGIN_STATUS"
echo "Response Body: $LOGIN_BODY"

AUTH_TOKEN=""
if [ "$LOGIN_STATUS" -eq 200 ]; then
  AUTH_TOKEN=$(echo "$LOGIN_BODY" | jq -r '.token' 2>/dev/null)
  if [ -z "$AUTH_TOKEN" ] || [ "$AUTH_TOKEN" == "null" ]; then
    echo "WARNING: Login successful but no 'token' found in the response body."
  else
    echo "Authentication Token (first 10 chars): ${AUTH_TOKEN:0:10}..."
  fi
else
  echo "ERROR: Login failed with status $LOGIN_STATUS."
  echo "Aborting further steps as no token was obtained."
  exit 1
fi

# --- 3. Register a business ---
echo -e "\n--- Attempting to register business ($BUSINESS_ENDPOINT) ---"
if [ -z "$AUTH_TOKEN" ] || [ "$AUTH_TOKEN" == "null" ]; then
  echo "ERROR: No authentication token available. Cannot register business."
  exit 1
fi

BUSINESS_PAYLOAD=$(
  cat <<EOF
{
  "name": "$BUSINESS_NAME",
  "startDate": "$ACCOUNTING_START_DATE"
}
EOF
)
echo "Request Body: $BUSINESS_PAYLOAD"

BUSINESS_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "$BUSINESS_PAYLOAD" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  "${BACKEND_URL}${BUSINESS_ENDPOINT}")

BUSINESS_BODY=$(echo "$BUSINESS_RESPONSE" | sed '$ d')
BUSINESS_STATUS=$(echo "$BUSINESS_RESPONSE" | tail -n 1 | cut -d':' -f2)

echo "Response Status: $BUSINESS_STATUS"
echo "Response Body: $BUSINESS_BODY"

if [ "$BUSINESS_STATUS" -ge 200 ] && [ "$BUSINESS_STATUS" -lt 300 ]; then
  echo "Business registered successfully (status $BUSINESS_STATUS)."
else
  echo "ERROR: Business registration failed with status $BUSINESS_STATUS."
  echo "This might be due to a missing or invalid token if the login step above failed to provide one."
fi

echo -e "\n--- Script Finished ---"
