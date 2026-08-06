/**
 * Common formatting and calculation helpers for reports.
 * Prevents duplicating logic inside controllers and services.
 */

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB'); // DD/MM/YYYY format
};

const calculatePercentage = (part, total) => {
    if (!total || total === 0) return '0%';
    return ((part / total) * 100).toFixed(1) + '%';
};

const groupRecordsBy = (records, keyPath) => {
    return records.reduce((acc, record) => {
        // Resolve nested keys e.g. "department.name"
        const key = keyPath.split('.').reduce((o, i) => (o ? o[i] : null), record) || 'Uncategorized';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(record);
        return acc;
    }, {});
};

module.exports = { formatCurrency, formatDate, calculatePercentage, groupRecordsBy };
