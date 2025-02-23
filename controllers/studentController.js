const Student = require("../models/Student");
const University = require("../models/University");
const Building = require("../models/Building");
const Floor = require("../models/Floor");
const Package = require("../models/Package");
const incidentReports = require("../models/IncidentReport");
const studentConnectionNotes = require("../models/StudentConnectionNote");



const addStudent = async (req, res) => {
    try {
        console.log("🔹 Received request to add a new student!");

        const {
            preferredName, firstName, lastName, dateOfBirth, age, gender, picture,
            studentNumber, classification, entryStatus, email, building, floor, room,
            typeLocation, contractDates, roomRate
        } = req.body;

        console.log("📌 Validating required fields...");
        if (!firstName || !lastName || !studentNumber || !classification || !entryStatus || !email || !building) {
            console.log("❌ Missing required fields!");
            return res.status(400).json({ error: "Missing required fields" });
        }

        console.log("🏫 Checking user's university...");
        const university = req.userUniversity;
        if (!university) {
            console.log("❌ University not found in request!");
            return res.status(404).json({ error: "University not found" });
        }
        console.log(`✅ University confirmed: ${university.name}`);

        console.log("🔎 Checking for existing student by email or student number...");
        const existingStudent = await Student.findOne({
            $or: [{ email }, { studentNumber }]
        });

        if (existingStudent) {
            console.log(`❌ Duplicate student detected! (Email: ${email}, Student Number: ${studentNumber})`);
            return res.status(400).json({ error: "A student with this email or student number already exists" });
        }
        console.log("✅ No duplicate student found. Proceeding...");

        console.log(`🏢 Searching for building: ${building} in university: ${university.name}`);
        const selectedBuilding = await Building.findOne({
            name: building,
            university: university._id
        }).populate("floors");

        if (!selectedBuilding) {
            console.log(`❌ Building "${building}" not found in university "${university.name}"!`);
            return res.status(404).json({ error: "Building not found in this university" });
        }
        console.log(`✅ Building found: ${selectedBuilding.name}`);

        let selectedFloor = null;
        if (floor) {
            console.log(`🔎 Searching for floor: ${floor} inside building: ${selectedBuilding.name}`);
            selectedFloor = selectedBuilding.floors.find(f => f.name === floor);
            if (!selectedFloor) {
                console.log(`❌ Floor "${floor}" not found in building "${selectedBuilding.name}"!`);
                return res.status(404).json({ error: "Floor not found in this building" });
            }
            console.log(`✅ Floor found: ${selectedFloor.name}`);
        }

        console.log("📝 Creating a new student record...");
        const newStudent = new Student({
            preferredName,
            firstName,
            lastName,
            dateOfBirth,
            age,
            gender,
            picture,
            studentNumber,
            classification,
            entryStatus,
            email,
            building: selectedBuilding.name,
            floor: selectedFloor ? selectedFloor.name : null,
            room,
            typeLocation,
            contractDates,
            roomRate
        });

        await newStudent.save();
        console.log(`✅ Student "${newStudent.firstName} ${newStudent.lastName}" successfully added!`);

        // Add student reference to university
        console.log(`📌 Adding student to university: ${university.name}`);
        await University.findByIdAndUpdate(university._id, { $push: { students: newStudent._id } });
        console.log(`✅ Student added to university "${university.name}"`);

        // Add student reference to building
        console.log(`📌 Adding student to building: ${selectedBuilding.name}`);
        await Building.findByIdAndUpdate(selectedBuilding._id, { $push: { students: newStudent._id } });
        console.log(`✅ Student added to building "${selectedBuilding.name}"`);

        // Add student reference to floor if applicable
        if (selectedFloor) {
            console.log(`📌 Adding student to floor: ${selectedFloor.name}`);
            await Floor.findByIdAndUpdate(selectedFloor._id, { $push: { residents: newStudent._id } });
            console.log(`✅ Student added to floor "${selectedFloor.name}"`);
        }

        console.log("🎉 Student registration completed successfully!");
        res.status(201).json({ message: "Student added successfully", student: newStudent });

    } catch (error) {
        console.error("🔥 Error adding student:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getStudents = async (req, res) => {
    try {
        console.log("📡 Fetching students from university.students...");

        // Extract filters from query parameters
        const { search = "", page = 1, limit = 10 } = req.query;
        const university = req.userUniversity; // Retrieved from checkRole middleware
        
        if (!university) {
            console.log("❌ University not found in request!");
            return res.status(400).json({ error: "University not found" });
        }

        console.log(`🔍 Search: ${search} | 📄 Page: ${page} | 🔢 Limit: ${limit} | 🏛️ University: ${university.name}`);

        // Split search terms by commas, trim spaces, and remove empty values
        const searchTerms = search.split(',').map(term => term.trim()).filter(term => term);

        let query = { _id: { $in: university.students } };

        if (searchTerms.length > 0) {
            query.$and = searchTerms.map(term => ({
                $or: [
                    { firstName: new RegExp(term, "i") },
                    { lastName: new RegExp(term, "i") },
                    { studentNumber: new RegExp(term, "i") },
                    { email: new RegExp(term, "i") },
                    { building: new RegExp(term, "i") },
                    { room: new RegExp(term, "i") }
                ]
            }));
        }

        console.log("🔎 Query:", JSON.stringify(query, null, 2));

        // Pagination calculation
        const students = await Student.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalStudents = await Student.countDocuments(query);
        const totalPages = Math.ceil(totalStudents / limit);

        console.log(`✅ Found ${students.length} students (Total: ${totalStudents}, Pages: ${totalPages})`);

        res.status(200).json({
            students,
            totalPages,
            currentPage: Number(page),
        });
    } catch (error) {
        console.error("❌ Error fetching students:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};





const getStudentById = async (req, res) => {
    try {
        console.log("📡 Fetching student details...");

        const { studentID } = req.params; // studentID is actually the studentNumber now
        const university = req.userUniversity; // Retrieved from checkRole middleware

        if (!university) {
            console.log("❌ University not found in request!");
            return res.status(400).json({ error: "University not found" });
        }

        console.log(`🔎 Searching for student with studentNumber: ${studentID}`);

        // First, find the student by studentNumber
        const student = await Student.findOne({ studentNumber: studentID })
            .populate({ path: "packages", model: "Package", options: { strictPopulate: false } })
            .populate({ path: "incidentReports", model: "IncidentReport", options: { strictPopulate: false } })
            .populate({ path: "studentConnectionNotes", model: "StudentConnectionNote", options: { strictPopulate: false } });

        if (!student) {
            console.log(`❌ Student with studentNumber: ${studentID} not found.`);
            return res.status(404).json({ error: "Student not found" });
        }

        // Check if the student belongs to the university
        const isStudentInUniversity = university.students.includes(student._id);

        if (!isStudentInUniversity) {
            console.log(`❌ Student does not belong to university: ${university.name}`);
            return res.status(403).json({ error: "Access denied: Student does not belong to this university" });
        }

        console.log("✅ Student found and belongs to the university:", student.firstName, student.lastName);

        // Ensure missing references are handled properly
        const safeStudent = {
            ...student.toObject(),
            packages: student.packages || [],
            incidentReports: student.incidentReports || [],
            studentConnectionNotes: student.studentConnectionNotes || []
        };

        res.status(200).json(safeStudent);
    } catch (error) {
        console.error("❌ Error fetching student:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



module.exports = { addStudent,getStudents,getStudentById };
