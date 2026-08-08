const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

/**
 * Helper to build a human-readable period label from query filters.
 */
const getPeriodLabel = (filters) => {
    if (!filters) return '—';
    if (filters.month && filters.year) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${months[Number(filters.month) - 1]} ${filters.year}`;
    }
    if (filters.date) {
        return new Date(filters.date).toLocaleDateString('en-GB');
    }
    if (filters.startDate && filters.endDate) {
        return `${new Date(filters.startDate).toLocaleDateString('en-GB')} to ${new Date(filters.endDate).toLocaleDateString('en-GB')}`;
    }
    return '—';
};

// Register basic Handlebars helpers for template rendering
handlebars.registerHelper('eq', function (a, b) {
    return a === b;
});
handlebars.registerHelper('lowercase', function (str) {
    return typeof str === 'string' ? str.toLowerCase() : '';
});

/**
 * Generates a PDF buffer using Puppeteer from standard report JSON and companyInfo.
 *
 * @param {Object} reportJson - Standardized report JSON
 * @param {Object} companyInfo - Company configuration object
 * @param {String} templateName - The folder/name path of the .hbs template (e.g. 'attendance/dailyAttendance')
 * @returns {Promise<Buffer>} Resolves to PDF file buffer
 */
const generatePdf = async (reportJson, companyInfo, templateName) => {
    let browser;
    try {
        const { title, generatedAt, generatedBy, filters, summary, columns, rows } = reportJson;

        // 1. Map flat row arrays to structured camelCase objects based on headers
        let mappedRows = [];
        if (columns && rows) {
            const colKeys = columns.map(col => 
                col.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .replace(/\s+(.)/g, (m, chr) => chr.toUpperCase())
                    .trim()
            );

            mappedRows = rows.map(row => {
                const rowObj = {};
                colKeys.forEach((key, i) => {
                    rowObj[key] = row[i];
                });

                // Prepare presentation-only properties required by the daily/monthly templates
                rowObj.isLate = rowObj.status === 'Late';
                rowObj.lateDisplay = rowObj.status === 'Late' ? 'L' : '—';
                rowObj.inLoc = '—';
                rowObj.outLoc = '—';
                rowObj.early = '—';

                return rowObj;
            });
        }

        // 2. Build template view data without mutating original reportJson
        const templateData = {
            ...reportJson,
            mappedRows,
            generatedDateOnly: new Date(generatedAt || Date.now()).toISOString().split('T')[0],
            periodLabel: getPeriodLabel(filters),
            companyName: companyInfo?.companyName || '',
            hasSummary: summary && Object.keys(summary).length > 0
        };

        // 3. Resolve template path (with default/missing template fallback to genericReport)
        let resolvedTemplate = templateName || 'generic/genericReport';
        let templatePath = path.join(__dirname, '../../templates', `${resolvedTemplate}.hbs`);
        let cssPath = path.join(__dirname, '../../templates', `${resolvedTemplate}.css`);

        // If the requested template does not exist, automatically fall back to generic/genericReport
        if (!fs.existsSync(templatePath) || !fs.existsSync(cssPath)) {
            resolvedTemplate = 'generic/genericReport';
            templatePath = path.join(__dirname, '../../templates', `${resolvedTemplate}.hbs`);
            cssPath = path.join(__dirname, '../../templates', `${resolvedTemplate}.css`);
        }

        // 4. Read template and style contents
        const htmlSource = fs.readFileSync(templatePath, 'utf8');
        const cssContent = fs.readFileSync(cssPath, 'utf8');

        // 5. Compile layout with Handlebars
        const template = handlebars.compile(htmlSource);
        const compiledHtml = template({
            ...templateData,
            cssContent
        });

        // 6. Render using Puppeteer
        browser = await puppeteer.launch({
            headless: 'shell',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(compiledHtml, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: {
                top: '10px',
                bottom: '10px',
                left: '10px',
                right: '10px'
            }
        });

        return pdfBuffer;
    } catch (err) {
        console.error('❌ Error during Puppeteer PDF generation:', err);
        throw err;
    } finally {
        if (browser) {
            await browser.close().catch(console.error);
        }
    }
};

module.exports = { generatePdf };
