
import mongoose from "mongoose";

const geofenceSchema = new mongoose.Schema(
  {
    centreName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    radiusMetres: {
      type: Number,
      required: true,
      min: 1
    },
    jobCountry: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
      maxlength: 2
    },
    checkFlags: {
      type: [Number],
      default: [1, 2, 3, 4, 5]
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Geofence", geofenceSchema);
