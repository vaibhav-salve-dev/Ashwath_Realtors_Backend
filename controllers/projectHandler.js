const project = require("../models/project");
const path = require("path");
const fs = require("fs");

const getData = async (req, res) => {
    const body = req.body;
    try {
        const imagePath = req.file
            ? `http://localhost:5100/uploads/${req.file.filename}`
            : (body.Image || body.image || "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800");

        const target = await project.create({
            Title: body.Title || body.title,
            Category: body.Category || body.category || "residential",
            Status: body.Status || body.status || "in-progress",
            Year: Number(body.Year || body.year) || new Date().getFullYear(),
            Duration: body.Duration || body.duration || "12 months",
            Image: imagePath,
            Description: body.Description || body.description || ""
        });

        res.send("Project added successfully");
    } catch (err) {
        console.log("error of project : ", err);
        res.status(500).send("Unable to add project ! Try again later");
    }
};

const sendData = async (req, res) => {
    try {
        const data = await project.find({}).sort({ _id: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateData = async (req, res) => {
    const body = req.body;
    console.log("update project : ", body);

    try {
        const existingProject = await project.findById(body.id);
        if (!existingProject) {
            return res.status(404).send("Project not found");
        }

        const updateFields = {
            Title: body.Title || body.title || existingProject.Title,
            Category: body.Category || body.category || existingProject.Category,
            Status: body.Status || body.status || existingProject.Status,
            Year: Number(body.Year || body.year) || existingProject.Year,
            Duration: body.Duration || body.duration || existingProject.Duration,
            Description: body.Description || body.description || existingProject.Description,
        };

        if (req.file) {
            if (existingProject.Image && existingProject.Image.includes('/uploads/')) {
                const oldPath = path.join(
                    __dirname,
                    "..",
                    "uploads",
                    path.basename(existingProject.Image)
                );
                fs.unlink(oldPath, (err) => {
                    if (err && err.code !== 'ENOENT') console.log("Failed to delete old image:", err);
                });
            }
            updateFields.Image = `http://localhost:5100/uploads/${req.file.filename}`;
        } else if (body.Image || body.image) {
            updateFields.Image = body.Image || body.image;
        }

        await project.findByIdAndUpdate(body.id, updateFields, { new: true });
        res.send("Project data updated successfully");
    } catch (err) {
        console.log("updateData error:", err);
        res.status(500).send("Unable to update project Data!");
    }
};

const deleteData = async (req, res) => {
    const body = req.body;
    try {
        const id = body.id || req.params.id;
        const target = await project.findById(id);
        if (target && target.Image && target.Image.includes('/uploads/')) {
            const oldPath = path.join(
                __dirname,
                "..",
                "uploads",
                path.basename(target.Image)
            );
            fs.unlink(oldPath, (err) => {
                if (err && err.code !== 'ENOENT') console.log("Old project image delete err:", err);
            });
        }
        await project.findByIdAndDelete(id);
        res.send("Project deleted successfully");
    } catch (err) {
        res.status(500).send("Unable to delete Project ! try again later");
        console.log("project delete error : ", err);
    }
};

module.exports = {
    getData,
    sendData,
    updateData,
    deleteData
};
