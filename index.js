const express = require("express");
const path = require("path");
const cors = require("cors");
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
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5100;

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
