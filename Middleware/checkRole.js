const Staff = require("../models/Staff");

const checkRole = (requiredRole) => {
    return async (req, res, next) => {
        console.log("🔹 [Middleware] Checking user role...");
        console.log(req.userData);
        const userID = req.userData.userID;
        console.log(`🆔 Extracted user ID: ${userID}`);

        try {
            console.log("🔍 Finding staff member in database...");
            const staff = await Staff.findById(userID).populate("university");

            if (!staff) {
                console.log("❌ Staff member not found!");
                return res.status(404).json({ message: "Staff member not found" });
            }
            console.log(`✅ Staff found: ${staff.name} (Role: ${staff.role})`);

            // Define role hierarchy
            const roleHierarchy = {
                "SuperAdmin": 4,
                "CD": 3,
                "GHD": 2,
                "RA": 1
            };

            console.log("🔍 Validating staff role...");
            if (!roleHierarchy[staff.role]) {
                console.log("❌ Invalid role detected!");
                return res.status(403).json({ message: "Invalid role detected" });
            }

            // Save the role and university to `req`
            req.userRole = staff.role;
            req.userUniversity = staff.university;
            console.log(`✅ Role & University stored in req: Role (${req.userRole}), University (${req.userUniversity?.name})`);

            // Check if the user has the required role or higher
            console.log(`🔄 Checking role permissions: Required (${requiredRole}) vs User (${staff.role})`);
            if (roleHierarchy[staff.role] >= roleHierarchy[requiredRole]) {
                console.log("✅ Access granted! Proceeding...");
                return next(); // Allow access
            } else {
                console.log("❌ Access denied: Insufficient permissions!");
                return res.status(403).json({ message: "Access denied: Insufficient permissions" });
            }
        } catch (error) {
            console.error("🔥 Error checking role:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
};

module.exports = checkRole;
