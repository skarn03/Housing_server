// controllers/staffController.js
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Staff = require("../models/Staff");
const Building = require("../models/Building");
const University = require("../models/University");
const { sendEmailMailgun } = require("../config/sendMail");

const getAllStaff = async (req, res) => {
    try {
        console.log("➡️ Entered getAllStaff controller...");
        const universityId = req.userUniversity; // from your middleware

        if (!universityId) {
            console.log("⚠️ No university ID provided in req.userUniversity");
            return res.status(400).json({ message: "University ID is required" });
        }

        console.log(`📋 Fetching staff for university: ${universityId}`);

        const staffMembers = await Staff.find({ university: universityId })
            .populate("building", "name")
            .select("-password");

        console.log(`✅ Fetched ${staffMembers.length} staff members.`);
        return res.status(200).json(staffMembers);
    } catch (error) {
        console.error("❌ Error fetching staff:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Add a new staff member
const addStaff = async (req, res) => {
    try {
        console.log("➡️ Entered addStaff controller...");

        // Destructure request body
        const { firstName, middleName, lastName, email, role, building } = req.body;
        console.log("📥 Payload:", { firstName, middleName, lastName, email, role, building });

        // The user's university from your auth middleware
        const universityId = req.userUniversity;
        console.log("🏫 Associated university ID:", universityId);

        // Check required fields
        if (!firstName || !lastName || !email) {
            console.log("⚠️ Missing required fields.");
            return res.status(400).json({ message: "Missing required fields." });
        }

        // 1. Find the University doc
        const universityDoc = await University.findById(universityId);
        if (!universityDoc) {
            console.log("❌ University not found.");
            return res.status(404).json({ message: "University not found." });
        }

        // 2. Check if there's already a staff with that email in THIS university
        console.log(`🔍 Checking if staff with email=${email} already exists in university=${universityId}...`);
        const existingStaff = await Staff.findOne({
            email: email.toLowerCase(),
            university: universityId,
        });

        if (existingStaff) {
            console.log("❌ Staff with this email already exists in the same university.");
            return res.status(500).json({ message: "Staff with this email already exists." });
        }

        // 3. If building is provided, optionally verify it
        let buildingDoc = null;
        if (building) {
            console.log(`🔍 Checking building with ID: ${building}`);
            buildingDoc = await Building.findById(building);
            if (!buildingDoc) {
                console.log("❌ Invalid building ID.");
                return res.status(404).json({ message: "Invalid building ID." });
            }
            console.log("✅ Building found:", buildingDoc.name);
        }

        // 4. Generate random password
        console.log("🔑 Generating random password...");
        const randomPassword = crypto.randomBytes(8).toString("hex");
        console.log("✅ Random password:", randomPassword);

        // 5. Hash password
        console.log("🔐 Hashing password...");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        console.log("✅ Hashed password created.");

        // Combine first + middle + last into a single "name"
        const fullName = [firstName, middleName, lastName]
            .filter(Boolean) // remove empty strings/null
            .join(" ");

        // 6. Create Staff doc
        console.log("📝 Creating staff document...");
        const newStaff = new Staff({
            name: fullName,
            firstName,
            middleName,
            lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            building: buildingDoc?._id,
            university: universityDoc._id,
        });

        // 7. Save staff to DB
        console.log("💾 Saving new staff to DB...");
        await newStaff.save();
        console.log("✅ Staff member created:", newStaff._id);

        // 8. Add staff reference to the university
        console.log("📎 Adding staff to university's staffs array...");
        universityDoc.staffs.push(newStaff._id);
        await universityDoc.save();
        console.log("✅ University updated with new staff.");

        // 9. Send email with plaintext password
        console.log(`📧 Sending email with credentials to ${email}...`);
        const mailgunFrom = process.env.MAILGUN_FROM_EMAIL || "noreply@example.com";
        const subject = "Your Staff Account Credentials";
        const textBody = `
Hello ${fullName},

An account has been created for you at ${universityDoc.name} with the following credentials:

Email: ${email}
Password: ${randomPassword}
Role: ${role}

Please log in and change your password as soon as possible.
`;
        const htmlBody = `
<h3>Hello ${fullName},</h3>
<p>
  A new Staff account has been created for you at <strong>${universityDoc.name}</strong>:
</p>
<ul>
  <li><strong>Email:</strong> ${email}</li>
  <li><strong>Password:</strong> ${randomPassword}</li>
  <li><strong>Role:</strong> ${role}</li>
</ul>
<p>Please log in and change your password as soon as possible.</p>
`;

        try {
            await sendEmailMailgun(mailgunFrom, subject, email, textBody, htmlBody);
            console.log(`✅ Email sent to ${email}`);
        } catch (mailErr) {
            console.error("❌ Error sending email:", mailErr.message);
            // We won't fail the entire request, staff is already created
        }

        console.log("✅ addStaff flow complete. Returning success response.");
        return res.status(201).json({
            message: "Staff member created successfully.",
            staff: newStaff,
        });
    } catch (error) {
        console.error("❌ Error adding staff:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getAllStaff,
    addStaff,
};
