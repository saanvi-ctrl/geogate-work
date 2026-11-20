# GeoGate – Location-Based Assessment Access System

## Overview

GeoGate is a full-stack web application designed to verify employee and candidate access to online assessments using GPS-based geofencing and network fraud detection.

Employers can configure a test centre by providing its location and permitted radius. Candidates can verify their current location before accessing an assessment.

The system checks the candidate's geographical distance and selected network security indicators before granting or denying access.

## Features

### Employer Module
- Configure test centre name and address.
- Capture current GPS coordinates using browser geolocation.
- Set the permitted geofencing radius in kilometres.
- Select fraud verification checks.
- Save test centre configuration in MongoDB.

### Candidate Module
- Candidate login and verification.
- Browser-based location permission.
- Real-time GPS location verification.
- Network and fraud indicator checks.
- Verification result showing whether the candidate is within the permitted range.

### Fraud Detection Checks

GeoGate supports five verification checks:

1. **Job Country Mismatch** – Compares the employer's test centre country with the candidate's IP location country.
2. **Suspicious IP Activity** – Checks the candidate's IP against a demonstration dataset of 12 reserved TEST-NET IP addresses.
3. **VPN Detection** – Checks VPN indicators using the IPLogs API.
4. **Residential Proxy Detection** – Checks residential proxy indicators using IPLogs.
5. **Public Proxy Detection** – Checks public proxy indicators using IPLogs.

Employers can select which checks should be applied during candidate verification.

**Note:** The suspicious IP dataset is for demonstration purposes and is not a production threat-intelligence database.

## Technology Stack

**Frontend**
- React.js
- Vite
- JavaScript
- CSS
- React Router
- Lucide React

**Backend**
- Node.js
- Express.js
- REST APIs

**Database**
- MongoDB Atlas
- Mongoose

**External Services**
- IPLogs API for network verification
- Browser Geolocation API for GPS coordinates

## Project Structure

```text
GeoGate/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── style.css
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   └── package.json
│
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd GeoGate
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Configure Backend Environment Variables

Create a `.env` file inside the `server` folder.

Configure the following values using your own credentials and the environment variable names expected by the backend:

```env
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
IPLOGS_API_KEY=your_iplogs_api_key
```

Do not upload your `.env` file or expose API keys and database credentials on GitHub.

### 4. Start the Backend

From the `server` folder:

```bash
npm run dev
```

### 5. Install Frontend Dependencies

Open another terminal:

```bash
cd GeoGate/client
npm install
```

### 6. Start the Frontend

```bash
npm run dev
```

Open the frontend URL displayed in the terminal. Usually:

```text
http://localhost:5173
```

## Application Workflow

1. The employer logs in and configures the test centre.
2. The application saves the centre coordinates and permitted radius in MongoDB.
3. The candidate logs in and opens the verification page.
4. The candidate grants browser location permission.
5. The frontend obtains the candidate's GPS coordinates and network information.
6. The backend calculates the distance between the candidate and the configured test centre.
7. The selected fraud checks are evaluated.
8. The application displays the verification result.
9. Assessment access is authorized only when the required verification checks pass.

## Verification Logic

A candidate is allowed to proceed only when:

- The candidate is within the permitted geographical radius.
- All fraud checks selected by the employer pass.

If any required check fails, access is denied.

## Important Notes

- MongoDB Atlas must be configured and accessible.
- The IPLogs API key must be valid for network verification.
- Location verification requires browser location permission.
- Geolocation works on localhost and secure HTTPS origins.
- Never commit `.env` files, API keys, or database credentials.

## Future Improvements

- Integration with an assessment platform.
- Enhanced IP reputation and threat intelligence.
- Detailed verification history and reporting.
- Improved administrator dashboard.
- Production deployment and authentication enhancements.

---

**GeoGate – Secure Assessment Access Through Location and Network Verification.**
