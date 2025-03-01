const Package = require("../models/Package");
const Student = require("../models/Student");
const Building = require("../models/Building");

// ✅ Add a new package
const addPackage = async (req, res) => {
    try {
        console.log("📦 Starting package addition process...");

        const {
            trackingNumber, recipient, parcelType, shippingType,
            receiptDate, receiptTime, comments, building // Now building is an ID, not name
        } = req.body;

        // ✅ Get Logged-in Staff ID from Request
        const staff = req.userData.userID;
        if (!staff) {
            console.log("⛔ Unauthorized: Staff not identified.");
            return res.status(401).json({ error: "Unauthorized: Staff not identified." });
        }
        console.log(`🆔 Staff Identified: ${staff}`);

        // ✅ Validate required fields
        if (!recipient || !parcelType || !shippingType || !building) {
            console.log("⚠️ Missing required fields:", { recipient, parcelType, shippingType, building });
            return res.status(400).json({ error: "Missing required fields." });
        }
        console.log("✅ All required fields are provided.");

        // ✅ Validate `parcelType`
        const validParcelTypes = [
            "Box/Bag - Large and Up", "Box/Bag - Medium", "Box/Bag - Small", "Care Package",
            "Conduct Letter", "Envelope-Financial Doc/Cards", "Envelope-IRS Document", "Envelope-Large",
            "Other-add type to comments", "Perishable-Flowers", "Perishable-Food", "Perishable-Other"
        ];
        if (!validParcelTypes.includes(parcelType)) {
            console.log(`❌ Invalid parcel type: ${parcelType}`);
            return res.status(400).json({ error: "Invalid parcel type." });
        }
        console.log(`📦 Parcel Type Validated: ${parcelType}`);

        // ✅ Validate `shippingType`
        const validShippingTypes = ["DHL", "FedEx", "Metro Delivery", "Other", "UPS", "USPS"];
        if (!validShippingTypes.includes(shippingType)) {
            console.log(`❌ Invalid shipping type: ${shippingType}`);
            return res.status(400).json({ error: "Invalid shipping type." });
        }
        console.log(`🚚 Shipping Type Validated: ${shippingType}`);

        // ✅ Ensure `recipient` (Student) Exists
        console.log(`🔍 Searching for recipient student (ID: ${recipient})...`);
        const student = await Student.findById(recipient);
        if (!student) {
            console.log("❌ Recipient student not found.");
            return res.status(404).json({ error: "Recipient student not found." });
        }
        console.log(`🎓 Recipient Student Found: ${student.firstName} ${student.lastName} (ID: ${student._id})`);

        // ✅ Ensure `building` Exists (Find by **ID** instead of Name)
        console.log(`🏢 Searching for building (ID: ${building})...`);
        const buildingExists = await Building.findById(building); // Now using building ID directly
        if (!buildingExists) {
            console.log("❌ Building not found.");
            return res.status(404).json({ error: "Building not found." });
        }
        console.log(`🏗️ Building Located: ${buildingExists.name} (ID: ${buildingExists._id})`);

        // ✅ Create & Save Package
        console.log("📦 Creating new package entry...");
        const newPackage = new Package({
            trackingNumber,
            recipient,
            parcelType,
            shippingType,
            receiptDate: receiptDate || new Date(),
            receiptTime: receiptTime || new Date().toLocaleTimeString(),
            status: "Logged In", // 👈 Always set to "Logged In"
            comments,
            building, // Directly using the passed building ID
            staff // 👈 Automatically set to logged-in user
        });

        await newPackage.save();
        console.log(`✅ Package Created Successfully: ${newPackage._id}`);

        // ✅ Add Package to Student's Packages Array
        console.log(`📦 Adding package to student's package list (Student ID: ${student._id})...`);
        student.packages.push(newPackage._id);
        await student.save();
        console.log("🎓 Student's package list updated successfully.");

        // ✅ Add Package to Building's Packages Array
        console.log(`🏢 Adding package to building's package list (Building ID: ${buildingExists._id})...`);
        buildingExists.packages.push(newPackage._id);
        await buildingExists.save();
        console.log("🏗️ Building's package list updated successfully.");

        console.log(`✅ Package added successfully by staff: ${staff} (Status: Logged In).`);
        res.status(201).json({ message: "Package added successfully", package: newPackage });

    } catch (error) {
        console.error("❌ Error adding package:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



// ✅ Fetch all packages
const getPackages = async (req, res) => {
    try {
        console.log("📦 Fetching all packages...");

        const { search = "", buildings = "", studentId = "", page = 1, limit = 10 } = req.query;
        let query = {};

        // ✅ Filter by selected buildings
        if (buildings) {
            const buildingIds = buildings.split(",").map(id => id.trim());
            query.building = { $in: buildingIds };
            console.log("🏢 Filtering by Buildings:", buildingIds);
        }

        // ✅ Filter by selected student ID (if provided)
        if (studentId) {
            query.recipient = studentId;
            console.log("🎓 Filtering by Student ID:", studentId);
        }

        // ✅ Prepare search terms
        const searchTerms = search.split(',').map(term => term.trim()).filter(term => term);
        let packageQuery = {};
        let studentQuery = {};

        if (searchTerms.length > 0) {
            console.log("🔎 Applying Search Filters:", searchTerms);

            // ✅ Separate Package Queries (Tracking, Status, Parcel Type)
            packageQuery.$or = [
                ...searchTerms.map(term => ({ trackingNumber: { $regex: term, $options: "i" } })),
                ...searchTerms.map(term => ({ parcelType: { $regex: term, $options: "i" } })),
                ...searchTerms.map(term => ({ shippingType: { $regex: term, $options: "i" } })),
                ...searchTerms.map(term => ({ status: { $regex: term, $options: "i" } }))
            ];

            // ✅ Separate Student Queries (Name, Student Number, Email, Building, Room)
            studentQuery.$or = [
                ...searchTerms.map(term => ({ firstName: { $regex: term, $options: "i" } })),
                ...searchTerms.map(term => ({ lastName: { $regex: term, $options: "i" } })),
                ...searchTerms.map(term => ({ studentNumber: { $regex: term, $options: "i" } })),
                ...searchTerms.map(term => ({ email: { $regex: term, $options: "i" } })),
                ...searchTerms.map(term => ({ building: { $regex: term, $options: "i" } })),
                ...searchTerms.map(term => ({ room: { $regex: term, $options: "i" } })),
                // New: also search by concatenated full name
                {
                    $expr: {
                        $regexMatch: {
                            input: { $concat: ["$firstName", " ", "$lastName"] },
                            regex: searchTerms.join("|"),
                            options: "i"
                        }
                    }
                }
            ];
        }

        // console.log("🔎 Package Query:", JSON.stringify(packageQuery, null, 2));
        // console.log("🎓 Student Query:", JSON.stringify(studentQuery, null, 2));

        // ✅ Step 1: Find all students matching `studentQuery`
        let matchingStudents = [];
        if (searchTerms.length > 0) {
            matchingStudents = await Student.find(studentQuery).select("_id");
            console.log(`✅ Found ${matchingStudents.length} matching students.`);
        }

        // ✅ Step 2: Combine Package + Student Search
        let combinedQuery = { ...query };

        if (packageQuery.$or) {
            combinedQuery.$or = packageQuery.$or;
        }

        if (matchingStudents.length > 0) {
            combinedQuery.$or = [...(combinedQuery.$or || []), { recipient: { $in: matchingStudents.map(s => s._id) } }];
        }

        // console.log("📝 Final Query for Packages:", JSON.stringify(combinedQuery, null, 2));

        // ✅ Fetch Packages with Pagination & Populate Student Details
        let packages = await Package.find(combinedQuery)
            .populate("recipient", "firstName lastName studentNumber email building room picture")
            .populate("staff", "firstName lastName email")
            .skip((page - 1) * limit)
            .limit(Number(limit));

        // ✅ Sort by last name (since `recipient.lastName` is populated)
        packages.sort((a, b) => {
            if (!a.recipient || !b.recipient) return 0;
            return a.recipient.lastName.localeCompare(b.recipient.lastName);
        });

        const totalPackages = await Package.countDocuments(combinedQuery);
        const totalPages = Math.ceil(totalPackages / limit);

        console.log(`✅ Found ${packages.length} packages (Total: ${totalPackages}, Pages: ${totalPages})`);
        res.status(200).json({
            packages,
            totalPages,
            currentPage: Number(page),
        });

    } catch (error) {
        console.error("❌ Error fetching packages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};





// ✅ Fetch a package by ID
const getPackageById = async (req, res) => {
    try {
        console.log("📦 Fetching package by ID...");

        const { packageId } = req.params;
        const package = await Package.findById(packageId)
            .populate("recipient", "firstName lastName studentNumber building room picture")
            .populate("staff", "firstName lastName email");

        if (!package) {
            console.log("❌ Package not found.");
            return res.status(404).json({ error: "Package not found." });
        }

        console.log("✅ Package found.");
        res.status(200).json(package);

    } catch (error) {
        console.error("❌ Error fetching package:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ✅ Delete a package by ID
const deletePackage = async (req, res) => {
    try {
        console.log("🗑️ Deleting package...");

        const { packageId } = req.params;
        const deletedPackage = await Package.findByIdAndDelete(packageId);

        if (!deletedPackage) {
            console.log("❌ Package not found.");
            return res.status(404).json({ error: "Package not found." });
        }

        console.log("✅ Package deleted successfully.");
        res.status(200).json({ message: "Package deleted successfully" });

    } catch (error) {
        console.error("❌ Error deleting package:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const logOutPackages = async (req, res) => {
    try {
        const { packageIds } = req.body; // Receive an array of package IDs from the request

        if (!packageIds || packageIds.length === 0) {
            return res.status(400).json({ error: "No packages selected for logging out." });
        }

        console.log(`🔄 Logging out ${packageIds.length} packages...`);

        // Update all selected packages' statuses to "Logged Out"
        const updatedPackages = await Package.updateMany(
            { _id: { $in: packageIds }, status: "Logged In" },
            { $set: { status: "Logged Out" } }
        );

        console.log(`✅ Successfully logged out ${updatedPackages.modifiedCount} packages.`);

        res.status(200).json({
            message: `${updatedPackages.modifiedCount} packages have been logged out successfully.`,
        });

    } catch (error) {
        console.error("❌ Error logging out packages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



module.exports = { addPackage, getPackages, getPackageById, deletePackage,logOutPackages };
