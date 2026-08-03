const CompanyInfo = require('../../models/CompanyInfo');

async function provisionCompanyInfo(companyId, companyObj) {
  const companyInfo = new CompanyInfo({
    company: companyId,
    companyName: companyObj.companyName,
    companyCode: companyObj.companyCode,
    officialEmail: companyObj.companyEmail,
    phone: companyObj.companyPhone,
    isConfigured: false
  });
  await companyInfo.save();
}

module.exports = { provisionCompanyInfo };
