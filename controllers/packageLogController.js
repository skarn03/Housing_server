const PackageLog = require("../models/PackageLog");
const Package = require("../models/Package");
const Building = require("../models/Building");

const createPackageLog = async (req, res) => {
    try {
        console.log("📝 [START] Creating a new package log...");

        const { packageIds, buildingIds, packagePresence } = req.body;

        // ✅ Extract the authenticated user's ID from middleware
        const createdBy = req.userData?.userID;
        if (!createdBy) {
            console.log("⛔ [ERROR] Unauthorized: User ID is missing.");
            return res.status(403).json({ error: "Unauthorized: User ID is missing." });
        }
        console.log(`👤 [USER] Package log is being created by User ID: ${createdBy}`);

        // ✅ Validate required fields
        if (!packageIds || !Array.isArray(packageIds) || packageIds.length === 0) {
            console.log("⚠️ [WARNING] No package IDs provided.");
            return res.status(400).json({ error: "At least one package ID is required." });
        }
        console.log(`📦 [VALIDATION] Received ${packageIds.length} package IDs.`);

        // ✅ Validate packages
        console.log("🔎 [CHECK] Validating package IDs...");
        const validPackages = await Package.find({ _id: { $in: packageIds } });

        if (validPackages.length !== packageIds.length) {
            console.log("❌ [ERROR] One or more package IDs are invalid.");
            return res.status(404).json({ error: "One or more package IDs are invalid." });
        }
        console.log(`✅ [SUCCESS] All ${validPackages.length} packages are valid.`);

        // ✅ Validate buildings (optional)
        let validBuildings = [];
        if (buildingIds && Array.isArray(buildingIds) && buildingIds.length > 0) {
            console.log("🏢 [CHECK] Validating building IDs...");
            validBuildings = await Building.find({ _id: { $in: buildingIds } });

            if (validBuildings.length !== buildingIds.length) {
                console.log("❌ [ERROR] One or more building IDs are invalid.");
                return res.status(404).json({ error: "One or more building IDs are invalid." });
            }
            console.log(`✅ [SUCCESS] All ${validBuildings.length} buildings are valid.`);
        } else {
            console.log("⚠️ [INFO] No buildings were provided.");
        }

        // ✅ Construct the package log data
        console.log("🛠️ [BUILD] Constructing package log data...");
        const packageLogData = {
            packages: packageIds.map((id) => ({
                package: id,
                present: packagePresence?.[id] ?? true, // Defaults to true if not provided
            })),
            buildings: validBuildings.map((b) => b._id), // Store valid building IDs
            createdBy, // ✅ Using the authenticated user's ID
            createdTime: new Date(), // ✅ Timestamp when log is created
        };
        console.log("📦 [DATA] Package log structure ready:", packageLogData);

        // ✅ Create and save the new package log
        console.log("💾 [SAVE] Saving package log to database...");
        const newLog = new PackageLog(packageLogData);
        await newLog.save();

        console.log("✅ [SUCCESS] Package log created successfully:", newLog);
        res.status(201).json({ message: "✅ Package log created successfully!", log: newLog });

    } catch (error) {
        console.error("❌ [ERROR] Internal server error while creating package log:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getFilteredPackageLogs = async (req, res) => {
    try {
        console.log("🔍 Fetching filtered package logs...");
        const { staff, buildings, page = 1, limit = 20 } = req.query; // Default: page 1, limit 20
        let filter = {};

        if (buildings) {
            const buildingIds = buildings.split(",");
            filter["buildings"] = { $in: buildingIds };
        }

        let logsQuery = PackageLog.find(filter)
            .populate("createdBy") // ✅ Populate createdBy (Staff)
            .populate({
                path: "packages.package",
                populate: {
                    path: "recipient", // ✅ Populate recipient inside package
                    model: "Student",
                    select: "firstName lastName studentNumber picture", // Fetch only needed fields
                }
            })
            .populate("buildings")
            .sort({ createdAt: -1 }); // 🔥 Sort logs by newest first

        // ✅ Apply staff name filter AFTER populating `createdBy`
        let logs = await logsQuery.exec();
        if (staff) {
            logs = logs.filter(log =>
                log.createdBy &&
                (log.createdBy.firstName.toLowerCase().includes(staff.toLowerCase()) ||
                    log.createdBy.lastName.toLowerCase().includes(staff.toLowerCase()))
            );
        }

        // ✅ Pagination logic
        const totalLogs = logs.length;
        const totalPages = Math.ceil(totalLogs / limit);
        const paginatedLogs = logs.slice((page - 1) * limit, page * limit);

        console.log(`✅ Showing page ${page} of ${totalPages}, logs: ${paginatedLogs.length}`);
        res.status(200).json({
            logs: paginatedLogs,
            totalPages,
            currentPage: parseInt(page),
            totalLogs
        });

    } catch (error) {
        console.error("❌ Error fetching package logs:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};





module.exports = { createPackageLog, getFilteredPackageLogs };
