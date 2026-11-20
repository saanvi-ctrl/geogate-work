import { Router } from "express";
import {
  verifyCandidate,
  getAttempt,
  authorizeAttempt
} from "../controllers/candidateController.js";

const router = Router();

router.post("/verify", verifyCandidate);
router.get("/attempts/:attemptId", getAttempt);
router.post("/attempts/:attemptId/authorize", authorizeAttempt);

export default router;
