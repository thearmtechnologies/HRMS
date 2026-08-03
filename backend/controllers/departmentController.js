const Department = require("../models/Department");
const Employee = require("../models/Employee");

const createDepartment = async (req, res) => {
    try {
        const departmentData = {
            ...req.body,
            company: req.company
        };
        const department = new Department(departmentData);
        await department.save();
        res.status(201).json(department);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ company: req.company }).populate('head', 'firstName lastName email');
        const employees = await Employee.find({ company: req.company }, 'department');

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
        const department = await Department.findOneAndUpdate(
            { _id: req.params.id, company: req.company }, 
            req.body, 
            { new: true }
        );
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
        const department = await Department.findOneAndDelete({ _id: req.params.id, company: req.company });
        if (!department) {
            return res.status(404).json({ error: "Department not found or unauthorized" });
        }
        res.json({ message: "Department deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createDepartment, getDepartments, updateDepartment, deleteDepartment };