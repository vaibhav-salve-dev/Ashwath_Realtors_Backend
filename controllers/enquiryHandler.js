const flat = require("../models/flatEnquiry");

const getData = async (req, res) => {
    const body = req.body;
    try {
        const target = await flat.create({
            Name: body.Name || body.name,
            Email: body.Email || body.email,
            Phone: body.Phone || body.phone,
            Property: body.Property || body.property || "General Property",
            Type: body.Type || body.type || "flat",
            Message: body.Message || body.message || "",
            Date: body.Date || body.date || new Date().toISOString().split('T')[0],
            Status: body.Status || body.status || "new"
        });

        res.json({ ok: true, message: "Enquiry submitted successfully", data: target });
    } catch (err) {
        console.log("error of enquiry : ", err);
        res.status(500).json({ ok: false, message: "Unable to send enquiry! Try again later", error: err.message });
    }
};

const sendData = async (req, res) => {
    try {
        const data = await flat.find({}).sort({ _id: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateStatus = async (req, res) => {
    const body = req.body;
    try {
        const target = await flat.findByIdAndUpdate(
            body.id,
            { Status: body.Status || body.status },
            { new: true }
        );
        res.send("Status updated successfully");
    } catch (err) {
        res.status(500).send("Unable to update status!");
    }
};

const deleteEnquiry = async (req, res) => {
    try {
        const id = req.params.id || req.body.id;
        await flat.findByIdAndDelete(id);
        res.json({ ok: true, message: "Enquiry deleted successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
};

module.exports = {
    getData,
    sendData,
    updateStatus,
    deleteEnquiry
};
