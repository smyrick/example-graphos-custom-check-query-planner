#!/bin/bash
set -e;

cur_dir="$(dirname "$0")";

source .env;

# Use a tool with the text being the sample request and the secret the one
# used in starting the app to calculate the header value
# https://www.devglan.com/online-tools/hmac-sha256-online

# curl -X POST http://localhost:3000/api/webhook \
#     -H "x-apollo-signature: sha256=$HMAC_HEADER_VALUE" \
#     -H "Content-Type: application/json" \
#     --data @$cur_dir/example-event.json

# Comment out the HMAC validation and run with a real event to test locally

curl -X POST http://localhost:3000/api/webhook \
    -H "Content-Type: application/json" \
    --data @$cur_dir/real-event.json
