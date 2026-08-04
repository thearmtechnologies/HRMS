const Department = require("../models/Department");
const Employee = require("../models/Employee");
const { createCompanyRecord, findCompanyRecords, updateCompanyRecord, deleteCompanyRecord, findOneCompanyRecord } = require("../utils/tenantUtils");

const createDepartment = async (req, res) => {
    try {
        if (req.body.head) {
            const headEmp = await findOneCompanyRecord(Employee, { _id: req.body.head }, req.company);
            if (!headEmp) return res.status(400).json({ error: "Invalid Department Head: Employee not found in this company." });
        }
        
        const department = await createCompanyRecord(Department, req.body, req.company);
        res.status(201).json(department);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getDepartments = async (req, res) => {
    try {
        const departments = await findCompanyRecords(Department, {}, req.company, { path: 'head', select: 'firstName lastName email' });
        const employees = await findCompanyRecords(Employee, {}, req.company, null, null);

        const deptWithStats = departments.map(dept => {
            const empCount = employees.filter(e => e.department && e.department.toString() === dept._id.toString()).length;
            return { 
                ...dept.toObject(), 
                employeesCount: empCount 
            };
        });

        res.json(deptWithStats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateDepartment = async (req, res) => {
    try {
        if (req.body.head) {
            const headEmp = await findOneCompanyRecord(Employee, { _id: req.body.head }, req.company);
            if (!headEmp) return res.status(400).json({ error: "Invalid Department Head: Employee not found in this company." });
        }

        const department = await updateCompanyRecord(Department, req.params.id, req.company, req.body);
        if (!department) {
            return res.status(404).json({ error: "Department not found or unauthorized" });
        }
        res.json(department);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const department = await deleteCompanyRecord(Department, req.params.id, req.company);
        if (!department) {
            return res.status(404).json({ error: "Department not found or unauthorized" });
        }
        res.json({ message: "Department deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createDepartment, getDepartments, updateDepartment, deleteDepartment };