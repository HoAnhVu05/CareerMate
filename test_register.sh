#!/bin/bash
# Write JSON using python3 (avoids quote hell)
python3 -c "
import json
data = {
    'email': 'testuser001@gmail.com',
    'password': 'Test1234!',
    'fullName': 'Test User',
    'role': 'STUDENT'
}
with open('/tmp/reg.json', 'w') as f:
    json.dump(data, f)
print('JSON written to /tmp/reg.json')
"

echo "JSON content:"
cat /tmp/reg.json

echo ""
echo "--- Sending register request ---"
curl -s -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d @/tmp/reg.json

echo ""
echo "--- Last 20 user-service logs ---"
docker logs careermate-user-service 2>&1 | tail -20
