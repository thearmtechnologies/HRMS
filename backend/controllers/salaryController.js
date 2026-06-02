const SalaryFixed = require('../models/SalaryFixed');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const Employee = require('../models/Employee');
const inrWords = require("inr-words");
const { sendPaySlip } = require('../config/emailService');
const TempChanges = require('../models/TempChanges');
const Payroll = require('../models/Payroll');
const archiver = require("archiver");

//fixed salary records
const createFixedSalary = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const existing = await SalaryFixed.findOne({ employeeId });
    if (existing) {
      return res.status(409).json({ message: 'Salary for this employee already exists' });
    }
    const salaryDetails = new SalaryFixed({
      employeeId,
      ...req.body
    });

    await salaryDetails.save();

    res.status(201).json({ message: 'Salary created', salaryDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating salary record' });
  }
};

const updateFixedSalaryByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updated = await SalaryFixed.findOneAndUpdate(
      { employeeId },
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Salary record not found for employee' });
    }
    res.status(200).json({ message: 'Salary updated successfully', salaryDetails: updated });
  } catch (err) {
    console.error('Error updating salary:', err);
    res.status(500).json({ message: 'Server error updating salary', error: err.message });
  }
};

const getFixedSalary = async (req, res) => {
  try {
    const fixedSalary = await SalaryFixed.find().populate('employeeId', [
      'tradeId',
      'employeeName',
      'designation',
      'department',
      'site',
      'email'
    ]);

    if (!fixedSalary || fixedSalary.length === 0) {
      return res.status(404).json({ message: "No fixed salary records found" });
    }

    res.status(200).json(fixedSalary);
  } catch (err) {
    console.error("❌ Error fetching fixed salary:", err);
    res.status(500).json({ message: "Error fetching fixed salary", error: err.message });
  }
};

const getFixedSalaryByEmployee = async (req, res) => {
  try {
    const fixedSalary = await SalaryFixed.findOne({ employeeId: req.params.employeeId }).populate('employeeId', 'employeeName tradeId designation');

    if (!fixedSalary) {
      return res.status(404).json({ message: 'Fixed salary not found for this employee' });
    }

    res.status(200).json(fixedSalary);
  } catch (err) {
    console.error('❌ Error fetching fixed salary by employeeId:', err);
    res.status(500).json({ message: 'Error fetching fixed salary', error: err.message });
  }
};

//payroll records
const saveDraftPayroll = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.body;

    let draft = await PayrollModel.findOne({ userId, month, year, isDraft: true });

    if (draft) {
      Object.assign(draft, req.body);
      await draft.save();
      return res.status(200).json({ message: 'Draft updated', draft });
    }
    draft = new PayrollModel({ userId, ...req.body, isDraft: true });
    await draft.save();
    res.status(201).json({ message: 'Draft saved', draft });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({ message: 'Server error saving draft' });
  }
};

const getDraftPayrolls = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: 'Month and year required' });

    const drafts = await PayrollModel.find({ month, year, isDraft: true });
    res.status(200).json(drafts);
  } catch (error) {
    console.error('Fetch drafts error:', error);
    res.status(500).json({ message: 'Server error fetching drafts' });
  }
};

const submitPayroll = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.body;

    // Find existing draft
    let draft = await PayrollModel.findOne({ userId, month, year, isDraft: true });

    if (draft) {
      draft.isDraft = false; // finalize payroll
      await draft.save();
      return res.status(200).json({ message: 'Payroll submitted from draft', payroll: draft });
    }

    // If no draft, create new final payroll
    const payroll = new PayrollModel({ userId, ...req.body, isDraft: false });
    await payroll.save();
    res.status(201).json({ message: 'Payroll submitted', payroll });
  } catch (error) {
    console.error('Submit payroll error:', error);
    res.status(500).json({ message: 'Server error submitting payroll' });
  }
};

const getFinalPayrolls = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: 'Month and year required' });

    const finalPayrolls = await PayrollModel.find({ month, year, isDraft: false });
    res.status(200).json(finalPayrolls);
  } catch (error) {
    console.error('Fetch final payrolls error:', error);
    res.status(500).json({ message: 'Server error fetching final payrolls' });
  }
};



const getPayDataByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const payroll = await PayrollModel.find({ userId });
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found for user' });
    }
    res.status(200).json(payroll);
  } catch (error) {
    console.error('Error fetching payroll data by user:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

const getPayslip = async (req, res) => {
  try {
    const { userId, month, year } = req.query;

    if (!userId || !month || !year) {
      return res.status(400).json({ message: 'userId, month, and year are required' });
    }

    const [payroll, fixedSalary, user, employee] = await Promise.all([
      PayrollModel.findOne({ userId, month, year }),
      SalaryFixed.findOne({ userId }),
      User.findById(userId),
      Employee.findOne({ user: userId }),
    ]);

    if (!payroll || !fixedSalary || !user || !employee) {
      return res.status(404).json({ message: 'Required data not found' });
    }

    const { totalDays = 30, payableDays = 30 } = payroll;

    // Utility to calculate earned salary
    const calculateEarned = (standard) =>
      parseFloat(((standard / totalDays) * payableDays).toFixed(2));

    const earnings = {
      basic: {
        standard: fixedSalary.basicMonthly,
        earned: calculateEarned(fixedSalary.basicMonthly),
      },
      hra: {
        standard: fixedSalary.hraMonthly,
        earned: calculateEarned(fixedSalary.hraMonthly),
      },
      conveyance: {
        standard: fixedSalary.caMonthly,
        earned: calculateEarned(fixedSalary.caMonthly),
      },
      medical: {
        standard: fixedSalary.maMonthly,
        earned: calculateEarned(fixedSalary.maMonthly),
      },
      specialAllowance: {
        standard: fixedSalary.saMonthly,
        earned: calculateEarned(fixedSalary.saMonthly),
      },
      bonus: {
        standard: fixedSalary.bonusMonthly || 0,
        earned: fixedSalary.bonusMonthly || 0,
      },
    };

    const deductions = {
      pf: fixedSalary.employeePFMonthly || 0,
      esi: fixedSalary.esiEmployee || 0,
      tax: fixedSalary.taxMonthly || 0,
      other: payroll.deduction || 0,
    };

    const totalEarnings = Object.values(earnings).reduce(
      (sum, val) => sum + (val.earned || 0),
      0
    );

    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
    const netPay = totalEarnings - totalDeductions;

    const payslipJSON = {
      employee: {
        name: employee.name,
        tradeId: employee.tradeId,
        bankAccount: employee.accountNo || 'N/A',
        bankName: employee.bankName || 'N/A',
        doj: employee.doj ? employee.doj.toISOString().split('T')[0] : 'N/A',
        designation: employee.designation || 'N/A',
        location: employee.city || 'N/A',
        esi: employee.esiNo || 'N/A',
        uan: employee.uan || 'N/A',
      },
      payrollInfo: {
        month,
        year,
        totalDays,
        payableDays,
        present: payroll.present,
        absent: payroll.absent,
        weekOffs: payroll.sundays,
        holidays: payroll.holidays,
        allowedLeaves: payroll.allowedLeaves,
      },
      earnings,
      deductions,
      totals: {
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalDeductions: parseFloat(totalDeductions.toFixed(2)),
        netPay: parseFloat(netPay.toFixed(2)),
      },
    };

    return res.status(200).json(payslipJSON);
  } catch (error) {
    console.error('Error fetching payslip JSON:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getPayslipPdf = async (req, res) => {
  try {
    const { userId, month, year } = req.query;

    if (!userId || !month || !year) {
      return res.status(400).json({ message: 'Missing userId, month, or year' });
    }

    const [payroll, fixedSalary, user, employee] = await Promise.all([
      PayrollModel.findOne({ userId, month, year }),
      SalaryFixed.findOne({ userId }),
      User.findById(userId),
      Employee.findOne({ user: userId }),
    ]);


    if (!payroll || !fixedSalary || !user || !employee) {
      return res.status(404).json({ message: 'Required data not found' });
    }

    const { totalDays, payableDays } = payroll;

    // Prorate only components that vary with attendance
    const prorateComponent = (value) => {
      const dailyRate = value / totalDays;
      const earned = dailyRate * payableDays;
      return parseFloat(earned.toFixed(2));
    };

    // Earnings: some components are prorated, others fixed
    const earnings = {
      basic: {
        standard: fixedSalary.basicMonthly || 0,
        earned: prorateComponent(fixedSalary.basicMonthly || 0),
      },
      hra: {
        standard: fixedSalary.hraMonthly || 0,
        earned: prorateComponent(fixedSalary.hraMonthly || 0),
      },
      conveyance: {
        standard: fixedSalary.caMonthly || 0,
        earned: prorateComponent(fixedSalary.caMonthly || 0),
      },
      medical: {
        standard: fixedSalary.maMonthly || 0,
        earned: prorateComponent(fixedSalary.maMonthly || 0), // ✅ Now correctly prorated
      },
      specialAllowance: {
        standard: fixedSalary.saMonthly || 0,
        earned: prorateComponent(fixedSalary.saMonthly || 0),
      },
      bonus: {
        standard: fixedSalary.bonusMonthly || 0,
        earned: fixedSalary.bonusMonthly || 0, // bonus still fixed unless told otherwise
      },
    };

    const deductions = {
      pf: fixedSalary.employeePFMonthly || 0,
      esi: fixedSalary.esiEmployee || 0,
      tax: fixedSalary.taxMonthly || 0,
      other: payroll.deduction || 0,
    };

    // Totals
    const totalEarnings = Object.values(earnings).reduce((sum, comp) => sum + (comp.earned || 0), 0);
    const totalStandard = Object.values(earnings).reduce((sum, comp) => sum + (comp.standard || 0), 0);
    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
    const netPay = parseFloat((totalEarnings - totalDeductions).toFixed(2));

    const netPayWords = inWords(netPay) + ' Only';

    // Prepare HTML template
    const templatePath = path.join(__dirname, '../utils/payslip-template.html');
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);

    // Register helper to calculate standard total
    handlebars.registerHelper('sumStandard', (earnings) => {
      return Object.values(earnings).reduce((sum, val) => sum + val.standard, 0).toFixed(2);
    });

    handlebars.registerHelper('formatINR', function (amount) {
      if (typeof amount !== 'number') return '₹0.00';

      return `₹${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    });

    const html = template({
      employee: {
        name: employee.name,
        tradeId: employee.tradeId,
        bankAccount: employee.accountNo || 'N/A',
        bankName: employee.bankName || 'N/A',
        doj: employee.doj ? employee.doj.toISOString().split('T')[0] : 'N/A',
        designation: employee.designation || 'N/A',
        location: employee.city || 'N/A',
        esi: employee.esiNo || 'N/A',
        uan: employee.uan || 'N/A',
      },
      payrollInfo: {
        month,
        year,
        totalDays,
        payableDays,
      },
      earnings,
      deductions,
      totals: {
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalStandard: parseFloat(totalStandard.toFixed(2)),
        totalDeductions: parseFloat(totalDeductions.toFixed(2)),
        netPay,
        netPayWords
      },
    });

    // Generate PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: puppeteer.executablePath(),
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '40px', bottom: '20px', left: '20px', right: '20px' },
    });

    await browser.close();

    await sendPaySlip(
      user.email,
      employee.name,
      employee.tradeId,
      month,
      year,
      pdfBuffer
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${user.name}_payslip_${month}_${year}.pdf`
    );
    res.end(pdfBuffer);
  } catch (err) {
    console.error('PDF Generation Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//payroll data 
const createOrUpdatePayroll = async (req, res) => {
  try {
    const payrollData = req.body;

    // Define filter to uniquely identify payroll record
    const filter = {
      employee: payrollData.employee,
      month: payrollData.month,
      year: payrollData.year,
    };

    // Update if exists or create new if not
    const updatedPayroll = await Payroll.findOneAndUpdate(
      filter,
      payrollData,
      { new: true, upsert: true } // upsert: create if not exists, new: return updated doc
    );

    res.status(200).json({
      success: true,
      message: "Payroll record created/updated successfully",
      data: updatedPayroll,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create/update payroll record",
      error: error.message,
    });
  }
};

const getAllPayrolls = async (req, res) => {
  try {
    const { month, year, tradeId, search } = req.query;

    let query = {};

    // Apply month/year filtering only if provided
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    // Filter by employee tradeId
    if (tradeId) {
      const employeeObj = await Employee.findOne({ tradeId });
      if (!employeeObj) return res.json([]); // No employee found
      query.employee = employeeObj._id;
    }

    // Populate employee with site and department
    let payrolls = await Payroll.find(query).populate({
      path: "employee",
      populate: [
        { path: "site", model: "Site" },
        { path: "department", model: "Department" }
      ]
    });

    if (!payrolls.length) return res.json([]);

    // Apply search filter if provided
    if (search) {
      const s = search.toLowerCase();
      payrolls = payrolls.filter(p => {
        const emp = p.employee;
        return (
          emp.employeeName?.toLowerCase().includes(s) ||
          emp.tradeId?.toLowerCase().includes(s) ||
          emp.designation?.toLowerCase().includes(s)
        );
      });
    }

    const formattedPayrolls = [];

    for (const payroll of payrolls) {
      const employee = payroll.employee;
      if (!employee) continue;

      // Fetch SalaryFixed for this employee
      const salary = await SalaryFixed.findOne({ employeeId: employee._id });
      if (!salary) continue;

      const totalDays = payroll.totalDays || 30;
      const payableDays = payroll.payableDays || 30;

      const calc = (std) => parseFloat(((std / totalDays) * payableDays).toFixed(2));

      const earnings = {
        basic: { standard: salary.basicMonthly, earned: calc(salary.basicMonthly) },
        hra: { standard: salary.hraMonthly, earned: calc(salary.hraMonthly) },
        conveyance: { standard: salary.caMonthly, earned: calc(salary.caMonthly) },
        medical: { standard: salary.maMonthly, earned: calc(salary.maMonthly) },
        specialAllowance: { standard: salary.saMonthly, earned: calc(salary.saMonthly) },
        arrears: { standard: 0, earned: payroll.arrears || 0 }
      };

      const deductions = {
        pf: salary.employeePFMonthly || 0,
        esi: salary.esiEmployee || 0,
        pt: payroll.professionalTax || 0,
        tax: salary.taxMonthly || 0,
        other: payroll.otherDed || 0
      };

      const totalEarnings = Object.values(earnings).reduce((sum, val) => sum + val.earned, 0);
      const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
      const netPay = totalEarnings + (payroll.arrears || 0) - totalDeductions;

      const grossSalary =
        (salary.basicMonthly || 0) +
        (salary.hraMonthly || 0) +
        (salary.caMonthly || 0) +
        (salary.maMonthly || 0) +
        (salary.saMonthly || 0) +
        (salary.bonusMonthly || 0);

      formattedPayrolls.push({
        employee: {
          tradeId: employee.tradeId,
          name: employee.employeeName,
          designation: employee.designation,
          site: employee.site?.siteName || "N/A",
          department: employee.department?.departmentName || "N/A",
          bankAccount: employee.accountNo || "N/A",
          bankName: employee.bankName || "N/A",
          doj: employee.doj ? employee.doj.toISOString().split("T")[0] : "N/A"
        },
        payrollInfo: {
          month: payroll.month,
          year: payroll.year,
          totalDays,
          payableDays,
          present: payroll.present,
          absent: payroll.absent,
          weekOffs: payroll.sundays,
          holidays: payroll.holidays,
          allowedLeaves: payroll.allowedLeaves
        },
        earnings,
        deductions,
        totals: {
          grossSalary: parseFloat(grossSalary.toFixed(2)),
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          arrears: payroll.arrears || 0,
          totalDeductions: parseFloat(totalDeductions.toFixed(2)),
          pt: payroll.professionalTax || 0,
          netPay: parseFloat(netPay.toFixed(2))
        }
      });
    }

    res.json(formattedPayrolls);

  } catch (error) {
    console.error("Error fetching payrolls:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};


// const getPayrollPdf = async (req, res) => {
//   try {
//     const { tradeId, month, year } = req.query;

//     if (!month || !year) {
//       return res.status(400).json({ message: "Missing month or year" });
//     }

//     let query = { month: Number(month), year: Number(year) };

//     // If tradeId filter applied → find employee objectId
//     if (tradeId) {
//       const employeeObj = await Employee.findOne({ tradeId });
//       if (!employeeObj) {
//         return res.status(404).json({ message: "Employee not found" });
//       }
//       query.employee = employeeObj._id;
//     }

//     // Find payrolls
//     const payrolls = await Payroll.find(query).populate({
//       path: "employee",
//       model: "Employee",
//       populate: [
//         { path: "site", model: "Site" },
//         { path: "department", model: "Department" }
//       ]
//     });

//     if (!payrolls.length) {
//       return res.status(404).json({ message: "No payroll records found" });
//     }

//     console.log("Payroll count:", payrolls.length);

//     const templatePath = path.join(__dirname, "../utils/payslip-template.html");
//     const htmlSource = fs.readFileSync(templatePath, "utf8");

//     // ⭐ REGISTER formatINR HELPER
//     handlebars.registerHelper("formatINR", function (value) {
//       if (!value && value !== 0) return "₹0";
//       return "₹" + Number(value).toLocaleString("en-IN");
//     });

//     const template = handlebars.compile(htmlSource);

//     const browser = await puppeteer.launch({
//       headless: "new",
//       args: ["--no-sandbox", "--disable-setuid-sandbox"]
//     });

//     const pdfBuffers = [];

//     for (const payroll of payrolls) {
//       const employee = payroll.employee;

//       if (!employee) {
//         console.log("Payroll missing employee", payroll._id);
//         continue;
//       }

//       const salary = await SalaryFixed.findOne({ employeeId: employee._id });

//       if (!salary) {
//         console.log("Salary not found for employee:", employee.tradeId);
//         continue;
//       }

//       const totalDays = payroll.totalDays || 30;
//       const payableDays = payroll.payableDays || 30;
//       const calc = (std) => parseFloat(((std / totalDays) * payableDays).toFixed(2));

//       const earnings = {
//         basic: { standard: salary.basicMonthly, earned: calc(salary.basicMonthly) },
//         hra: { standard: salary.hraMonthly, earned: calc(salary.hraMonthly) },
//         conveyance: { standard: salary.caMonthly, earned: calc(salary.caMonthly) },
//         medical: { standard: salary.maMonthly, earned: calc(salary.maMonthly) },
//         specialAllowance: { standard: salary.saMonthly, earned: calc(salary.saMonthly) },
//         bonus: { standard: salary.bonusMonthly, earned: salary.bonusMonthly },
//         arrears: { standard: 0, earned: payroll.arrears || 0 }
//       };

//       const deductions = {
//         pf: salary.employeePFMonthly || 0,
//         esi: salary.esiEmployee || 0,
//         pt: payroll.professionalTax || 0,
//         tax: salary.taxMonthly || 0,
//         other: payroll.otherDed || 0
//       };

//       const totalStandard = salary.grossMonthly
//       const totalEarnings = Object.values(earnings).reduce((s, v) => s + v.earned, 0);
//       const totalDeductions = Object.values(deductions).reduce((s, v) => s + v, 0);
//       const netPay = totalEarnings + (payroll.arrears || 0) - totalDeductions;

//       const getMonthName = (monthNumber) => {
//         const months = [
//           "January", "February", "March", "April", "May", "June",
//           "July", "August", "September", "October", "November", "December"
//         ];
//         return months[monthNumber - 1] || "Invalid Month";
//       };

//       const payslipData = {
//         employee: {
//           name: employee.employeeName,
//           tradeId: employee.tradeId,
//           designation: employee.designation,
//           site: employee.site?.siteName || "N/A",
//           department: employee.department?.departmentName || "N/A",
//           bankAccount: employee.accountNo || "N/A",
//           bankName: employee.bankName || "N/A",
//           doj: employee.doj ? employee.doj.toISOString().split("T")[0] : "N/A",
//           email: employee.email || "N/A"
//         },
//         payrollInfo: {
//           month: getMonthName(Number(month)),
//           year,
//           totalDays,
//           payableDays,
//           present: payroll.present,
//           absent: payroll.absent,
//           weekOffs: payroll.sundays,
//           holidays: payroll.holidays
//         },
//         earnings,
//         deductions,
//         totals: {
//           totalStandard,
//           totalEarnings,
//           totalDeductions,
//           arrears: payroll.arrears || 0,
//           pt: payroll.professionalTax || 0,
//           netPay,
//           netPayWords: inrWords(netPay) + " Only"
//         }
//       };

//       const html = template(payslipData);
//       const page = await browser.newPage();
//       await page.setContent(html, { waitUntil: "networkidle0" });

//       const pdf = await page.pdf({ format: "A4", printBackground: true });
//       console.log("Generated PDF size:", pdf.length);
//       pdfBuffers.push(pdf);

//       if (employee.email) {
//         await sendPaySlip(employee.email, employee.employeeName, employee.tradeId, getMonthName(Number(month)), year, pdf);
//       }
//     }

//     await browser.close();

//     if (pdfBuffers.length === 1) {
//       res.setHeader("Content-Type", "application/pdf");
//       res.setHeader("Content-Disposition", "attachment; filename=payslip.pdf");
//       return res.end(pdfBuffers[0]);
//     }

//     res.json({ message: "Multiple PDFs generated", count: pdfBuffers.length });

//   } catch (error) {
//     console.error("Error generating payroll PDF:", error);
//     res.status(500).json({ message: "Error generating payroll PDF", error: error.message });
//   }
// };

const getPayrollPdf = async (req, res) => {
  try {
    const { tradeId, month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Missing month or year" });
    }

    let query = { month: Number(month), year: Number(year) };
    if (tradeId) {
      const employeeObj = await Employee.findOne({ tradeId });
      if (!employeeObj) return res.status(404).json({ message: "Employee not found" });
      query.employee = employeeObj._id;
    }

    const payrolls = await Payroll.find(query).populate({
      path: "employee",
      model: "Employee",
      populate: [
        { path: "site", model: "Site" },
        { path: "department", model: "Department" }
      ]
    });

    if (!payrolls.length) return res.status(404).json({ message: "No payroll records found" });

    const templatePath = path.join(__dirname, "../utils/payslip-template.html");
    const htmlSource = fs.readFileSync(templatePath, "utf8");
    const template = handlebars.compile(htmlSource);

    handlebars.registerHelper("formatINR", function (value) {
      if (!value && value !== 0) return "₹0";
      return "₹" + Number(value).toLocaleString("en-IN");
    });

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: puppeteer.executablePath(),
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--no-zygote",
        "--disable-dev-shm-usage"
      ]
    });


    const pdfBuffers = [];

    const getMonthName = (monthNumber) => {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return months[monthNumber - 1] || "Invalid Month";
    };

    const sanitizeFilename = (name) => {
      return name.replace(/[^a-zA-Z0-9-_\.]/g, "_"); // Replace spaces & invalid chars
    };

    for (const payroll of payrolls) {
      const employee = payroll.employee;
      if (!employee) continue;

      const salary = await SalaryFixed.findOne({ employeeId: employee._id });
      if (!salary) continue;

      const totalDays = payroll.totalDays || 30;
      const payableDays = payroll.payableDays || 30;
      const calc = (std) => parseFloat(((std / totalDays) * payableDays).toFixed(2));

      const earnings = {
        basic: { standard: salary.basicMonthly, earned: calc(salary.basicMonthly) },
        hra: { standard: salary.hraMonthly, earned: calc(salary.hraMonthly) },
        conveyance: { standard: salary.caMonthly, earned: calc(salary.caMonthly) },
        medical: { standard: salary.maMonthly, earned: calc(salary.maMonthly) },
        specialAllowance: { standard: salary.saMonthly, earned: calc(salary.saMonthly) },
        bonus: { standard: salary.bonusMonthly, earned: salary.bonusMonthly },
        arrears: { standard: 0, earned: payroll.arrears || 0 }
      };

      const deductions = {
        pf: salary.employeePFMonthly || 0,
        esi: salary.esiEmployee || 0,
        pt: payroll.professionalTax || 0,
        tax: salary.taxMonthly || 0,
        other: payroll.otherDed || 0
      };

      const totalEarnings = Object.values(earnings).reduce((s, v) => s + v.earned, 0);
      const totalDeductions = Object.values(deductions).reduce((s, v) => s + v, 0);
      const netPay = totalEarnings + (payroll.arrears || 0) - totalDeductions;
      const totalStandard = salary.grossMonthly;

      const payslipData = {
        employee: {
          name: employee.employeeName,
          tradeId: employee.tradeId,
          designation: employee.designation,
          site: employee.site?.siteName || "N/A",
          department: employee.department?.departmentName || "N/A",
          bankAccount: employee.accountNo || "N/A",
          bankName: employee.bankName || "N/A",
          doj: employee.doj ? employee.doj.toISOString().split("T")[0] : "N/A",
          email: employee.email || "N/A"
        },
        payrollInfo: {
          month: getMonthName(Number(month)),
          year,
          totalDays,
          payableDays,
          present: payroll.present,
          absent: payroll.absent,
          weekOffs: payroll.sundays,
          holidays: payroll.holidays
        },
        earnings,
        deductions,
        totals: {
          totalStandard,
          totalEarnings,
          totalDeductions,
          arrears: payroll.arrears || 0,
          pt: payroll.professionalTax || 0,
          netPay,
          netPayWords: inrWords(netPay) + " Only"
        }
      };

      const html = template(payslipData);
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      let pdf = await page.pdf({ format: "A4", printBackground: true });
      if (!(pdf instanceof Buffer)) pdf = Buffer.from(pdf);

      if (pdf && pdf.length > 0) {
        const fileName = sanitizeFilename(
          `Payslip_${employee.employeeName}-${employee.tradeId}-${getMonthName(Number(month))}-${year}.pdf`
        );
        pdfBuffers.push({ pdf, filename: fileName });
      }

      await page.close();
    }

    await browser.close();

    if (!pdfBuffers.length) return res.status(404).json({ message: "No valid payroll PDFs generated" });

    if (pdfBuffers.length === 1) {
      const singleFile = pdfBuffers[0];
      const encodedName = encodeURIComponent(singleFile.filename);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`
      );
      return res.send(singleFile.pdf);
    }

    // Multiple PDFs → ZIP
    const zipFileName = `payrolls-${month}-${year}.zip`;
    const encodedZipName = encodeURIComponent(zipFileName);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodedZipName}"; filename*=UTF-8''${encodedZipName}`
    );

    const archive = archiver("zip");
    archive.pipe(res);

    pdfBuffers.forEach(item => {
      if (item.pdf && Buffer.isBuffer(item.pdf)) {
        archive.append(item.pdf, { name: item.filename });
      }
    });

    await archive.finalize();

  } catch (error) {
    console.error("Error generating payroll PDF:", error);
    res.status(500).json({ message: "Error generating payroll PDF", error: error.message });
  }
};

const getTempEditByEmployee = async (req, res) => {
  const { month, year } = req.query;
  try {
    const edits = await TempChanges.find({ month, year });
    res.json(edits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching temp edits" });
  }
};

const saveTempEdit = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    // Build dynamic update only for fields that exist in req.body
    const allowedFields = ["cl", "otherDed", "arrears", "professionalTax"];
    const updates = { isEdited: true };

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updated = await TempChanges.findOneAndUpdate(
      { employee: employeeId, month, year },
      { $set: updates },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    return res.json(updated);

  } catch (err) {
    console.error("Temp edit error:", err);
    return res.status(500).json({ message: "Error saving temp edit" });
  }
};

const resetTempEdit = async (req, res) => {
  const { employeeId, month, year } = req.body;

  try {
    await TempChanges.findOneAndDelete({ employee: employeeId, month, year });
    res.json({ message: "Temp edit reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error resetting temp edit" });
  }
};

module.exports = {
  createFixedSalary,
  getFixedSalary,
  getFixedSalaryByEmployee,
  updateFixedSalaryByEmployeeId,

  saveDraftPayroll,
  getDraftPayrolls,
  submitPayroll,
  getPayslip,
  getPayslipPdf,
  // getPayData,
  getFinalPayrolls,
  getPayDataByUserId,

  createOrUpdatePayroll,
  getAllPayrolls,
  getPayrollPdf,

  getTempEditByEmployee,
  saveTempEdit,
  resetTempEdit
};
