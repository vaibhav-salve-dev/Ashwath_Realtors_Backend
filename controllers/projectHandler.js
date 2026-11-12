const project = require("../models/project");
const path = require("path");
const fs = require("fs");
const { uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

const getData = async (req, res) => {
    const body = req.body;
    try {
        let imagePath = body.Image || body.image || "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800";

        if (req.file) {
            if (isCloudinaryConfigured()) {
                try {
                    const uploadRes = await uploadToCloudinary(req.file.buffer, {
                        folder: "ashwath-realtors/projects"
                    });
                    imagePath = uploadRes.secure_url;
                } catch (uploadErr) {
                    console.error("Cloudinary upload error in getData, falling back to local storage:", uploadErr.message);
                    const uploadsDir = path.join(__dirname, "..", "uploads");
                    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                    const localFileName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(req.file.originalname || '.jpg');
                    fs.writeFileSync(path.join(uploadsDir, localFileName), req.file.buffer);
                    imagePath = `http://localhost:5100/uploads/${localFileName}`;
                }
            } else {
                const uploadsDir = path.join(__dirname, "..", "uploads");
                if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                const localFileName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(req.file.originalname || '.jpg');
                fs.writeFileSync(path.join(uploadsDir, localFileName), req.file.buffer);
                imagePath = `http://localhost:5100/uploads/${localFileName}`;
            }
        } else if (imagePath.startsWith('data:image/') && isCloudinaryConfigured()) {
            try {
                const uploadRes = await uploadToCloudinary(imagePath, {
                    folder: "ashwath-realtors/projects"
                });
                imagePath = uploadRes.secure_url;
            } catch (err) {
                console.error("Base64 upload to Cloudinary failed:", err.message);
            }
        }

        const target = await project.create({
            Title: body.Title || body.title,
            Category: body.Category || body.category || "residential",
            Status: body.Status || body.status || "in-progress",
            Year: Number(body.Year || body.year) || new Date().getFullYear(),
            Duration: body.Duration || body.duration || "12 months",
            Image: imagePath,
            Description: body.Description || body.description || ""
        });

        res.status(201).json({ message: "Project added successfully", project: target });
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
            // Delete previous image from Cloudinary or local disk
            if (existingProject.Image && existingProject.Image.includes('cloudinary.com')) {
                deleteFromCloudinary(existingProject.Image).catch(err => console.log("Cloudinary old image delete err:", err));
            } else if (existingProject.Image && existingProject.Image.includes('/uploads/')) {
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

            if (isCloudinaryConfigured()) {
                try {
                    const uploadRes = await uploadToCloudinary(req.file.buffer, {
                        folder: "ashwath-realtors/projects"
                    });
                    updateFields.Image = uploadRes.secure_url;
                } catch (uploadErr) {
                    console.error("Cloudinary upload failed in updateData, falling back to local:", uploadErr.message);
                    const uploadsDir = path.join(__dirname, "..", "uploads");
                    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                    const localFileName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(req.file.originalname || '.jpg');
                    fs.writeFileSync(path.join(uploadsDir, localFileName), req.file.buffer);
                    updateFields.Image = `http://localhost:5100/uploads/${localFileName}`;
                }
            } else {
                const uploadsDir = path.join(__dirname, "..", "uploads");
                if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                const localFileName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(req.file.originalname || '.jpg');
                fs.writeFileSync(path.join(uploadsDir, localFileName), req.file.buffer);
                updateFields.Image = `http://localhost:5100/uploads/${localFileName}`;
            }
        } else if (body.Image || body.image) {
            const imgVal = body.Image || body.image;
            if (imgVal.startsWith('data:image/') && isCloudinaryConfigured()) {
                try {
                    const uploadRes = await uploadToCloudinary(imgVal, {
                        folder: "ashwath-realtors/projects"
                    });
                    updateFields.Image = uploadRes.secure_url;
                } catch (err) {
                    console.error("Base64 upload to Cloudinary failed:", err.message);
                    updateFields.Image = imgVal;
                }
            } else {
                updateFields.Image = imgVal;
            }
        }

        const updated = await project.findByIdAndUpdate(body.id, updateFields, { new: true });
        res.json({ message: "Project data updated successfully", project: updated });
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
        if (target && target.Image) {
            if (target.Image.includes('cloudinary.com')) {
                await deleteFromCloudinary(target.Image);
            } else if (target.Image.includes('/uploads/')) {
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
