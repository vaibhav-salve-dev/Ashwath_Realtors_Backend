const Project = require('../models/project');
const Flat = require('../models/Flat');
const Contact = require('../models/contact');
const FlatEnquiry = require('../models/flatEnquiry');
const Company = require('../models/company');

const getDashboardData = async (req, res) => {
  try {
    const [
      totalProjects,
      completedProjects,
      inProgressProjects,
      totalFlats,
      availableFlats,
      soldFlats,
      upcomingFlats,
      totalContacts,
      newContacts,
      totalFlatEnquiries,
      newFlatEnquiries,
      recentContacts,
      recentFlatEnquiries,
      companyInfo
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ Status: { $in: ['completed', 'Completed'] } }),
      Project.countDocuments({ Status: { $in: ['in-progress', 'in-progress', 'InProgress', 'In Progress'] } }),
      Flat.countDocuments(),
      Flat.countDocuments({ category: { $in: ['available', 'Available'] } }),
      Flat.countDocuments({ category: { $in: ['sold', 'Sold'] } }),
      Flat.countDocuments({ category: { $in: ['upcoming', 'Upcoming'] } }),
      Contact.countDocuments(),
      Contact.countDocuments({ Status: { $in: ['new', 'New'] } }),
      FlatEnquiry.countDocuments(),
      FlatEnquiry.countDocuments({ Status: { $in: ['new', 'New'] } }),
      Contact.find().sort({ _id: -1 }).limit(4),
      FlatEnquiry.find().sort({ _id: -1 }).limit(4),
      Company.findOne({})
    ]);

    // Build recent activities list
    const activities = [];

    recentContacts.forEach(c => {
      activities.push({
        id: `contact-${c._id}`,
        type: 'enquiry',
        title: `Contact message from ${c.Name}`,
        message: c.Subject ? `${c.Subject}: ${c.Message.slice(0, 60)}...` : c.Message.slice(0, 60),
        time: c.Date ? new Date(c.Date).toLocaleDateString() : 'Recent',
        status: c.Status
      });
    });

    recentFlatEnquiries.forEach(e => {
      activities.push({
        id: `enquiry-${e._id}`,
        type: 'flat',
        title: `Property enquiry for ${e.Property}`,
        message: `${e.Name} (${e.Phone || e.Email})`,
        time: e.Date ? new Date(e.Date).toLocaleDateString() : 'Recent',
        status: e.Status
      });
    });

    res.json({
      success: true,
      stats: {
        totalProjects,
        completedProjects,
        inProgressProjects,
        totalFlats,
        availableFlats,
        soldFlats,
        upcomingFlats,
        totalEnquiries: totalContacts + totalFlatEnquiries,
        totalContacts,
        newContacts,
        totalFlatEnquiries,
        newFlatEnquiries,
      },
      recentActivity: activities,
      company: companyInfo
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getDashboardData
};

