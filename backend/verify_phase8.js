require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');
const Department = require('./models/Department');
const Employee = require('./models/Employee');
const { findCompanyRecords, findOneCompanyRecord, updateCompanyRecord, deleteCompanyRecord } = require('./utils/tenantUtils');

async function verifyPhase8() {
    console.log("=== Phase 8: Data Isolation Verification ===");
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        let companies = await Company.find().limit(2);
        if (companies.length < 2) {
            console.log("Creating a second company for isolation test...");
            const comp2 = new Company({
                companyName: "Isolation Test Company",
                companyEmail: "test_iso@example.com",
                companyCode: "TEST_ISO_01",
                companyPhone: "1234567891",
                website: "https://example.com"
            });
            await comp2.save();
            companies = await Company.find().limit(2);
        }

        const compA = companies[0]._id;
        const compB = companies[1]._id;
        
        console.log(`Company A: ${compA}`);
        console.log(`Company B: ${compB}`);

        // Create a department in Company A
        const deptA = new Department({ departmentName: `Dept A Isolated ${Date.now()}`, company: compA });
        await deptA.save();

        // Test 1: findCompanyRecords (Company A querying)
        const aDepts = await findCompanyRecords(Department, {}, compA);
        const hasB = aDepts.some(d => d.company.toString() === compB.toString());
        if (hasB) throw new Error("findCompanyRecords leaked data to Company A");

        // Test 2: findOneCompanyRecord (Company B trying to find Dept A)
        const leakedDept = await findOneCompanyRecord(Department, { _id: deptA._id }, compB);
        if (leakedDept) throw new Error("findOneCompanyRecord leaked data to Company B");

        // Test 3: updateCompanyRecord (Company B trying to update Dept A)
        const updatedDept = await updateCompanyRecord(Department, deptA._id, compB, { departmentName: "Hacked" });
        if (updatedDept) throw new Error("updateCompanyRecord allowed Company B to update Company A record");

        // Test 4: deleteCompanyRecord (Company B trying to delete Dept A)
        const deletedDept = await deleteCompanyRecord(Department, deptA._id, compB);
        if (deletedDept) throw new Error("deleteCompanyRecord allowed Company B to delete Company A record");

        // Cleanup
        await deleteCompanyRecord(Department, deptA._id, compA);

        console.log("✅ All Phase 8 Data Isolation Tests Passed!");
        process.exit(0);

    } catch (e) {
        console.error("❌ Test Failed:", e.message);
        process.exit(1);
    }
}

verifyPhase8();
