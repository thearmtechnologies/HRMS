const { getTemplateBuffer, previewImport, confirmImport } = require('../imports/employeeImportService');

const downloadEmployeeTemplate = async (req, res) => {
  try {
    const buffer = await getTemplateBuffer(req.company);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Employee_Import_Template.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error('❌ Error generating employee import template:', error);
    res.status(500).json({ message: 'Error generating template', error: error.message });
  }
};

const importEmployees = async (req, res) => {
  try {
    const action = String(req.body.action || 'preview').toLowerCase();
    const result = action === 'confirm' ? await confirmImport(req) : await previewImport(req);
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error processing employee import:', error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Error processing import', error: error.message });
  }
};

module.exports = { downloadEmployeeTemplate, importEmployees };