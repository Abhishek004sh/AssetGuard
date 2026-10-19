const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const workspaceContext = require("../middleware/workspace.middleware");
const { askAboutAssets } = require("../controllers/ai.controller");


// Simple per-user limit so one person can't burn through the free Gemini
// quota. Kept in memory, which is fine for a single server instance.
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const recentRequests = new Map();

const aiRateLimit = (req, res, next) => {

    const now = Date.now();
    const key = req.user._id.toString();

    const timestamps =
        (recentRequests.get(key) || [])
            .filter(time => now - time < WINDOW_MS);

    if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {

        return res.status(429).json({
            message: "Too many questions. Please wait a minute and try again."
        });

    }

    timestamps.push(now);
    recentRequests.set(key, timestamps);

    next();

};


// Anyone in the workspace (including VIEWER) can ask - it only reads data.
router.post(
"/ask",
protect,
workspaceContext,
aiRateLimit,
askAboutAssets
);


module.exports = router;
