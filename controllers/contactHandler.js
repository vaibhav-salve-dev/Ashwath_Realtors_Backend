const contact = require("../models/contact");

const getData = async (req, res) => {
    const body = req.body;
    console.log("con body : ", body);
    try {
        const target = await contact.create({
            Name: body.Name || body.name,
            Phone: body.Phone || body.phone,
            Email: body.Email || body.email,
            Subject: body.Subject || body.subject,
            Message: body.Message || body.message,
            Date: body.Date || body.date || new Date().toISOString(),
            Status: body.Status || body.status || "new"
        });

        res.send("Message sent successfully");
    } catch (err) {
        console.log("error of message : ", err);
        res.status(500).send("Unable to send message ! Try again later");
    }
};

const sendData = async (req, res) => {
    try {
        const data = await contact.find({}).sort({ _id: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const reply = (req, res) => {
    const body = req.body;
    const recipient = body.email;
    const subject = encodeURIComponent(body.subject || "Response from Ashwath Realtors Construction");
    const msg = encodeURIComponent(`Dear Client,\n\nThank you for reaching out to Ashwath Realtors.\n\nBest regards,\nAshwath Realtors Team`);
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${msg}`;
    res.json({ link: gmailLink });
};

const update = async (req, res) => {
    const body = req.body;
    try {
        const target = await contact.findByIdAndUpdate(
            body.id,
            { Status: body.status || body.Status },
            { new: true }
        );
        res.json({ message: "Status updated successfully", contact: target });
    } catch (err) {
        console.log("update error : ", err);
        res.status(500).json({ error: err.message });
    }
};

const deleteContact = async (req, res) => {
    try {
        const id = req.params.id || req.body.id;
        await contact.findByIdAndDelete(id);
        res.json({ message: "Contact enquiry deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getData,
    sendData,
    reply,
    update,
    deleteContact
};
