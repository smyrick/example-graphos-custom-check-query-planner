curl -X POST http://localhost:3000/api/webhook \
    -H "x-apollo-signature: sha256=31802124e34f15288086db096fe82a1ddece6ace0dc968770fd507385e8e8ef4" \
    -H "Content-Type: application/json" \
    --data @example-event.json
