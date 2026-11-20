# GeoGate – Location-Based Candidate Verification & Fraud Detection

GeoGate is a full-stack web application that evaluates candidates before granting access to an online assessment. It combines GPS-based geofencing and IP intelligence to verify a candidate's location and detect potentially suspicious network activity.

The application allows employers to configure a test centre, define a permitted geographical radius, and select mandatory fraud checks. Candidates must pass the GPS verification and all selected checks to receive assessment authorization.
tection Results](docs/images/fraud-detection.png)

---

## 🎯 What Does GeoGate Evaluate?

GeoGate evaluates candidates using **GPS location verification and five IP-based fraud detection checks**.

### 1. GPS Location Verification

- Captures the candidate's current location using the browser Geolocation API.
- Compares the candidate's coordinates with the employer's configured test-centre coordinates.
- Calculates the geographical distance between the two locations.
- Checks whether the candidate is within the permitted radius.

**Result:** Passed if the candidate is within the configured radius; otherwise Failed.

### 2. Job Country Mismatch

- Identifies the candidate's country using IP intelligence.
- Compares it with the employer's test-centre/job country.
- Detects a mismatch between the expected country and the candidate's IP country.

**Result:** Passed if the countries match; Failed if they do not.

### 3. Suspicious IP Activity

- Checks the candidate's public IP against a predefined sample dataset of suspicious IP addresses.
- Detects an IP if it matches an entry in the dataset.

**Result:** Passed if the IP does not match the sample dataset; Failed if a match is found.

### 4. VPN Detection

- Uses IPLogs network intelligence to identify VPN indicators.
- Evaluates whether the candidate's connection is associated with VPN usage.

**Result:** Passed if VPN is not detected; Failed if VPN is detected.

### 5. Residential Proxy Detection

- Evaluates IPLogs proxy information.
- Checks for residential proxy indicators and proxy classification.
- Identifies connections classified as residential proxies.

**Result:** Passed if a residential proxy is not detected; Failed if it is detected.

### 6. Public Proxy Detection

- Evaluates IPLogs proxy information.
- Checks for public proxy, datacenter, and hosting-related indicators.

**Result:** Passed if a public proxy is not detected; Failed if it is detected.

---

## ✅ Verification Checks and Expected Results

| Verification Check | Passed Condition |
|---|---|
| GPS Location | Candidate is within the permitted radius |
| Job Country Mismatch | Candidate IP country matches the expected country |
| Suspicious IP Activity | IP does not match the sample dataset |
| VPN Detection | VPN is not detected |
| Residential Proxy Detection | Residential proxy is not detected |
| Public Proxy Detection | Public proxy is not detected |

**Important:** Employers can select which fraud checks are mandatory. Only the selected checks are included in the final verification decision.

## 🔄 How the Application Works

1. **Employer Login:** The employer logs in to the application.
2. **Test Centre Configuration:** The employer sets the test-centre name, address, GPS coordinates, and permitted radius.
3. **Fraud Check Selection:** The employer selects the checks candidates must pass.
4. **Save Configuration:** The configuration is stored in MongoDB.
5. **Candidate Login:** The candidate logs in using their name and candidate ID.
6. **GPS Verification:** The candidate's current location is captured and checked against the test centre.
7. **IP Verification:** Candidate IP information is retrieved and evaluated using IPLogs.
8. **Fraud Evaluation:** All employer-selected checks are evaluated.
9. **Final Decision:** The application determines whether the candidate is eligible for assessment access.

## 🏆 Final Verification Decision

**Verification PASSED**
- GPS location verification passes.
- Every selected fraud check passes.
- Candidate is authorized to take the assessment.

**Verification FAILED**
- GPS verification fails, OR
- One or more selected fraud checks fail.
- Candidate is not authorized to take the assessment.

---

## 🛠️ Technologies Used

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, CSS |
| Routing | React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| IP Intelligence | IPLogs API |
| Location | Browser Geolocation API |
| Reverse Geocoding | OpenStreetMap Nominatim |
| Icons | Lucide React |

## 📁 Project Structure

```text
geogate-work/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── style.css
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── ...
│   └── package.json
│
├── docs/
│   └── images/
│
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites
- Node.js and npm
- MongoDB Atlas account or local MongoDB
- IPLogs API access/configuration

### 1. Clone the repository

```bash
git clone https://github.com/saanvi-ctrl/geogate-work.git
cd geogate-work
```

### 2. Start the backend

```bash
cd server
npm install
npm run dev
```

Configure the required environment variables in `server/.env`, including your MongoDB connection string, port, frontend origin, and any API credentials required by your backend.

Backend URL: `http://localhost:3001`

### 3. Start the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

---

## 🗄️ Database

MongoDB stores:
- Employer test-centre configuration.
- GPS coordinates and permitted radius.
- Selected fraud verification checks.
- Candidate verification attempts.
- Individual check results.
- Final authorization status.

## 🔮 Future Enhancements

- Advanced IP reputation analysis.
- Employer analytics and reporting.
- Candidate verification history.
- Downloadable verification reports.
- Enhanced audit logging and security.

---

## 👩‍💻 Developed By

**Saanvi Sarraf**

**Project:** GeoGate – Location-Based Candidate Verification & Fraud Detection

[GitHub Repository](https://github.com/saanvi-ctrl/geogate-work)
