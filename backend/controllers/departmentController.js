const Department = require("../models/Department");

const createDepartment = async (req, res) => {
    try {
        const department = new Department(req.body);
        await department.save();
        res.status(201).json(department);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const Employee = require("../models/Employee");

const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().populate('head', 'firstName lastName email');
        const employees = await Employee.find({}, 'department');

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
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!department) {
            return res.status(404).json({ error: "Department not found" });
        }
        res.json(department);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) {
            return res.status(404).json({ error: "Department not found" });
        }
        res.json({ message: "Department deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createDepartment, getDepartments, updateDepartment, deleteDepartment }