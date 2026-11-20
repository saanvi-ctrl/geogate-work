
import mongoose from "mongoose";

const verificationAttemptSchema = new mongoose.Schema(
  {
    candidateName: {
      type: String,
      required: true
    },
    candidateId: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    accuracy: {
      type: Number,
      default: null
    },
    ipAddress: {
      type: String,
      default: "unknown"
    },
    jobCountry: {
      type: String,
      default: ""
    },
    candidateCountry: {
      type: String,
      default: ""
    },
    vpnDetected: {
      type: Boolean,
      default: false
    },
    proxyDetected: {
      type: Boolean,
      default: false
    },
    proxyType: {
      type: String,
      default: ""
    },
    residentialProxyDetected: {
      type: Boolean,
      default: false
    },
    publicProxyDetected: {
      type: Boolean,
      default: false
    },
    suspiciousIpDetected: {
      type: Boolean,
      default: false
    },
    hostingDetected: {
      type: Boolean,
      default: false
    },
    torDetected: {
      type: Boolean,
      default: false
    },
    relayDetected: {
      type: Boolean,
      default: false
    },
    networkScore: {
      type: Number,
      default: null
    },
    networkVerdict: {
      type: String,
      default: "unknown"
    },
    networkReputation: {
      type: String,
      default: "unknown"
    },
    networkSignals: {
      type: Array,
      default: []
    },
    vpnProvider: {
      type: String,
      default: ""
    },
    networkCheckCompleted: {
      type: Boolean,
      default: false
    },
    networkCheckSource: {
      type: String,
      default: "none"
    },
    networkCheckMessage: {
      type: String,
      default: ""
    },
    locationSource: {
      type: String,
      default: "browser-gps"
    },
    locationCity: {
      type: String,
      default: ""
    },
    locationCountry: {
      type: String,
      default: ""
    },
    isp: {
      type: String,
      default: ""
    },
    distanceMetres: {
      type: Number,
      required: true
    },
    radiusMetres: {
      type: Number,
      required: true
    },
    locationPassed: {
      type: Boolean,
      default: false
    },
    checkFlags: {
      type: [Number],
      default: []
    },
    checkResults: {
      type: [
        {
          checkId: Number,
          name: String,
          passed: Boolean
        }
      ],
      default: []
    },
    passedChecks: {
      type: Number,
      default: 0
    },
    totalChecks: {
      type: Number,
      default: 0
    },
    allowed: {
      type: Boolean,
      required: true
    },
    authorized: {
      type: Boolean,
      default: false
    },
    centreName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "VerificationAttempt",
  verificationAttemptSchema
);
