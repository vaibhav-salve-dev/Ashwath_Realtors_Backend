const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connectDB, getMongoUri } = require("./config/db");

const projectRoute = require("./routes/project");
const contactRoute = require("./routes/contact");
const companyRoute = require("./routes/company");
const enquiryRoute = require("./routes/enquiry");
const flatRoutes = require('./routes/flatRoutes');
const dashboardRoute = require('./routes/dasboard');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.json({ limit: '25mb' }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/project", projectRoute);
app.use("/api/contact", contactRoute);
app.use("/api/company", companyRoute);
app.use("/api/enquiry", enquiryRoute);
app.use('/api/flats', flatRoutes);
app.use('/api/dashboard', dashboardRoute);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        dbState: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        dbName: mongoose.connection.name || null,
        timestamp: new Date().toISOString()
    });
});

// Database info endpoint
app.get("/api/db-status", (req, res) => {
    const config = getMongoUri();
    res.json({
        target: config.label,
        isAtlas: config.isAtlas,
        connected: mongoose.connection.readyState === 1,
        databaseName: mongoose.connection.name,
        host: mongoose.connection.host,
        nodeEnv: process.env.NODE_ENV || 'development'
    });
});

const PORT = process.env.PORT || 5100;

// Initialize database connection and start server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Critical: Could not connect to database on startup. Starting server in degraded mode...", err.message);
        app.listen(PORT, () => {
            console.log(`Server started in degraded mode at http://localhost:${PORT}`);
        });
    });
