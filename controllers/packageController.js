const Package = require("../models/Package");
const Student = require("../models/Student");
const Building = require("../models/Building");

// ✅ Add a new package
const addPackage = async (req, res) => {
    try {
        console.log("📦 Adding a new package...");

        const {
            trackingNumber, recipient, parcelType, shippingType,
            receiptDate, receiptTime, comments, building
        } = req.body;

        // ✅ Get Logged-in Staff ID from Request
        const staff = req.userData.userID;
        if (!staff) {
            return res.status(401).json({ error: "Unauthorized: Staff not identified." });
        }

        // ✅ Validate required fields
        if (!recipient || !parcelType || !shippingType || !building) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // ✅ Validate `parcelType` & `shippingType`
        const validParcelTypes = [
            "Box/Bag - Large and Up", "Box/Bag - Medium", "Box/Bag - Small", "Care Package",
            "Conduct Letter", "Envelope-Financial Doc/Cards", "Envelope-IRS Document", "Envelope-Large",
            "Other-add type to comments", "Perishable-Flowers", "Perishable-Food", "Perishable-Other"
        ];
        if (!validParcelTypes.includes(parcelType)) {
            return res.status(400).json({ error: "Invalid parcel type." });
        }

        const validShippingTypes = ["DHL", "FedEx", "Metro Delivery", "Other", "UPS", "USPS"];
        if (!validShippingTypes.includes(shippingType)) {
            return res.status(400).json({ error: "Invalid shipping type." });
        }

        // ✅ Ensure `recipient` (Student) Exists
        const student = await Student.findById(recipient);
        if (!student) {
            return res.status(404).json({ error: "Recipient student not found." });
        }

        // ✅ Ensure `building` Exists (Find by Name)
        const buildingExists = await Building.findOne({ name: building });
        if (!buildingExists) {
            return res.status(404).json({ error: "Building not found." });
        }

        // ✅ Create & Save Package (Status always set to "Logged In")
        const newPackage = new Package({
            trackingNumber,
            recipient,
            parcelType,
            shippingType,
            receiptDate: receiptDate || new Date(),
            receiptTime: receiptTime || new Date().toLocaleTimeString(),
            status: "Logged In", // 👈 Always set to "Logged In"
            comments,
            building: buildingExists._id, // Store building ID
            staff // 👈 Automatically set to logged-in user
        });

        await newPackage.save();

        // ✅ Add Package to Student's Packages Array
        student.packages.push(newPackage._id);
        await student.save();

        // ✅ Add Package to Building's Packages Array
        buildingExists.packages.push(newPackage._id);
        await buildingExists.save();

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

        const packages = await Package.find()
            .populate("recipient", "firstName lastName studentNumber building room picture")
            .populate("staff", "firstName lastName email");

        console.log(`✅ Found ${packages.length} packages.`);
        res.status(200).json(packages);

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

module.exports = { addPackage, getPackages, getPackageById, deletePackage };
