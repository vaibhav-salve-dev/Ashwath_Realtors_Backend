const company = require("../models/company");

const getData = async (req, res) => {
    const body = req.body;
    console.log("company body:", body);

    try {
        const updateDoc = {
            name: body.name || body.Name || "Ashwath Realtors",
            founded: Number(body.founded || body.Year || 1994),
            description: body.description || body.Description || "",
            mission: body.mission || body.Mission || "",
            vision: body.vision || body.Vision || body.Vission || "",
            address: body.address || body.Address || "",
            phone: body.phone || body.Phone || "",
            email: body.email || body.Email || "",
            totalProjects: String(body.totalProjects || body.Total_Projects || "100"),
            yearsExperience: String(body.yearsExperience || body.Years_Experience || "25"),
            teamMembers: String(body.teamMembers || body.Team_Members || "100"),
            clientSatisfaction: Number(body.clientSatisfaction || body.Client_Satisfaction || 98),
            website: body.website || "https://ashwathrealtors.in",
            tagline: body.tagline || body.Tagline || "SPACES. STORIES. LEGACY."
        };

        const existing = await company.findOne({});
        if (!existing) {
            const target = await company.create(updateDoc);
            return res.json({ message: "Data created successfully", data: target });
        } else {
            const target = await company.findByIdAndUpdate(existing._id, updateDoc, { new: true });
            return res.json({ message: "Data updated successfully", data: target });
        }
    } catch (err) {
        console.log("error of company : ", err);
        res.status(500).json({ error: "Unable to update data! Try again later", details: err.message });
    }
};

const updateData = async (req, res) => {
    const body = req.body;
    try {
        const updateDoc = {
            name: body.name || body.Name,
            founded: Number(body.founded || body.Year),
            description: body.description || body.Description,
            mission: body.mission || body.Mission,
            vision: body.vision || body.Vision || body.Vission,
            address: body.address || body.Address,
            phone: body.phone || body.Phone,
            email: body.email || body.Email,
            totalProjects: String(body.totalProjects || body.Total_Projects),
            yearsExperience: String(body.yearsExperience || body.Years_Experience),
            teamMembers: String(body.teamMembers || body.Team_Members),
            clientSatisfaction: Number(body.clientSatisfaction || body.Client_Satisfaction),
            website: body.website || "https://ashwathrealtors.in"
        };

        // Remove undefined fields
        Object.keys(updateDoc).forEach(key => updateDoc[key] === undefined && delete updateDoc[key]);

        const target = await company.findOneAndUpdate({}, updateDoc, { new: true, upsert: true });
        res.json({ message: "Company data updated successfully", data: target });
    } catch (err) {
        console.error("Company updateData error:", err);
        res.status(500).json({ error: "Unable to update company data!", details: err.message });
    }
};

const sendData = async (req, res) => {
    try {
        const data = await company.findOne({});
        if (!data) {
            return res.json({
                name: 'Ashwath Realtors',
                founded: 2004,
                description: 'We believe a meaningful development is measured not only in square feet, but in the lives it touches and the value it creates over time. Rooted in experience and driven by thoughtful planning, Ashwath Realtors brings together people, places and possibilities through considered real estate development.',
                mission: 'To deliver reliable and high-quality construction services by maintaining integrity, transparency and a strong commitment to customer satisfaction.',
                vision: 'To become a trusted leader in construction and infrastructure by delivering high-quality, innovative and sustainable building solutions that shape better living with quality, trust and excellence.',
                address: 'Pune · Mumbai · Maharashtra',
                phone: '+91 96570 86779',
                email: 'info@ashwathrealtors.in',
                website: 'https://ashwathrealtors.in',
                tagline: 'SPACES. STORIES. LEGACY.',
                totalProjects: '6',
                yearsExperience: '20',
                teamMembers: '100',
                clientSatisfaction: 99
            });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getData,
    sendData,
    updateData
};
