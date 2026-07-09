const Employee = require('../models/Employee');
const User = require('../models/User');
const { sendVerificationStatusEmail } = require('../config/emailService');
const { notify } = require('../utils/notificationService');

const getPendingVerifications = async (req, res) => {
  try {
    const employees = await Employee.find({
      $or: [
        { panStatus: "pending" },
        { aadhaarStatus: "pending" },
        { bankStatus: "pending" }
      ]
    }).populate("department", "departmentName").lean();
    
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVerifiedRecords = async (req, res) => {
  try {
    const employees = await Employee.find({
      $or: [
        { panStatus: "verified" },
        { aadhaarStatus: "verified" },
        { bankStatus: "verified" }
      ]
    }).populate("department", "departmentName").lean();
    
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRejectedRecords = async (req, res) => {
  try {
    const employees = await Employee.find({
      $or: [
        { panStatus: "rejected" },
        { aadhaarStatus: "rejected" },
        { bankStatus: "rejected" }
      ]
    }).populate("department", "departmentName").lean();
    
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyDocument = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { documentType } = req.body; // 'pan', 'aadhaar', or 'bank'
    const hrUserId = req.user.userId;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    if (documentType === 'pan') {
      employee.panStatus = "verified";
      employee.panVerification = { verifiedBy: hrUserId, verifiedAt: new Date(), remarks: null };
    } else if (documentType === 'aadhaar') {
      employee.aadhaarStatus = "verified";
      employee.aadhaarVerification = { verifiedBy: hrUserId, verifiedAt: new Date(), remarks: null };
    } else if (documentType === 'bank') {
      employee.bankStatus = "verified";
      employee.bankVerification = { verifiedBy: hrUserId, verifiedAt: new Date(), remarks: null };
    } else {
      return res.status(400).json({ error: "Invalid document type" });
    }

    await employee.save();
    // Send email notification
    if (employee.email) {
      await sendVerificationStatusEmail(employee.email, employee.firstName, documentType, 'verified');
    }

    if (employee.user) {
      const docNames = { pan: 'PAN', aadhaar: 'Aadhaar', bank: 'Bank Details' };
      const docName = docNames[documentType] || documentType.toUpperCase();
      await notify({
        recipient: employee.user,
        sender: hrUserId || null,
        title: `${docName} Verified`,
        message: `Your ${docName} has been verified successfully by HR.`,
        type: 'verification',
        module: 'verification',
        link: '/employee/verification'
      }).catch(() => {});
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectDocument = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { documentType, remarks } = req.body;
    
    if (!remarks) {
      return res.status(400).json({ error: "Remarks are required for rejection" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    if (documentType === 'pan') {
      employee.panStatus = "rejected";
      employee.panVerification.remarks = remarks;
    } else if (documentType === 'aadhaar') {
      employee.aadhaarStatus = "rejected";
      employee.aadhaarVerification.remarks = remarks;
    } else if (documentType === 'bank') {
      employee.bankStatus = "rejected";
      employee.bankVerification.remarks = remarks;
    } else {
      return res.status(400).json({ error: "Invalid document type" });
    }

    await employee.save();
    // Send email notification
    if (employee.email) {
      await sendVerificationStatusEmail(employee.email, employee.firstName, documentType, 'rejected', remarks);
    }

    if (employee.user) {
      const docNames = { pan: 'PAN', aadhaar: 'Aadhaar', bank: 'Bank Details' };
      const docName = docNames[documentType] || documentType.toUpperCase();
      await notify({
        recipient: employee.user,
        sender: req.user ? req.user.userId : null,
        title: 'Verification Rejected',
        message: `Your ${docName} verification was rejected. Reason: ${remarks}`,
        type: 'verification',
        module: 'verification',
        link: '/employee/verification'
      }).catch(() => {});
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPendingVerifications,
  getVerifiedRecords,
  getRejectedRecords,
  verifyDocument,
  rejectDocument
};
