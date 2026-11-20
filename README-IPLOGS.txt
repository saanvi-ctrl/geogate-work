GEOGATE - IPLOGS VPN CHECKER UPDATE

This project version replaces the old IP-API/IPQualityScore network lookup with IPLogs.
IPLogs endpoint: POST https://iplogs.com/v1/check
No API key or signup is required according to IPLogs documentation.

SETUP
1. Extract this ZIP into a new folder. Keep your existing project folder as a backup.
2. Copy server/.env.example to server/.env.
3. Put your own MongoDB Atlas connection string in server/.env. Do not share the password.
4. In one terminal:
   cd server
   npm install
   npm run dev
5. In another terminal:
   cd client
   npm install
   npm run dev
6. Open http://localhost:5173

IMPORTANT NETWORK NOTE
For local development, the Candidate page obtains the browser's public IP from api.ipify.org and sends it to the backend, because a local Express request otherwise appears to come from 127.0.0.1/::1. The backend then calls IPLogs. In production, use the public client IP observed by your trusted reverse proxy and do not trust a client-supplied publicIp field.

LOCATION NOTE
GPS coordinates are obtained by the browser and sent to the backend. The backend calculates the distance from the employer's saved test-centre coordinates. IP-based city/country is informational only and is not used as the candidate's precise location.

DECISION
A candidate passes only if GPS is within the permitted radius, the IPLogs check completed, and IPLogs did not flag VPN, proxy, or Tor. Hosting alone and privacy relay alone are recorded but are not automatically blocked by this policy.

IPLogs can return suspicious results or fail/timeout. The application fails closed when the network check cannot complete. VPN detection is a risk signal, not a guarantee; IP reputation providers can misclassify addresses and results can be cached.
