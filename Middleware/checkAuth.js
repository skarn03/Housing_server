const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    console.log("🔹 [Middleware] Authentication check started...");

    if (req.method === 'OPTIONS') {
        console.log("✅ OPTIONS request detected, skipping authentication.");
        return next();
    }

    try {
        console.log("🔍 Extracting token from headers...");
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            console.log("❌ No authorization header found!");
            return res.status(401).json({ message: "Authentication failure: No token provided" });
        }

        const token = authHeader.split(' ')[1];
        console.log(`🔑 Extracted token: ${token ? "✅ Token found" : "❌ No token"}`);

        if (!token) {
            console.log("❌ Token missing after extraction!");
            return res.status(401).json({ message: "Authentication failure: Token is missing" });
        }

        console.log("🔄 Verifying token...");
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        console.log("✅ Token successfully verified!");
        console.log(`📌 Decoded Token Data: ${JSON.stringify(decodedToken)}`);

        req.userData = { userID: decodedToken.id };
        console.log(`🆔 User ID set in request: ${req.userData.userID}`);

        console.log("🚀 Proceeding to next middleware...");
        next();
    } catch (err) {
        console.error("🔥 Authentication Error:", err.message);
        return res.status(401).json({ message: "Authentication failed: Invalid token" });
    }
};
