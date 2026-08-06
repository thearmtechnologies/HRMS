const mongoose = require('mongoose');

/**
 * Automatically builds a Mongoose filter object from HTTP query parameters.
 * Validates and casts ObjectIds where necessary.
 * 
 * @param {Object} query - req.query object from Express
 * @param {Object} fieldMapping - Optional mapping if query param differs from DB field
 * @returns {Object} Mongoose filter object
 */
const buildFilters = (query, fieldMapping = {}) => {
    const filters = {};

    if (query.department) {
        const field = fieldMapping.department || 'department';
        filters[field] = new mongoose.Types.ObjectId(query.department);
    }

    if (query.employee) {
        const field = fieldMapping.employee || 'employeeId';
        filters[field] = new mongoose.Types.ObjectId(query.employee);
    }

    if (query.designation) {
        const field = fieldMapping.designation || 'designation';
        // For text search or exact match depending on schema
        filters[field] = new RegExp(query.designation, 'i');
    }

    if (query.status) {
        const field = fieldMapping.status || 'status';
        filters[field] = query.status;
    }

    if (query.startDate && query.endDate) {
        const field = fieldMapping.date || 'date';
        filters[field] = {
            $gte: new Date(query.startDate),
            $lte: new Date(query.endDate)
        };
    }

    return filters;
};

/**
 * Builds pagination and sorting options.
 */
const buildPagination = (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 50; // Default reasonable limit
    const skip = (page - 1) * limit;

    const sortOptions = {};
    if (query.sortBy) {
        const order = query.sortOrder === 'desc' ? -1 : 1;
        sortOptions[query.sortBy] = order;
    } else {
        // Default sort by createdAt descending
        sortOptions.createdAt = -1;
    }

    return { skip, limit, sortOptions, page };
};

module.exports = { buildFilters, buildPagination };
